import { OrbitControls } from '@react-three/drei'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { FurnitureItem } from './FurnitureItem'
import { useHomeStore } from '../store/useHomeStore'
import type { FurnitureType, Vector3Tuple } from '../types/home'

const WALL_THICKNESS = 0.12

const FURNITURE_PRESETS: Record<FurnitureType, { size: Vector3Tuple; color: string }> = {
  couch: { size: [2.4, 0.85, 0.95], color: '#728878' },
  bed: { size: [2, 0.55, 2.4], color: '#d6c7b6' },
  table: { size: [1.6, 0.78, 1], color: '#9b7653' },
  chair: { size: [0.65, 0.9, 0.65], color: '#b18a61' },
  cabinet: { size: [1.4, 1.8, 0.55], color: '#8a755f' },
}

function Room() {
  const { width, length, height } = useHomeStore((state) => state.roomDimensions)
  const selectedTool = useHomeStore((state) => state.selectedTool)
  const selectedFurnitureType = useHomeStore((state) => state.selectedFurnitureType)
  const furnitureItems = useHomeStore((state) => state.furnitureItems)
  const wallColor = useHomeStore((state) => state.wallColor)
  const floorColor = useHomeStore((state) => state.floorColor)
  const addFurnitureItem = useHomeStore((state) => state.addFurnitureItem)
  const openingWidth = Math.min(2, width * 0.45)
  const openingHeight = Math.min(2.2, height * 0.8)
  const sideWidth = (width - openingWidth) / 2
  const topHeight = height - openingHeight
  const sideOffset = openingWidth / 2 + sideWidth / 2

  const placeFurniture = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (selectedTool !== 'furniture' || event.delta > 2) return

    const preset = FURNITURE_PRESETS[selectedFurnitureType]
    addFurnitureItem({
      id: crypto.randomUUID(),
      type: selectedFurnitureType,
      position: [event.point.x, 0, event.point.z],
      rotation: [0, 0, 0],
      size: preset.size,
      color: preset.color,
    })
  }

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} onClick={placeFurniture}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={floorColor} roughness={0.9} />
      </mesh>

      {furnitureItems.map((item) => <FurnitureItem item={item} key={item.id} />)}

      <mesh castShadow receiveShadow position={[0, height / 2, -length / 2]}>
        <boxGeometry args={[width, height, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      <mesh castShadow receiveShadow position={[-width / 2, height / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, height, length]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      <mesh castShadow receiveShadow position={[width / 2, height / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, height, length]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>

      {/* Three sections form the front wall around a centered opening. */}
      <mesh castShadow receiveShadow position={[-sideOffset, height / 2, length / 2]}>
        <boxGeometry args={[sideWidth, height, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      <mesh castShadow receiveShadow position={[sideOffset, height / 2, length / 2]}>
        <boxGeometry args={[sideWidth, height, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, openingHeight + topHeight / 2, length / 2]}>
        <boxGeometry args={[openingWidth, topHeight, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.95} />
      </mesh>
    </group>
  )
}

export function Canvas3D() {
  const { height, length } = useHomeStore((state) => state.roomDimensions)

  return (
    <Canvas
      shadows
      camera={{ position: [9, 7, length / 2 + 10], fov: 45, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#e8e5df']} />
      <ambientLight intensity={1.4} />
      <directionalLight castShadow position={[5, 10, 8]} intensity={1.8} shadow-mapSize={[1024, 1024]} />
      <Room />
      <OrbitControls
        makeDefault
        target={[0, height / 2, 0]}
        minDistance={5}
        maxDistance={35}
        maxPolarAngle={Math.PI / 2.02}
        enableDamping
      />
    </Canvas>
  )
}
