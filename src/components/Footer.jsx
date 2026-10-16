import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, scrollToId } from '../lib/motion'
import { brand, clocks } from '../config'
import { Logo } from './Nav'

function Clock({ city, tz }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now)
  const hour = +new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: 'numeric', hour12: false }).format(now)
  const open = hour >= 9 && hour < 19
  return (
    <div className="border-t border-white/10 py-3">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
        {city}
        <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-sea' : 'bg-white/20'}`} title={open ? 'Desk open' : 'After hours'} />
      </div>
      <div className="mt-1 font-mono text-lg tabular-nums">{time}</div>
    </div>
  )
}

export default function Footer() {
  const ref = useRef()
  useGSAP(
    () => {
      gsap.from('.fw-letter', {
        yPercent: 100,
        stagger: 0.04,
        ease: 'expo.out',
        duration: 1.4,
        scrollTrigger: { trigger: '.fw', start: 'top 95%' },
      })
    },
    { scope: ref }
  )
  const word = brand.name.toUpperCase()
  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-white/10 px-5 pt-20 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-mute">{brand.tagline}. Licensed customs broker and freight forwarder headquartered in Mumbai.</p>
          <div className="mt-6 space-y-1 text-sm">
            <a href={`mailto:${brand.email}`} className="block hover:text-signal">
              {brand.email}
            </a>
            <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="block hover:text-signal">
              {brand.phone}
            </a>
            <div className="text-mute">{brand.address}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {[
            ['Company', [['services', 'Services'], ['products', 'Products'], ['journey', 'Process'], ['track', 'Tracking']]],
            ['Connect', [['quote', 'Get a quote'], ['quote', 'WhatsApp'], ['quote', 'LinkedIn'], ['quote', 'Careers']]],
          ].map(([h, items]) => (
            <div key={h}>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">{h}</div>
              <ul className="mt-4 space-y-2">
                {items.map(([id, l]) => (
                  <li key={l}>
                    <button onClick={() => scrollToId(id)} className="transition-colors hover:text-signal">
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute">Desks open now</div>
          <div className="mt-3 grid grid-cols-2 gap-x-6 md:grid-cols-1">
            {clocks.map((c) => (
              <Clock key={c.city} {...c} />
            ))}
          </div>
        </div>
      </div>
      <div className="fw mt-16 flex select-none justify-center overflow-hidden leading-[0.78]" aria-hidden>
        {word.split('').map((ch, i) => (
          <span key={i} className="fw-letter inline-block bg-gradient-to-b from-bone/90 to-bone/0 bg-clip-text text-[19vw] font-semibold tracking-[-0.06em] text-transparent">
            {ch}
          </span>
        ))}
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
        <span>© {new Date().getFullYear()} {brand.name} {brand.suffix} Pvt. Ltd.</span>
        <span>IEC 0300000000 · GSTIN 27AAAAA0000A1Z5</span>
        <button onClick={() => scrollToId('top')} className="hover:text-bone">
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
