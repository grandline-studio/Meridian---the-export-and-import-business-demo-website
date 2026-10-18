import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'motion/react'
import { testimonials } from '../config'
import Kicker from './ui/Kicker'

const initials = (n) =>
  n
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('')
    .slice(0, 2)

export default function Testimonials() {
  const [order, setOrder] = useState(testimonials.map((_, i) => i))
  const [dir, setDir] = useState(1)
  const ref = useRef()
  const inView = useInView(ref, { margin: '-20% 0px' })
  const [hover, setHover] = useState(false)

  const next = (d = 1) => {
    setDir(d)
    setOrder((o) => [...o.slice(1), o[0]])
  }
  useEffect(() => {
    if (!inView || hover) return
    const id = setInterval(() => next(1), 5500)
    return () => clearInterval(id)
  }, [inView, hover])

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">
        <div>
          <Kicker index="06">Partners say</Kicker>
          <h2 className="mt-5 text-[clamp(2.2rem,4.6vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.035em]">
            Trusted by importers on
            <span className="serif-i text-signal"> five continents.</span>
          </h2>
          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-2">
              {testimonials.map((t) => (
                <span key={t.name} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-ink-3 text-xs font-medium">
                  {initials(t.name)}
                </span>
              ))}
            </div>
            <div className="text-sm text-mute">
              <span className="text-bone">4.9/5</span> average across 380+ reviewed shipments
            </div>
          </div>
          <div className="mt-10 flex gap-2">
            <button onClick={() => next(-1)} aria-label="Previous" className="flex h-12 w-12 items-center justify-center rounded-full border border-fg/15 transition-colors hover:bg-fg/5">
              ←
            </button>
            <button onClick={() => next(1)} aria-label="Next" className="flex h-12 w-12 items-center justify-center rounded-full bg-bone text-ink transition-colors hover:bg-signal">
              →
            </button>
          </div>
        </div>

        <div className="relative h-[400px] md:h-[440px]" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
          <AnimatePresence initial={false} custom={dir}>
            {order.slice(0, 3).map((idx, pos) => {
              const t = testimonials[idx]
              const top = pos === 0
              return (
                <motion.figure
                  key={idx}
                  custom={dir}
                  className={`absolute inset-0 flex cursor-grab flex-col justify-between rounded-3xl border border-fg/10 p-7 active:cursor-grabbing md:p-9 ${top ? 'bg-ink-3' : 'bg-ink-2'}`}
                  style={{ zIndex: 10 - pos, transformOrigin: 'bottom center' }}
                  initial={{ scale: 0.85, y: 60, opacity: 0 }}
                  animate={{ scale: 1 - pos * 0.06, y: pos * -26, opacity: 1 - pos * 0.3, rotate: pos === 0 ? 0 : pos % 2 ? -2.5 : 2.5 }}
                  exit={(d) => ({ x: d * 520, rotate: d * 18, opacity: 0, transition: { duration: 0.5 } })}
                  transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                  drag={top ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.9}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600) next(info.offset.x > 0 ? 1 : -1)
                  }}
                  whileDrag={{ scale: 1.03 }}
                  data-cursor="Drag"
                >
                  <div className="flex items-center justify-between">
                    <span className="serif-i text-7xl leading-none text-signal">“</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{t.country}</span>
                  </div>
                  <blockquote className="text-xl leading-snug tracking-tight md:text-2xl">{t.quote}</blockquote>
                  <figcaption className="flex items-center gap-4 border-t border-fg/10 pt-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-signal to-signal-2 text-sm font-semibold text-night">{initials(t.name)}</span>
                    <div>
                      <div className="font-medium">{t.name}</div>
                      <div className="text-sm text-mute">
                        {t.role}, {t.company}
                      </div>
                    </div>
                  </figcaption>
                </motion.figure>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
