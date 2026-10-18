import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { origin, destinations } from '../config'
import { range, smooth, lerp, clamp, lowPower } from '../lib/motion'

const DEG = Math.PI / 180
export function ll2v(lat, lng, r = 1) {
  const phi = (90 - lat) * DEG
  const th = (lng + 180) * DEG
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th))
}

// glow tricks (additive light) vanish on a pale page, so light mode swaps blending + colours
const PAL = {
  dark: { land: '#8fa3c7', hot: '#ff7a3a', scan: '#8cd9ff', base: '#070b17', rim: '#2b4f8f', atmo: '#2f5fd0', atmoGain: 0.78, arcA: '#46d6c8', arcB: '#ff8a4a', ship: '#fff3e6', pin: '#ffffff', stars: true, additive: true },
  light: { land: '#3d4a63', hot: '#e4561b', scan: '#1d4ed8', base: '#fbfaf7', rim: '#b9cbe6', atmo: '#7d9fd8', atmoGain: 0.5, arcA: '#0e9384', arcB: '#e4561b', ship: 'route', pin: '#15171d', stars: false, additive: false },
}

const WHITE = new THREE.Color('#ffffff')
const ORIGIN_V = ll2v(origin.lat, origin.lng)
// rotation that brings the origin port to face the camera
const FACE_Y = -Math.atan2(ORIGIN_V.x, ORIGIN_V.z)
const FACE_X = origin.lat * DEG

/* ---------- land dots ---------- */
// fetched (in parallel with the JS) rather than bundled: ~140 KB less script to parse
const landPromise = fetch('/land.json').then((r) => r.json())

function LandDots({ theme }) {
  const [land, setLand] = useState(null)
  useEffect(() => {
    landPromise.then(setLand).catch(() => {})
  }, [])
  const geo = useMemo(() => {
    if (!land) return null
    // phones draw every other dot (~5.5k instead of ~11k)
    const step = lowPower ? 2 : 1
    const n = Math.floor(land.length / 2 / step)
    const pos = new Float32Array(n * 3)
    const rand = new Float32Array(n)
    const hot = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const k = i * step
      const v = ll2v(land[k * 2], land[k * 2 + 1], 1.0)
      pos.set([v.x, v.y, v.z], i * 3)
      rand[i] = Math.random()
      hot[i] = clamp(1 - v.distanceTo(ORIGIN_V) / 0.32) ** 1.4 // India glows
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
    g.setAttribute('aHot', new THREE.BufferAttribute(hot, 1))
    return g
  }, [land])

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: lowPower ? 18.0 : 15.0 },
          uPR: { value: Math.min(window.devicePixelRatio, 2) },
          uCol: { value: new THREE.Color('#8fa3c7') },
          uHot: { value: new THREE.Color('#ff7a3a') },
          uScanCol: { value: new THREE.Color('#8cd9ff') },
          uScan: { value: -2 },
        },
        vertexShader: /* glsl */ `
          uniform float uSize; uniform float uPR;
          attribute float aRand; attribute float aHot;
          varying float vFacing; varying float vRand; varying float vHot; varying float vY;
          void main(){
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vec3 n = normalize(normalMatrix * position);
            vFacing = dot(n, normalize(-mv.xyz));
            vRand = aRand; vHot = aHot; vY = position.y;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * uPR * (1.0 / -mv.z) * (0.85 + 0.6 * aHot);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uCol; uniform vec3 uHot; uniform vec3 uScanCol; uniform float uScan;
          varying float vFacing; varying float vRand; varying float vHot; varying float vY;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.15, d);
            float tw = 0.7 + 0.3 * sin(uTime * 1.3 + vRand * 40.0);
            float face = smoothstep(-0.05, 0.55, vFacing);
            float scan = exp(-pow((vY - uScan) * 9.0, 2.0)) * 0.9;
            vec3 col = mix(mix(uCol, uHot, vHot), uScanCol, scan * 0.8 * (1.0 - vHot));
            gl_FragColor = vec4(col, a * face * tw * (0.5 + 0.5 * vHot + scan * 0.5));
          }`,
      }),
    []
  )
  useEffect(() => {
    const c = PAL[theme]
    mat.uniforms.uCol.value.set(c.land)
    mat.uniforms.uHot.value.set(c.hot)
    mat.uniforms.uScanCol.value.set(c.scan)
  }, [theme, mat])
  useFrame((s) => {
    mat.uniforms.uTime.value = s.clock.elapsedTime
    mat.uniforms.uScan.value = ((s.clock.elapsedTime * 0.35) % 3.5) - 1.5
  })
  return geo ? <points geometry={geo} material={mat} /> : null
}

/* ---------- body + atmosphere ---------- */
const ATMO_SCALE = 1.32
// on the halo shell, the globe's own edge sits where cos(view, normal) = sqrt(1 - (1/scale)^2)
const ATMO_RIM = Math.sqrt(1 - 1 / (ATMO_SCALE * ATMO_SCALE))
function Body({ theme }) {
  const [core, atmo] = useMemo(
    () => [
      new THREE.ShaderMaterial({
        uniforms: { uBase: { value: new THREE.Color('#070b17') }, uRim: { value: new THREE.Color('#2b4f8f') } },
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform vec3 uBase; uniform vec3 uRim; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 3.0); gl_FragColor = vec4(mix(uBase, uRim, f * 0.85), 1.0); }`,
      }),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        uniforms: { uC: { value: new THREE.Color('#2f5fd0') }, uGain: { value: 0.9 }, uAdd: { value: 1 }, uRimAt: { value: ATMO_RIM } },
        // t is 0 at the halo's outer silhouette and 1 where it meets the globe, measured against the real
        // view ray (not a fixed +z), so the glow fades to nothing evenly on both sides of an off-centre globe
        fragmentShader: `uniform vec3 uC; uniform float uGain; uniform float uAdd; uniform float uRimAt; varying vec3 vN; varying vec3 vV;
          void main(){
            float t = clamp(-dot(normalize(vN), normalize(vV)) / uRimAt, 0.0, 1.0);
            float i = pow(t, 2.4) * uGain;
            gl_FragColor = vec4(uC * mix(1.0, i, uAdd), clamp(i, 0.0, 1.0));
          }`,
      }),
    ],
    []
  )
  useEffect(() => {
    const c = PAL[theme]
    core.uniforms.uBase.value.set(c.base)
    core.uniforms.uRim.value.set(c.rim)
    atmo.uniforms.uC.value.set(c.atmo)
    atmo.uniforms.uGain.value = c.atmoGain
    atmo.uniforms.uAdd.value = c.additive ? 1 : 0
    atmo.blending = c.additive ? THREE.AdditiveBlending : THREE.NormalBlending
    atmo.needsUpdate = true
  }, [theme, core, atmo])
  return (
    <>
      <mesh material={core}>
        <sphereGeometry args={[0.992, lowPower ? 48 : 96, lowPower ? 48 : 96]} />
      </mesh>
      <mesh scale={ATMO_SCALE} material={atmo}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
    </>
  )
}

/* ---------- trade routes ---------- */
const arcVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`
const arcFrag = `
  uniform float uTime; uniform float uDraw; uniform float uSpeed; uniform float uOffset; uniform vec3 uColor;
  varying vec2 vUv;
  void main(){
    float t = vUv.x;
    if (t > uDraw) discard;
    float head = fract(uTime * uSpeed + uOffset);
    float dd = head - t; if (dd < 0.0) dd += 1.0;
    float comet = exp(-dd * 12.0);
    float tip = smoothstep(uDraw - 0.05, uDraw, t) * step(uDraw, 0.999);
    float a = 0.32 + comet * 0.9 + tip;
    gl_FragColor = vec4(uColor * (1.0 + comet * 1.6 + tip * 2.0), a);
  }`

function Routes({ progress, labels, theme }) {
  const arcs = useMemo(
    () =>
      destinations.map((d, i) => {
        const a = ORIGIN_V.clone()
        const b = ll2v(d.lat, d.lng)
        const dist = a.distanceTo(b)
        const alt = 0.03 + dist * 0.2
        const c1 = a.clone().lerp(b, 0.25).normalize().multiplyScalar(1 + alt)
        const c2 = a.clone().lerp(b, 0.75).normalize().multiplyScalar(1 + alt)
        const curve = new THREE.CubicBezierCurve3(a, c1, c2, b)
        const color = new THREE.Color(i % 3 === 0 ? '#46d6c8' : '#ff8a4a')
        return {
          ...d,
          curve,
          end: b,
          color,
          speed: 0.16 + (i % 4) * 0.035,
          offset: Math.random(),
          geo: new THREE.TubeGeometry(curve, lowPower ? 64 : 128, 0.0045, lowPower ? 5 : 8, false),
          mat: new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: arcVert,
            fragmentShader: arcFrag,
            uniforms: { uTime: { value: 0 }, uDraw: { value: 0 }, uSpeed: { value: 0 }, uOffset: { value: 0 }, uColor: { value: color } },
          }),
        }
      }),
    []
  )
  const ships = useRef([])
  const rings = useRef([])
  const pins = useRef([])
  useEffect(() => {
    const c = PAL[theme]
    arcs.forEach((arc, i) => {
      arc.color.set(i % 3 === 0 ? c.arcA : c.arcB)
      arc.mat.blending = c.additive ? THREE.AdditiveBlending : THREE.NormalBlending
      arc.mat.needsUpdate = true
      const ship = ships.current[i]?.material.color
      if (ship) c.ship === 'route' ? ship.copy(arc.color).lerp(WHITE, 0.3) : ship.set(c.ship)
      pins.current[i]?.material.color.set(c.pin)
    })
  }, [theme, arcs])
  const root = useRef()
  const start = useRef(null)
  const [tmp, center, camDir] = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], [])

  useFrame((s) => {
    const { camera, size, clock } = s
    if (start.current === null) start.current = clock.elapsedTime
    const t = clock.elapsedTime - start.current
    const p = progress.current
    const labelVis = smooth(range(p, 0.3, 0.42)) * (1 - smooth(range(p, 0.84, 0.92)))
    root.current.localToWorld(center.set(0, 0, 0))
    camDir.copy(camera.position).sub(center).normalize()

    arcs.forEach((arc, i) => {
      const u = arc.mat.uniforms
      u.uTime.value = clock.elapsedTime
      u.uSpeed.value = arc.speed
      u.uOffset.value = arc.offset
      const draw = smooth(range(t, 0.5 + i * 0.12, 1.9 + i * 0.12))
      u.uDraw.value = draw

      const ship = ships.current[i]
      if (ship) {
        const k = (clock.elapsedTime * arc.speed * 0.3 + arc.offset) % 1
        ship.position.copy(arc.curve.getPoint(k))
        ship.visible = draw > 0.99
      }
      const ring = rings.current[i]
      if (ring) {
        const pulse = (clock.elapsedTime * 0.6 + i * 0.17) % 1
        ring.scale.setScalar(0.6 + pulse * 1.8)
        ring.material.opacity = (1 - pulse) * 0.8 * draw
      }
      const el = labels?.current?.[i]
      // labels are hidden for most of the scroll — skip the projection + DOM writes then
      if (el && labelVis <= 0.001) {
        if (el.style.opacity !== '0') el.style.opacity = '0'
      } else if (el) {
        root.current.localToWorld(tmp.copy(arc.end).multiplyScalar(1.01))
        const facing = tmp.clone().sub(center).normalize().dot(camDir)
        const o = labelVis * clamp((facing - 0.3) * 3)
        tmp.project(camera)
        const x = (tmp.x * 0.5 + 0.5) * size.width
        const y = (-tmp.y * 0.5 + 0.5) * size.height
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
        el.style.opacity = o.toFixed(3)
      }
    })
  })

  return (
    <group ref={root}>
      {arcs.map((arc, i) => (
        <group key={arc.name}>
          <mesh geometry={arc.geo} material={arc.mat} />
          <mesh ref={(m) => (ships.current[i] = m)} visible={false}>
            <sphereGeometry args={[0.008, 12, 12]} />
            <meshBasicMaterial color="#fff3e6" toneMapped={false} />
          </mesh>
          <group position={arc.end.clone().multiplyScalar(1.002)} onUpdate={(g) => g.lookAt(arc.end.clone().multiplyScalar(3))}>
            <mesh ref={(m) => (rings.current[i] = m)}>
              <ringGeometry args={[0.012, 0.016, 40]} />
              <meshBasicMaterial color={arc.color} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
            </mesh>
            <mesh ref={(m) => (pins.current[i] = m)}>
              <circleGeometry args={[0.006, 20]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          </group>
        </group>
      ))}
      <OriginBeacon />
    </group>
  )
}

function OriginBeacon() {
  const ring = useRef()
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), ORIGIN_V.clone().normalize()), [])
  useFrame((s) => {
    const k = (s.clock.elapsedTime * 0.8) % 1
    ring.current.scale.setScalar(1 + k * 3)
    ring.current.material.opacity = (1 - k) * 0.9
  })
  return (
    <group position={ORIGIN_V} quaternion={q}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.0018, 0.0018, 0.12, 6]} />
        <meshBasicMaterial color="#ffb547" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshBasicMaterial color="#ffd9a8" toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.016, 0.022, 48]} />
        <meshBasicMaterial color="#ff6b2c" transparent depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Stars() {
  const ref = useRef()
  const geo = useMemo(() => {
    const n = lowPower ? 500 : 1400
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(6 + Math.random() * 14)
      p.set([v.x, v.y, v.z], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  useFrame((_, dt) => (ref.current.rotation.y += dt * 0.006))
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.03} color="#b9c6e6" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ---------- scene orchestrated by scroll progress ---------- */
export default function GlobeScene({ progress, labels, theme = 'dark', onSpin }) {
  const outer = useRef()
  const inner = useRef()
  const { size, camera, pointer, gl } = useThree()
  const mobile = size.width < 768
  const smoothP = useRef(0)
  const mouse = useRef({ x: 0, y: 0 })
  // drag-to-spin state: y/x are the user's extra rotation on top of the scroll choreography
  const spin = useRef({ y: 0, x: 0, vy: 0, vx: 0, ay: 0, ax: 0, dragging: false, hover: false, px: 0, py: 0, travel: 0, told: false })

  useEffect(() => {
    const s = spin.current
    const el = gl.domElement
    const move = (e) => {
      if (!s.dragging) return
      const dx = e.clientX - s.px
      const dy = e.clientY - s.py
      s.px = e.clientX
      s.py = e.clientY
      const k = 3.4 / Math.min(window.innerWidth, window.innerHeight)
      s.ay += dx * k
      // touch only spins sideways — vertical swipes belong to page scrolling
      if (e.pointerType !== 'touch') s.ax += dy * k
      s.travel += Math.abs(dx) + Math.abs(dy)
      if (!s.told && s.travel > 40) {
        s.told = true
        onSpin?.()
      }
    }
    const up = () => {
      if (!s.dragging) return
      s.dragging = false
      document.body.style.userSelect = ''
      el.style.cursor = s.hover ? 'grab' : ''
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [gl, onSpin])

  const grab = {
    onPointerDown: (e) => {
      const s = spin.current
      s.dragging = true
      s.px = e.nativeEvent.clientX
      s.py = e.nativeEvent.clientY
      s.vy = s.vx = 0
      gl.domElement.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none' // R3F listeners are passive, so block selection with CSS instead
    },
    onPointerOver: () => {
      spin.current.hover = true
      if (!spin.current.dragging) gl.domElement.style.cursor = 'grab'
      gl.domElement.dataset.cursor = 'Spin'
    },
    onPointerOut: () => {
      spin.current.hover = false
      if (!spin.current.dragging) gl.domElement.style.cursor = ''
      delete gl.domElement.dataset.cursor
    },
  }

  useFrame((st, dt) => {
    // damp scroll for buttery motion
    smoothP.current = THREE.MathUtils.damp(smoothP.current, progress.current, 6, dt)
    const p = smoothP.current
    const s = spin.current
    if (!s.dragging) {
      mouse.current.x = THREE.MathUtils.damp(mouse.current.x, pointer.x, 3, dt)
      mouse.current.y = THREE.MathUtils.damp(mouse.current.y, pointer.y, 3, dt)
    }

    // drag + momentum
    const step = Math.max(dt, 1 / 240)
    if (s.dragging) {
      s.y += s.ay
      s.x += s.ax
      s.vy = THREE.MathUtils.damp(s.vy, s.ay / step, 18, dt)
      s.vx = THREE.MathUtils.damp(s.vx, s.ax / step, 18, dt)
      s.ay = s.ax = 0
    } else {
      s.y += s.vy * dt
      s.x += s.vx * dt
      s.vy *= Math.exp(-1.6 * dt)
      s.vx *= Math.exp(-4 * dt)
      // once the visitor scrolls, ease back so the story still lands on India
      if (p > 0.03) {
        const home = Math.round(s.y / (Math.PI * 2)) * Math.PI * 2
        s.y = THREE.MathUtils.damp(s.y, home, 2.5, dt)
        s.vy *= Math.exp(-6 * dt)
        s.x = THREE.MathUtils.damp(s.x, 0, 2.5, dt)
      } else {
        s.x = THREE.MathUtils.damp(s.x, 0, 0.8, dt) // tilt slowly settles back upright
      }
    }
    s.x = clamp(s.x, -0.75, 0.75)

    const tIn = smooth(range(p, 0.02, 0.38))
    const tPan = smooth(range(p, 0.42, 0.82))
    const tOut = smooth(range(p, 0.84, 1))
    const idle = Math.sin(st.clock.elapsedTime * 0.12) * 0.12

    inner.current.rotation.y = FACE_Y + lerp(0.5 + idle, 0, tIn) + tPan * 0.6 + mouse.current.x * 0.18 + s.y
    outer.current.rotation.x = lerp(0.32, FACE_X * 0.7, tIn) + tPan * 0.12 - mouse.current.y * 0.1 + s.x
    outer.current.rotation.z = lerp(-0.18, 0, tIn)

    const x0 = mobile ? 0 : 0.85
    const y0 = mobile ? -0.55 : -0.05
    outer.current.position.x = lerp(x0, mobile ? 0 : 0.45, tIn) - (mobile ? 0 : 0.45) * tPan
    outer.current.position.y = lerp(y0, mobile ? 0.15 : 0.05, tIn) + tPan * 0.15 + tOut * 0.9
    const sc = lerp(mobile ? 0.8 : 0.86, mobile ? 1.0 : 1.12, tIn) * lerp(1, 0.55, tOut)
    outer.current.scale.setScalar(sc)

    camera.position.z = mobile ? 4.1 : 3.3
    camera.lookAt(0, 0, 0)
  })

  return (
    <>
      {PAL[theme].stars && <Stars />}
      <group ref={outer}>
        {/* invisible grab handle, a little larger than the globe so the rim is easy to catch */}
        <mesh {...grab}>
          <sphereGeometry args={[1.12, 32, 32]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
        <group ref={inner}>
          <Body theme={theme} />
          <LandDots theme={theme} />
          <Routes progress={smoothP} labels={labels} theme={theme} />
        </group>
      </group>
    </>
  )
}
