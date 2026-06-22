'use client'
import { Canvas } from '@react-three/fiber'
import { usePropertyStore } from '@/store/usePropertyStore'
import { CameraController } from './CameraController'
import { Lighting } from './Lighting'
import { Terrain } from './property/Terrain'
import { Driveway } from './property/Driveway'
import { Fence } from './property/Fence'
import { Pool } from './property/Pool'
import { House } from './house/House'
import { Trees } from './landscaping/Trees'

export function Scene() {
  const lotDepth = usePropertyStore((s) => s.property.lotDepth)

  return (
    <Canvas
      shadows
      camera={{ position: [18, 22, lotDepth * 0.7], fov: 42, near: 0.1, far: 500 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#b8d4e8']} />
      <fog attach="fog" args={['#b8d4e8', 80, 250]} />

      <CameraController />
      <Lighting />

      <Terrain />
      <Driveway />
      <Fence />
      <Pool />
      <House />
      <Trees />
    </Canvas>
  )
}
