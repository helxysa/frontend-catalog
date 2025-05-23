'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Tipo para o usuário
interface User {
  id: number
  email: string
  fullName: string | null
  isAdmin?: boolean // Novo campo para identificar admin
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

  // Variável para controlar se a verificação inicial já foi feita
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Função para verificar se o usuário está autenticado
  const checkAuth = async (): Promise<boolean> => {
    // Se já tiver um usuário autenticado, retorna true imediatamente
    if (user) {
      return true;
    }

    // Se já estiver verificando, não faz nada
    if (isCheckingAuth) {
      return false;
    }

    // Se a verificação inicial já foi feita e não há usuário, retorna false
    if (initialCheckDone && !user) {
      return false;
    }

    try {
      setIsCheckingAuth(true);
      // Usar a API do frontend em vez de fetch diretamente
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333'}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Importante para enviar cookies
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Adicionar um parâmetro de cache-busting para evitar cache
        cache: 'no-store',
      })


      if (response.status === 401) {
        // Se não estiver autenticado, não precisamos processar o JSON
        setUser(null)
        setInitialCheckDone(true);
        return false
      }

      const data = await response.json()
      
      // Adicionar flag isAdmin baseado no ID do usuário
      const userData = {
        ...data.user,
        isAdmin: data.user.id === 1 // ID 1 é considerado admin
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

  // Verificar autenticação ao carregar o componente apenas uma vez
  useEffect(() => {
    // Variável para controlar se o componente está montado e se a verificação já foi feita
    let isMounted = true;
    let initialCheckDone = false;

    const initialCheck = async () => {
      // Verificar se o componente ainda está montado e se a verificação ainda não foi feita
      if (isMounted && !initialCheckDone) {
        initialCheckDone = true;
        try {
          // Fazer uma verificação inicial com o servidor
          const result = await checkAuth();
        } catch (error) {
        }
      }
    };

    initialCheck();

    // Função de limpeza para evitar atualizações de estado após desmontagem
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
        credentials: 'include', // Importante para receber cookies
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
          
          // Adicionar flag isAdmin baseado no ID do usuário
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

      // Limpar o estado do usuário
      setUser(null)

      // Redirecionar para a página de login
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

