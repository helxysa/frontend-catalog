'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, checkAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const verifyAuth = async () => {
      if (!isMounted) return

      if (!loading) {
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) {
          router.replace('/login')
        }
      }
    }

    verifyAuth()

    return () => {
      isMounted = false
    }
  }, [loading, router, checkAuth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

