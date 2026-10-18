import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'motion/react'
import { services } from '../config'
import { visuals } from './ServiceVisuals'
import Tilt from './ui/Tilt'
import Kicker from './ui/Kicker'
import RevealText from './ui/RevealText'
import { getLenis, scrollToId } from '../lib/motion'

function ServiceCard({ s, index, onOpen }) {
  const ref = useRef()
  const inView = useInView(ref, { margin: '-10% 0px' })
  const Visual = visuals[s.id]
  return (
    <motion.div
      ref={ref}
      className={`${s.span} h-[360px] md:h-[400px]`}
      initial={{ opacity: 0, y: 60, rotateX: -12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 1, delay: (index % 3) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ transformPerspective: 1200 }}
    >
      <Tilt max={6} className="h-full rounded-3xl">
        <motion.button
          layoutId={`card-${s.id}`}
          onClick={() => onOpen(s)}
          className="beam-border group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-fg/[0.07] bg-ink-2 text-left [--beam-opacity:0] hover:[--beam-opacity:1]"
          data-cursor="Open"
        >
          <div className="relative min-h-0 flex-1 [transform:translateZ(30px)]">
            <Visual active={inView} />
          </div>
          <div className="relative flex items-end justify-between gap-4 border-t border-fg/[0.06] p-5 md:p-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">{s.kicker}</div>
              <motion.h3 layoutId={`title-${s.id}`} className="mt-2 text-2xl font-medium tracking-tight">
                {s.title}
              </motion.h3>
              <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-mute">{s.blurb}</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-fg/15 transition-all duration-500 group-hover:rotate-45 group-hover:border-signal group-hover:bg-signal group-hover:text-night">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </motion.button>
      </Tilt>
    </motion.div>
  )
}

function ServiceDialog({ s, onClose }) {
  const Visual = visuals[s.id]
  useEffect(() => {
    const l = getLenis()
    l?.stop()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      l?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-8">
      <motion.div className="absolute inset-0 bg-ink/70 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        layoutId={`card-${s.id}`}
        className="relative z-10 grid max-h-[92svh] w-full max-w-4xl overflow-hidden rounded-3xl border border-fg/10 bg-ink-2 md:grid-cols-2"
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        role="dialog"
        aria-modal="true"
        aria-label={s.title}
      >
        <div className="relative h-56 border-b border-fg/5 md:h-auto md:border-b-0 md:border-r">
          <Visual active />
        </div>
        <div className="overflow-y-auto p-6 md:p-9" data-lenis-prevent>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">{s.kicker}</div>
          <motion.h3 layoutId={`title-${s.id}`} className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {s.title}
          </motion.h3>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} exit={{ opacity: 0 }}>
            <p className="mt-4 leading-relaxed text-mute">{s.detail}</p>
            <ul className="mt-6 grid gap-2">
              {s.points.map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.3 + i * 0.06 } }}
                  className="flex items-center gap-3 rounded-xl border border-fg/5 bg-fg/[0.02] px-4 py-3 text-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                  {p}
                </motion.li>
              ))}
            </ul>
            <button
              onClick={() => {
                onClose()
                setTimeout(() => scrollToId('quote'), 350)
              }}
              className="mt-7 w-full rounded-full bg-signal py-3.5 text-sm font-medium text-night transition-colors hover:bg-signal-2"
            >
              Get a quote for {s.title.toLowerCase()}
            </button>
          </motion.div>
        </div>
        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-fg/15 bg-ink/60 backdrop-blur transition-colors hover:bg-fg/10">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </motion.div>
    </div>
  )
}

export default function Services() {
  const [open, setOpen] = useState(null)
  return (
    <section id="services" className="relative px-4 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 grid gap-8 md:mb-20 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Kicker index="01">What we handle</Kicker>
            <RevealText text="Every link in the chain, *handled.*" className="mt-6 max-w-3xl text-[clamp(2.4rem,5.5vw,5rem)] font-medium leading-[0.98] tracking-[-0.035em]" />
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-mute">Tap any card — each one is a live view of how that desk works for you, from booking space on a vessel to stamping the final customs release.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.id} s={s} index={i} onOpen={setOpen} />
          ))}
        </div>
      </div>
      <AnimatePresence>{open && <ServiceDialog s={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  )
}
