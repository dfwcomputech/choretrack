export interface ChoreTemplateResponse {
  id: string
  title: string
  description: string | null
  suggestedPoints: number
  category: string | null
}

export interface RewardTemplateResponse {
  id: string
  name: string
  description: string | null
  suggestedPoints: number
  category: string | null
}

export interface SeasonTemplateRewardResponse {
  id: string
  name: string
  description: string | null
  pointCost: number
  category: string | null
  sortOrder: number
}

export interface SeasonTemplateResponse {
  id: string
  name: string
  description: string | null
  rewardCount: number
  rewards: SeasonTemplateRewardResponse[]
}

export class LibraryServiceError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'LibraryServiceError'
    this.status = status
  }
}

const requireToken = (token: string) => {
  if (!token.trim()) {
    throw new LibraryServiceError('Authentication required. Please log in.', 0)
  }
}

export const searchChoreTemplates = async (query: string, token: string): Promise<ChoreTemplateResponse[]> => {
  requireToken(token)
  const url = query.trim() ? `/api/library/chores?query=${encodeURIComponent(query.trim())}` : '/api/library/chores'
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new LibraryServiceError('Unable to load chore library. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as ChoreTemplateResponse[]
  }

  if (response.status === 401) {
    throw new LibraryServiceError('Your session has expired. Please log in again.', response.status)
  }

  throw new LibraryServiceError('Unable to load chore library. Please try again.', response.status)
}

export const searchRewardTemplates = async (query: string, token: string): Promise<RewardTemplateResponse[]> => {
  requireToken(token)
  const url = query.trim() ? `/api/library/rewards?query=${encodeURIComponent(query.trim())}` : '/api/library/rewards'
  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new LibraryServiceError('Unable to load reward library. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as RewardTemplateResponse[]
  }

  if (response.status === 401) {
    throw new LibraryServiceError('Your session has expired. Please log in again.', response.status)
  }

  throw new LibraryServiceError('Unable to load reward library. Please try again.', response.status)
}

export const listSeasonTemplates = async (token: string): Promise<SeasonTemplateResponse[]> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch('/api/library/season-templates', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new LibraryServiceError('Unable to load season templates. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as SeasonTemplateResponse[]
  }

  if (response.status === 401) {
    throw new LibraryServiceError('Your session has expired. Please log in again.', response.status)
  }

  throw new LibraryServiceError('Unable to load season templates. Please try again.', response.status)
}

export const getSeasonTemplate = async (templateId: string, token: string): Promise<SeasonTemplateResponse> => {
  requireToken(token)
  let response: Response
  try {
    response = await fetch(`/api/library/season-templates/${encodeURIComponent(templateId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new LibraryServiceError('Unable to load season template. Please check your connection and try again.', 0)
  }

  if (response.ok) {
    return (await response.json()) as SeasonTemplateResponse
  }

  if (response.status === 401) {
    throw new LibraryServiceError('Your session has expired. Please log in again.', response.status)
  }

  if (response.status === 404) {
    throw new LibraryServiceError('Season template not found.', response.status)
  }

  throw new LibraryServiceError('Unable to load season template. Please try again.', response.status)
}
