import { useState, useEffect, useCallback } from 'react'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'app-theme'

export function useTheme() {
  // Initialize state with a function to avoid execution during SSR
  const [theme, setThemeState] = useState<Theme>(() => {
    // Return null during SSR since localStorage is not available
    if (typeof window === 'undefined') return 'dark'
    
    // Check localStorage first
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as Theme | null
    if (storedTheme) return storedTheme
    
    // Then check user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })
  
  // Update theme in localStorage and document
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, newTheme)
    }
  }, [])
  
  // Update document when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
  
  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }
    
    // Add listener
    mediaQuery.addEventListener('change', handleChange)
    
    // Clean up
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  
  return { theme, setTheme }
} 