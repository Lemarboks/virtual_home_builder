'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { usePropertyStore } from '@/store/usePropertyStore'

function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

/* ── Garden bed (long raised planter) ──────────────────────── */
function GardenBed({ x, z, w, d, rotation = 0 }: { x: number; z: number; w: number; d: number; rotation?: number }) {
  const rng = useMemo(() => seededRng(Math.round(x * 100 + z)), [x, z])
  const flowerPositions = useMemo(() => {
    const count = Math.round(w * d * 3)
    return Array.from({ length: count }, () => ({
      x: (rng() - 0.5) * (w - 0.15),
      z: (rng() - 0.5) * (d - 0.15),
      s: 0.06 + rng() * 0.08,
      c: ['#e84a5f', '#f5a623', '#f8e71c', '#7ed321', '#9b59b6'][Math.floor(rng() * 5)],
    }))
  }, [w, d, rng])

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {/* Bed border */}
      <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
        <boxGeometry args={[w, 0.16, d]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.95} />
      </mesh>
      {/* Soil surface */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.165, 0]}>
        <planeGeometry args={[w - 0.1, d - 0.1]} />
        <meshStandardMaterial color="#2a1a0a" roughness={1} />
      </mesh>
      {/* Flowers / plants */}
      {flowerPositions.map((f, i) => (
        <group key={i} position={[f.x, 0.17, f.z]}>
          {/* Stem */}
          <mesh castShadow position={[0, f.s * 0.5, 0]}>
            <cylinderGeometry args={[0.012, 0.012, f.s, 5]} />
            <meshStandardMaterial color="#4a8a20" roughness={0.9} />
          </mesh>
          {/* Flower head */}
          <mesh castShadow position={[0, f.s + 0.04, 0]}>
            <sphereGeometry args={[f.s * 0.5, 6, 5]} />
            <meshStandardMaterial color={f.c} roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ── Rock cluster ───────────────────────────────────────────── */
function Rocks({ positions }: { positions: { x: number; z: number; s: number; ry: number }[] }) {
  return (
    <>
      {positions.map((r, i) => (
        <mesh key={i} castShadow receiveShadow
          position={[r.x, r.s * 0.3, r.z]}
          rotation={[r.ry * 0.4, r.ry, r.ry * 0.3]}
          scale={[r.s * 1.3, r.s * 0.7, r.s]}>
          <dodecahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#8a8680" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}
    </>
  )
}

/* ── Stone pathway from door to gate ───────────────────────── */
function Pathway({ lotDepth, lotWidth, drivewaySide }: { lotDepth: number; lotWidth: number; drivewaySide: string }) {
  const gateX = drivewaySide === 'right' ?  lotWidth / 2 - 2
              : drivewaySide === 'left'  ? -lotWidth / 2 + 2
              : 0

  // Path goes from door (z ≈ house front) to gate (z = lot front)
  const steps = 10
  const startZ = 6        // roughly house front
  const endZ   = lotDepth / 2 - 0.3

  return (
    <group>
      {Array.from({ length: steps }, (_, i) => {
        const t  = i / (steps - 1)
        const z  = startZ + t * (endZ - startZ)
        const px = t * gateX           // diagonal path from centre to gate
        const jx = ((i * 1234 + 567) % 100 / 100 - 0.5) * 0.15
        const jz = ((i * 4321 + 987) % 100 / 100 - 0.5) * 0.1
        return (
          <mesh key={i} receiveShadow
            position={[px + jx, 0.01, z + jz]}
            rotation={[0, i * 0.2, 0]}>
            <boxGeometry args={[0.48 + (i % 3) * 0.06, 0.04, 0.42 + (i % 2) * 0.06]} />
            <meshStandardMaterial color="#b8b0a4" roughness={0.85} />
          </mesh>
        )
      })}
    </group>
  )
}

/* ── Main Garden component ──────────────────────────────────── */
export function Garden() {
  const property = usePropertyStore((s) => s.property)
  const { lotWidth, lotDepth, house, hasDriveway, drivewaySide, hasPool, poolX, poolZ } = property
  const { hasGardenBeds, hasRocks } = property.landscaping

  const rng = useMemo(() => seededRng(77), [])

  // Rock positions — scattered in back garden, avoiding pool
  const rockPositions = useMemo(() => {
    if (!hasRocks) return []
    const r = seededRng(55)
    return Array.from({ length: 14 }, () => ({
      x: (r() * 2 - 1) * (lotWidth / 2 - 1.5),
      z: -lotDepth * 0.15 - r() * lotDepth * 0.3,
      s: 0.18 + r() * 0.28,
      ry: r() * Math.PI * 2,
    })).filter((p) => {
      if (hasPool && Math.abs(p.x - poolX) < 3.5 && Math.abs(p.z - poolZ) < 5) return false
      if (Math.abs(p.x - house.x) < house.width / 2 + 1 && Math.abs(p.z - house.z) < house.depth / 2 + 1) return false
      return true
    })
  }, [hasRocks, lotWidth, lotDepth, hasPool, poolX, poolZ, house])

  return (
    <group>
      {/* ── Garden beds along house foundation ── */}
      {hasGardenBeds && (
        <>
          {/* Front of house */}
          <GardenBed
            x={house.x - house.width * 0.15}
            z={house.z + house.depth / 2 + 0.55}
            w={house.width * 0.45} d={0.9}
          />
          {/* Left side */}
          <GardenBed
            x={house.x - house.width / 2 - 0.55}
            z={house.z}
            w={0.9} d={house.depth * 0.5}
            rotation={0}
          />
          {/* Back of lot */}
          <GardenBed
            x={0} z={-lotDepth / 2 + 1.2}
            w={lotWidth * 0.45} d={1.2}
          />
        </>
      )}

      {/* ── Rocks ── */}
      {hasRocks && <Rocks positions={rockPositions} />}

      {/* ── Stone pathway ── */}
      {hasDriveway && (
        <Pathway lotDepth={lotDepth} lotWidth={lotWidth} drivewaySide={drivewaySide} />
      )}
    </group>
  )
}
