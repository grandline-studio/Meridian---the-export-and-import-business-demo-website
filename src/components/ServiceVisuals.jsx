import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'motion/react'

const C = ['#ff6b2c', '#46d6c8', '#ffb547', '#5b7cfa', '#e2e8f0', '#ef4444']

/* Ship sailing over layered waves with live ETA */
export function SeaVisual({ active }) {
  const [eta, setEta] = useState(22 * 24 * 60)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setEta((e) => (e <= 0 ? 22 * 24 * 60 : e - 151)), 250)
    return () => clearInterval(id)
  }, [active])
  const d = Math.floor(eta / 1440)
  const h = Math.floor((eta % 1440) / 60)
  const m = eta % 60
  const containers = [0, 1, 2, 3, 4, 5, 6, 7]
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute left-5 top-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-mute">
        <span className="rounded border border-white/10 px-1.5 py-0.5 text-sea">MV Meridian Star</span>
        ETA <span className="tabular-nums text-bone">{String(d).padStart(2, '0')}d {String(h).padStart(2, '0')}h {String(m).padStart(2, '0')}m</span>
      </div>
      {/* dotted route */}
      <svg className="absolute inset-x-0 top-12 h-10 w-full" preserveAspectRatio="none" viewBox="0 0 400 40">
        <path d="M0 30 C 120 0, 280 0, 400 30" stroke="rgba(255,255,255,0.18)" strokeDasharray="2 6" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* ship */}
      <motion.div
        className="absolute bottom-[36%] left-[34%] w-48 -translate-x-1/2 md:left-[40%]"
        animate={active ? { x: [-24, 24, -24] } : {}}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* wake */}
        {[0, 1, 2].map((k) => (
          <motion.span
            key={k}
            className="absolute bottom-1 right-[85%] h-[2px] rounded-full bg-white/50"
            animate={active ? { width: [0, 90], x: [0, -120], opacity: [0.8, 0] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.8, ease: 'easeOut' }}
            style={{ bottom: 4 + k * 4 }}
          />
        ))}
        <motion.div animate={{ rotate: [-1.2, 1.2, -1.2], y: [0, 3, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <svg viewBox="0 0 200 70" className="w-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
            {containers.map((c, i) => (
              <rect key={i} x={30 + (i % 4) * 28} y={i < 4 ? 22 : 8} width="26" height="13" rx="1" fill={C[(i * 3) % C.length]} opacity={0.92} />
            ))}
            <rect x="148" y="6" width="16" height="30" rx="1" fill="#e5e7eb" />
            <rect x="151" y="10" width="10" height="4" fill="#0b0f1a" />
            <path d="M8 36 H192 L178 60 H26 Z" fill="#1f2937" />
            <path d="M8 36 H192 L189 41 H11 Z" fill="#ff6b2c" />
            <text x="40" y="53" fontSize="7" fill="#9ca3af" fontFamily="monospace" letterSpacing="2">MERIDIAN</text>
          </svg>
        </motion.div>
      </motion.div>
      {/* waves */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="absolute inset-x-0 overflow-hidden" style={{ bottom: `${i * 9 - 4}%`, height: '42%', opacity: 1 - i * 0.25 }}>
          <div className="marquee-track flex h-full w-[200%]" style={{ '--marquee-speed': `${8 + i * 5}s`, animationPlayState: active ? 'running' : 'paused' }}>
            {[0, 1].map((k) => (
              <svg key={k} viewBox="0 0 400 60" preserveAspectRatio="none" className="h-full w-1/2">
                <path d="M0 20 Q 25 8 50 20 T 100 20 T 150 20 T 200 20 T 250 20 T 300 20 T 350 20 T 400 20 V60 H0 Z" fill={['#0d2a4a', '#0a2140', '#081a33'][i]} />
              </svg>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* Plane tracing an arc between airports */
export function AirVisual({ active }) {
  const path = 'M 30 150 Q 170 0 310 110'
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 340 190" className="absolute inset-0 h-full w-full">
        <path d={path} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 6" fill="none" />
        <motion.path d={path} stroke="url(#airg)" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} animate={active ? { pathLength: [0, 1, 1] } : {}} transition={{ duration: 4, repeat: Infinity, times: [0, 0.8, 1] }} />
        <defs>
          <linearGradient id="airg" x1="0" x2="1">
            <stop offset="0" stopColor="#46d6c8" stopOpacity="0" />
            <stop offset="1" stopColor="#46d6c8" />
          </linearGradient>
        </defs>
        {[
          [30, 150, 'BOM'],
          [310, 110, 'FRA'],
        ].map(([x, y, l]) => (
          <g key={l}>
            <circle cx={x} cy={y} r="4" fill="#46d6c8" />
            <circle cx={x} cy={y} r="10" fill="none" stroke="#46d6c8" strokeOpacity=".35" />
            <text x={x} y={y + 24} textAnchor="middle" fontSize="10" fill="#8b91a1" fontFamily="Geist Mono, monospace">
              {l}
            </text>
          </g>
        ))}
        {active && (
          <g>
            <circle r="9" fill="#46d6c8" opacity=".15" />
            <path d="M-2 -9 L1 -1 L9 0 L1 1 L-2 9 L-1 2 L-6 2 L-8 5 L-9 5 L-8 0 L-9 -5 L-8 -5 L-6 -2 L-1 -2 Z" fill="#ece8df" />
            <animateMotion dur="4s" repeatCount="indefinite" rotate="auto" path={path} keyPoints="0;1;1" keyTimes="0;0.8;1" calcMode="linear" />
          </g>
        )}
      </svg>
      <div className="absolute left-5 top-4 font-mono text-[10px] uppercase tracking-widest text-mute">
        AWB 176-48219375 · <span className="text-sea">In flight</span>
      </div>
    </div>
  )
}

/* Checklist ticks then a CLEARED stamp slams down */
export function CustomsVisual({ active }) {
  const items = ['Shipping bill', 'Commercial invoice', 'Certificate of origin', 'Phyto certificate']
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setStep((s) => (s + 1) % 7), 700)
    return () => clearInterval(id)
  }, [active])
  return (
    <div className="relative flex h-full w-full items-center justify-center p-5">
      <div className="relative w-full max-w-[250px] rounded-lg border border-white/10 bg-ink-3/80 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-mute">
          <span>ICEGATE · SB 4821937</span>
          <span className={step >= 5 ? 'text-sea' : 'text-signal-2'}>{step >= 5 ? 'Cleared' : 'Assessing'}</span>
        </div>
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={it} className="flex items-center gap-2 text-[12px] text-bone/80">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-300 ${step > i ? 'border-sea bg-sea text-ink' : 'border-white/20'}`}>
                {step > i && (
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                    <path d="M2.5 6.5l2 2 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              {it}
            </li>
          ))}
        </ul>
        <motion.div
          className="pointer-events-none absolute -right-3 -top-3 rounded-md border-2 border-sea px-2.5 py-1 font-mono text-sm font-bold uppercase tracking-widest text-sea"
          initial={false}
          animate={step >= 5 ? { scale: 1, opacity: 1, rotate: -12 } : { scale: 2.4, opacity: 0, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        >
          Cleared
        </motion.div>
      </div>
    </div>
  )
}

/* Scanner sweeps a product grid, tiles pass QC */
export function SourcingVisual({ active }) {
  const [scan, setScan] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setScan((s) => (s + 1) % 12), 380)
    return () => clearInterval(id)
  }, [active])
  return (
    <div className="relative flex h-full w-full items-center justify-center p-5">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => {
          const done = scan > i
          const flag = i === 4
          return (
            <div key={i} className={`relative h-12 w-12 overflow-hidden rounded-md border transition-colors duration-300 ${done ? (flag ? 'border-signal/70 bg-signal/10' : 'border-sea/60 bg-sea/10') : 'border-white/10 bg-white/[0.03]'}`}>
              <div className="absolute inset-2 rounded-sm bg-gradient-to-br from-white/15 to-white/0" />
              {done && <span className={`absolute bottom-0.5 right-1 font-mono text-[8px] ${flag ? 'text-signal' : 'text-sea'}`}>{flag ? 'RE' : 'OK'}</span>}
              {scan === i + 1 && <div className="absolute inset-0 rounded-md border-2 border-bone" />}
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-widest text-mute">
        Lot #A-2291 · Pass <span className="tabular-nums text-sea">{Math.min(scan, 9) > 4 ? Math.min(scan, 9) - 1 : Math.min(scan, 9)}/9</span>
      </div>
    </div>
  )
}

/* Isometric pallets drop into a rack */
export function WarehouseVisual({ active }) {
  const ref = useRef()
  const inView = useInView(ref)
  const count = useRef()
  useEffect(() => {
    if (!inView || !active) return
    const c = animate(1180, 1284, { duration: 3, onUpdate: (v) => count.current && (count.current.textContent = Math.round(v).toLocaleString()) })
    return () => c.stop()
  }, [inView, active])
  const boxes = []
  for (let z = 0; z < 2; z++) for (let x = 0; x < 4; x++) for (let y = 0; y < 2; y++) boxes.push({ x, y, z })
  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <div className="absolute left-1/2 top-[66%]" style={{ perspective: 900 }}>
        <div style={{ transformStyle: 'preserve-3d', transform: 'rotateX(58deg) rotateZ(-40deg)' }}>
          <div className="absolute -left-36 -top-24 h-48 w-72 rounded-lg border border-white/10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]" />
          {boxes.map((b, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: -100 + b.x * 52, top: -50 + b.y * 52, width: 46, height: 46, transformStyle: 'preserve-3d' }}
              initial={{ z: 260, opacity: 0 }}
              animate={active && inView ? { z: [260, b.z * 46, b.z * 46, 260], opacity: [0, 1, 1, 0] } : { z: b.z * 46, opacity: 1 }}
              transition={{ duration: 6, times: [0, 0.18, 0.85, 1], delay: i * 0.12, repeat: Infinity, repeatDelay: 0.5, ease: [0.3, 1.3, 0.5, 1] }}
            >
              <Cube color={b.z ? '#c2763d' : '#a8622f'} />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute left-5 top-4 font-mono text-[10px] uppercase tracking-widest text-mute">
        JNPT Hub · pallets <span ref={count} className="tabular-nums text-bone">1,180</span>
      </div>
    </div>
  )
}

function Cube({ color }) {
  const s = 46
  const face = 'absolute inset-0 border border-black/25'
  return (
    <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
      <div className={face} style={{ background: color, transform: `translateZ(${s}px)` }}>
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-[#e8c48f]/60" />
      </div>
      <div className={face} style={{ background: color, filter: 'brightness(0.75)', transformOrigin: 'bottom', transform: 'rotateX(-90deg)', top: 'auto', height: s, bottom: 0 }} />
      <div className={face} style={{ background: color, filter: 'brightness(0.6)', transformOrigin: 'right', transform: 'rotateY(90deg)', left: 'auto', width: s, right: 0 }} />
    </div>
  )
}

export const visuals = { sea: SeaVisual, air: AirVisual, customs: CustomsVisual, sourcing: SourcingVisual, warehouse: WarehouseVisual }
