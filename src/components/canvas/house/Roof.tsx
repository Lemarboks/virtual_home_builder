'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { buildGableRoof, buildHipRoof, makeRoofTileTexture } from '@/lib/geometry'
import type { HouseConfig } from '@/types/property'

interface Props { house: HouseConfig; totalHeight: number }

export function Roof({ house, totalHeight }: Props) {
  const { width, depth, roofType, roofPitch, roofOverhang, roofColor, trimColor } = house

  const tileTex = useMemo(() => makeRoofTileTexture(roofColor), [roofColor])

  const geo = useMemo(() => {
    if (roofType === 'gable') return buildGableRoof(width, depth, roofPitch, roofOverhang)
    if (roofType === 'hip')   return buildHipRoof(width, depth, roofPitch, roofOverhang)
    return null
  }, [width, depth, roofType, roofPitch, roofOverhang])

  if (roofType === 'flat') {
    return (
      <group position={[0, totalHeight, 0]}>
        {/* Flat roof slab */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width + roofOverhang * 2, 0.18, depth + roofOverhang * 2]} />
          <meshStandardMaterial color={roofColor} roughness={0.85} />
        </mesh>
        {/* Parapet wall around the perimeter */}
        {[
          [0, 0.3, -(depth / 2 + roofOverhang), width + roofOverhang * 2, 0.6, 0.12],
          [0, 0.3,  (depth / 2 + roofOverhang), width + roofOverhang * 2, 0.6, 0.12],
          [-(width / 2 + roofOverhang), 0.3, 0, 0.12, 0.6, depth + roofOverhang * 2],
          [ (width / 2 + roofOverhang), 0.3, 0, 0.12, 0.6, depth + roofOverhang * 2],
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={i} castShadow position={[x as number, y as number, z as number]}>
            <boxGeometry args={[w as number, h as number, d as number]} />
            <meshStandardMaterial color={trimColor} roughness={0.8} />
          </mesh>
        ))}
      </group>
    )
  }

  if (roofType === 'shed') {
    const rh = roofPitch * width
    const hw = width / 2 + roofOverhang
    const hd = depth / 2 + roofOverhang
    const shedGeo = useMemo(() => {
      const g = new THREE.BufferGeometry()
      const verts = new Float32Array([
        -hw, 0,    -hd,   hw, 0,  -hd,   hw, rh, hd,  -hw, rh, hd,
         hw, 0,   -hd,   hw, 0,   hd,   hw, rh, hd,
        -hw, 0,   -hd,  -hw, 0,   hd,  -hw, rh, hd,
         hw, 0,   -hd,  -hw, 0, -hd,   -hw, rh, hd,   hw, rh, hd,
         hw, 0,    hd,  -hw, 0,  hd,   -hw, rh, hd,   hw, rh, hd,
      ])
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      g.setIndex([0,1,2, 0,2,3, 4,5,6, 7,8,9, 10,11,12, 10,12,13, 14,15,16, 14,16,17])
      g.computeVertexNormals()
      return g
    }, [hw, hd, rh])

    return (
      <mesh castShadow receiveShadow position={[0, totalHeight, 0]} geometry={shedGeo}>
        <meshStandardMaterial map={tileTex} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    )
  }

  if (!geo) return null

  return (
    <group position={[0, totalHeight, 0]}>
      <mesh castShadow receiveShadow geometry={geo}>
        <meshStandardMaterial map={tileTex} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Fascia board along the eaves */}
      {[
        [0, -0.05, -(depth / 2 + roofOverhang), width + roofOverhang * 2, 0.15, 0.06],
        [0, -0.05,  (depth / 2 + roofOverhang), width + roofOverhang * 2, 0.15, 0.06],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x as number, y as number, z as number]}>
          <boxGeometry args={[w as number, h as number, d as number]} />
          <meshStandardMaterial color={trimColor} roughness={0.75} />
        </mesh>
      ))}
    </group>
  )
}
