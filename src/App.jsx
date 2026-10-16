import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { initSmoothScroll } from './lib/motion'
import Preloader from './components/Preloader'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Cursor from './components/ui/Cursor'

// start fetching right away, but only mount once the hero has painted
const loadBelowFold = () => import('./components/BelowFold')
const BelowFold = lazy(loadBelowFold)

const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 200))

export default function App() {
  const [ready, setReady] = useState(false)
  const [rest, setRest] = useState(false)
  const done = useCallback(() => setReady(true), [])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    initSmoothScroll()
    loadBelowFold()
  }, [])

  useEffect(() => {
    if (ready) idle(() => setRest(true))
  }, [ready])

  return (
    <div className="grain">
      <Preloader onDone={done} />
      <Cursor />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
      </main>
      {rest ? (
        <Suspense fallback={<div className="h-screen" />}>
          <BelowFold />
        </Suspense>
      ) : (
        <div className="h-screen" />
      )}
    </div>
  )
}
