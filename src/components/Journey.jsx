import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { journey } from '../config'
import Kicker from './ui/Kicker'

// stylised lane, one stop per journey step: Mumbai → supplier → JNPT → customs → Suez → Rotterdam
const ROUTE = 'M 470 400 C 450 380, 430 370, 420 350 C 400 320, 360 330, 330 300 C 300 270, 270 250, 250 210 C 238 185, 232 170, 222 150 C 200 120, 160 125, 130 110 C 100 95, 90 70, 95 45'
const STOPS = [
  { x: 470, y: 400, l: 'Enquiry' },
  { x: 420, y: 350, l: 'Supplier' },
  { x: 330, y: 300, l: 'QC · JNPT' },
  { x: 250, y: 210, l: 'Customs' },
  { x: 130, y: 110, l: 'Suez transit' },
  { x: 95, y: 45, l: 'Rotterdam' },
]

export default function Journey() {
  const section = useRef()
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const path = section.current.querySelector('#route-path')
      const len = path.getTotalLength()
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.journey-steps', start: 'top 60%', end: 'bottom 70%', scrub: 0.8 },
        defaults: { ease: 'none' },
      })
      tl.to(path, { strokeDashoffset: 0 }, 0).to('#route-ship', { motionPath: { path: '#route-path', align: '#route-path', alignOrigin: [0.5, 0.5], autoRotate: 180 } }, 0)

      gsap.utils.toArray('.journey-step').forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', onToggle: (self) => self.isActive && setActive(i) })
      })
    },
    { scope: section }
  )

  return (
    <section ref={section} id="journey" className="relative px-4 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-7xl">
        <Kicker index="04">How it works</Kicker>
        <h2 className="mt-5 max-w-3xl text-[clamp(2.2rem,5vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.035em]">
          From factory floor to
          <span className="serif-i text-signal"> your warehouse.</span>
        </h2>

        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-16">
          {/* sticky map */}
          <div className="sticky top-16 z-10 h-[42svh] md:top-0 md:h-svh md:py-[12vh]">
            <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-ink-2/90 backdrop-blur">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:14px_14px]" />
              <svg viewBox="40 0 480 440" className="relative h-full w-full" preserveAspectRatio="xMidYMid meet">
                <path d={ROUTE} stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="3 7" fill="none" />
                <path id="route-path" d={ROUTE} stroke="url(#rg)" strokeWidth="3" fill="none" strokeLinecap="round" />
                <defs>
                  <linearGradient id="rg" x1="1" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#ffb547" />
                    <stop offset="1" stopColor="#ff6b2c" />
                  </linearGradient>
                </defs>
                {STOPS.map((s, i) => (
                  <g key={s.l}>
                    <circle cx={s.x} cy={s.y} r={active >= i ? 7 : 4} fill={active >= i ? '#ff6b2c' : '#1b2233'} stroke={active >= i ? '#ffb547' : 'rgba(255,255,255,0.3)'} style={{ transition: 'all .5s' }} />
                    {active === i && <circle cx={s.x} cy={s.y} r="16" fill="none" stroke="#ff6b2c" strokeOpacity=".5" className="origin-center animate-ping" style={{ transformBox: 'fill-box' }} />}
                    <text x={s.x + 14} y={s.y + 4} fontSize="12" fontFamily="Geist Mono, monospace" fill={active >= i ? '#ece8df' : '#5b6275'} style={{ transition: 'fill .5s' }}>
                      {s.l}
                    </text>
                  </g>
                ))}
                <g id="route-ship">
                  <circle r="14" fill="#ff6b2c" opacity=".18" />
                  <path d="M-9 -4 L7 -4 L10 0 L7 4 L-9 4 Z" fill="#ece8df" />
                  <rect x="-6" y="-2" width="4" height="4" fill="#ff6b2c" />
                  <rect x="-1" y="-2" width="4" height="4" fill="#46d6c8" />
                </g>
              </svg>
              <div className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
                Step <span className="text-bone">{journey[active].code}</span> / 06
              </div>
              <div className="absolute bottom-5 left-5 right-5 flex gap-1">
                {journey.map((_, i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= active ? 'bg-signal' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* steps */}
          <div className="journey-steps md:py-[20vh]">
            {journey.map((j, i) => (
              <div key={j.code} className={`journey-step flex min-h-[45vh] flex-col justify-center border-t border-white/10 py-10 transition-opacity duration-500 md:min-h-[60vh] ${active === i ? 'opacity-100' : 'opacity-30'}`}>
                <div className="font-mono text-sm text-signal">{j.code}</div>
                <h3 className="mt-3 text-3xl font-medium tracking-tight md:text-5xl">{j.title}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-mute">{j.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
