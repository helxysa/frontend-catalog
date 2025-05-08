'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  email: string
  fullName: string | null
  isAdmin?: boolean 
  isManager?: boolean
}

// Tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

// Criando o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Provider do contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Variável para controlar se uma verificação já está em andamento
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Função para verificar se o usuário está autenticado
  const checkAuth = async (): Promise<boolean> => {
    if (user) {
      return true;
    }

    if (isCheckingAuth) {
      return false;
    }

    if (initialCheckDone && !user) {
      return false;
    }

    try {
      setIsCheckingAuth(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'}/auth/me`, {
        method: 'GET',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      })


      if (response.status === 401) {
        setUser(null)
        setInitialCheckDone(true);
        return false
      }

      const data = await response.json()
      
      const verifyRole = (roleId: number) => roleId === 2;
      const verifyManager = (roleId: number) => roleId === 3;
      
      const userData = {
        ...data.user,
        isAdmin: verifyRole(data.user.roleId),
        isManager: verifyManager(data.user.roleId)
      }
      
      setUser(userData)
      setInitialCheckDone(true);
      return true
    } catch (error) {
      setUser(null)
      setInitialCheckDone(true);
      return false
    } finally {
      setLoading(false)
      setIsCheckingAuth(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    let initialCheckDone = false;

    const initialCheck = async () => {
      if (isMounted && !initialCheckDone) {
        initialCheckDone = true;
        try {
          const result = await checkAuth();
        } catch (error) {
        }
      }
    };

    initialCheck();

    return () => {
      isMounted = false;
    };
  }, [])

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'}/auth/login`, {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        cache: 'no-store',
      })

      const data = await response.json()

      if (response.ok) {
        // Se o login for bem-sucedido, buscar os dados do usuário
        // Fazer uma requisição para obter os dados do usuário
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          cache: 'no-store',
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          
          const userWithAdminFlag = {
            ...userData.user,
            isAdmin: userData.user.id === 1 // ID 1 é considerado admin
          }
          
          setUser(userWithAdminFlag)
          setInitialCheckDone(true)
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }

  // Função de logout
  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })

      setUser(null)
      router.push('/login')
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

