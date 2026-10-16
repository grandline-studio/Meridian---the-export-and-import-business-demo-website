import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { isTouch } from '../../lib/motion'

export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef()
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15, mass: 0.4 })
  if (isTouch) return <span className={`inline-block ${className}`}>{children}</span>
  return (
    <motion.span
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * strength)
        y.set((e.clientY - r.top - r.height / 2) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.span>
  )
}
