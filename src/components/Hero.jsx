import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGSAP } from '@gsap/react'
import GlobeScene from './Globe'
import { gsap, ScrollTrigger, scrollToId } from '../lib/motion'
import { heroStats, destinations, origin, brand } from '../config'
import Magnetic from './ui/Magnetic'

const lines = [
  [{ t: 'We move' }, { t: "India's finest" }],
  [{ t: 'to the', serif: false }, { t: 'world.', serif: true }],
]

export default function Hero({ ready }) {
  const section = useRef()
  const progress = useRef(0)
  const statRefs = useRef([])
  const barRef = useRef()
  const pctRef = useRef()
  const labels = useRef([])
  const [visible, setVisible] = useState(true)

  // stop rendering the globe once the hero is off-screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(section.current)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          progress.current = p
          if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
          if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
          const k = gsap.utils.clamp(0, 1, (p - 0.5) / 0.2)
          heroStats.forEach((s, i) => {
            const el = statRefs.current[i]
            if (el) el.textContent = (s.value * gsap.parseEase('power3.out')(k)).toLocaleString('en-IN', { minimumFractionDigits: s.decimals || 0, maximumFractionDigits: s.decimals || 0 })
          })
        },
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        defaults: { ease: 'none' },
      })
      tl.to('.hero-a', { yPercent: -18, autoAlpha: 0, filter: 'blur(8px)', duration: 0.16 }, 0.1)
        .fromTo('.hero-b', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.3)
        .fromTo('.hero-b .route-row', { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, stagger: 0.012, duration: 0.06 }, 0.34)
        .to('.hero-b', { autoAlpha: 0, y: -60, duration: 0.08 }, 0.5)
        .fromTo('.hero-c', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.5)
        .fromTo('.hero-c .stat', { y: 80, autoAlpha: 0, rotateX: -50 }, { y: 0, autoAlpha: 1, rotateX: 0, stagger: 0.02, duration: 0.1 }, 0.5)
        .to('.hero-c', { autoAlpha: 0, y: -80, duration: 0.08 }, 0.86)
        .to(".hero-canvas", { autoAlpha: 0.0, duration: 0.1 }, 0.9)
        .to(".hero-hud", { autoAlpha: 0, duration: 0.06 }, 0.92)
        .to({}, { duration: 0.0001 }, 1)
      return () => st.kill()
    },
    { scope: section }
  )

  // intro reveal once the preloader lifts
  useGSAP(
    () => {
      if (!ready) return
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('.hero-word', { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.08 })
        .from('.hero-fade', { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08 }, 0.4)
        .from('.hero-canvas', { scale: 1.15, autoAlpha: 0, duration: 2.2, ease: 'power3.out' }, 0)
    },
    { scope: section, dependencies: [ready] }
  )

  return (
    <section ref={section} id="top" className="relative h-[460vh]">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* backdrop glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_45%,rgba(63,124,255,0.18),transparent_70%),radial-gradient(40%_40%_at_20%_80%,rgba(255,107,44,0.10),transparent_70%)]" />
        <div className="hero-canvas absolute inset-0">
          <Canvas frameloop={visible ? 'always' : 'never'} dpr={[1, 2]} camera={{ fov: 40, position: [0, 0, 3.3], near: 0.1, far: 60 }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
            <Suspense fallback={null}>
              <GlobeScene progress={progress} labels={labels} />
            </Suspense>
          </Canvas>
        </div>
        {/* port labels, positioned every frame by the globe */}
        <div className="hero-canvas pointer-events-none absolute inset-0 overflow-hidden">
          {destinations.map((d, i) => (
            <div key={d.name} ref={(el) => (labels.current[i] = el)} className="absolute left-0 top-0 opacity-0 will-change-transform">
              <div className="-translate-y-1/2 translate-x-3 whitespace-nowrap rounded-full border border-white/15 bg-ink/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-bone backdrop-blur-md">
                {d.name} <span className="text-signal">· {d.days}d</span>
              </div>
            </div>
          ))}
        </div>
        {/* readability scrim */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,8,15,0.85)_0%,rgba(6,8,15,0.35)_45%,transparent_70%)] max-md:bg-[linear-gradient(180deg,rgba(6,8,15,0.9)_0%,rgba(6,8,15,0.4)_45%,transparent_70%)]" />

        {/* Phase A — headline */}
        <div className="hero-a absolute inset-0 flex flex-col justify-start px-5 pt-28 md:justify-center md:px-12 md:pt-0">
          <div className="hero-fade mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
            </span>
            Est. 2007 · {origin.name} → 64 countries
          </div>
          <h1 className="max-w-[14ch] text-[clamp(2.9rem,8.2vw,8.5rem)] font-medium leading-[0.92] tracking-[-0.045em] text-bone">
            {lines.map((line, li) => (
              <span key={li} className="block">
                {line.map((w, wi) => (
                  <span key={wi} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
                    <span className={`hero-word inline-block ${w.serif ? 'serif-i bg-gradient-to-r from-signal to-signal-2 bg-clip-text pr-2 text-transparent' : ''}`}>{w.t}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <p className="hero-fade mt-7 max-w-md text-[15px] leading-relaxed text-mute md:text-base">
            Sourcing, customs, freight and finance — one accountable desk taking your cargo from Indian farms and factories to 120+ ports, with every container tracked live.
          </p>
          <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <button onClick={() => scrollToId('quote')} className="group relative overflow-hidden rounded-full bg-signal px-7 py-4 text-sm font-medium text-ink">
                <span className="relative z-10 flex items-center gap-2">
                  Get a landed-cost quote
                  <svg className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </span>
                <span className="absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-y-0" />
              </button>
            </Magnetic>
            <button onClick={() => scrollToId('services')} className="rounded-full border border-white/15 px-6 py-4 text-sm text-bone backdrop-blur transition-colors hover:border-white/40 hover:bg-white/5">
              Explore services
            </button>
          </div>
        </div>

        {/* Phase B — routes */}
        <div className="hero-b invisible absolute left-5 top-1/2 max-w-sm -translate-y-1/2 md:left-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">Live trade lanes</div>
          <h2 className="mt-4 text-4xl font-medium leading-[1.02] tracking-tight md:text-6xl">
            One desk.
            <br />
            <span className="serif-i text-mute">120+ ports.</span>
          </h2>
          <div className="mt-8 hidden space-y-1.5 md:block">
            {destinations.slice(0, 7).map((d) => (
              <div key={d.name} className="route-row flex items-center justify-between gap-6 border-b border-white/5 py-1.5 font-mono text-xs text-mute">
                <span>
                  {brand.originPort.split(' ')[0]} <span className="text-signal">→</span> <span className="text-bone">{d.name}</span>
                </span>
                <span>{d.days} days</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase C — stats */}
        <div className="hero-c invisible absolute inset-x-0 bottom-16 px-5 md:bottom-20 md:px-12" style={{ perspective: 900 }}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {heroStats.map((s, i) => (
              <div key={s.label} className="stat rounded-2xl border border-white/10 bg-ink/50 p-4 backdrop-blur-xl md:p-6">
                <div className="flex items-baseline text-3xl font-medium tracking-tight md:text-5xl">
                  <span ref={(el) => (statRefs.current[i] = el)}>0</span>
                  <span className="text-signal">{s.suffix}</span>
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mute md:text-[11px]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HUD */}
        <div className="hero-fade hero-hud pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute md:px-12 md:pb-7">
          <div className="hidden md:block">
            {origin.lat.toFixed(2)}°N {origin.lng.toFixed(2)}°E
            <br />
            <span className="text-bone/70">{brand.originPort}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Voyage</span>
            <span className="relative h-px w-24 bg-white/15 md:w-40">
              <span ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-signal" />
            </span>
            <span ref={pctRef} className="text-bone">000</span>
          </div>
          <div className="flex items-center gap-2">
            Scroll
            <span className="relative block h-7 w-[18px] rounded-full border border-white/25">
              <span className="absolute left-1/2 top-1.5 h-1.5 w-[2px] -translate-x-1/2 animate-[float-y_1.6s_ease-in-out_infinite] rounded bg-signal" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
