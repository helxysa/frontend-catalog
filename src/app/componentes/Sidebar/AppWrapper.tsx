'use client'
import { Sidebar } from './Sidebar'
import { usePathname } from 'next/navigation'

export function AppWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isProprietarioPage = pathname?.startsWith('/proprietario')
  const isLoginPage = pathname?.startsWith('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isProprietarioPage && !isLoginPage && <Sidebar />}
      <main className={!isProprietarioPage && !isLoginPage ? "flex-1 md:pl-64 pt-16 md:pt-0" : "flex-1"}>
        {children}
      </main>
    </div>
  )
} 
