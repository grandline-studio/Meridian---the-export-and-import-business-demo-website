import { useEffect } from 'react'
import { ScrollTrigger } from '../lib/motion'
import Services from './Services'
import ContainerSection from './ContainerSection'
import Products from './Products'
import Journey from './Journey'
import Track from './Track'
import Testimonials from './Testimonials'
import Quote from './Quote'
import Footer from './Footer'

/** Everything after the hero — loaded as a separate chunk once the hero is on screen. */
export default function BelowFold() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()
    const id = setTimeout(refresh, 300)
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    return () => {
      clearTimeout(id)
      window.removeEventListener('load', refresh)
    }
  }, [])
  return (
    <>
      <main>
        <Services />
        <ContainerSection />
        <Products />
        <Journey />
        <Track />
        <Testimonials />
        <Quote />
      </main>
      <Footer />
    </>
  )
}
