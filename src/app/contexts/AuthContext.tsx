'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Tipo para o usuário
interface User {
  id: number
  email: string
  fullName: string | null
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

      if (response.ok && data.user) {
        setUser(data.user)
        setInitialCheckDone(true);
        return true
      } else {
        setUser(null)
        setInitialCheckDone(true);
        return false
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
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
          console.error('AuthContext: Erro na verificação inicial:', error)
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

          // Atualizar o estado do usuário com os dados recebidos
          setUser(userData.user)
          // Marcar a verificação inicial como concluída
          setInitialCheckDone(true)
          return true
        } else {
          console.error('Erro ao obter dados do usuário após login')
          return false
        }
      } else {
        console.error('Erro de login:', data)
        return false
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
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
      console.error('Erro ao fazer logout:', error)
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
