// Precomputes land dots for the hero globe (fibonacci sphere sampled against Natural Earth land).
import { readFileSync, writeFileSync } from 'node:fs'
import { feature } from 'topojson-client'
import { geoContains } from 'd3-geo'

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/land-110m.json', import.meta.url)))
const land = feature(topo, topo.objects.land)
const N = 42000
const pts = []
const golden = Math.PI * (3 - Math.sqrt(5))
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2
  const theta = golden * i
  const lat = (Math.asin(y) * 180) / Math.PI
  let lng = ((theta * 180) / Math.PI) % 360
  if (lng > 180) lng -= 360
  if (lat < -60) continue // skip Antarctica
  if (geoContains(land, [lng, lat])) pts.push(+lat.toFixed(2), +lng.toFixed(2))
}
writeFileSync(new URL('../public/land.json', import.meta.url), JSON.stringify(pts))
console.log('land points', pts.length / 2)
