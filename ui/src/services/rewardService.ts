export interface RewardResponse {
  id: string
  name: string
  description: string | null
  pointCost: number
  active: boolean
  category: string | null
  imageRef: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRewardPayload {
  name: string
  description?: string
  pointCost: number
  category?: string
  active?: boolean
}

export interface UpdateRewardPayload {
  name: string
  description?: string
  pointCost: number
  category?: string
  active: boolean
}

interface ValidationErrorBody {
  errors?: Array<{ field?: string; message?: string }>
}

interface ErrorBody {
  message?: string
  field?: string
}

export class RewardServiceError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'RewardServiceError'
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
    throw new RewardServiceError('Authentication required. Please log in.', 0)
  }
}

const handleMutationError = async (
  response: Response,
  fallbackMessage: string,
  statusMessages: Partial<Record<number, string>>,
) => {
  if (response.status === 400) {
    const fieldErrors = await parseValidationErrors(response)
    throw new RewardServiceError('Please correct the highlighted fields and try again.', response.status, fieldErrors)
  }

  if (response.status in statusMessages) {
    throw new RewardServiceError(statusMessages[response.status] ?? fallbackMessage, response.status)
  }

  if (response.status >= 500) {
    throw new RewardServiceError(fallbackMessage, response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  const message = errorBody?.message ?? fallbackMessage
  const fieldErrors = errorBody?.field ? { [errorBody.field]: message } : {}
  throw new RewardServiceError(message, response.status, fieldErrors)
}

export const listRewards = async (token: string): Promise<RewardResponse[]> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch('/api/rewards', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new RewardServiceError('Unable to load rewards. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as RewardResponse[]
  }

  if (response.status === 401) {
    throw new RewardServiceError('Your session has expired. Please log in again.', response.status)
  }

  if (response.status === 403) {
    throw new RewardServiceError('Only parent users can manage rewards.', response.status)
  }

  if (response.status >= 500) {
    throw new RewardServiceError('Unable to load rewards. Please try again.', response.status)
  }

  const errorBody = await parseJson<ErrorBody>(response)
  throw new RewardServiceError(errorBody?.message || 'Unable to load rewards. Please try again.', response.status)
}

export const createReward = async (payload: CreateRewardPayload, token: string): Promise<RewardResponse> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch('/api/rewards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new RewardServiceError('Unable to create reward. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as RewardResponse
  }

  await handleMutationError(response, 'Unable to create reward. Please try again.', {
    401: 'Your session has expired. Please log in again.',
    403: 'Only parent users can create rewards.',
  })
  throw new RewardServiceError('Unable to create reward. Please try again.', response.status)
}

export const updateReward = async (rewardId: string, payload: UpdateRewardPayload, token: string): Promise<RewardResponse> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch(`/api/rewards/${encodeURIComponent(rewardId)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new RewardServiceError('Unable to update reward. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as RewardResponse
  }

  await handleMutationError(response, 'Unable to update reward. Please try again.', {
    401: 'Your session has expired. Please log in again.',
    403: 'You are not authorized to update this reward.',
    404: 'This reward no longer exists.',
  })
  throw new RewardServiceError('Unable to update reward. Please try again.', response.status)
}

export const deleteReward = async (rewardId: string, token: string): Promise<void> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch(`/api/rewards/${encodeURIComponent(rewardId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new RewardServiceError('Unable to delete reward. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return
  }

  await handleMutationError(response, 'Unable to delete reward. Please try again.', {
    401: 'Your session has expired. Please log in again.',
    403: 'You are not authorized to delete this reward.',
    404: 'This reward no longer exists.',
  })
}
