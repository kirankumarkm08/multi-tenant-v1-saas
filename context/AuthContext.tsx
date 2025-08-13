'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  token: string | null
  setToken: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token')
    if (storedToken) {
      setTokenState(storedToken)
    }
    console.log(storedToken)
  }, [])

  const setToken = (newToken: string) => {
    localStorage.setItem('access_token', newToken)  
    setTokenState(newToken)
     console.log(setToken)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setTokenState(null)
    router.push('/login')
  }
  

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
