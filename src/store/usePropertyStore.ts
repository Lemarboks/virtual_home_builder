'use client'
import { create } from 'zustand'
import type { PropertyConfig, HouseConfig, LandscapingConfig, LightingConfig, ActivePanel, CameraMode } from '@/types/property'

const DEFAULT_HOUSE: HouseConfig = {
  x: 0, z: -3,
  width: 14, depth: 10,
  floors: 1, wallHeight: 2.9,
  style: 'modern', roofType: 'flat',
  roofPitch: 0.05, roofOverhang: 0.4,
  wallMaterial: 'render', wallColor: '#f0ece4',
  roofColor: '#2a2a2a', trimColor: '#1a1a1a',
  windowColor: '#a8c4d4',
  hasGarage: true,  garageWidth: 5,   garageDepth: 6,
  hasPorch:  true,  porchWidth: 5,    porchDepth: 2.5,
  hasChimney: false, chimneyOffsetX: 3,
  hasBalcony: false,
}

const DEFAULT_LANDSCAPING: LandscapingConfig = {
  treeCount: 10, bushCount: 14,
  hasGardenBeds: true, hasRocks: true,
  grassColor: '#5a8a3c',
}

const DEFAULT_LIGHTING: LightingConfig = {
  timeOfDay: 14,
  sunIntensity: 2.2, ambientIntensity: 0.6,
  shadowsEnabled: true,
}

const DEFAULT_PROPERTY: PropertyConfig = {
  id: 'default',
  name: 'My Property',
  lotWidth: 24, lotDepth: 36,
  hasDriveway: true, drivewaySide: 'right', drivewaySurface: 'concrete',
  hasGarage: true,
  hasPool: true,  poolX: -6, poolZ: 8,  poolWidth: 5, poolDepth: 9,
  hasFence: true, fenceStyle: 'wood',
  hasSidewalk: true,
  house: DEFAULT_HOUSE,
  landscaping: DEFAULT_LANDSCAPING,
  lighting: DEFAULT_LIGHTING,
}

export type AppView = '3d' | '2d'

interface ViewState {
  activePanel:  ActivePanel
  cameraMode:   CameraMode
  showGrid:     boolean
  showMeasurements: boolean
  appView:      AppView
}

interface PropertyStore {
  property:   PropertyConfig
  view:       ViewState
  isDirty:    boolean

  setProperty:     (p: Partial<PropertyConfig>) => void
  setHouse:        (h: Partial<HouseConfig>) => void
  setLandscaping:  (l: Partial<LandscapingConfig>) => void
  setLighting:     (l: Partial<LightingConfig>) => void
  setActivePanel:  (panel: ActivePanel) => void
  setCameraMode:   (mode: CameraMode) => void
  setAppView:      (view: AppView) => void
  toggleGrid:      () => void
  markSaved:       () => void
  loadProperty:    (p: PropertyConfig) => void
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  property:  DEFAULT_PROPERTY,
  view: { activePanel: 'property', cameraMode: 'orbit', showGrid: false, showMeasurements: false, appView: '3d' },
  isDirty: false,

  setProperty:    (patch) => set((s) => ({ property: { ...s.property, ...patch }, isDirty: true })),
  setHouse:       (patch) => set((s) => ({ property: { ...s.property, house: { ...s.property.house, ...patch } }, isDirty: true })),
  setLandscaping: (patch) => set((s) => ({ property: { ...s.property, landscaping: { ...s.property.landscaping, ...patch } }, isDirty: true })),
  setLighting:    (patch) => set((s) => ({ property: { ...s.property, lighting: { ...s.property.lighting, ...patch } }, isDirty: true })),
  setActivePanel: (panel) => set((s) => ({ view: { ...s.view, activePanel: panel } })),
  setCameraMode:  (mode)  => set((s) => ({ view: { ...s.view, cameraMode: mode } })),
  setAppView:     (view)  => set((s) => ({ view: { ...s.view, appView: view } })),
  toggleGrid:     ()      => set((s) => ({ view: { ...s.view, showGrid: !s.view.showGrid } })),
  markSaved:      ()      => set({ isDirty: false }),
  loadProperty:   (p)     => set({ property: p, isDirty: false }),
}))
