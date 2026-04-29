export interface CreateChildAccountPayload {
  username: string
  password: string
  firstName: string
  lastName: string
  displayName: string
}

export interface UpdateChildAccountPayload {
  username: string
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
  active?: boolean
  updatedAt?: string
}

export const listChildAccounts = async (token: string): Promise<ChildAccountResponse[]> => {
  if (!token.trim()) {
    throw new ChildServiceError('Authentication required. Please log in.', -1)
  }

  let response: Response
  try {
    response = await fetch('/api/children', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new ChildServiceError('Unable to load child accounts. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ChildAccountResponse[]
  }

  if (response.status === 401) {
    throw new ChildServiceError('Your session has expired. Please log in again.', response.status)
  }

  if (response.status === 403) {
    throw new ChildServiceError('Only parent users can view child accounts.', response.status)
  }

  if (response.status >= 500) {
    throw new ChildServiceError('Unable to load child accounts. Please try again.', response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  throw new ChildServiceError(errorBody?.message || 'Unable to load child accounts. Please try again.', response.status)
}

export interface DeleteChildAccountResponse {
  id?: string
  active?: boolean
  message?: string
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

const parseValidationErrors = async (response: Response) => {
  const errorBody = await parseJson<ValidationErrorBody>(response)
  return (errorBody?.errors ?? []).reduce<Record<string, string>>((accumulator, error) => {
    if (error.field && error.message) {
      accumulator[error.field] = error.message
    }
    return accumulator
  }, {})
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
    const fieldErrors = await parseValidationErrors(response)
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
    const errorBody = await parseJson<ErrorBody>(response)
    const message = errorBody?.message ?? 'Only parent users can create child accounts.'
    const fieldErrors = errorBody?.field ? { [errorBody.field]: message } : {}
    throw new ChildServiceError(message, response.status, fieldErrors)
  }

  if (response.status >= 500) {
    throw new ChildServiceError('Unable to create child account. Please try again.', response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  throw new ChildServiceError(errorBody?.message || 'Unable to create child account. Please try again.', response.status)
}

export const updateChildAccount = async (childId: string, payload: UpdateChildAccountPayload, token: string): Promise<ChildAccountResponse> => {
  if (!token.trim()) {
    throw new ChildServiceError('Authentication required. Please log in.', -1)
  }

  let response: Response
  try {
    response = await fetch(`/api/children/${encodeURIComponent(childId)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ChildServiceError('Unable to update child account. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ChildAccountResponse
  }

  if (response.status === 400) {
    const fieldErrors = await parseValidationErrors(response)
    throw new ChildServiceError('Please correct the highlighted fields and try again.', response.status, fieldErrors)
  }

  if (response.status === 401) {
    throw new ChildServiceError('Your session has expired. Please log in again.', response.status)
  }

  if (response.status === 403) {
    throw new ChildServiceError('You are not authorized to update this child account.', response.status)
  }

  if (response.status === 404) {
    throw new ChildServiceError('This child account no longer exists.', response.status)
  }

  if (response.status === 409) {
    const errorBody = await parseJson<ErrorBody>(response)
    const message = errorBody?.message ?? 'Username already exists.'
    const fieldErrors = errorBody?.field ? { [errorBody.field]: message } : { username: message }
    throw new ChildServiceError(message, response.status, fieldErrors)
  }

  if (response.status >= 500) {
    throw new ChildServiceError('Unable to update child account. Please try again.', response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  throw new ChildServiceError(errorBody?.message || 'Unable to update child account. Please try again.', response.status)
}

export const deleteChildAccount = async (childId: string, token: string): Promise<DeleteChildAccountResponse> => {
  if (!token.trim()) {
    throw new ChildServiceError('Authentication required. Please log in.', -1)
  }

  let response: Response
  try {
    response = await fetch(`/api/children/${encodeURIComponent(childId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new ChildServiceError('Unable to remove child account. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    const body = await parseJson<DeleteChildAccountResponse>(response)
    return body ?? {}
  }

  if (response.status === 401) {
    throw new ChildServiceError('Your session has expired. Please log in again.', response.status)
  }

  if (response.status === 403) {
    throw new ChildServiceError('You are not authorized to remove this child account.', response.status)
  }

  if (response.status === 404) {
    throw new ChildServiceError('This child account no longer exists.', response.status)
  }

  if (response.status >= 500) {
    throw new ChildServiceError('Unable to remove child account. Please try again.', response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  throw new ChildServiceError(errorBody?.message || 'Unable to remove child account. Please try again.', response.status)
}
