import { createContext } from 'react'
import type { components } from '@/types/api'

type User = components['schemas']['User']

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
