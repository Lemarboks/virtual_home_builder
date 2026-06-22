'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { makeWoodTexture } from '@/lib/geometry'
import { usePropertyStore } from '@/store/usePropertyStore'

/* ─────────────────────────────────────────────────────────────
   Furniture primitives
   ───────────────────────────────────────────────────────────── */

function Sofa({ color = '#6b7e7c' }: { color?: string }) {
  return (
    <group>
      {/* Base / seat */}
      <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[2.3, 0.3, 0.95]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Back cushion */}
      <mesh castShadow receiveShadow position={[0, 0.68, -0.38]}>
        <boxGeometry args={[2.3, 0.55, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Arm rests */}
      {([-1.1, 1.1] as number[]).map((x, i) => (
        <mesh key={i} castShadow receiveShadow position={[x, 0.5, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.95]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      ))}
      {/* Legs */}
      {([-0.95, 0.95] as number[]).flatMap((x) =>
        ([-0.36, 0.36] as number[]).map((z, i) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.07, z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.14, 6]} />
            <meshStandardMaterial color="#3a2510" metalness={0.1} roughness={0.7} />
          </mesh>
        ))
      )}
    </group>
  )
}

function CoffeeTable({ color = '#8b6a3e' }: { color?: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.1, 0.05, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.05} />
      </mesh>
      {([-0.45, 0.45] as number[]).flatMap((x) =>
        ([-0.22, 0.22] as number[]).map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.2, z]}>
            <boxGeometry args={[0.06, 0.4, 0.06]} />
            <meshStandardMaterial color="#2e1a08" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

function TV() {
  return (
    <group>
      {/* Screen */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[1.6, 0.9, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Screen surface (emissive) */}
      <mesh position={[0, 1.1, 0.032]}>
        <boxGeometry args={[1.52, 0.84, 0.01]} />
        <meshStandardMaterial color="#1a2a3a" emissive="#1a2a3a" emissiveIntensity={0.4} roughness={0.1} />
      </mesh>
      {/* Stand */}
      <mesh castShadow position={[0, 0.68, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.06]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.64, 0.1]}>
        <boxGeometry args={[0.5, 0.04, 0.28]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Bed({ color = '#c8b8a0' }: { color?: string }) {
  return (
    <group>
      {/* Frame */}
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[1.7, 0.28, 2.15]} />
        <meshStandardMaterial color="#5a3820" roughness={0.85} />
      </mesh>
      {/* Mattress */}
      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <boxGeometry args={[1.56, 0.18, 2.0]} />
        <meshStandardMaterial color="#f0ece4" roughness={0.9} />
      </mesh>
      {/* Duvet */}
      <mesh castShadow receiveShadow position={[0, 0.52, 0.2]}>
        <boxGeometry args={[1.5, 0.08, 1.5]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      {/* Pillows */}
      {([-0.35, 0.35] as number[]).map((x, i) => (
        <mesh key={i} castShadow receiveShadow position={[x, 0.56, -0.82]}>
          <boxGeometry args={[0.6, 0.12, 0.42]} />
          <meshStandardMaterial color="#ffffff" roughness={0.95} />
        </mesh>
      ))}
      {/* Headboard */}
      <mesh castShadow receiveShadow position={[0, 0.78, -1.02]}>
        <boxGeometry args={[1.7, 0.9, 0.1]} />
        <meshStandardMaterial color="#5a3820" roughness={0.85} />
      </mesh>
    </group>
  )
}

function DiningTable({ color = '#9b7653' }: { color?: string }) {
  return (
    <group>
      {/* Table top */}
      <mesh castShadow receiveShadow position={[0, 0.76, 0]}>
        <boxGeometry args={[1.6, 0.06, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Legs */}
      {([-0.68, 0.68] as number[]).flatMap((x) =>
        ([-0.36, 0.36] as number[]).map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.38, z]}>
            <cylinderGeometry args={[0.04, 0.04, 0.76, 6]} />
            <meshStandardMaterial color="#6b4820" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Chair({ color = '#8b6840' }: { color?: string }) {
  return (
    <group>
      {/* Seat */}
      <mesh castShadow receiveShadow position={[0, 0.46, 0]}>
        <boxGeometry args={[0.48, 0.06, 0.46]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Back rest */}
      <mesh castShadow receiveShadow position={[0, 0.76, -0.2]}>
        <boxGeometry args={[0.48, 0.55, 0.06]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Legs */}
      {([-0.19, 0.19] as number[]).flatMap((x) =>
        ([-0.18, 0.18] as number[]).map((z) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, 0.22, z]}>
            <cylinderGeometry args={[0.025, 0.025, 0.44, 6]} />
            <meshStandardMaterial color="#3a2510" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Wardrobe({ color = '#c8b090' }: { color?: string }) {
  return (
    <group>
      {/* Body */}
      <mesh castShadow receiveShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[1.8, 2.0, 0.6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Door lines */}
      {([-0.45, 0.45] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0.302]}>
          <boxGeometry args={[0.88, 1.85, 0.01]} />
          <meshStandardMaterial color="#b8a070" roughness={0.5} />
        </mesh>
      ))}
      {/* Handles */}
      {([-0.15, 0.15] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.0, 0.31]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 6]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Bookshelf({ color = '#b08860' }: { color?: string }) {
  const shelves = 4
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[1.0, 1.8, 0.3]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      {Array.from({ length: shelves }, (_, i) => (
        <mesh key={i} position={[0, 0.08 + i * 0.44, 0]}>
          <boxGeometry args={[0.94, 0.04, 0.28]} />
          <meshStandardMaterial color="#7a5a30" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────
   Interior floor + ceiling
   ───────────────────────────────────────────────────────────── */

function RoomShell({ width, depth, height, floorTex }: {
  width: number; depth: number; height: number
  floorTex: THREE.CanvasTexture
}) {
  return (
    <group>
      {/* Interior floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
        <planeGeometry args={[width - 0.5, depth - 0.5]} />
        <meshStandardMaterial map={floorTex} roughness={0.6} />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height - 0.05, 0]}>
        <planeGeometry args={[width - 0.5, depth - 0.5]} />
        <meshStandardMaterial color="#f8f6f0" roughness={0.95} side={THREE.BackSide} />
      </mesh>
      {/* Skirting boards */}
      {[
        [0,           0.32, -(depth/2 - 0.26), width - 0.5, 0.12, 0.06],
        [0,           0.32,  (depth/2 - 0.26), width - 0.5, 0.12, 0.06],
        [-(width/2 - 0.26), 0.32, 0, 0.06, 0.12, depth - 0.5],
        [ (width/2 - 0.26), 0.32, 0, 0.06, 0.12, depth - 0.5],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]}>
          <boxGeometry args={[w as number, h as number, d as number]} />
          <meshStandardMaterial color="#e8e4dc" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main export
   ───────────────────────────────────────────────────────────── */

export function Interior() {
  const house = usePropertyStore((s) => s.property.house)
  const { x, z, width, depth, wallHeight, floors } = house

  const floorTex = useMemo(() => {
    if (typeof window === 'undefined') return null
    return makeWoodTexture()
  }, [])

  if (!floorTex) return null

  const totalH  = wallHeight * floors
  const livingZ = depth * 0.18   // living area shifted toward front
  const sleepZ  = -depth * 0.22  // sleeping area toward back

  return (
    <group position={[x, 0, z]}>
      <RoomShell width={width} depth={depth} height={totalH} floorTex={floorTex} />

      {/* ── Living area ── */}
      {/* Sofa facing front */}
      <group position={[-(width * 0.12), 0, livingZ - 1.4]} rotation={[0, 0, 0]}>
        <Sofa color="#728878" />
      </group>
      {/* Coffee table in front of sofa */}
      <group position={[-(width * 0.12), 0, livingZ - 0.55]}>
        <CoffeeTable />
      </group>
      {/* TV on back wall of living zone */}
      <group position={[-(width * 0.12), 0, sleepZ - 0.08]} rotation={[0, Math.PI, 0]}>
        <TV />
      </group>
      {/* Bookshelf in corner */}
      <group position={[width * 0.35, 0, livingZ - 0.8]}>
        <Bookshelf />
      </group>

      {/* ── Dining area ── */}
      <group position={[width * 0.3, 0, livingZ + 0.5]}>
        <DiningTable />
        {/* 4 chairs around the table */}
        <group position={[0, 0, -0.7]}>                  <Chair /></group>
        <group position={[0, 0,  0.7]} rotation={[0, Math.PI, 0]}><Chair /></group>
        <group position={[-0.9, 0, 0]} rotation={[0,  Math.PI/2, 0]}><Chair /></group>
        <group position={[ 0.9, 0, 0]} rotation={[0, -Math.PI/2, 0]}><Chair /></group>
      </group>

      {/* ── Bedroom (back zone, or upstairs on 2-floor) ── */}
      <group position={[-(width * 0.2), 0, sleepZ + 0.4]}>
        <Bed color="#c8b8a0" />
      </group>
      <group position={[width * 0.28, 0, sleepZ - 0.18]}>
        <Wardrobe />
      </group>

      {/* Second floor bedroom if 2 floors */}
      {floors === 2 && (
        <group position={[width * 0.1, wallHeight, sleepZ]}>
          <Bed color="#b0a0c8" />
        </group>
      )}
    </group>
  )
}
