import { ReactNode } from "react"
import { Header } from "./header"
import { Footer } from "./footer"

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" 
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className={`flex-1 ${className || ""}`}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
