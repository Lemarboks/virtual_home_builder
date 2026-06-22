'use client'
import { usePropertyStore } from '@/store/usePropertyStore'

export function Pool() {
  const { hasPool, poolX, poolZ, poolWidth, poolDepth } = usePropertyStore((s) => s.property)
  if (!hasPool) return null

  const DECK_T   = 0.12   // deck slab thickness
  const DECK_PAD = 0.85   // deck surround width
  const POOL_D   = 1.6    // pool depth below deck
  const deckW    = poolWidth  + DECK_PAD * 2
  const deckD    = poolDepth  + DECK_PAD * 2

  return (
    <group position={[poolX, 0, poolZ]}>
      {/* Deck surround – 4 slabs forming a frame */}
      {[
        // North slab
        [0,          DECK_T/2, -(poolDepth/2 + DECK_PAD/2), deckW, DECK_T, DECK_PAD],
        // South slab
        [0,          DECK_T/2,  (poolDepth/2 + DECK_PAD/2), deckW, DECK_T, DECK_PAD],
        // West slab
        [-(poolWidth/2 + DECK_PAD/2), DECK_T/2, 0, DECK_PAD, DECK_T, poolDepth],
        // East slab
        [ (poolWidth/2 + DECK_PAD/2), DECK_T/2, 0, DECK_PAD, DECK_T, poolDepth],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} castShadow receiveShadow position={[x as number, y as number, z as number]}>
          <boxGeometry args={[w as number, h as number, d as number]} />
          <meshStandardMaterial color="#e0dbd4" roughness={0.75} />
        </mesh>
      ))}

      {/* Pool basin walls */}
      {[
        [0,           -POOL_D/2, -(poolDepth/2), poolWidth, POOL_D, 0.15],
        [0,           -POOL_D/2,  (poolDepth/2), poolWidth, POOL_D, 0.15],
        [-(poolWidth/2), -POOL_D/2, 0, 0.15, POOL_D, poolDepth],
        [ (poolWidth/2), -POOL_D/2, 0, 0.15, POOL_D, poolDepth],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={`wall-${i}`} receiveShadow position={[x as number, y as number, z as number]}>
          <boxGeometry args={[w as number, h as number, d as number]} />
          <meshStandardMaterial color="#c8e4f0" roughness={0.3} />
        </mesh>
      ))}

      {/* Pool floor */}
      <mesh receiveShadow position={[0, -POOL_D, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[poolWidth - 0.15, poolDepth - 0.15]} />
        <meshStandardMaterial color="#7abcdc" roughness={0.3} />
      </mesh>

      {/* Water surface – slightly transparent */}
      <mesh position={[0, DECK_T - 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[poolWidth - 0.15, poolDepth - 0.15]} />
        <meshPhysicalMaterial
          color="#38a8d8"
          transparent
          opacity={0.82}
          roughness={0.05}
          metalness={0}
          transmission={0.3}
          thickness={1}
        />
      </mesh>

      {/* Pool light strip (emissive edge) */}
      <mesh position={[0, DECK_T * 0.5, 0]}>
        <boxGeometry args={[poolWidth + 0.02, 0.01, poolDepth + 0.02]} />
        <meshStandardMaterial color="#60c8f0" emissive="#30a8e0" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}
