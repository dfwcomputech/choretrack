export type ChoreStatus = 'PENDING' | 'COMPLETED'

export interface ChoreResponse {
  id: string
  title: string
  description: string | null
  points: number
  assignedChildId: string
  assignedChildName: string
  dueDate: string | null
  status: ChoreStatus
  createdAt: string
  updatedAt: string
}

export interface CreateChorePayload {
  title: string
  description?: string
  points: number
  assignedChildId: string
  dueDate?: string
  status?: ChoreStatus
}

export type UpdateChorePayload = CreateChorePayload

export interface ChoreCompletionResponse {
  choreId: string
  status: ChoreStatus
  completedByChildId: string
  pointsAwarded: number
  childCurrentPoints: number
  completedAt: string
}

interface ValidationErrorBody {
  errors?: Array<{ field?: string; message?: string }>
}

interface ErrorBody {
  message?: string
  field?: string
}

export class ChoreServiceError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ChoreServiceError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
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

const requireToken = (token: string) => {
  if (!token.trim()) {
    throw new ChoreServiceError('Authentication required. Please log in.', 0)
  }
}

export const listChores = async (token: string): Promise<ChoreResponse[]> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch('/api/chores', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new ChoreServiceError('Unable to load chores. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ChoreResponse[]
  }

  if (response.status === 401) {
    throw new ChoreServiceError('Your session has expired. Please log in again.', response.status)
  }

  if (response.status === 403) {
    throw new ChoreServiceError('You are not authorized to view these chores.', response.status)
  }

  if (response.status >= 500) {
    throw new ChoreServiceError('Unable to load chores. Please try again.', response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  throw new ChoreServiceError(errorBody?.message || 'Unable to load chores. Please try again.', response.status)
}

const handleMutationError = async (
  response: Response,
  fallbackMessage: string,
  statusMessages: Partial<Record<number, string>>,
) => {
  if (response.status === 400) {
    const fieldErrors = await parseValidationErrors(response)
    throw new ChoreServiceError('Please correct the highlighted fields and try again.', response.status, fieldErrors)
  }

  if (response.status in statusMessages) {
    throw new ChoreServiceError(statusMessages[response.status] ?? fallbackMessage, response.status)
  }

  if (response.status >= 500) {
    throw new ChoreServiceError(fallbackMessage, response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  const message = errorBody?.message ?? fallbackMessage
  const fieldErrors = errorBody?.field ? { [errorBody.field]: message } : {}
  throw new ChoreServiceError(message, response.status, fieldErrors)
}

export const createChore = async (payload: CreateChorePayload, token: string): Promise<ChoreResponse> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch('/api/chores', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ChoreServiceError('Unable to create chore. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ChoreResponse
  }

  await handleMutationError(response, 'Unable to create chore. Please try again.', {
    401: 'Your session has expired. Please log in again.',
    403: 'Only parent users can create chores.',
    404: 'The selected child account no longer exists.',
  })
  throw new ChoreServiceError('Unable to create chore. Please try again.', response.status)
}

export const updateChore = async (choreId: string, payload: UpdateChorePayload, token: string): Promise<ChoreResponse> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch(`/api/chores/${encodeURIComponent(choreId)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ChoreServiceError('Unable to update chore. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ChoreResponse
  }

  await handleMutationError(response, 'Unable to update chore. Please try again.', {
    401: 'Your session has expired. Please log in again.',
    403: 'You are not authorized to update this chore.',
    404: 'This chore no longer exists.',
  })
  throw new ChoreServiceError('Unable to update chore. Please try again.', response.status)
}

export const deleteChore = async (choreId: string, token: string): Promise<void> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch(`/api/chores/${encodeURIComponent(choreId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new ChoreServiceError('Unable to delete chore. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return
  }

  await handleMutationError(response, 'Unable to delete chore. Please try again.', {
    401: 'Your session has expired. Please log in again.',
    403: 'You are not authorized to delete this chore.',
    404: 'This chore no longer exists.',
  })
}

export const completeChore = async (choreId: string, token: string): Promise<ChoreCompletionResponse> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch(`/api/chores/${encodeURIComponent(choreId)}/complete`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new ChoreServiceError('Unable to complete chore. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ChoreCompletionResponse
  }

  await handleMutationError(response, 'Unable to complete chore. Please try again.', {
    401: 'Your session has expired. Please log in again.',
    403: 'You are not authorized to complete this chore.',
    404: 'This chore no longer exists.',
    409: 'This chore has already been completed.',
  })
  throw new ChoreServiceError('Unable to complete chore. Please try again.', response.status)
}
