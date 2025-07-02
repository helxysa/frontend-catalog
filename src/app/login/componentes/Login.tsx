'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/proprietario')
      } else {
        setError("Credenciais inválidas. Por favor, tente novamente.")
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border shadow-lg space-y-6">
          <div className="text-center space-y-4 mb-6">
            <div className="flex justify-center">
              <Image
                src="/images.webp"
                alt="MP-AP Logo"
                width={200}
                height={200}
                className="object-contain"
                loading="lazy"
                sizes="200px"
              />
            </div>
            <div>
              <div className="bg-[#1a73e8] text-white px-8 py-2.5 rounded-md font-bold text-xl tracking-wide inline-block mt-6 shadow-sm hover:bg-[#1557b0] transition-colors">
                Catalog
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-blue-900">Senha</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
