'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { makeGrassTexture, makeAsphaltTexture } from '@/lib/geometry'
import { usePropertyStore } from '@/store/usePropertyStore'

export function Terrain() {
  const { lotWidth, lotDepth, hasSidewalk } = usePropertyStore((s) => s.property)
  const grassColor = usePropertyStore((s) => s.property.landscaping.grassColor)

  const grassTex  = useMemo(() => makeGrassTexture(grassColor), [grassColor])
  const roadTex   = useMemo(() => makeAsphaltTexture(), [])

  const ROAD_W   = lotWidth + 10
  const ROAD_D   = 7
  const SIDE_D   = 1.8

  return (
    <group>
      {/* Lawn / lot ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[lotWidth, lotDepth, 1, 1]} />
        <meshStandardMaterial map={grassTex} roughness={0.95} metalness={0} />
      </mesh>

      {/* Road */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, lotDepth / 2 + ROAD_D / 2]}>
        <planeGeometry args={[ROAD_W, ROAD_D]} />
        <meshStandardMaterial map={roadTex} roughness={0.9} />
      </mesh>

      {/* Road centre line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, lotDepth / 2 + ROAD_D / 2]}>
        <planeGeometry args={[ROAD_W, 0.15]} />
        <meshStandardMaterial color="#e8e060" roughness={0.8} />
      </mesh>

      {/* Kerb (low concrete strip between road and sidewalk) */}
      <mesh castShadow receiveShadow
        position={[0, 0.06, lotDepth / 2 + SIDE_D]}>
        <boxGeometry args={[lotWidth, 0.12, 0.18]} />
        <meshStandardMaterial color="#b8b4ae" roughness={0.9} />
      </mesh>

      {/* Sidewalk */}
      {hasSidewalk && (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, lotDepth / 2 + SIDE_D / 2]}>
          <planeGeometry args={[lotWidth, SIDE_D]} />
          <meshStandardMaterial color="#ccc8c0" roughness={0.85} />
        </mesh>
      )}

      {/* Property boundary – invisible ground extension to fill gaps */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[lotWidth + 20, lotDepth + 20]} />
        <meshStandardMaterial color="#4a7030" roughness={1} />
      </mesh>
    </group>
  )
}
