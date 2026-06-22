import type { FurnitureItemData } from '../types/home'
import { useHomeStore } from '../store/useHomeStore'

interface FurnitureItemProps {
  item: FurnitureItemData
}

export function FurnitureItem({ item }: FurnitureItemProps) {
  const selected = useHomeStore((state) => state.selectedFurnitureId === item.id)
  const setSelectedFurnitureId = useHomeStore((state) => state.setSelectedFurnitureId)
  const [width, height, depth] = item.size
  const [x, y, z] = item.position

  return (
    <mesh
      castShadow
      receiveShadow
      position={[x, y + height / 2, z]}
      rotation={item.rotation}
      userData={{ id: item.id, type: item.type }}
      onClick={(event) => {
        event.stopPropagation()
        setSelectedFurnitureId(item.id)
      }}
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={item.color}
        roughness={0.8}
        emissive={selected ? '#7f9d88' : '#000000'}
        emissiveIntensity={selected ? 0.18 : 0}
      />
    </mesh>
  )
}
