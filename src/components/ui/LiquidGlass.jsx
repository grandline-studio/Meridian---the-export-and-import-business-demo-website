import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { lowPower } from '../../lib/motion'

// Only Chromium can feed an SVG filter into backdrop-filter; everyone else gets the frosted layer alone.
const canRefract =
  typeof navigator !== 'undefined' &&
  !lowPower &&
  !!navigator.userAgentData?.brands?.some((b) => /Chromium|Google Chrome|Microsoft Edge/.test(b.brand))

/**
 * Displacement map for a rounded rect: pixels near the rim push sampling inward along the
 * edge normal (R = x, G = y, 128 = none), which bends the backdrop like a thick glass lens.
 */
function lensMap(w, h, radius, band) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  const img = ctx.createImageData(w, h)
  const hx = w / 2
  const hy = h / 2
  const r = Math.min(radius, hx, hy)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hx
      const py = y + 0.5 - hy
      const qx = Math.abs(px) - (hx - r)
      const qy = Math.abs(py) - (hy - r)
      const ox = Math.max(qx, 0)
      const oy = Math.max(qy, 0)
      const outside = Math.hypot(ox, oy)
      const d = outside + Math.min(Math.max(qx, qy), 0) - r // signed distance, < 0 inside
      let nx = 0
      let ny = 0
      if (outside > 0) {
        nx = (ox / outside) * Math.sign(px)
        ny = (oy / outside) * Math.sign(py)
      } else if (qx > qy) nx = Math.sign(px)
      else ny = Math.sign(py)
      const t = Math.min(1, Math.max(0, 1 + d / band)) // 1 at the rim → 0 at `band` px inside
      const m = t * t * (3 - 2 * t)
      const i = (y * w + x) * 4
      img.data[i] = 128 - nx * m * 127
      img.data[i + 1] = 128 - ny * m * 127
      img.data[i + 2] = 128
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}

export default function LiquidGlass({ as: Tag = 'div', className = '', radius = 9999, band = 22, strength = 46, children, ...rest }) {
  const ref = useRef()
  const raw = useId()
  const id = `lg${raw.replace(/[^a-zA-Z0-9]/g, '')}`
  const [map, setMap] = useState(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    if (!canRefract) return
    const el = ref.current
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentBoxSize?.[0]?.inlineSize ?? el.offsetWidth)
      const h = Math.round(e.contentBoxSize?.[0]?.blockSize ?? el.offsetHeight)
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }))
    })
    ro.observe(el, { box: 'border-box' })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!canRefract || !size.w || !size.h) return
    setMap(lensMap(size.w, size.h, radius, band))
  }, [size, radius, band])

  // specular highlight drifts toward the pointer
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--lx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
  }

  const refract = canRefract && map
  return (
    <Tag ref={ref} className={`lg ${className}`} onPointerMove={onMove} {...rest}>
      {refract && (
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id={id} x="0" y="0" width={size.w} height={size.h} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feImage href={map} x="0" y="0" width={size.w} height={size.h} preserveAspectRatio="none" result="map" />
            {/* split R/G/B with slightly different strengths for a faint prism fringe at the rim */}
            <feDisplacementMap in="SourceGraphic" in2="map" scale={strength} xChannelSelector="R" yChannelSelector="G" result="dr" />
            <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={strength + 6} xChannelSelector="R" yChannelSelector="G" result="dg" />
            <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feDisplacementMap in="SourceGraphic" in2="map" scale={strength + 12} xChannelSelector="R" yChannelSelector="G" result="db" />
            <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feBlend in="r" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b" mode="screen" />
          </filter>
        </svg>
      )}
      <span
        className="lg-backdrop"
        style={refract ? { backdropFilter: `url(#${id}) blur(4px) saturate(190%) brightness(1.04)` } : undefined}
      />
      <span className="lg-tint" />
      <span className="lg-shine" />
      {children}
    </Tag>
  )
}
