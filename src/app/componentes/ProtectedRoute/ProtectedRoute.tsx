'use client'

import { useEffect, ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Variável para controlar se o componente está montado
    let isMounted = true;

    const verifyAuth = async () => {
      if (isMounted) {
        if (loading) {
          return;
        }
        if (user) {
        } else {
          router.push('/login')
        }
      }
    }

    // Executar a verificação apenas quando o loading mudar para false
    if (!loading) {
      verifyAuth()
    }

    // Função de limpeza para evitar atualizações de estado após desmontagem
    return () => {
      isMounted = false;
    }
  }, [user, loading, router])

  // Mostrar um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Se o usuário não estiver autenticado, não renderiza nada (será redirecionado)
  if (!user && !loading) {
    return null
  }

  // Se o usuário estiver autenticado, renderiza os filhos
  return <>{children}</>
}
