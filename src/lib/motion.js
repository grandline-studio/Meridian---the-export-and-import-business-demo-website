import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

export { gsap, ScrollTrigger }

export const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
// phones / low-core devices get lighter 3D (lower pixel ratio, no shadows, fewer particles)
export const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
export const lowPower = isMobile || (typeof navigator !== 'undefined' && (navigator.hardwareConcurrency || 8) <= 4)

// mobile address-bar show/hide shouldn't trigger a full layout refresh
ScrollTrigger.config({ ignoreMobileResize: true })

let lenis
export function initSmoothScroll() {
  if (lenis || reducedMotion) return lenis
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
  lenis.on('scroll', ScrollTrigger.update)
  if (import.meta.env.DEV) window.__lenis = lenis
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}
export const getLenis = () => lenis

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 })
  else el.scrollIntoView({ behavior: 'smooth' })
}

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
/** maps p from [a,b] to [0,1], clamped, eased */
export const range = (p, a, b) => clamp((p - a) / (b - a))
export const smooth = (t) => t * t * (3 - 2 * t)
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
