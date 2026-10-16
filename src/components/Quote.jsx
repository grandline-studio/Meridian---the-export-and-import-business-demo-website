import { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../lib/motion'
import { ctaVideo, ctaPoster, products, destinations, brand } from '../config'

const loads = [
  { id: 'lcl', label: 'LCL', sub: 'Shared container', cbm: '< 15 CBM' },
  { id: '20', label: "20' FCL", sub: 'Standard', cbm: '33 CBM' },
  { id: '40', label: "40' HC", sub: 'High cube', cbm: '76 CBM' },
  { id: 'air', label: 'Air', sub: 'Express', cbm: 'By kg' },
]

const field = 'w-full rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-sm text-bone outline-none transition-colors placeholder:text-mute/70 focus:border-signal/60'

export default function Quote() {
  const section = useRef()
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const [f, setF] = useState({ mode: 'export', product: products[0].name, dest: 'Rotterdam', load: '20', name: '', email: '', company: '' })
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v?.target ? v.target.value : v }))
  const dest = destinations.find((d) => d.name === f.dest)
  const transit = useMemo(() => (f.load === 'air' ? '2–4 days' : `${dest?.days ?? 20}–${(dest?.days ?? 20) + 4} days`), [f.load, dest])

  useGSAP(
    () => {
      gsap.fromTo('.cta-video', { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'top top', scrub: true } })
      gsap.from('.cta-line', { yPercent: 110, stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: section.current, start: 'top 70%' } })
    },
    { scope: section }
  )

  const canNext = step === 0 || step === 1 || (f.name && /\S+@\S+\.\S+/.test(f.email))

  return (
    <section ref={section} id="quote" className="relative overflow-hidden">
      {/* video band */}
      <div className="relative flex h-[70svh] min-h-[480px] items-end overflow-hidden px-5 pb-14 md:px-12 md:pb-20">
        <video className="cta-video absolute inset-0 h-full w-full object-cover" src={ctaVideo} poster={ctaPoster} autoPlay muted loop playsInline preload="metadata" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
        <h2 className="relative text-[clamp(3rem,10vw,10rem)] font-medium leading-[0.88] tracking-[-0.05em]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span className="cta-line block">Ready to</span>
          </span>
          <span className="block overflow-hidden pb-[0.1em]">
            <span className="cta-line serif-i block pr-4 text-signal">set sail?</span>
          </span>
        </h2>
      </div>

      <div className="relative px-4 pb-28 md:px-10 md:pb-36">
        <div className="mx-auto -mt-6 grid max-w-6xl gap-4 md:grid-cols-[1.4fr_1fr]">
          {/* form */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-2 p-6 md:p-9">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                Landed-cost quote · Step <span className="text-bone">{Math.min(step + 1, 3)}</span>/3
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1 w-8 rounded-full transition-colors duration-500 ${i <= step ? 'bg-signal' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[360px] flex-col items-center justify-center text-center">
                  <motion.div initial={{ scale: 3, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: -8, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }} className="rounded-lg border-2 border-sea px-5 py-2 font-mono text-xl font-bold uppercase tracking-[0.2em] text-sea">
                    Received
                  </motion.div>
                  <h3 className="mt-8 text-3xl font-medium tracking-tight">Thanks{f.name ? `, ${f.name.split(' ')[0]}` : ''}.</h3>
                  <p className="mt-3 max-w-sm text-mute">A trade desk executive will send your landed-cost breakdown for {f.product.toLowerCase()} to {f.dest} within 24 hours.</p>
                  <button onClick={() => { setSent(false); setStep(0) }} className="mt-8 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5">
                    Start another quote
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!canNext) return
                    if (step < 2) setStep(step + 1)
                    else setSent(true)
                  }}
                  className="mt-7 min-h-[360px]"
                >
                  {step === 0 && (
                    <>
                      <h3 className="text-2xl font-medium tracking-tight md:text-3xl">What are you moving?</h3>
                      <div className="mt-6 inline-flex rounded-full border border-white/10 p-1">
                        {['export', 'import'].map((m) => (
                          <button type="button" key={m} onClick={() => set('mode')(m)} className="relative rounded-full px-6 py-2 text-sm capitalize">
                            {f.mode === m && <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-bone" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                            <span className={`relative ${f.mode === m ? 'text-ink' : 'text-mute'}`}>{m}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {products.map((p) => (
                          <button type="button" key={p.name} onClick={() => set('product')(p.name)} className={`rounded-full border px-4 py-2 text-sm transition-all ${f.product === p.name ? 'border-signal bg-signal/10 text-bone' : 'border-white/10 text-mute hover:border-white/30'}`}>
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <h3 className="text-2xl font-medium tracking-tight md:text-3xl">Where and how much?</h3>
                      <label className="mt-6 block text-xs text-mute">
                        Destination port
                        <select value={f.dest} onChange={set('dest')} className={`${field} mt-2`}>
                          {destinations.map((d) => (
                            <option key={d.name} value={d.name} className="bg-ink">
                              {d.name}, {d.country}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {loads.map((l) => (
                          <button type="button" key={l.id} onClick={() => set('load')(l.id)} className={`rounded-2xl border p-4 text-left transition-all ${f.load === l.id ? 'border-signal bg-signal/10' : 'border-white/10 hover:border-white/30'}`}>
                            <div className="text-lg font-medium">{l.label}</div>
                            <div className="mt-1 text-xs text-mute">{l.sub}</div>
                            <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-signal">{l.cbm}</div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h3 className="text-2xl font-medium tracking-tight md:text-3xl">Where do we send it?</h3>
                      <div className="mt-6 grid gap-3 md:grid-cols-2">
                        <input required value={f.name} onChange={set('name')} placeholder="Full name" className={field} autoComplete="name" />
                        <input value={f.company} onChange={set('company')} placeholder="Company" className={field} autoComplete="organization" />
                        <input required type="email" value={f.email} onChange={set('email')} placeholder="Work email" className={`${field} md:col-span-2`} autoComplete="email" />
                      </div>
                      <p className="mt-4 text-xs text-mute">No spam. One quote, one follow-up call if you want it.</p>
                    </>
                  )}
                  <div className="mt-10 flex items-center justify-between">
                    <button type="button" onClick={() => setStep(Math.max(0, step - 1))} className={`text-sm text-mute transition-opacity hover:text-bone ${step === 0 ? 'pointer-events-none opacity-0' : ''}`}>
                      ← Back
                    </button>
                    <button disabled={!canNext} className="group relative overflow-hidden rounded-full bg-signal px-7 py-3.5 text-sm font-medium text-ink transition-opacity disabled:opacity-40">
                      <span className="relative z-10">{step < 2 ? 'Continue →' : 'Request quote'}</span>
                      <span className="absolute inset-0 translate-y-full bg-bone transition-transform duration-500 group-hover:translate-y-0" />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* live summary */}
          <div className="flex flex-col gap-4">
            <div className="beam-border rounded-3xl border border-white/10 bg-ink-2 p-6 md:p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Your shipment</div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-mute">{f.mode === 'export' ? 'From' : 'To'}</div>
                  <div className="text-xl font-medium">Nhava Sheva</div>
                </div>
                <div className="relative h-px flex-1 bg-gradient-to-r from-signal/0 via-signal to-signal/0">
                  <motion.span className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-signal" animate={{ left: ['0%', '100%'] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
                </div>
                <div className="text-right">
                  <div className="text-xs text-mute">{f.mode === 'export' ? 'To' : 'From'}</div>
                  <AnimatePresence mode="wait">
                    <motion.div key={f.dest} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="text-xl font-medium">
                      {f.dest}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <dl className="mt-6 space-y-2.5 border-t border-white/10 pt-5 text-sm">
                {[
                  ['Cargo', f.product],
                  ['Load', loads.find((l) => l.id === f.load)?.label],
                  ['Est. transit', transit],
                  ['Quote in', '< 24 hours'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-mute">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <a href={`https://wa.me/${brand.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-3xl border border-white/10 bg-ink-2 p-6 transition-colors hover:border-[#25D366]/50">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Prefer to chat?</div>
                <div className="mt-1 text-lg font-medium">WhatsApp the trade desk</div>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-ink transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3.1.2.1.8-.1 1.4z" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
