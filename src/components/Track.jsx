import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Kicker from './ui/Kicker'
import { ScrollTrigger } from '../lib/motion'

const events = [
  { t: 'Booking confirmed', d: '02 Oct · 10:14', where: 'Mumbai desk', done: true },
  { t: 'Stuffed & sealed', d: '05 Oct · 16:40', where: 'JNPT CFS · Seal BS-0091827', done: true },
  { t: 'Customs cleared', d: '06 Oct · 09:02', where: 'ICEGATE · LEO granted', done: true },
  { t: 'Loaded on vessel', d: '07 Oct · 22:15', where: 'MV Meridian Star · 042W', done: true },
  { t: 'Transiting Suez Canal', d: '15 Oct · 06:30', where: 'Port Said', done: true, live: true },
  { t: 'Arrival Rotterdam', d: 'ETA 29 Oct', where: 'ECT Delta terminal', done: false },
  { t: 'Delivered', d: 'ETA 31 Oct', where: 'Consignee warehouse', done: false },
]

export default function Track() {
  const [code, setCode] = useState('MRDU 482193 7')
  const [state, setState] = useState('idle') // idle | loading | done

  // panel height changes -> recompute downstream scroll triggers
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 1800)
    return () => clearTimeout(id)
  }, [state])

  const submit = (e) => {
    e.preventDefault()
    setState('loading')
    setTimeout(() => setState('done'), 1100)
  }

  return (
    <section id="track" className="relative px-4 py-28 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <div>
          <Kicker index="05">Track a shipment</Kicker>
          <h2 className="mt-5 text-[clamp(2.2rem,4.6vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.035em]">
            Know where your cargo is.
            <span className="serif-i text-mute"> Always.</span>
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-mute">Every client gets a live dashboard: vessel position, document status, temperature logs and ETA alerts on WhatsApp. Try the demo container below.</p>
          <form onSubmit={submit} className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-fg/15 bg-ink-2 p-1.5 pl-5 focus-within:border-signal/60">
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-mute" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 14l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              aria-label="Container or B/L number"
              className="min-w-0 flex-1 bg-transparent font-mono text-sm tracking-wider text-bone outline-none placeholder:text-mute"
              placeholder="Container / B/L number"
            />
            <button className="rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-night transition-colors hover:bg-signal-2">Track</button>
          </form>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Demo data · real dashboards update every 15 min</div>
        </div>

        <div className="relative min-h-[520px] rounded-3xl border border-fg/10 bg-ink-2 p-5 md:p-8">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div key="idle" exit={{ opacity: 0, y: -10 }} className="flex h-full min-h-[460px] flex-col items-center justify-center text-center">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="flex h-20 w-20 items-center justify-center rounded-2xl border border-fg/10 bg-ink-3">
                  <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none">
                    <rect x="5" y="11" width="30" height="18" rx="1.5" stroke="#ff6b2c" strokeWidth="1.5" />
                    {[11, 16, 21, 26, 31].map((x) => (
                      <path key={x} d={`M${x} 14v12`} stroke="#ff6b2c" strokeOpacity=".5" />
                    ))}
                  </svg>
                </motion.div>
                <p className="mt-6 text-mute">
                  Hit <span className="text-bone">Track</span> to load the demo shipment.
                </p>
              </motion.div>
            )}
            {state === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-fg/[0.04]" style={{ animationDelay: `${i * 80}ms` }} />
                ))}
              </motion.div>
            )}
            {state === 'done' && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Container</div>
                    <div className="mt-1 font-mono text-lg tracking-wider">{code || 'MRDU 482193 7'}</div>
                  </div>
                  <span className="flex items-center gap-2 rounded-full border border-sea/30 bg-sea/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-sea">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sea" /> In transit · on schedule
                  </span>
                </div>
                {/* voyage bar */}
                <div className="mt-6">
                  <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-mute">
                    <span>Nhava Sheva</span>
                    <span>Rotterdam</span>
                  </div>
                  <div className="relative mt-3 h-1.5 rounded-full bg-fg/10">
                    <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-signal to-signal-2" initial={{ width: 0 }} animate={{ width: '64%' }} transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }} />
                    <motion.div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" initial={{ left: 0 }} animate={{ left: '64%' }} transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bone shadow-[0_0_0_6px_rgba(255,107,44,0.25)]">
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-ink" fill="currentColor">
                          <path d="M2 9h12l-2 4H4zM5 5h3v3H5zm4 0h3v3H9z" />
                        </svg>
                      </span>
                    </motion.div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      ['Distance left', '3,912 nm'],
                      ['Speed', '17.4 kn'],
                      ['ETA', '29 Oct'],
                    ].map(([k, v], i) => (
                      <motion.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 + i * 0.08 } }} className="rounded-xl border border-fg/5 bg-fg/[0.02] p-3">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-mute">{k}</div>
                        <div className="mt-1 text-lg font-medium">{v}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                {/* timeline */}
                <ol className="relative mt-7 space-y-0">
                  {events.map((e, i) => (
                    <motion.li key={e.t} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.6 + i * 0.09 } }} className="relative flex gap-4 pb-4 last:pb-0">
                      <div className="relative flex flex-col items-center">
                        <span className={`relative z-10 mt-1 h-3 w-3 rounded-full border-2 ${e.done ? 'border-signal bg-signal' : 'border-fg/25 bg-ink-2'}`}>
                          {e.live && <span className="absolute -inset-1.5 animate-ping rounded-full bg-signal/50" />}
                        </span>
                        {i < events.length - 1 && <span className={`absolute top-4 h-full w-px ${e.done && events[i + 1].done ? 'bg-signal/60' : 'bg-fg/10'}`} />}
                      </div>
                      <div className="flex flex-1 flex-wrap justify-between gap-x-4 text-sm">
                        <div>
                          <div className={e.done ? 'text-bone' : 'text-mute'}>{e.t}</div>
                          <div className="text-xs text-mute">{e.where}</div>
                        </div>
                        <div className="font-mono text-[11px] text-mute">{e.d}</div>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
