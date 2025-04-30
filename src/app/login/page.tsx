'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Login from "./componentes/Login"
import { useAuth } from '../contexts/AuthContext'

export default function PageLogin() {
    const { user, loading } = useAuth()
    const router = useRouter()

    // Redirecionar para /proprietario se o usuário já estiver autenticado
    useEffect(() => {
        if (user && !loading) {
            console.log('Usuário já autenticado, redirecionando para /proprietario')
            router.push('/proprietario')
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

    // Se o usuário não estiver autenticado, mostrar o formulário de login
    return (
        <Login />
    )
}