import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { range, smooth, lerp, easeInOut } from '../lib/motion'
import { brand } from '../config'

const L = 6.1
const W = 2.44
const H = 2.6

/** vertical trapezoid corrugation, extruded to a thin solid panel lying in XY, facing +z */
function corrugated(length, height, period = 0.3, depth = 0.05, thick = 0.025) {
  const s = new THREE.Shape()
  const n = Math.round(length / period)
  const p = length / n
  const q = p / 4
  s.moveTo(0, 0)
  for (let i = 0; i < n; i++) {
    const x = i * p
    s.lineTo(x + q * 0.6, 0)
    s.lineTo(x + q * 1.4, depth)
    s.lineTo(x + q * 2.6, depth)
    s.lineTo(x + q * 3.4, 0)
  }
  s.lineTo(length, 0)
  s.lineTo(length, -thick)
  s.lineTo(0, -thick)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: height, bevelEnabled: false, curveSegments: 1 })
  g.rotateX(-Math.PI / 2) // extrusion -> +y, corrugation -> -z
  g.scale(1, 1, -1) // corrugation faces +z
  g.translate(-length / 2, -height / 2, 0)
  g.computeVertexNormals()
  return g
}

function labelTexture() {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 512
  const x = c.getContext('2d')
  x.clearRect(0, 0, c.width, c.height)
  x.fillStyle = 'rgba(255,255,255,0.92)'
  x.font = '700 210px Geist, Arial, sans-serif'
  x.textBaseline = 'middle'
  x.fillText(brand.name.toUpperCase(), 60, 250)
  x.font = '500 64px "Geist Mono", monospace'
  x.fillStyle = 'rgba(255,255,255,0.7)'
  x.fillText(`${brand.suffix.toUpperCase()} · GLOBAL TRADE`, 70, 420)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}
function codeTexture() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 256
  const x = c.getContext('2d')
  x.fillStyle = 'rgba(255,255,255,0.85)'
  x.font = '600 92px "Geist Mono", monospace'
  x.textBaseline = 'middle'
  x.fillText('MRDU 482193 7', 20, 90)
  x.font = '500 56px "Geist Mono", monospace'
  x.fillStyle = 'rgba(255,255,255,0.6)'
  x.fillText('45G1   MAX 32,500 KG', 20, 190)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Door({ side, open }) {
  const ref = useRef()
  const geo = useMemo(() => corrugated(W / 2 - 0.02, H - 0.16, 0.22, 0.035), [])
  useFrame(() => {
    ref.current.rotation.y = -side * open.current * 1.95
  })
  const w = W / 2 - 0.02
  return (
    // hinge on the outer edge (z = ±W/2), door spans toward centre
    <group ref={ref} position={[L / 2 + 0.03, 0, (side * W) / 2]}>
      <group position={[0, 0, (-side * w) / 2]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={geo} castShadow>
          <meshStandardMaterial color="#c4501a" metalness={0.35} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        {/* lock bars */}
        {[-0.28, 0.28].map((o) => (
          <group key={o} position={[o * w * 1.2, 0, 0.08]}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, H - 0.1, 10]} />
              <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0.08, -0.15, 0.03]}>
              <boxGeometry args={[0.2, 0.04, 0.04]} />
              <meshStandardMaterial color="#d1d5db" metalness={0.9} roughness={0.25} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

const CRATE_TARGETS = [
  [4.7, -1.35, -0.5],
  [5.4, 0.15, 0.15],
  [4.5, 1.65, 0.45],
]
function Crate({ index, slide, size = [1.1, 0.9, 0.95], color = '#b7834d', label }) {
  const ref = useRef()
  const base = useMemo(() => new THREE.Vector3(L / 2 - 0.8 - index * 1.25, -H / 2 + size[1] / 2 + 0.09, index % 2 ? -0.5 : 0.5), [index, size])
  useFrame(() => {
    const k = easeInOut(range(slide.current, index * 0.22, index * 0.22 + 0.45))
    const [tx, tz, tr] = CRATE_TARGETS[index]
    // slide straight out through the doors first, then fan out
    const kx = Math.min(1, k * 1.25)
    const kz = smooth(range(k, 0.35, 1))
    ref.current.position.set(lerp(base.x, tx, kx), base.y - kz * 0.12 + Math.sin(k * Math.PI) * 0.12, lerp(base.z, tz, kz))
    ref.current.rotation.y = tr * kz
  })
  return (
    <group ref={ref}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* slats */}
      {[-0.32, 0, 0.32].map((y) => (
        <mesh key={y} position={[0, y * size[1], size[2] / 2 + 0.006]}>
          <boxGeometry args={[size[0] + 0.01, 0.06, 0.01]} />
          <meshStandardMaterial color="#8a5a2b" roughness={0.9} />
        </mesh>
      ))}
      {label && (
        <mesh position={[0, 0.02, size[2] / 2 + 0.013]}>
          <planeGeometry args={[size[0] * 0.6, size[1] * 0.28]} />
          <meshBasicMaterial color="#f5f1e8" />
        </mesh>
      )}
    </group>
  )
}

function ContainerModel({ progress }) {
  const root = useRef()
  const open = useRef(0)
  const slide = useRef(0)
  const light = useRef()
  const { size, camera } = useThree()
  const mobile = size.width < 768

  const sideGeo = useMemo(() => corrugated(L, H - 0.16, 0.3, 0.05), [])
  const endGeo = useMemo(() => corrugated(W - 0.1, H - 0.16, 0.24, 0.04), [])
  const [logo, code] = useMemo(() => [labelTexture(), codeTexture()], [])
  const sp = useRef(0)

  useFrame((s, dt) => {
    sp.current = THREE.MathUtils.damp(sp.current, progress.current, 5, dt)
    const p = sp.current
    const tTurn = smooth(range(p, 0.0, 0.35))
    open.current = easeInOut(range(p, 0.3, 0.58))
    slide.current = range(p, 0.55, 0.95)

    root.current.rotation.y = lerp(0.55, -0.95, tTurn) + Math.sin(s.clock.elapsedTime * 0.3) * 0.03
    root.current.position.y = Math.sin(s.clock.elapsedTime * 0.8) * 0.03
    root.current.position.x = mobile ? -0.6 : lerp(1.6, 0.9, tTurn)
    light.current.intensity = open.current * 30

    const tOut = smooth(range(p, 0.55, 1))
    const z = mobile ? lerp(24, 27, tOut) : lerp(13, 15.5, tOut)
    camera.position.set(lerp(0, 2.2, tTurn), lerp(3.4, 2.6, tTurn) + tOut * 0.8, z)
    camera.lookAt(mobile ? 0.6 : lerp(0.9, 1.9, tOut), mobile ? 1.1 : -0.4, 0)
  })

  const rail = '#5a2a12'
  return (
    <group ref={root}>
      {/* side walls */}
      <mesh geometry={sideGeo} position={[0, 0, W / 2 - 0.05]} castShadow receiveShadow>
        <meshStandardMaterial color="#c4501a" metalness={0.35} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={sideGeo} position={[0, 0, -W / 2 + 0.05]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#c4501a" metalness={0.35} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* front wall */}
      <mesh geometry={endGeo} position={[-L / 2 + 0.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <meshStandardMaterial color="#c4501a" metalness={0.35} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* roof & floor */}
      <mesh position={[0, H / 2 - 0.04, 0]} castShadow>
        <boxGeometry args={[L, 0.06, W]} />
        <meshStandardMaterial color="#b4471a" metalness={0.3} roughness={0.55} />
      </mesh>
      <mesh position={[0, -H / 2 + 0.05, 0]} receiveShadow>
        <boxGeometry args={[L, 0.08, W - 0.04]} />
        <meshStandardMaterial color="#3b2a1d" roughness={0.9} />
      </mesh>
      {/* frame: corner posts + rails */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * L) / 2, 0, (sz * W) / 2]} castShadow>
            <boxGeometry args={[0.16, H, 0.16]} />
            <meshStandardMaterial color={rail} metalness={0.4} roughness={0.5} />
          </mesh>
        ))
      )}
      {[-1, 1].map((sy) =>
        [-1, 1].map((sz) => (
          <mesh key={`r${sy}${sz}`} position={[0, (sy * H) / 2 - sy * 0.06, (sz * W) / 2]}>
            <boxGeometry args={[L, 0.14, 0.12]} />
            <meshStandardMaterial color={rail} metalness={0.4} roughness={0.5} />
          </mesh>
        ))
      )}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sy) => (
          <mesh key={`e${sx}${sy}`} position={[(sx * L) / 2, (sy * H) / 2 - sy * 0.06, 0]}>
            <boxGeometry args={[0.14, 0.16, W]} />
            <meshStandardMaterial color={rail} metalness={0.4} roughness={0.5} />
          </mesh>
        ))
      )}
      {/* corner castings */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sy) =>
          [-1, 1].map((sz) => (
            <mesh key={`c${sx}${sy}${sz}`} position={[(sx * L) / 2, (sy * H) / 2 - sy * 0.06, (sz * W) / 2]}>
              <boxGeometry args={[0.2, 0.18, 0.2]} />
              <meshStandardMaterial color="#2b1a10" metalness={0.5} roughness={0.6} />
            </mesh>
          ))
        )
      )}
      {/* branding */}
      <mesh position={[-0.6, 0.2, W / 2 + 0.03]}>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={logo} transparent toneMapped={false} />
      </mesh>
      <mesh position={[-L / 2 + 0.03, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.8, 0.45]} />
        <meshBasicMaterial map={code} transparent toneMapped={false} />
      </mesh>
      <mesh position={[L / 2 - 0.9, H / 2 - 0.45, W / 2 + 0.03]}>
        <planeGeometry args={[1.4, 0.35]} />
        <meshBasicMaterial map={code} transparent toneMapped={false} />
      </mesh>

      <Door side={1} open={open} />
      <Door side={-1} open={open} />

      {/* cargo */}
      <Crate index={0} slide={slide} label />
      <Crate index={1} slide={slide} size={[1.0, 1.1, 0.9]} color="#a8763f" label />
      <Crate index={2} slide={slide} size={[1.1, 0.8, 1.0]} color="#c08f58" label />
      <pointLight ref={light} position={[L / 2 - 1.2, 0.3, 0]} color="#ffb070" intensity={0} distance={8} decay={1.6} />
    </group>
  )
}

export default function ContainerScene({ progress }) {
  return (
    <>
      <color attach="background" args={['#06080f']} />
      <fog attach="fog" args={['#06080f', 20, 44]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 9, 6]} intensity={2.2} color="#ffe2c4" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-8, 3, -6]} intensity={1.4} color="#4f7cff" />
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 3, 1]} color="#ffffff" />
        <Lightformer intensity={1.5} position={[-6, 1, 3]} scale={[4, 6, 1]} color="#7aa2ff" />
        <Lightformer intensity={2} position={[6, 2, 4]} scale={[4, 4, 1]} color="#ffb070" />
      </Environment>
      <ContainerModel progress={progress} />
      <ContactShadows position={[0, -H / 2 - 0.02, 0]} opacity={0.65} scale={22} blur={2.6} far={4} color="#000000" />
      <gridHelper args={[60, 60, '#1b2233', '#121827']} position={[0, -H / 2 - 0.03, 0]} />
    </>
  )
}
