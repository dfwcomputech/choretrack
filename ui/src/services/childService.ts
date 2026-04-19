export interface CreateChildAccountPayload {
  username: string
  password: string
  firstName: string
  lastName: string
  displayName: string
}

export interface ChildAccountResponse {
  id: string
  username: string
  firstName: string
  lastName: string
  displayName: string
  parentId: string
  role: string
  createdAt: string
}

export class ChildServiceError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ChildServiceError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface ValidationErrorBody {
  errors?: Array<{ field?: string; message?: string }>
}

interface ErrorBody {
  message?: string
  field?: string
}

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

export const createChildAccount = async (payload: CreateChildAccountPayload, token: string): Promise<ChildAccountResponse> => {
  if (!token.trim()) {
    throw new ChildServiceError('Authentication required. Please log in.', -1)
  }

  let response: Response
  try {
    response = await fetch('/api/children', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ChildServiceError('Unable to create child account. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ChildAccountResponse
  }

  if (response.status === 400) {
    const errorBody = await parseJson<ValidationErrorBody>(response)
    const fieldErrors = (errorBody?.errors ?? []).reduce<Record<string, string>>((accumulator, error) => {
      if (error.field && error.message) {
        accumulator[error.field] = error.message
      }
      return accumulator
    }, {})
    throw new ChildServiceError('Please correct the highlighted fields and try again.', response.status, fieldErrors)
  }

  if (response.status === 409) {
    const errorBody = await parseJson<ErrorBody>(response)
    const message = errorBody?.message ?? 'Username already exists.'
    const fieldErrors = errorBody?.field ? { [errorBody.field]: message } : {}
    throw new ChildServiceError(message, response.status, fieldErrors)
  }

  if (response.status === 401) {
    throw new ChildServiceError('Your session has expired. Please log in again.', response.status)
  }

  if (response.status === 403) {
    throw new ChildServiceError('Only parent users can create child accounts.', response.status)
  }

  if (response.status >= 500) {
    throw new ChildServiceError('Unable to create child account. Please try again.', response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  throw new ChildServiceError(errorBody?.message || 'Unable to create child account. Please try again.', response.status)
}
