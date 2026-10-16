import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '../../lib/motion'

/** Splits text into words that rise + un-blur as they scroll into view. Pass `serif` words via *asterisks*. */
export default function RevealText({ text, as: Tag = 'h2', className = '', scrub = false }) {
  const ref = useRef()
  useGSAP(
    () => {
      gsap.from(ref.current.querySelectorAll('.rw'), {
        yPercent: 110,
        opacity: 0,
        rotate: 3,
        stagger: 0.05,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: scrub ? { trigger: ref.current, start: 'top 85%', end: 'top 40%', scrub: 0.6 } : { trigger: ref.current, start: 'top 85%' },
      })
    },
    { scope: ref }
  )
  const words = text.split(' ')
  return (
    <Tag ref={ref} className={className}>
      {words.map((w, i) => {
        const serif = w.startsWith('*') && w.endsWith('*')
        const clean = serif ? w.slice(1, -1) : w
        return (
          <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <span className={`rw inline-block ${serif ? 'serif-i pr-[0.08em] text-signal' : ''}`}>{clean}</span>
            {i < words.length - 1 && ' '}
          </span>
        )
      })}
    </Tag>
  )
}
