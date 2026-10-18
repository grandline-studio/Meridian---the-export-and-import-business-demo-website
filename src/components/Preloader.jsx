import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { brand } from '../config'

/** Container-code counter that lifts like a shutter. */
export default function Preloader({ onDone }) {
  const root = useRef()
  const num = useRef()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    document.getElementById('boot')?.remove()
    const o = { v: 0 }
    const ctx = gsap.context(() => {
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to(o, {
          v: 100,
          duration: 1.1,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (num.current) num.current.textContent = String(Math.round(o.v)).padStart(3, '0')
          },
        })
        .to('.pl-bar', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
        .to('.pl-inner', { yPercent: -30, autoAlpha: 0, duration: 0.5, ease: 'power3.in' })
        .add(() => onDone?.(), '-=0.15')
        .to('.pl-shutter', { scaleY: 0, duration: 0.8, ease: 'expo.inOut', stagger: 0.05, transformOrigin: 'top' }, '-=0.3')
    }, root)
    return () => ctx.revert()
  }, [onDone])

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 grid grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="pl-shutter h-full bg-ink-2" style={{ boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      <div className="pl-inner absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-mute">Loading manifest</div>
        <div className="mt-6 flex items-end gap-4">
          <div className="text-[clamp(4rem,14vw,10rem)] font-medium leading-none tracking-tighter text-bone">
            <span ref={num}>000</span>
          </div>
          <div className="mb-3 font-mono text-xs text-signal">%</div>
        </div>
        <div className="mt-6 h-px w-64 bg-fg/10">
          <div className="pl-bar h-full origin-left scale-x-0 bg-signal" />
        </div>
        <div className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-mute">
          MRDU 482193 · 7 — {brand.name} {brand.suffix}
        </div>
      </div>
    </div>
  )
}
