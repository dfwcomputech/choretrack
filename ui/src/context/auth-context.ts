import { createContext } from 'react'
import type { LoginResponse, LoginUserPayload } from '../services/authService'

export interface AuthContextValue {
  token: string
  isAuthenticated: boolean
  login: (payload: LoginUserPayload) => Promise<LoginResponse>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
