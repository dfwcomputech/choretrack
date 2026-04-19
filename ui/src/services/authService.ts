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

export interface LoginUserPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  tokenType: string
}

export const AUTH_TOKEN_STORAGE_KEY = 'choretrack.token'

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

interface LoginErrorBody {
  message?: string
}

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

export const getStoredAuthToken = (): string => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? ''

export const setStoredAuthToken = (token: string) => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export const clearStoredAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
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

export const loginUser = async (payload: LoginUserPayload): Promise<LoginResponse> => {
  let response: Response
  try {
    response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new AuthServiceError('Unable to reach the server. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    const data = (await parseJson<Partial<LoginResponse>>(response)) ?? {}
    if (!data.token?.trim()) {
      throw new AuthServiceError('Login failed due to an invalid server response.', 500)
    }

    const loginResponse: LoginResponse = {
      token: data.token,
      tokenType: data.tokenType?.trim() || 'Bearer',
    }

    setStoredAuthToken(loginResponse.token)
    return loginResponse
  }

  if (response.status === 400) {
    throw new AuthServiceError('Username/email and password are required.', response.status)
  }

  if (response.status === 401) {
    throw new AuthServiceError('Invalid username/email or password.', response.status)
  }

  if (response.status === 403) {
    throw new AuthServiceError('You are not authorized to access this account.', response.status)
  }

  if (response.status === 503 || response.status === 502) {
    throw new AuthServiceError('Server is currently unavailable. Please try again shortly.', response.status)
  }

  if (response.status >= 500) {
    throw new AuthServiceError('Unexpected backend error. Please try again.', response.status)
  }

  const errorBody = await parseJson<LoginErrorBody>(response)
  throw new AuthServiceError(errorBody?.message || 'Login failed. Please try again.', response.status)
}
