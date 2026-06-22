'use client'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { usePropertyStore } from '@/store/usePropertyStore'

function seededRandom(seed: number) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

interface TreePos { x: number; z: number; scale: number; type: 'pine' | 'deciduous' }

export function Trees() {
  const { lotWidth, lotDepth, house, hasPool, poolX, poolZ, poolWidth, poolDepth } =
    usePropertyStore((s) => s.property)
  const { treeCount, bushCount, grassColor } = usePropertyStore((s) => s.property.landscaping)

  const rng = useMemo(() => seededRandom(42), [])

  const positions = useMemo<TreePos[]>(() => {
    const rand = seededRandom(99)
    const hw = lotWidth / 2 - 1.5
    const hd = lotDepth / 2 - 1.5
    const hx = house.x, hz = house.z
    const HW = house.width / 2 + 1.5, HD = house.depth / 2 + 1.5

    function blocked(x: number, z: number): boolean {
      if (Math.abs(x - hx) < HW && Math.abs(z - hz) < HD) return true
      if (hasPool && Math.abs(x - poolX) < poolWidth/2 + 2 && Math.abs(z - poolZ) < poolDepth/2 + 2) return true
      return false
    }

    const result: TreePos[] = []
    let attempts = 0
    while (result.length < treeCount && attempts < 200) {
      attempts++
      const x = (rand() * 2 - 1) * hw
      const z = (rand() * 2 - 1) * hd
      if (blocked(x, z)) continue
      if (result.some((p) => Math.hypot(p.x - x, p.z - z) < 2.5)) continue
      result.push({
        x, z,
        scale: 0.8 + rand() * 0.7,
        type:  rand() > 0.5 ? 'pine' : 'deciduous',
      })
    }
    return result
  }, [treeCount, lotWidth, lotDepth, house, hasPool, poolX, poolZ, poolWidth, poolDepth])

  const bushPositions = useMemo(() => {
    const rand = seededRandom(77)
    const hw = lotWidth / 2 - 1.2, hd = lotDepth / 2 - 1.2
    const hx = house.x, hz = house.z
    const HW = house.width / 2 + 0.5, HD = house.depth / 2 + 0.5
    const result: { x: number; z: number; s: number }[] = []
    let att = 0
    while (result.length < bushCount && att < 300) {
      att++
      const x = (rand() * 2 - 1) * hw
      const z = (rand() * 2 - 1) * hd
      if (Math.abs(x - hx) < HW && Math.abs(z - hz) < HD) continue
      result.push({ x, z, s: 0.4 + rand() * 0.4 })
    }
    return result
  }, [bushCount, lotWidth, lotDepth, house])

  /* Instanced trunk mesh */
  const trunkCount    = positions.length
  const foliageCount  = positions.length
  const trunkRef      = useRef<THREE.InstancedMesh>(null)
  const foliageRef    = useRef<THREE.InstancedMesh>(null)
  const foliage2Ref   = useRef<THREE.InstancedMesh>(null)
  const bushRef       = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const dummy = new THREE.Object3D()
    positions.forEach(({ x, z, scale, type }, i) => {
      dummy.position.set(x, scale * 0.9, z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      trunkRef.current?.setMatrixAt(i, dummy.matrix)

      if (type === 'pine') {
        dummy.position.set(x, scale * 2.2, z)
        dummy.scale.set(scale, scale * 1.4, scale)
      } else {
        dummy.position.set(x, scale * 2.8, z)
        dummy.scale.setScalar(scale * 1.2)
      }
      dummy.updateMatrix()
      foliageRef.current?.setMatrixAt(i, dummy.matrix)

      if (type === 'pine') {
        dummy.position.set(x, scale * 3.4, z)
        dummy.scale.set(scale * 0.7, scale * 1.0, scale * 0.7)
        dummy.updateMatrix()
        foliage2Ref.current?.setMatrixAt(i, dummy.matrix)
      } else {
        dummy.position.set(x, scale * 2.8, z)
        dummy.scale.setScalar(0)  // hide for deciduous
        dummy.updateMatrix()
        foliage2Ref.current?.setMatrixAt(i, dummy.matrix)
      }
    })
    if (trunkRef.current)   { trunkRef.current.instanceMatrix.needsUpdate   = true }
    if (foliageRef.current) { foliageRef.current.instanceMatrix.needsUpdate = true }
    if (foliage2Ref.current){ foliage2Ref.current.instanceMatrix.needsUpdate= true }

    // Bushes
    const bd = new THREE.Object3D()
    bushPositions.forEach(({ x, z, s }, i) => {
      bd.position.set(x, s * 0.35, z)
      bd.scale.setScalar(s)
      bd.updateMatrix()
      bushRef.current?.setMatrixAt(i, bd.matrix)
    })
    if (bushRef.current) { bushRef.current.instanceMatrix.needsUpdate = true }
  }, [positions, bushPositions])

  if (trunkCount === 0) return null

  return (
    <group>
      {/* Trunks */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trunkCount]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.8, 6]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.95} />
      </instancedMesh>

      {/* Lower foliage / canopy */}
      <instancedMesh ref={foliageRef} args={[undefined, undefined, foliageCount]} castShadow>
        <coneGeometry args={[1.2, 2.2, 7]} />
        <meshStandardMaterial color="#2d6a1a" roughness={0.9} />
      </instancedMesh>

      {/* Upper foliage tier (pine only) */}
      <instancedMesh ref={foliage2Ref} args={[undefined, undefined, foliageCount]} castShadow>
        <coneGeometry args={[0.85, 1.6, 7]} />
        <meshStandardMaterial color="#245c14" roughness={0.9} />
      </instancedMesh>

      {/* Bushes */}
      {bushPositions.length > 0 && (
        <instancedMesh ref={bushRef} args={[undefined, undefined, bushPositions.length]} castShadow>
          <sphereGeometry args={[0.55, 7, 5]} />
          <meshStandardMaterial color="#3a7a20" roughness={0.95} />
        </instancedMesh>
      )}
    </group>
  )
}
