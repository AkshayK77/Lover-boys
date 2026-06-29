import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

interface UIContextValue {
  drawerOpen: boolean
  drawerInitMessage: string | null
  openDrawer: (initMessage?: string) => void
  closeDrawer: () => void
  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerInitMessage, setDrawerInitMessage] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const openDrawer = useCallback((initMessage?: string) => {
    setDrawerInitMessage(initMessage ?? null)
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    setDrawerInitMessage(null)
  }, [])

  const openMobileNav = useCallback(() => setMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <UIContext value={{ drawerOpen, drawerInitMessage, openDrawer, closeDrawer, mobileNavOpen, openMobileNav, closeMobileNav }}>
      {children}
    </UIContext>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside UIProvider')
  return ctx
}
