export interface RegisterUserPayload {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface RegistrationResponse {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
}

export class AuthServiceError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'AuthServiceError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface ValidationErrorBody {
  errors?: Array<{ field?: string; message?: string }>
}

interface ConflictErrorBody {
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

export const registerUser = async (payload: RegisterUserPayload): Promise<RegistrationResponse> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (response.ok) {
    return (await response.json()) as RegistrationResponse
  }

  if (response.status === 400) {
    const errorBody = await parseJson<ValidationErrorBody>(response)
    const fieldErrors = (errorBody?.errors ?? []).reduce<Record<string, string>>((accumulator, error) => {
      if (error.field && error.message) {
        accumulator[error.field] = error.message
      }
      return accumulator
    }, {})
    throw new AuthServiceError('Please correct the highlighted fields and try again.', response.status, fieldErrors)
  }

  if (response.status === 409) {
    const errorBody = await parseJson<ConflictErrorBody>(response)
    const message = errorBody?.message ?? 'An account with these details already exists.'
    const fieldErrors = errorBody?.field ? { [errorBody.field]: message } : {}
    throw new AuthServiceError(message, response.status, fieldErrors)
  }

  throw new AuthServiceError('Unexpected server error. Please try again.', response.status)
}
