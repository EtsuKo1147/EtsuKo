'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type SiteTheme = 'light' | 'dark'

type SiteThemeContextValue = {
  theme: SiteTheme
  isInverted: boolean
  toggleTheme: () => void
}

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null)

type SiteThemeProviderProps = {
  children: ReactNode
}

export default function SiteThemeProvider({ children }: SiteThemeProviderProps) {
  const [theme, setTheme] = useState<SiteTheme>('light')

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }, [])

  useEffect(() => {
    document.documentElement.dataset.siteTheme = theme
    document.body.dataset.simpleNavInverted = theme === 'dark' ? 'true' : 'false'
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      isInverted: theme === 'dark',
      toggleTheme,
    }),
    [theme, toggleTheme],
  )

  return <SiteThemeContext.Provider value={value}>{children}</SiteThemeContext.Provider>
}

export function useSiteTheme() {
  const context = useContext(SiteThemeContext)

  if (!context) {
    throw new Error('useSiteTheme must be used inside SiteThemeProvider')
  }

  return context
}
