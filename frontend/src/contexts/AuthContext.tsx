import { useState, useEffect, type ReactNode } from 'react'
import { api } from '@/api/Api'
import type { components } from '@/types/api'
import { AuthContext, type AuthContextType } from './AuthContext'

type User = components['schemas']['User']

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
    const { data, error } = await api.POST('/api/login', {
      body: { username, password },
    })

    if (error) {
      throw new Error(error.message || 'Login failed')
    }

    if (data?.success && data.user) {
      setUser(data.user)

      // Store user info in localStorage for persistence
      localStorage.setItem('user_info', JSON.stringify(data.user))
    } else {
      throw new Error(data?.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await api.POST('/api/logout')
    } catch {
      // Logout failed, but we still clear the session
    } finally {
      clearSession()
    }
  }

  const clearSession = () => {
    setUser(null)
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
