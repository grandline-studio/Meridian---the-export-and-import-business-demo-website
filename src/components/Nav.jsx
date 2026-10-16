import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { brand } from '../config'
import { scrollToId, getLenis } from '../lib/motion'
import Magnetic from './ui/Magnetic'

const links = [
  ['services', 'Services'],
  ['products', 'Products'],
  ['journey', 'Process'],
  ['track', 'Track'],
  ['quote', 'Contact'],
]

export function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeOpacity=".35" />
        <ellipse cx="16" cy="16" rx="5.5" ry="12" stroke="currentColor" strokeOpacity=".6" />
        <path d="M4 16h24" stroke="currentColor" strokeOpacity=".35" />
        <circle cx="21.5" cy="11" r="2.4" fill="#ff6b2c" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">
        {brand.name}
        <span className="font-normal text-mute"> {brand.suffix}</span>
      </span>
    </span>
  )
}

export default function Nav() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      setHidden(y > last && y > 300 && !open)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  useEffect(() => {
    const l = getLenis()
    if (open) l?.stop()
    else l?.start()
  }, [open])

  const go = (id) => {
    setOpen(false)
    setTimeout(() => scrollToId(id), 50)
  }

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:pt-4"
      >
        <nav className={`flex w-full max-w-6xl items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-500 md:px-5 ${scrolled ? 'border-white/10 bg-ink/90 md:bg-ink/60 md:backdrop-blur-xl' : 'border-transparent'}`}>
          <button onClick={() => go('top')} aria-label="Home">
            <Logo />
          </button>
          <ul className="hidden items-center gap-1 md:flex">
            {links.map(([id, label]) => (
              <li key={id}>
                <button onClick={() => go(id)} className="group relative overflow-hidden rounded-full px-4 py-2 text-[13px] text-mute transition-colors hover:text-bone">
                  <span className="block transition-transform duration-500 group-hover:-translate-y-full">{label}</span>
                  <span className="absolute inset-x-0 top-full block py-2 text-bone transition-transform duration-500 group-hover:-translate-y-full">{label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Magnetic className="hidden md:inline-block">
              <button onClick={() => go('quote')} className="rounded-full bg-bone px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-signal">
                Request quote
              </button>
            </Magnetic>
            <button onClick={() => setOpen((o) => !o)} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 md:hidden" aria-label="Menu">
              <span className={`absolute h-px w-4 bg-bone transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-1'}`} />
              <span className={`absolute h-px w-4 bg-bone transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-1'}`} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink-2 px-6 pb-12"
          >
            {links.map(([id, label], i) => (
              <motion.button
                key={id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.25 + i * 0.06 } }}
                onClick={() => go(id)}
                className="flex items-baseline gap-4 border-b border-white/10 py-4 text-left text-4xl font-medium tracking-tight"
              >
                <span className="font-mono text-xs text-signal">0{i + 1}</span>
                {label}
              </motion.button>
            ))}
            <div className="mt-8 font-mono text-xs text-mute">
              {brand.email}
              <br />
              {brand.phone}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
