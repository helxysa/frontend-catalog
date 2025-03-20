import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppWrapper } from './componentes/Sidebar/AppWrapper'
import { SidebarProvider } from './componentes/Sidebar/SidebarContext';

const montserrat = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catalog do Ministerio",
  description: "Catalog do Ministerio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${montserrat.className}  antialiased vsc-initialized`}>
        <SidebarProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
        </SidebarProvider>
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
