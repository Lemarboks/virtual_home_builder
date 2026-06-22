import { create } from 'zustand'
import type { HomeState, RoomDimensions, FurnitureItemData } from '../types/home'

const DEFAULT_ROOM: RoomDimensions = { width: 8, length: 10, height: 3 }
// Fix #8: single source of truth for defaults — resetProject and initial state
// both reference these, so changing a value only needs to happen in one place.
const DEFAULT_WALL_COLOR  = '#f2eee7'
const DEFAULT_FLOOR_COLOR = '#d6c4ad'

export const useHomeStore = create<HomeState>((set) => ({
  // Project identity
  projectId: null,
  projectName: 'Untitled room',

  // Design data
  selectedTool: 'wall',
  selectedFurnitureType: 'couch',
  selectedFurnitureId: null,
  roomDimensions: DEFAULT_ROOM,
  furnitureItems: [],
  wallColor: DEFAULT_WALL_COLOR,
  floorColor: DEFAULT_FLOOR_COLOR,

  // Project actions
  setProjectId: (projectId) => set({ projectId }),
  setProjectName: (projectName) => set({ projectName }),

  loadFromSaved: ({ projectId, projectName, roomDimensions, wallColor, floorColor, furnitureItems }) =>
    set({
      projectId,
      projectName,
      roomDimensions,
      wallColor,
      floorColor,
      furnitureItems,
      selectedFurnitureId: null,
    }),

  resetProject: () =>
    set({
      projectId: null,
      projectName: 'Untitled room',
      roomDimensions: DEFAULT_ROOM,
      furnitureItems: [],
      wallColor: DEFAULT_WALL_COLOR,
      floorColor: DEFAULT_FLOOR_COLOR,
      selectedFurnitureId: null,
    }),

  // Design actions
  setSelectedTool: (selectedTool) => set({ selectedTool }),
  setSelectedFurnitureType: (selectedFurnitureType) =>
    set({ selectedFurnitureType, selectedTool: 'furniture' }),
  setSelectedFurnitureId: (selectedFurnitureId) => set({ selectedFurnitureId }),
  setRoomDimension: (dimension, value) =>
    set((state) => ({
      roomDimensions: { ...state.roomDimensions, [dimension]: Math.max(1, value) },
    })),
  addFurnitureItem: (item: FurnitureItemData) =>
    set((state) => ({
      furnitureItems: [...state.furnitureItems, item],
      selectedFurnitureId: item.id,
    })),
  setWallColor: (wallColor) => set({ wallColor }),
  setFloorColor: (floorColor) => set({ floorColor }),
  setFurnitureColor: (id, color) =>
    set((state) => ({
      furnitureItems: state.furnitureItems.map((item) =>
        item.id === id ? { ...item, color } : item,
      ),
    })),
}))
