import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const setLight  = () => setTheme('light')
  const setDark   = () => setTheme('dark')
  const setSystem = () => {
    const sys = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    setTheme(sys)
    localStorage.removeItem('theme')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, setLight, setDark, setSystem }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
