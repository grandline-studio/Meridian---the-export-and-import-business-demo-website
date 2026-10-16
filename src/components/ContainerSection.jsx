import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger, lowPower } from '../lib/motion'
import Kicker from './ui/Kicker'

// split out (with drei) so it only downloads when the section is close
const ContainerScene = lazy(() => import('./Container3D'))

const steps = [
  { t: 'Sealed at source', d: 'Bolt seal and GPS e-lock fitted at the factory gate. The seal number travels with your documents.' },
  { t: 'Opened only on camera', d: 'Stuffing, inspection and destuffing are filmed and shared — you see exactly what went in.' },
  { t: 'Delivered intact', d: 'All-risk marine insurance from warehouse to warehouse. Claims handled by us, not you.' },
]

const telemetry = [
  { k: 'Container', v: 'MRDU 482193 7', at: 0 },
  { k: 'Type', v: "40' High Cube · 45G1", at: 0.05, desk: true },
  { k: 'Seal', v: 'BS-0091827 · Intact', at: 0.15, desk: true },
  { k: 'Position', v: '15.42°N 68.11°E', at: 0.25 },
  { k: 'Temp / RH', v: '18.4°C · 52%', at: 0.35, desk: true },
  { k: 'Doors', v: 'Opened at destination', at: 0.5 },
  { k: 'Cargo', v: '1,120 cartons · 18.2 MT', at: 0.62 },
  { k: 'Status', v: 'Delivered ✓', at: 0.85 },
]

export default function ContainerSection() {
  const section = useRef()
  const progress = useRef(0)
  const [visible, setVisible] = useState(false)
  const [near, setNear] = useState(false)
  const [p, setP] = useState(0)

  useEffect(() => {
    // mount the WebGL scene ~1.5 screens ahead, render frames only while on screen
    const nearIO = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '150% 0px' })
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '200px' })
    nearIO.observe(section.current)
    io.observe(section.current)
    return () => {
      nearIO.disconnect()
      io.disconnect()
    }
  }, [])

  // keep the canvas out of the per-scroll re-render
  const canvas = useMemo(
    () =>
      near && (
        <Canvas shadows={!lowPower} dpr={lowPower ? [1, 1.25] : [1, 1.75]} frameloop={visible ? 'always' : 'never'} camera={{ fov: 30, position: [0, 3, 12] }} gl={{ antialias: !lowPower, powerPreference: 'high-performance' }}>
          <Suspense fallback={null}>
            <ContainerScene progress={progress} />
          </Suspense>
        </Canvas>
      ),
    [near, visible]
  )

  useGSAP(() => {
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progress.current = self.progress
        const r = Math.round(self.progress * 50) / 50
        setP((v) => (v === r ? v : r))
      },
    })
    return () => st.kill()
  })

  const active = p < 0.3 ? 0 : p < 0.55 ? 1 : 2

  return (
    <section ref={section} id="container" className="relative h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0">
          {canvas}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,15,0.92)_0%,rgba(6,8,15,0.5)_35%,transparent_60%)] max-md:bg-[linear-gradient(180deg,rgba(6,8,15,0.95)_0%,rgba(6,8,15,0.6)_40%,transparent_65%)]" />

        <div className="relative flex h-full flex-col justify-start px-5 pt-20 md:justify-center md:px-12 md:pt-0">
          <Kicker index="02">Inside the box</Kicker>
          <h2 className="mt-5 max-w-md text-[clamp(2.2rem,4.6vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.035em]">
            One container.
            <br />
            <span className="serif-i text-signal">Zero guesswork.</span>
          </h2>
          <ol className="mt-5 max-w-sm space-y-0 md:mt-10 md:space-y-1">
            {steps.map((s, i) => (
              <li key={s.t} className={`relative border-l py-2 pl-5 md:py-3 transition-all duration-500 ${active === i ? 'border-signal' : 'border-white/10 opacity-40'}`}>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] text-signal">0{i + 1}</span>
                  <span className="text-lg font-medium">{s.t}</span>
                </div>
                <div className={`grid transition-all duration-500 ${active === i ? 'mt-1.5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <p className="overflow-hidden text-sm leading-relaxed text-mute">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* telemetry HUD */}
        <div className="absolute bottom-5 right-4 w-[min(320px,calc(100%-2rem))] rounded-2xl border border-white/10 bg-ink/85 p-4 font-mono text-[11px] md:bottom-10 md:bg-ink/60 md:backdrop-blur-xl md:right-10">
          <div className="mb-3 flex items-center justify-between uppercase tracking-[0.18em] text-mute">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sea" /> Live telemetry
            </span>
            <span className="text-bone">{Math.round(p * 100)}%</span>
          </div>
          <div className="space-y-1.5">
            {telemetry.map((t) => (
              <div key={t.k} className={`flex justify-between gap-3 transition-all duration-500 ${t.desk ? 'max-md:hidden' : ''} ${p >= t.at ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-20'}`}>
                <span className="text-mute">{t.k}</span>
                <span className={t.k === 'Status' && p >= t.at ? 'text-sea' : 'text-bone'}>{p >= t.at ? t.v : '— — —'}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-signal to-signal-2" style={{ width: `${p * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
