import { useEffect, useId, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { brand } from '../config'
import { scrollToId, getLenis } from '../lib/motion'
import { useTheme } from '../lib/theme'
import Magnetic from './ui/Magnetic'
import LiquidGlass from './ui/LiquidGlass'

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
        <circle cx="21.5" cy="11" r="2.4" fill="var(--signal)" />
      </svg>
      <span className="display whitespace-nowrap text-[15px] font-semibold tracking-tight">
        {brand.name}
        <span className="font-normal text-mute"> {brand.suffix}</span>
      </span>
    </span>
  )
}

/** Sun ↔ moon morph: the moon is the sun's disc with a second circle masked out of it. */
function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  const mask = `moon${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const spring = { type: 'spring', stiffness: 260, damping: 20 }
  return (
    <LiquidGlass
      as="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`flex h-10 w-10 shrink-0 items-center justify-center text-bone ${className}`}
      band={12}
      strength={24}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
        <mask id={mask}>
          <rect width="24" height="24" fill="white" />
          <motion.circle r="6" fill="black" initial={false} animate={{ cx: dark ? 16.5 : 30, cy: dark ? 7.5 : -6 }} transition={spring} />
        </mask>
        <motion.circle cx="12" cy="12" fill="currentColor" mask={`url(#${mask})`} initial={false} animate={{ r: dark ? 8 : 4.5 }} transition={spring} />
        <motion.g
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ originX: '12px', originY: '12px' }}
          initial={false}
          animate={{ opacity: dark ? 0 : 1, rotate: dark ? -60 : 0, scale: dark ? 0.4 : 1 }}
          transition={spring}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.2" x2="12" y2="4.4" transform={`rotate(${a} 12 12)`} />
          ))}
        </motion.g>
      </svg>
    </LiquidGlass>
  )
}

export default function Nav() {
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    let last = 0
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > last && y > 300 && !open)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

  // highlight the section currently in the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    const watch = () => links.forEach(([id]) => document.getElementById(id) && io.observe(document.getElementById(id)))
    watch()
    // sections below the hero mount a moment later
    const mo = new MutationObserver(watch)
    mo.observe(document.body, { childList: true, subtree: true })
    const stop = setTimeout(() => mo.disconnect(), 6000)
    return () => {
      io.disconnect()
      mo.disconnect()
      clearTimeout(stop)
    }
  }, [])

  useEffect(() => {
    const l = getLenis()
    if (open) l?.stop()
    else l?.start()
  }, [open])

  const go = (id) => {
    setOpen(false)
    setTimeout(() => scrollToId(id), 50)
  }

  const pill = hover ?? active

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center gap-2 px-3 pt-3 md:pt-4"
      >
        <LiquidGlass as="nav" className="flex w-full max-w-5xl items-center justify-between py-1.5 pl-4 pr-1.5 md:pl-5">
          <button onClick={() => go('top')} aria-label="Home" className="text-bone">
            <Logo />
          </button>
          <ul className="hidden items-center md:flex" onPointerLeave={() => setHover(null)}>
            {links.map(([id, label]) => (
              <li key={id}>
                <button
                  onClick={() => go(id)}
                  onPointerEnter={() => setHover(id)}
                  className={`relative rounded-full px-4 py-2 text-[13px] transition-colors duration-300 ${pill === id ? 'text-bone' : 'text-mute hover:text-bone'}`}
                >
                  {pill === id && (
                    <motion.span
                      layoutId="nav-bubble"
                      className="absolute inset-0 rounded-full bg-fg/[0.07] shadow-[inset_0_1px_0_var(--glass-edge),inset_0_-1px_0_var(--glass-shine),0_4px_14px_-6px_rgba(0,0,0,0.35)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-1.5">
            <ThemeToggle className="md:hidden" />
            <div className="hidden md:block">
              <Magnetic>
                <button onClick={() => go('quote')} className="rounded-full bg-bone px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-signal hover:text-night">
                  Request quote
                </button>
              </Magnetic>
            </div>
            <button onClick={() => setOpen((o) => !o)} className="relative flex h-10 w-10 items-center justify-center rounded-full bg-fg/[0.06] md:hidden" aria-label="Menu" aria-expanded={open}>
              <span className={`absolute h-px w-4 bg-bone transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-1'}`} />
              <span className={`absolute h-px w-4 bg-bone transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-1'}`} />
            </button>
          </div>
        </LiquidGlass>
        <ThemeToggle className="hidden h-[52px] w-[52px] md:flex" />
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
                className="display flex items-baseline gap-4 border-b border-fg/10 py-4 text-left text-4xl font-semibold tracking-tight"
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
