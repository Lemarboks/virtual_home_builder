export interface Point { x: number; y: number }

export type FPTool = 'select' | 'room' | 'wall' | 'furniture' | 'erase'
export type RoomType = 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining' | 'office' | 'hallway' | 'garage'

export const ROOM_PRESETS: Record<RoomType, { label: string; floorColor: string; wallColor: string }> = {
  living:   { label: 'Living Room', floorColor: '#e8dcc8', wallColor: '#c8b898' },
  bedroom:  { label: 'Bedroom',     floorColor: '#c8d4e8', wallColor: '#a8b8d0' },
  kitchen:  { label: 'Kitchen',     floorColor: '#e8e0c0', wallColor: '#c8c0a0' },
  bathroom: { label: 'Bathroom',    floorColor: '#c8e4e8', wallColor: '#a0c8cc' },
  dining:   { label: 'Dining Room', floorColor: '#e4d8c0', wallColor: '#c0b090' },
  office:   { label: 'Office',      floorColor: '#d4cce0', wallColor: '#b4a8c8' },
  hallway:  { label: 'Hallway',     floorColor: '#dcdad0', wallColor: '#bcbab0' },
  garage:   { label: 'Garage',      floorColor: '#c8c8c0', wallColor: '#a0a098' },
}

export interface FPRoom {
  id: string
  x: number    // top-left corner in world metres
  y: number
  width: number
  height: number
  type: RoomType
  floorColor: string
  wallColor: string
}

export interface FPWall {
  id: string
  x1: number; y1: number
  x2: number; y2: number
  hasDoor: boolean
}

export interface FPFurniture {
  id: string
  type: string
  label: string
  x: number    // centre in world metres
  y: number
  width: number
  depth: number
  rotation: number   // 0 | 90 | 180 | 270 degrees
  color: string
  icon: string
}

export interface FurnitureDef {
  type: string
  label: string
  category: string
  width: number
  depth: number
  color: string
  icon: string
}

export const FURNITURE_CATALOG: FurnitureDef[] = [
  // Living
  { type: 'sofa',         label: 'Sofa',          category: 'Living',   width: 2.2,  depth: 0.95, color: '#7a9488', icon: '🛋' },
  { type: 'armchair',     label: 'Armchair',       category: 'Living',   width: 0.85, depth: 0.85, color: '#9a7488', icon: '🪑' },
  { type: 'coffee-table', label: 'Coffee Table',   category: 'Living',   width: 1.1,  depth: 0.6,  color: '#a08060', icon: '▬' },
  { type: 'tv-unit',      label: 'TV Unit',        category: 'Living',   width: 1.8,  depth: 0.45, color: '#404040', icon: '📺' },
  { type: 'bookcase',     label: 'Bookcase',       category: 'Living',   width: 1.0,  depth: 0.3,  color: '#b09070', icon: '📚' },
  { type: 'floor-lamp',   label: 'Floor Lamp',     category: 'Living',   width: 0.4,  depth: 0.4,  color: '#c8b878', icon: '💡' },
  // Bedroom
  { type: 'double-bed',   label: 'Double Bed',     category: 'Bedroom',  width: 1.6,  depth: 2.1,  color: '#c8b0a0', icon: '🛏' },
  { type: 'single-bed',   label: 'Single Bed',     category: 'Bedroom',  width: 0.9,  depth: 2.0,  color: '#c8c0b0', icon: '🛏' },
  { type: 'wardrobe',     label: 'Wardrobe',       category: 'Bedroom',  width: 1.8,  depth: 0.6,  color: '#b89860', icon: '🚪' },
  { type: 'dresser',      label: 'Dresser',        category: 'Bedroom',  width: 1.2,  depth: 0.5,  color: '#a87850', icon: '🗄' },
  { type: 'desk',         label: 'Desk',           category: 'Bedroom',  width: 1.4,  depth: 0.7,  color: '#b09060', icon: '💻' },
  { type: 'nightstand',   label: 'Nightstand',     category: 'Bedroom',  width: 0.5,  depth: 0.4,  color: '#a07858', icon: '▦' },
  // Kitchen
  { type: 'fridge',       label: 'Refrigerator',   category: 'Kitchen',  width: 0.7,  depth: 0.7,  color: '#d0d8e0', icon: '🧊' },
  { type: 'stove',        label: 'Stove',          category: 'Kitchen',  width: 0.6,  depth: 0.6,  color: '#707070', icon: '🍳' },
  { type: 'counter',      label: 'Counter',        category: 'Kitchen',  width: 1.8,  depth: 0.6,  color: '#e0d8c0', icon: '▬' },
  { type: 'island',       label: 'Kitchen Island', category: 'Kitchen',  width: 1.5,  depth: 0.9,  color: '#d8ceb0', icon: '▬' },
  { type: 'kitchen-sink', label: 'Sink',           category: 'Kitchen',  width: 0.6,  depth: 0.5,  color: '#b0c8d8', icon: '🚰' },
  // Dining
  { type: 'dining-table', label: 'Dining Table',   category: 'Dining',   width: 1.6,  depth: 0.9,  color: '#a08060', icon: '🍽' },
  { type: 'dining-chair', label: 'Chair',          category: 'Dining',   width: 0.48, depth: 0.48, color: '#907050', icon: '🪑' },
  // Bathroom
  { type: 'toilet',       label: 'Toilet',         category: 'Bathroom', width: 0.4,  depth: 0.7,  color: '#e8f0f8', icon: '🚽' },
  { type: 'bath-sink',    label: 'Sink',           category: 'Bathroom', width: 0.5,  depth: 0.4,  color: '#d0e4f0', icon: '🪣' },
  { type: 'bathtub',      label: 'Bathtub',        category: 'Bathroom', width: 0.75, depth: 1.7,  color: '#c8e4f8', icon: '🛁' },
  { type: 'shower',       label: 'Shower',         category: 'Bathroom', width: 0.9,  depth: 0.9,  color: '#a0d4f0', icon: '🚿' },
  // Office
  { type: 'office-desk',  label: 'Office Desk',    category: 'Office',   width: 1.6,  depth: 0.8,  color: '#c0b888', icon: '🖥' },
  { type: 'office-chair', label: 'Office Chair',   category: 'Office',   width: 0.65, depth: 0.65, color: '#505868', icon: '🪑' },
  { type: 'filing-cab',   label: 'Filing Cabinet', category: 'Office',   width: 0.4,  depth: 0.5,  color: '#888890', icon: '🗄' },
]
