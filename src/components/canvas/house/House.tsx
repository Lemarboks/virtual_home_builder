'use client'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import { makeBrickTexture, makeConcreteTexture, makeWoodTexture } from '@/lib/geometry'
import { Roof } from './Roof'
import { usePropertyStore } from '@/store/usePropertyStore'
import type { HouseConfig } from '@/types/property'

/* ── Window component ─────────────────────────────────────── */
function Window({
  x, y, z, w, h, rotation = 0, frameColor, glassColor,
}: {
  x: number; y: number; z: number
  w: number; h: number
  rotation?: number
  frameColor: string; glassColor: string
}) {
  const FRAME = 0.06, DEPTH = 0.08, GLASS_D = 0.04

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]}>
      {/* Frame – 4 bars */}
      {[
        [0,   h/2, 0,   w,    FRAME, DEPTH],  // top
        [0,  -h/2, 0,   w,    FRAME, DEPTH],  // bottom
        [-w/2, 0,  0,   FRAME, h,    DEPTH],  // left
        [ w/2, 0,  0,   FRAME, h,    DEPTH],  // right
        [0,    0,  0,   FRAME, h/2,  DEPTH],  // mullion centre vertical
        [0,    0.1,0,   w,    FRAME, DEPTH],  // mullion centre horizontal
      ].map(([fx,fy,fz,fw,fh,fd], i) => (
        <mesh key={i} castShadow position={[fx as number, fy as number, fz as number]}>
          <boxGeometry args={[fw as number, fh as number, fd as number]} />
          <meshStandardMaterial color={frameColor} roughness={0.6} metalness={0.2} />
        </mesh>
      ))}
      {/* Glass pane */}
      <mesh position={[0, 0, GLASS_D / 2]}>
        <boxGeometry args={[w - FRAME * 2, h - FRAME * 2, GLASS_D]} />
        <meshPhysicalMaterial
          color={glassColor} transparent opacity={0.35}
          roughness={0.05} metalness={0.1}
          transmission={0.6} thickness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
    </group>
  )
}

/* ── Door component ───────────────────────────────────────── */
function Door({
  x, y, z, w, h, rotation = 0, color, frameColor,
}: {
  x: number; y: number; z: number
  w: number; h: number
  rotation?: number
  color: string; frameColor: string
}) {
  const FRAME = 0.08, DEPTH = 0.1

  return (
    <group position={[x, y, z]} rotation={[0, rotation, 0]}>
      {/* Door panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w - FRAME * 2, h - FRAME, DEPTH]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Frame */}
      {[
        [0,   h/2,  0, w,    FRAME, DEPTH + 0.02],
        [-w/2, 0,   0, FRAME, h,    DEPTH + 0.02],
        [ w/2, 0,   0, FRAME, h,    DEPTH + 0.02],
      ].map(([fx,fy,fz,fw,fh,fd], i) => (
        <mesh key={i} position={[fx as number, fy as number, fz as number]}>
          <boxGeometry args={[fw as number, fh as number, fd as number]} />
          <meshStandardMaterial color={frameColor} roughness={0.6} />
        </mesh>
      ))}
      {/* Door handle */}
      <mesh position={[w / 2 - 0.14, -0.06, DEPTH / 2 + 0.01]}>
        <cylinderGeometry args={[0.025, 0.025, 0.12, 8]} />
        <meshStandardMaterial color="#c0a040" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  )
}

/* ── Wall section (box) ───────────────────────────────────── */
function WallBox({ pos, size, mat }: { pos: [number,number,number]; size: [number,number,number]; mat: ReactElement }) {
  return (
    <mesh castShadow receiveShadow position={pos}>
      <boxGeometry args={size} />
      {mat}
    </mesh>
  )
}

/* ── Garage door ──────────────────────────────────────────── */
function GarageDoor({ w, h, z, color }: { w: number; h: number; z: number; color: string }) {
  const panels = 4
  const pH = h / panels

  return (
    <group position={[0, h / 2, z]}>
      {Array.from({ length: panels }, (_, i) => (
        <mesh key={i} castShadow position={[0, (i - panels/2 + 0.5) * pH, 0]}>
          <boxGeometry args={[w - 0.1, pH - 0.04, 0.06]} />
          <meshStandardMaterial color={color} roughness={0.5} metalness={0.15} />
        </mesh>
      ))}
      {/* Track rails */}
      {[-w/2 + 0.06, w/2 - 0.06].map((x, i) => (
        <mesh key={`rail-${i}`} position={[x, 0, 0.01]}>
          <boxGeometry args={[0.06, h, 0.04]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Chimney ──────────────────────────────────────────────── */
function Chimney({ house, totalHeight }: { house: HouseConfig; totalHeight: number }) {
  if (!house.hasChimney) return null
  const CW = 0.7, CD = 0.7, ABOVE = 1.2
  const rh = house.roofPitch * house.width / 2
  return (
    <group position={[house.chimneyOffsetX, 0, -house.depth * 0.3]}>
      {/* Chimney stack */}
      <mesh castShadow receiveShadow position={[0, totalHeight + rh / 2 + ABOVE / 2, 0]}>
        <boxGeometry args={[CW, ABOVE + rh, CD]} />
        <meshStandardMaterial color="#8B4030" roughness={0.9} />
      </mesh>
      {/* Chimney cap */}
      <mesh castShadow position={[0, totalHeight + rh + ABOVE, 0]}>
        <boxGeometry args={[CW + 0.15, 0.1, CD + 0.15]} />
        <meshStandardMaterial color="#5a3020" roughness={0.85} />
      </mesh>
    </group>
  )
}

/* ── Porch ────────────────────────────────────────────────── */
function Porch({ house, wallH }: { house: HouseConfig; wallH: number }) {
  if (!house.hasPorch) return null
  const { depth, porchWidth, porchDepth, trimColor } = house
  const frontZ = depth / 2
  const numCols = Math.max(2, Math.round(porchWidth / 2.5))
  const colSpacing = porchWidth / (numCols - 1)

  return (
    <group position={[0, 0, frontZ]}>
      {/* Porch slab */}
      <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]}
        position={[0, 0.05, porchDepth / 2]}>
        <planeGeometry args={[porchWidth, porchDepth]} />
        <meshStandardMaterial color="#dedad4" roughness={0.8} />
      </mesh>
      {/* Porch step */}
      <mesh castShadow receiveShadow position={[0, 0.075, porchDepth + 0.15]}>
        <boxGeometry args={[porchWidth, 0.15, 0.3]} />
        <meshStandardMaterial color="#ccc8c0" roughness={0.85} />
      </mesh>
      {/* Columns */}
      {Array.from({ length: numCols }, (_, i) => {
        const x = -porchWidth / 2 + i * colSpacing
        return (
          <mesh key={i} castShadow position={[x, wallH / 2, porchDepth]}>
            <cylinderGeometry args={[0.1, 0.12, wallH, 8]} />
            <meshStandardMaterial color={trimColor} roughness={0.6} />
          </mesh>
        )
      })}
      {/* Porch roof beam */}
      <mesh castShadow position={[0, wallH + 0.1, porchDepth / 2]}>
        <boxGeometry args={[porchWidth + 0.2, 0.15, porchDepth + 0.2]} />
        <meshStandardMaterial color={trimColor} roughness={0.7} />
      </mesh>
    </group>
  )
}

/* ── Main House component ─────────────────────────────────── */
export function House() {
  const house = usePropertyStore((s) => s.property.house)

  const {
    x, z, width, depth, floors, wallHeight,
    wallMaterial, wallColor, trimColor, windowColor, roofColor,
    hasGarage, garageWidth, garageDepth,
  } = house

  const wallTex = useMemo(() => {
    if (typeof window === 'undefined') return null
    if (wallMaterial === 'brick')        return makeBrickTexture()
    if (wallMaterial === 'wood-cladding') return makeWoodTexture()
    return makeConcreteTexture()
  }, [wallMaterial])

  const wallMat = (
    <meshStandardMaterial
      map={wallTex ?? undefined}
      color={wallTex ? '#ffffff' : wallColor}
      roughness={0.88} metalness={0}
      side={2} /* THREE.DoubleSide — walls visible from inside in FPS mode */
    />
  )

  const totalH = wallHeight * floors
  const WT     = 0.25    // wall thickness

  /* Derive window / door positions */
  const DOOR_W = 1.1, DOOR_H = 2.15
  const WIN_W  = 1.3,  WIN_H  = 1.2
  const WIN_Y  = wallHeight * 0.55

  /* Front wall: door centre-left, two windows */
  const frontZ    = depth / 2 + WT / 2
  const frontLeft = -(width / 4)

  /* Back wall: 2 windows */
  const backZ = -(depth / 2 + WT / 2)

  /* Garage attached on right side */
  const garageX = width / 2 + garageWidth / 2
  const garageH = wallHeight * 0.9

  return (
    <group position={[x, 0, z]}>
      {/* ── Foundation ── */}
      <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[width + 0.4, 0.2, depth + 0.4]} />
        <meshStandardMaterial color="#b8b0a0" roughness={0.9} />
      </mesh>

      {/* ── Exterior walls ── */}
      {/* Back wall (full) */}
      <WallBox pos={[0, totalH/2, backZ]}     size={[width, totalH, WT]} mat={wallMat} />
      {/* Left wall (full) */}
      <WallBox pos={[-(width/2+WT/2), totalH/2, 0]} size={[WT, totalH, depth]} mat={wallMat} />
      {/* Right wall – shortened if garage attached */}
      <WallBox pos={[(width/2+WT/2), totalH/2, 0]}  size={[WT, totalH, depth]} mat={wallMat} />

      {/* Front wall – three sections around door */}
      {/* Left section */}
      <WallBox pos={[frontLeft - WIN_W/2 - 0.5 - (width/2 - (width/4 + WIN_W/2 + 1)) / 2,
        totalH/2, frontZ]}
        size={[width/2 - (width/4 + WIN_W/2 + 1), totalH, WT]} mat={wallMat} />
      {/* Left of door */}
      <WallBox pos={[frontLeft - DOOR_W/2 - 0.3, totalH/2, frontZ]}
        size={[0.6, totalH, WT]} mat={wallMat} />
      {/* Above door */}
      <WallBox pos={[frontLeft, totalH - (totalH - DOOR_H)/2, frontZ]}
        size={[DOOR_W, totalH - DOOR_H, WT]} mat={wallMat} />
      {/* Between door and right window */}
      <WallBox pos={[frontLeft + DOOR_W/2 + WIN_W/2 + 0.3, totalH/2, frontZ]}
        size={[WIN_W * 0.6, totalH, WT]} mat={wallMat} />
      {/* Right of window 1 */}
      <WallBox pos={[width/4 - WIN_W/2 - 0.2, totalH/2, frontZ]}
        size={[0.4, totalH, WT]} mat={wallMat} />
      {/* Above window 1 */}
      <WallBox pos={[width/4, totalH - (totalH - WIN_H - WIN_Y) / 2, frontZ]}
        size={[WIN_W + 0.1, totalH - WIN_H - WIN_Y, WT]} mat={wallMat} />
      {/* Below window 1 */}
      <WallBox pos={[width/4, WIN_Y/2, frontZ]}
        size={[WIN_W + 0.1, WIN_Y, WT]} mat={wallMat} />
      {/* Far right of front */}
      <WallBox pos={[width/4 + WIN_W/2 + 0.5 + (width/2 - width/4 - WIN_W/2 - 1) / 2,
        totalH/2, frontZ]}
        size={[width/2 - width/4 - WIN_W/2 - 1, totalH, WT]} mat={wallMat} />

      {/* ── Windows & doors ── */}
      {/* Front door */}
      <Door
        x={frontLeft} y={DOOR_H/2} z={frontZ + WT/2 + 0.01}
        w={DOOR_W} h={DOOR_H}
        color={trimColor} frameColor={trimColor}
      />
      {/* Front window */}
      <Window
        x={width/4} y={WIN_Y + WIN_H/2} z={frontZ + WT/2 + 0.01}
        w={WIN_W} h={WIN_H}
        frameColor={trimColor} glassColor={windowColor}
      />
      {/* Back windows */}
      {[-width/4, width/4].map((wx, i) => (
        <Window key={i}
          x={wx} y={WIN_Y + WIN_H/2} z={backZ - WT/2 - 0.01}
          w={WIN_W} h={WIN_H} rotation={Math.PI}
          frameColor={trimColor} glassColor={windowColor}
        />
      ))}
      {/* Side windows */}
      {[-depth/4, depth/4].map((wz, i) => (
        <Window key={`side-${i}`}
          x={width/2 + WT/2 + 0.01} y={WIN_Y + WIN_H/2} z={wz}
          w={0.9} h={WIN_H} rotation={Math.PI/2}
          frameColor={trimColor} glassColor={windowColor}
        />
      ))}

      {/* Second floor windows */}
      {floors === 2 && (
        <>
          {[-width/4, width/4].map((wx, i) => (
            <Window key={`f2-${i}`}
              x={wx} y={wallHeight + WIN_Y + WIN_H/2} z={frontZ + WT/2 + 0.01}
              w={WIN_W} h={WIN_H}
              frameColor={trimColor} glassColor={windowColor}
            />
          ))}
          {/* Second floor band */}
          <WallBox pos={[0, wallHeight, 0]} size={[width, 0.08, depth + WT * 2]} mat={
            <meshStandardMaterial color={trimColor} roughness={0.7} />
          } />
        </>
      )}

      {/* ── Garage ── */}
      {hasGarage && (
        <group position={[garageX, 0, -depth/2 + garageDepth/2]}>
          {/* Garage walls */}
          <WallBox pos={[0, garageH/2, -(garageDepth/2 + WT/2)]} size={[garageWidth, garageH, WT]} mat={wallMat} />
          <WallBox pos={[garageWidth/2 + WT/2, garageH/2, 0]} size={[WT, garageH, garageDepth]} mat={wallMat} />
          <WallBox pos={[0, garageH/2, garageDepth/2 + WT/2]}  size={[garageWidth, garageH, WT]} mat={wallMat} />
          {/* Flat garage roof */}
          <mesh castShadow receiveShadow position={[0, garageH + 0.09, 0]}>
            <boxGeometry args={[garageWidth + 0.3, 0.18, garageDepth + 0.3]} />
            <meshStandardMaterial color={roofColor} roughness={0.85} />
          </mesh>
          {/* Garage door */}
          <GarageDoor w={garageWidth - 0.3} h={garageH * 0.85} z={garageDepth/2 + WT/2 + 0.01} color={trimColor} />
        </group>
      )}

      {/* ── Porch ── */}
      <Porch house={house} wallH={wallHeight} />

      {/* ── Chimney ── */}
      <Chimney house={house} totalHeight={totalH} />

      {/* ── Roof ── */}
      <Roof house={house} totalHeight={totalH} />
    </group>
  )
}
