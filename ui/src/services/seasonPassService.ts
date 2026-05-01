import type { RewardResponse } from './rewardService'

export interface ApplyTemplatePayload {
  replace: boolean
}

export interface ApplyTemplateResponse {
  rewards: RewardResponse[]
}

export class SeasonPassServiceError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'SeasonPassServiceError'
    this.status = status
  }
}

const requireToken = (token: string) => {
  if (!token.trim()) {
    throw new SeasonPassServiceError('Authentication required. Please log in.', 0)
  }
}

export const applySeasonTemplate = async (
  templateId: string,
  payload: ApplyTemplatePayload,
  token: string,
): Promise<ApplyTemplateResponse> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch(`/api/season-pass/templates/${encodeURIComponent(templateId)}/apply`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new SeasonPassServiceError('Unable to apply season template. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ApplyTemplateResponse
  }

  if (response.status === 401) {
    throw new SeasonPassServiceError('Your session has expired. Please log in again.', response.status)
  }

  if (response.status === 403) {
    throw new SeasonPassServiceError('Only parent users can apply season templates.', response.status)
  }

  if (response.status === 404) {
    throw new SeasonPassServiceError('Season template not found.', response.status)
  }

  throw new SeasonPassServiceError('Unable to apply season template. Please try again.', response.status)
}
