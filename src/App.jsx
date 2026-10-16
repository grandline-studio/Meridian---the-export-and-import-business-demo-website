import { useCallback, useEffect, useState } from 'react'
import { initSmoothScroll, ScrollTrigger } from './lib/motion'
import Preloader from './components/Preloader'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Services from './components/Services'
import ContainerSection from './components/ContainerSection'
import Products from './components/Products'
import Journey from './components/Journey'
import Track from './components/Track'
import Testimonials from './components/Testimonials'
import Quote from './components/Quote'
import Footer from './components/Footer'
import Cursor from './components/ui/Cursor'

export default function App() {
  const [ready, setReady] = useState(false)
  const done = useCallback(() => setReady(true), [])

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    initSmoothScroll()
    const refresh = () => ScrollTrigger.refresh()
    const id = setTimeout(refresh, 800)
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => {
      clearTimeout(id)
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <div className="grain">
      <Preloader onDone={done} />
      <Cursor />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <Services />
        <ContainerSection />
        <Products />
        <Journey />
        <Track />
        <Testimonials />
        <Quote />
      </main>
      <Footer />
    </div>
  )
}
