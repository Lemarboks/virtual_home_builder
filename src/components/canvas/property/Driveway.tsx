'use client'
import { useMemo } from 'react'
import { makeConcreteTexture, makeAsphaltTexture } from '@/lib/geometry'
import { usePropertyStore } from '@/store/usePropertyStore'

export function Driveway() {
  const property = usePropertyStore((s) => s.property)
  const { lotWidth, lotDepth, hasDriveway, drivewaySide, drivewaySurface, house } = property

  const concreteTex = useMemo(() => makeConcreteTexture(), [])
  const asphaltTex  = useMemo(() => makeAsphaltTexture(),  [])
  const tex = drivewaySurface === 'asphalt' ? asphaltTex : concreteTex

  if (!hasDriveway) return null

  const DW = house.garageWidth + 0.4      // driveway width
  const lotFront = lotDepth / 2
  const driveLength = lotFront - (house.z - house.depth / 2) + house.garageDepth

  let xOffset = 0
  if (drivewaySide === 'left')  xOffset = -(lotWidth / 2 - DW / 2 - 1)
  if (drivewaySide === 'right') xOffset =   lotWidth / 2 - DW / 2 - 1

  const zCenter = lotFront - driveLength / 2

  return (
    <group>
      {/* Main driveway slab */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}
        position={[xOffset, 0.008, zCenter]}>
        <planeGeometry args={[DW, driveLength]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>

      {/* Low edging strips */}
      {[-DW / 2, DW / 2].map((x, i) => (
        <mesh key={i} castShadow receiveShadow
          position={[xOffset + x, 0.04, zCenter]}>
          <boxGeometry args={[0.08, 0.08, driveLength]} />
          <meshStandardMaterial color="#aaa89e" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
