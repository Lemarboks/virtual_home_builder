'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, SoftShadows } from '@react-three/drei'
import * as THREE from 'three'
import { usePropertyStore } from '@/store/usePropertyStore'
import { sunPosition } from '@/lib/geometry'

export function Lighting() {
  const lighting  = usePropertyStore((s) => s.property.lighting)
  const dirRef    = useRef<THREE.DirectionalLight>(null)

  const sunPos = sunPosition(lighting.timeOfDay)
  const isDawn = lighting.timeOfDay < 7 || lighting.timeOfDay > 19
  const skyColor = isDawn ? '#ff9944' : '#ffffff'

  return (
    <>
      {lighting.shadowsEnabled && <SoftShadows size={20} samples={12} focus={0.5} />}

      <ambientLight intensity={lighting.ambientIntensity} color={isDawn ? '#ffddaa' : '#ffffff'} />

      <directionalLight
        ref={dirRef}
        castShadow={lighting.shadowsEnabled}
        position={[sunPos.x, sunPos.y, sunPos.z]}
        intensity={lighting.sunIntensity}
        color={skyColor}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0004}
      />

      {/* Fill light from opposite side of sun */}
      <directionalLight
        position={[-sunPos.x * 0.5, 8, -sunPos.z * 0.5]}
        intensity={lighting.sunIntensity * 0.15}
        color="#aaccff"
      />

      <Environment preset="city" />
    </>
  )
}
