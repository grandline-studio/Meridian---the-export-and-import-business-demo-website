import { createContext, useCallback, useContext, useState } from 'react'
import { flushSync } from 'react-dom'
import { reducedMotion } from './motion'

const ThemeCtx = createContext({ theme: 'dark', toggle: () => {} })
const META = { dark: '#06080f', light: '#f2efe8' }

function apply(t) {
  const root = document.documentElement
  root.dataset.theme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META[t])
  try {
    localStorage.setItem('theme', t)
  } catch {
    /* private mode — the choice just won't persist */
  }
}

export function ThemeProvider({ children }) {
  // index.html already set data-theme before first paint
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark')

  const toggle = useCallback(
    (e) => {
      const next = theme === 'dark' ? 'light' : 'dark'
      const commit = () => {
        apply(next)
        setTheme(next)
      }
      if (!document.startViewTransition || reducedMotion) return commit()
      // grow the new theme as a circle out of the toggle button
      const x = e?.clientX ?? window.innerWidth - 60
      const y = e?.clientY ?? 32
      const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
      const root = document.documentElement.style
      root.setProperty('--vt-x', `${x}px`)
      root.setProperty('--vt-y', `${y}px`)
      root.setProperty('--vt-r', `${r}px`)
      document.startViewTransition(() => flushSync(commit))
    },
    [theme]
  )

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

export const useTheme = () => useContext(ThemeCtx)
