import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './auth-context'
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  loginUser,
  logoutUser,
  type LoginResponse,
  type LoginUserPayload,
} from '../services/authService'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => getStoredAuthToken())

  const login = async (payload: LoginUserPayload): Promise<LoginResponse> => {
    const response = await loginUser(payload)
    setToken(response.token)
    return response
  }

  const logout = async () => {
    const tokenToClear = token
    await logoutUser(tokenToClear)
    clearStoredAuthToken()
    setToken('')
  }

  const value: AuthContextValue = {
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
