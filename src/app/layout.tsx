
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppWrapper } from './componentes/Sidebar/AppWrapper'

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
    <html lang="pt-BR">
      <body className={montserrat.className}>
        <AppWrapper>
          {children}
        </AppWrapper>
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
