'use client'
import { Sidebar } from '../componentes/Sidebar/Sidebar'
import { usePathname } from 'next/navigation'

export function AppWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isProprietarioPage = pathname?.startsWith('/proprietario')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isProprietarioPage && <Sidebar />}
      <main className={!isProprietarioPage ? "flex-1 md:pl-64 pt-16 md:pt-0" : "flex-1"}>
        {children}
      </main>
    </div>
  )
} 