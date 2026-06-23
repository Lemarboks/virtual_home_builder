'use client'
import { create } from 'zustand'
import type { FPTool, FPRoom, FPWall, FPFurniture, RoomType, Point, FurnitureDef } from '@/types/floorplan'
import { ROOM_PRESETS } from '@/types/floorplan'

function uid() { return Math.random().toString(36).slice(2, 10) }

interface FloorPlanStore {
  rooms:       FPRoom[]
  walls:       FPWall[]
  furniture:   FPFurniture[]
  activeTool:  FPTool
  selectedId:  string | null
  pendingFurnitureDef: FurnitureDef | null   // furniture picked from catalog, waiting to be placed

  // Actions
  addRoom:          (room: Omit<FPRoom, 'id'>) => string
  updateRoom:       (id: string, patch: Partial<FPRoom>) => void
  deleteRoom:       (id: string) => void
  addWall:          (wall: Omit<FPWall, 'id'>) => void
  deleteWall:       (id: string) => void
  addFurniture:     (item: Omit<FPFurniture, 'id'>) => void
  updateFurniture:  (id: string, patch: Partial<FPFurniture>) => void
  deleteFurniture:  (id: string) => void
  setActiveTool:    (tool: FPTool) => void
  setSelectedId:    (id: string | null) => void
  setPendingFurniture: (def: FurnitureDef | null) => void
  deleteSelected:   () => void
  rotateSelected:   () => void
  clearAll:         () => void
}

export const useFloorPlanStore = create<FloorPlanStore>((set, get) => ({
  rooms: [
    // Default starter layout
    { id: 'r1', x: -6, y: -4, width: 8, height: 5, type: 'living',  floorColor: '#e8dcc8', wallColor: '#c8b898' },
    { id: 'r2', x:  2, y: -4, width: 5, height: 5, type: 'bedroom', floorColor: '#c8d4e8', wallColor: '#a8b8d0' },
    { id: 'r3', x: -6, y:  1, width: 5, height: 4, type: 'kitchen', floorColor: '#e8e0c0', wallColor: '#c8c0a0' },
    { id: 'r4', x: -1, y:  1, width: 3, height: 4, type: 'bathroom',floorColor: '#c8e4e8', wallColor: '#a0c8cc' },
    { id: 'r5', x:  2, y:  1, width: 5, height: 4, type: 'dining',  floorColor: '#e4d8c0', wallColor: '#c0b090' },
  ],
  walls:     [],
  furniture: [],
  activeTool:  'select',
  selectedId:  null,
  pendingFurnitureDef: null,

  addRoom: (room) => {
    const id = uid()
    set((s) => ({ rooms: [...s.rooms, { ...room, id }] }))
    return id
  },
  updateRoom: (id, patch) =>
    set((s) => ({ rooms: s.rooms.map((r) => r.id === id ? { ...r, ...patch } : r) })),
  deleteRoom: (id) =>
    set((s) => ({ rooms: s.rooms.filter((r) => r.id !== id), selectedId: s.selectedId === id ? null : s.selectedId })),

  addWall: (wall) =>
    set((s) => ({ walls: [...s.walls, { ...wall, id: uid() }] })),
  deleteWall: (id) =>
    set((s) => ({ walls: s.walls.filter((w) => w.id !== id), selectedId: s.selectedId === id ? null : s.selectedId })),

  addFurniture: (item) =>
    set((s) => ({ furniture: [...s.furniture, { ...item, id: uid() }] })),
  updateFurniture: (id, patch) =>
    set((s) => ({ furniture: s.furniture.map((f) => f.id === id ? { ...f, ...patch } : f) })),
  deleteFurniture: (id) =>
    set((s) => ({ furniture: s.furniture.filter((f) => f.id !== id), selectedId: s.selectedId === id ? null : s.selectedId })),

  setActiveTool:       (activeTool)        => set({ activeTool }),
  setSelectedId:       (selectedId)        => set({ selectedId }),
  setPendingFurniture: (pendingFurnitureDef) => set({ pendingFurnitureDef }),

  deleteSelected: () => {
    const { selectedId, rooms, walls, furniture } = get()
    if (!selectedId) return
    if (rooms.some((r) => r.id === selectedId))     get().deleteRoom(selectedId)
    else if (walls.some((w) => w.id === selectedId)) get().deleteWall(selectedId)
    else                                             get().deleteFurniture(selectedId)
  },

  rotateSelected: () => {
    const { selectedId, furniture } = get()
    const f = furniture.find((f) => f.id === selectedId)
    if (f) get().updateFurniture(f.id, { rotation: (f.rotation + 90) % 360 })
  },

  clearAll: () => set({ rooms: [], walls: [], furniture: [], selectedId: null }),
}))
