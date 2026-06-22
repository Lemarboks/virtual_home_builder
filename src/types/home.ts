export type HomeTool = 'wall' | 'door' | 'window' | 'furniture' | 'color'
export type FurnitureType = 'couch' | 'bed' | 'table' | 'chair' | 'cabinet'
export type Vector3Tuple = [number, number, number]

export interface FurnitureItemData {
  id: string
  type: FurnitureType
  position: Vector3Tuple
  rotation: Vector3Tuple
  size: Vector3Tuple
  color: string
}

export interface RoomDimensions {
  width: number
  length: number
  height: number
}

export interface HomeState {
  // Project identity
  projectId: string | null
  projectName: string

  // Design data
  selectedTool: HomeTool
  selectedFurnitureType: FurnitureType
  selectedFurnitureId: string | null
  roomDimensions: RoomDimensions
  furnitureItems: FurnitureItemData[]
  wallColor: string
  floorColor: string

  // Actions
  setProjectId: (id: string | null) => void
  setProjectName: (name: string) => void
  loadFromSaved: (params: {
    projectId: string
    projectName: string
    roomDimensions: RoomDimensions
    wallColor: string
    floorColor: string
    furnitureItems: FurnitureItemData[]
  }) => void
  resetProject: () => void
  setSelectedTool: (tool: HomeTool) => void
  setSelectedFurnitureType: (type: FurnitureType) => void
  setSelectedFurnitureId: (id: string | null) => void
  setRoomDimension: (dimension: keyof RoomDimensions, value: number) => void
  addFurnitureItem: (item: FurnitureItemData) => void
  setWallColor: (color: string) => void
  setFloorColor: (color: string) => void
  setFurnitureColor: (id: string, color: string) => void
}
