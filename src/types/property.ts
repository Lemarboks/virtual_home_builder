export type HouseStyle    = 'modern' | 'traditional' | 'luxury' | 'townhouse'
export type RoofType      = 'flat' | 'gable' | 'hip' | 'shed'
export type WallMaterial  = 'brick' | 'render' | 'concrete' | 'wood-cladding' | 'stone'
export type FenceStyle    = 'wood' | 'metal' | 'brick-wall'
export type CameraMode    = 'orbit' | 'topdown' | 'fps' | 'drone'
export type ActivePanel   = 'property' | 'building' | 'materials' | 'landscaping' | 'lighting'

export interface Vec2 { x: number; z: number }

export interface HouseConfig {
  // Footprint (metres, centred on lot)
  x: number
  z: number
  width: number
  depth: number
  // Floors
  floors: 1 | 2
  wallHeight: number          // per-floor wall height
  // Style
  style: HouseStyle
  roofType: RoofType
  roofPitch: number           // rise per half-width (0 = flat, 0.4 = moderate)
  roofOverhang: number
  // Materials / colours
  wallMaterial: WallMaterial
  wallColor: string
  roofColor: string
  trimColor: string
  windowColor: string
  // Features
  hasGarage: boolean
  garageWidth: number
  garageDepth: number
  hasPorch: boolean
  porchWidth: number
  porchDepth: number
  hasChimney: boolean
  chimneyOffsetX: number
  hasBalcony: boolean
}

export interface LandscapingConfig {
  treeCount: number
  bushCount: number
  hasGardenBeds: boolean
  hasRocks: boolean
  grassColor: string
}

export interface LightingConfig {
  timeOfDay: number           // 0-24 hours
  sunIntensity: number
  ambientIntensity: number
  shadowsEnabled: boolean
}

export interface PropertyConfig {
  id: string
  name: string
  // Lot size (metres)
  lotWidth: number
  lotDepth: number
  // Outdoor
  hasDriveway: boolean
  drivewaySide: 'left' | 'center' | 'right'
  drivewaySurface: 'concrete' | 'asphalt' | 'pavers'
  hasGarage: boolean
  hasPool: boolean
  poolX: number
  poolZ: number
  poolWidth: number
  poolDepth: number
  hasFence: boolean
  fenceStyle: FenceStyle
  hasSidewalk: boolean
  // Sub-configs
  house: HouseConfig
  landscaping: LandscapingConfig
  lighting: LightingConfig
}
