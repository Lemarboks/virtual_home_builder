'use client'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { usePropertyStore } from '@/store/usePropertyStore'

export function Fence() {
  const property = usePropertyStore((s) => s.property)
  const { lotWidth, lotDepth, hasFence, fenceStyle, hasDriveway, drivewaySide, house } = property

  if (!hasFence) return null

  const hw = lotWidth / 2
  const hd = lotDepth / 2

  // Gap for driveway opening on front fence
  const DW = house.garageWidth + 2.0
  let gapX = 0
  if (drivewaySide === 'left')  gapX = -(hw - DW / 2 - 1)
  if (drivewaySide === 'right') gapX =   hw - DW / 2 - 1

  return (
    <group>
      {fenceStyle === 'wood'      && <WoodFence hw={hw} hd={hd} gapX={hasDriveway ? gapX : null} gapW={hasDriveway ? DW : 0} />}
      {fenceStyle === 'metal'     && <MetalFence hw={hw} hd={hd} gapX={hasDriveway ? gapX : null} gapW={hasDriveway ? DW : 0} />}
      {fenceStyle === 'brick-wall' && <BrickWallFence hw={hw} hd={hd} gapX={hasDriveway ? gapX : null} gapW={hasDriveway ? DW : 0} />}
    </group>
  )
}

/* ── Shared segment helper ─────────────────────────────────── */
function FenceSegment({
  x0, z0, x1, z1, postH, postW, railH, railW, numRails, color, postColor,
}: {
  x0: number; z0: number; x1: number; z1: number
  postH: number; postW: number; railH: number; railW: number
  numRails: number; color: string; postColor: string
}) {
  const dx = x1 - x0, dz = z1 - z0
  const len = Math.sqrt(dx * dx + dz * dz)
  const angle = Math.atan2(dx, dz)
  const numPosts = Math.max(2, Math.round(len / 1.8) + 1)
  const posts = Array.from({ length: numPosts }, (_, i) => ({
    x: x0 + (dx * i) / (numPosts - 1),
    z: z0 + (dz * i) / (numPosts - 1),
  }))

  return (
    <group>
      {posts.map((p, i) => (
        <mesh key={i} castShadow receiveShadow position={[p.x, postH / 2, p.z]}>
          <boxGeometry args={[postW, postH, postW]} />
          <meshStandardMaterial color={postColor} roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: numRails }, (_, i) => {
        const y = railH + (i * (postH - railH * 2)) / Math.max(1, numRails - 1)
        const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2
        return (
          <mesh key={i} castShadow receiveShadow position={[cx, y, cz]} rotation={[0, angle, 0]}>
            <boxGeometry args={[railW, 0.05, len]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
        )
      })}
    </group>
  )
}

/* ── Wood fence ────────────────────────────────────────────── */
function WoodFence({ hw, hd, gapX, gapW }: { hw: number; hd: number; gapX: number | null; gapW: number }) {
  const props = { postH: 1.5, postW: 0.1, railH: 0.3, railW: 0.06, numRails: 3, color: '#8B6343', postColor: '#6B4323' }
  const frontZ = hd

  return (
    <group>
      {/* Back fence */}
      <FenceSegment x0={-hw} z0={-hd} x1={hw} z1={-hd} {...props} />
      {/* Left fence */}
      <FenceSegment x0={-hw} z0={-hd} x1={-hw} z1={hd} {...props} />
      {/* Right fence */}
      <FenceSegment x0={hw} z0={-hd} x1={hw} z1={hd} {...props} />
      {/* Front fence – split around driveway */}
      {gapX !== null ? (
        <>
          <FenceSegment x0={-hw} z0={frontZ} x1={gapX - gapW / 2} z1={frontZ} {...props} />
          <FenceSegment x0={gapX + gapW / 2} z0={frontZ} x1={hw} z1={frontZ} {...props} />
        </>
      ) : (
        <FenceSegment x0={-hw} z0={frontZ} x1={hw} z1={frontZ} {...props} />
      )}
    </group>
  )
}

/* ── Metal fence ───────────────────────────────────────────── */
function MetalFence({ hw, hd, gapX, gapW }: { hw: number; hd: number; gapX: number | null; gapW: number }) {
  const props = { postH: 1.8, postW: 0.08, railH: 0.2, railW: 0.04, numRails: 2, color: '#606060', postColor: '#404040' }
  const frontZ = hd

  return (
    <group>
      <FenceSegment x0={-hw} z0={-hd} x1={hw}  z1={-hd} {...props} />
      <FenceSegment x0={-hw} z0={-hd} x1={-hw} z1={hd}  {...props} />
      <FenceSegment x0={hw}  z0={-hd} x1={hw}  z1={hd}  {...props} />
      {gapX !== null ? (
        <>
          <FenceSegment x0={-hw} z0={frontZ} x1={gapX - gapW / 2} z1={frontZ} {...props} />
          <FenceSegment x0={gapX + gapW / 2} z0={frontZ} x1={hw} z1={frontZ} {...props} />
        </>
      ) : (
        <FenceSegment x0={-hw} z0={frontZ} x1={hw} z1={frontZ} {...props} />
      )}
    </group>
  )
}

/* ── Brick-wall fence ──────────────────────────────────────── */
function BrickWallFence({ hw, hd, gapX, gapW }: { hw: number; hd: number; gapX: number | null; gapW: number }) {
  const WALL_H  = 0.9
  const WALL_TH = 0.22
  const mat = <meshStandardMaterial color="#b06040" roughness={0.85} />

  function WallStrip({ x0, z0, x1, z1 }: { x0: number; z0: number; x1: number; z1: number }) {
    const len = Math.sqrt((x1-x0)**2 + (z1-z0)**2)
    const cx = (x0+x1)/2, cz = (z0+z1)/2
    const angle = Math.atan2(x1-x0, z1-z0)
    return (
      <mesh castShadow receiveShadow position={[cx, WALL_H/2, cz]} rotation={[0, angle, 0]}>
        <boxGeometry args={[WALL_TH, WALL_H, len]} />
        {mat}
      </mesh>
    )
  }
  const frontZ = hd
  return (
    <group>
      <WallStrip x0={-hw} z0={-hd} x1={hw} z1={-hd} />
      <WallStrip x0={-hw} z0={-hd} x1={-hw} z1={hd} />
      <WallStrip x0={hw}  z0={-hd} x1={hw}  z1={hd}  />
      {gapX !== null ? (
        <>
          <WallStrip x0={-hw} z0={frontZ} x1={gapX - gapW/2} z1={frontZ} />
          <WallStrip x0={gapX + gapW/2} z0={frontZ} x1={hw} z1={frontZ} />
        </>
      ) : (
        <WallStrip x0={-hw} z0={frontZ} x1={hw} z1={frontZ} />
      )}
    </group>
  )
}
