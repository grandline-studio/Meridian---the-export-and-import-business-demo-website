import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger, scrollToId } from '../lib/motion'
import { products, img } from '../config'
import Kicker from './ui/Kicker'

function FlipCard({ p, i }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="product-card relative h-[460px] w-[78vw] shrink-0 sm:w-[340px] md:h-[520px] md:w-[380px]" style={{ perspective: 1400 }}>
      <div
        className="relative h-full w-full transition-transform duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)] [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* front */}
        <button
          onClick={() => setFlipped(true)}
          className="group absolute inset-0 overflow-hidden rounded-3xl border border-white/10 bg-ink-2 text-left [backface-visibility:hidden]"
          data-cursor="Specs"
          aria-label={`${p.name} — view specs`}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={img(p.photo, 900)}
              srcSet={`${img(p.photo, 640)} 640w, ${img(p.photo, 900)} 900w`}
              sizes="(max-width: 640px) 80vw, 380px"
              alt={p.name}
              loading="lazy"
              decoding="async"
              className="product-img absolute inset-y-0 -left-[15%] h-full w-[130%] max-w-none object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          <div className="absolute inset-0 opacity-0 mix-blend-color transition-opacity duration-700 group-hover:opacity-40" style={{ background: p.tone }} />
          <div className="absolute left-5 right-5 top-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
            <span className="rounded-full border border-white/20 bg-ink/40 px-2.5 py-1 backdrop-blur">{p.hs}</span>
            <span className="text-bone/70">{String(i + 1).padStart(2, '0')}/{String(products.length).padStart(2, '0')}</span>
          </div>
          <div className="absolute inset-x-5 bottom-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal-2">{p.origin}</div>
            <div className="mt-2 flex items-end justify-between gap-3">
              <h3 className="text-3xl font-medium leading-none tracking-tight">{p.name}</h3>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bone text-ink transition-transform duration-500 group-hover:rotate-180">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                  <path d="M3 6a5 5 0 0 1 9-1.5M13 10a5 5 0 0 1-9 1.5M12 2v3h-3M4 14v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </button>

        {/* back — spec sheet */}
        <div className="absolute inset-0 flex flex-col rounded-3xl border border-white/10 bg-ink-3 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Spec sheet</span>
            <button onClick={() => setFlipped(false)} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-mute transition-colors hover:text-bone">
              ← Back
            </button>
          </div>
          <h3 className="mt-6 text-3xl font-medium leading-tight tracking-tight">{p.name}</h3>
          <dl className="mt-6 divide-y divide-white/5 border-y border-white/5 text-sm">
            {[
              ['HS code', p.hs],
              ['Origin', p.origin],
              ['MOQ', p.moq],
              ['Packing', p.pack],
              ['Incoterms', 'FOB · CIF · DDP'],
              ['Lead time', '10–21 days'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-mute">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
            <button onClick={() => scrollToId('quote')} className="rounded-full bg-signal py-3 text-sm font-medium text-ink transition-colors hover:bg-bone">
              Get price
            </button>
            <button onClick={() => scrollToId('quote')} className="rounded-full border border-white/15 py-3 text-sm transition-colors hover:bg-white/5">
              Request sample
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const section = useRef()
  const track = useRef()

  useGSAP(
    () => {
      const distance = () => track.current.scrollWidth - window.innerWidth
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
      // parallax inside each photo + velocity skew
      gsap.utils.toArray('.product-img').forEach((el) => {
        gsap.fromTo(el, { xPercent: 8 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: el.closest('.product-card'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
      })
      const skew = gsap.quickTo('.product-card', 'skewX', { duration: 0.5, ease: 'power3' })
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: () => `+=${distance()}`,
        onUpdate: (self) => skew(gsap.utils.clamp(-6, 6, self.getVelocity() / -400)),
        onLeave: () => skew(0),
        onLeaveBack: () => skew(0),
      })
      gsap.to('.products-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section.current, start: 'top top', end: () => `+=${distance()}`, scrub: true } })
    },
    { scope: section }
  )

  return (
    <section ref={section} id="products" className="relative flex h-svh flex-col justify-center overflow-hidden">
      <div className="mb-8 flex items-end justify-between gap-6 px-5 md:mb-12 md:px-12">
        <div>
          <Kicker index="03">What we trade</Kicker>
          <h2 className="mt-5 text-[clamp(2.2rem,5vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.035em]">
            Sourced across India.
            <br />
            <span className="serif-i text-mute">Sold across the globe.</span>
          </h2>
        </div>
        <p className="hidden max-w-[16rem] text-sm text-mute md:block">Tap a card to flip it — every category comes with its HS code, MOQ and export packing.</p>
      </div>
      <div ref={track} className="flex gap-4 pl-5 pr-[10vw] will-change-transform md:gap-6 md:pl-12">
        {products.map((p, i) => (
          <FlipCard key={p.name} p={p} i={i} />
        ))}
        <div className="flex h-[460px] w-[70vw] shrink-0 flex-col justify-center rounded-3xl border border-dashed border-white/15 p-8 sm:w-[320px] md:h-[520px]">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">Custom sourcing</div>
          <p className="mt-4 text-2xl font-medium leading-snug tracking-tight">Don't see your product? We source 400+ HS lines on request.</p>
          <button onClick={() => scrollToId('quote')} className="mt-8 self-start rounded-full bg-bone px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-signal">
            Tell us what you need
          </button>
        </div>
      </div>
      <div className="mx-5 mt-10 h-px bg-white/10 md:mx-12">
        <div className="products-progress h-full origin-left scale-x-0 bg-signal" />
      </div>
    </section>
  )
}
