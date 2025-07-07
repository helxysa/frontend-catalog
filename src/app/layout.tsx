import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppWrapper } from './componentes/Sidebar/AppWrapper'
import { SidebarProvider } from './componentes/Sidebar/SidebarContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProprietariosProvider } from './contexts/ProprietarioContext';

const montserrat = Montserrat({
  subsets: ["latin"],
  display: 'swap', // Adiciona display swap para melhorar o LCP
});

export const metadata: Metadata = {
  title: "Catalog do Ministerio",
  description: "Catalog do Ministerio",
  // Adiciona metadados para precarregamento de recursos críticos
  other: {
    'link': [
      '/images.webp',
     
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${montserrat.className}  antialiased vsc-initialized`}>
        <AuthProvider>
          <ProprietariosProvider>
          <SidebarProvider>
            <AppWrapper>
              {children}
            </AppWrapper>
          </SidebarProvider>
        </ProprietariosProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

export function ProprietarioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
