import { certifications, destinations } from '../config'

function Row({ items, reverse, speed = 40, accent }) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
      <div className="marquee-track flex w-max shrink-0" style={{ '--marquee-speed': `${speed}s`, animationDirection: reverse ? 'reverse' : 'normal' }}>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {items.map((t) => (
              <span key={t} className="flex items-center gap-6 px-6 text-[clamp(1.4rem,3vw,2.6rem)] font-medium tracking-tight text-bone/80">
                {t}
                <span className={`inline-block h-2 w-2 rotate-45 ${accent}`} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Marquee() {
  return (
    <section aria-label="Certifications and ports" className="relative -mt-[1px] space-y-4 border-y border-white/10 bg-ink py-10">
      <Row items={certifications} speed={45} accent="bg-signal" />
      <Row items={destinations.map((d) => `${d.name}`)} reverse speed={55} accent="bg-sea" />
    </section>
  )
}
