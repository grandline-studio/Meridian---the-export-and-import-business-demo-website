import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { isTouch } from '../../lib/motion'

/** Soft follower that grows into a label over elements with data-cursor. */
export default function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 })
  const [label, setLabel] = useState(null)

  useEffect(() => {
    if (isTouch) return
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target.closest?.('[data-cursor]')
      setLabel(t ? t.getAttribute('data-cursor') : null)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [x, y])

  if (isTouch) return null
  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[90] mix-blend-normal" style={{ x: sx, y: sy }}>
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-signal font-mono text-[10px] font-medium uppercase tracking-widest text-ink"
        animate={{ width: label ? 76 : 8, height: label ? 76 : 8, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        {label && (
          <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}>
            {label}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  )
}
