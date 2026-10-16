import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react'
import { isTouch } from '../../lib/motion'

/** 3D tilt + cursor spotlight + glare. Children can read --mx/--my CSS vars. */
export default function Tilt({ children, className = '', max = 10, glare = true, ...rest }) {
  const ref = useRef()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const sx = useSpring(px, { stiffness: 160, damping: 18 })
  const sy = useSpring(py, { stiffness: 160, damping: 18 })
  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])
  const mx = useTransform(px, (v) => `${v * 100}%`)
  const my = useTransform(py, (v) => `${v * 100}%`)
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx} ${my}, rgba(255,140,80,0.16), transparent 45%)`
  const glareBg = useMotionTemplate`radial-gradient(220px circle at ${mx} ${my}, rgba(255,255,255,0.10), transparent 60%)`

  return (
    <motion.div
      ref={ref}
      className={`group/tilt relative [transform-style:preserve-3d] ${className}`}
      style={isTouch ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={(e) => {
        if (isTouch) return
        const r = ref.current.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width)
        py.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
      }}
      {...rest}
    >
      {children}
      <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tilt:opacity-100" style={{ background: spot }} />
      {glare && <motion.div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover/tilt:opacity-100" style={{ background: glareBg }} />}
    </motion.div>
  )
}
