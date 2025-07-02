import { useState, useEffect, type ReactNode } from 'react'
import { api } from '@/api/Api'
import type { User } from '@/api/Api'
import { AuthContext, type AuthContextType } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For session-based auth, check if we have stored user info
        const storedUser = localStorage.getItem('user_info')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setUser(user)
        }
        setIsLoading(false)
      } catch {
        // Auth check failed, clear session
        setUser(null)
        localStorage.removeItem('user_info')
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string) => {
    const response = await api.login({ username, password })

    if (response.success && response.user) {
      setUser(response.user)

      // Store the token if your API returns one
      // For session-based auth, you might not need to store a token
      // but you could store user info or session ID
      if (response.user) {
        // Store user info in localStorage for persistence
        localStorage.setItem('user_info', JSON.stringify(response.user))
      }
    } else {
      throw new Error(response.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // Logout failed, but we still clear the session
    } finally {
      clearSession()
    }
  }

  const clearSession = () => {
    setUser(null)
    api.clearAuthToken()
    localStorage.removeItem('user_info')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    clearSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
