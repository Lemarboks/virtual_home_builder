'use client'
import { useState } from 'react'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { ROOM_PRESETS } from '@/types/floorplan'
import type { FPTool, RoomType } from '@/types/floorplan'
import { FloorPlanCanvas } from './FloorPlanCanvas'
import { FurnitureCatalog } from './FurnitureCatalog'

const TOOLS: { id: FPTool; icon: string; label: string; hint: string }[] = [
  { id: 'select',    icon: '↖',  label: 'Select',    hint: 'Click to select · Drag to move · Del to delete · R to rotate' },
  { id: 'room',      icon: '⬜', label: 'Room',      hint: 'Click and drag to draw a room rectangle' },
  { id: 'wall',      icon: '┃',  label: 'Wall',      hint: 'Click to start wall · Click again to finish · Double-click to end chain · Right-click to cancel' },
  { id: 'furniture', icon: '🛋', label: 'Furniture',  hint: 'Pick furniture from the right panel · Click canvas to place · R to rotate' },
  { id: 'erase',     icon: '✕',  label: 'Erase',     hint: 'Click any room, wall, or furniture to delete it' },
]

const ROOM_TYPES = Object.entries(ROOM_PRESETS) as [RoomType, typeof ROOM_PRESETS[RoomType]][]

export function FloorPlanEditor() {
  const [panelOpen, setPanelOpen] = useState(false)
  const activeTool   = useFloorPlanStore((s) => s.activeTool)
  const selectedId   = useFloorPlanStore((s) => s.selectedId)
  const rooms        = useFloorPlanStore((s) => s.rooms)
  const furniture    = useFloorPlanStore((s) => s.furniture)
  const setActiveTool = useFloorPlanStore((s) => s.setActiveTool)
  const updateRoom   = useFloorPlanStore((s) => s.updateRoom)
  const updateFurni  = useFloorPlanStore((s) => s.updateFurniture)
  const deleteSelected = useFloorPlanStore((s) => s.deleteSelected)
  const rotateSelected = useFloorPlanStore((s) => s.rotateSelected)
  const clearAll     = useFloorPlanStore((s) => s.clearAll)

  const selectedRoom  = rooms.find((r) => r.id === selectedId)
  const selectedFurni = furniture.find((f) => f.id === selectedId)
  const hint = TOOLS.find((t) => t.id === activeTool)?.hint ?? ''

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-zinc-950 sm:flex-row">

      {/* ── Left: tool rail ─────────────────────────────── */}
      <aside className="order-3 flex h-12 w-full flex-row items-center gap-0.5 border-t border-zinc-800 bg-zinc-950 px-1 shrink-0 sm:order-none sm:h-full sm:w-14 sm:flex-col sm:gap-1 sm:border-r sm:border-t-0 sm:px-0 sm:py-3">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => { setActiveTool(t.id); if (t.id === 'furniture') setPanelOpen(true) }} title={t.label}
            className={`h-10 flex-1 rounded-xl flex items-center justify-center text-sm transition-colors sm:h-11 sm:w-11 sm:flex-none sm:text-base
              ${activeTool === t.id ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}
          >
            {t.icon}
          </button>
        ))}

        <div className="hidden flex-1 sm:block" />

        <button onClick={() => setPanelOpen((open) => !open)} title="Furniture and properties"
          className={`h-10 flex-1 rounded-xl text-xs font-bold transition-colors sm:hidden ${panelOpen ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:bg-zinc-800'}`}>
          Menu
        </button>

        {/* Zoom reset */}
        <button onClick={() => clearAll()} title="Clear all"
          className="h-10 flex-1 rounded-xl flex items-center justify-center text-sm text-zinc-600 hover:bg-red-900 hover:text-red-400 transition-colors sm:h-11 sm:w-11 sm:flex-none">
          🗑
        </button>
      </aside>

      {/* ── Centre: canvas ──────────────────────────────── */}
      <div className="order-1 flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden sm:order-none">
        {/* Hint bar */}
        <div className="px-2 py-1.5 text-[10px] sm:px-4 sm:py-2 sm:text-xs text-zinc-400 bg-zinc-900 border-b border-zinc-800 shrink-0 truncate">
          {hint} &nbsp;·&nbsp; <span className="text-zinc-500">Scroll to zoom · Middle-drag to pan</span>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <FloorPlanCanvas />
        </div>

        {/* Status bar */}
        <div className="px-2 py-1 text-[10px] sm:px-4 sm:py-1.5 sm:text-xs text-zinc-500 bg-zinc-900 border-t border-zinc-800 shrink-0 flex gap-3 sm:gap-4 overflow-hidden [&>span:last-child]:hidden [&>span:last-child]:sm:inline">
          <span>Rooms: {rooms.length}</span>
          <span>Furniture: {furniture.length}</span>
          <span className="text-zinc-600">Del — delete &nbsp;|&nbsp; R — rotate &nbsp;|&nbsp; Esc — cancel</span>
        </div>
      </div>

      {/* ── Right: properties + catalog ─────────────────── */}
      <aside className={`${panelOpen ? 'flex' : 'hidden'} absolute inset-x-0 bottom-12 z-20 h-[min(42dvh,22rem)] flex-col overflow-hidden rounded-t-2xl border-x border-t border-zinc-700 bg-zinc-900/98 shadow-2xl backdrop-blur-md sm:static sm:flex sm:h-full sm:w-60 sm:rounded-none sm:border-l sm:border-r-0 sm:border-t-0 sm:border-zinc-800 sm:bg-zinc-900 sm:shadow-none sm:backdrop-blur-none shrink-0`}>

        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 sm:hidden shrink-0">
          <span className="text-xs font-semibold text-white">Furniture & properties</span>
          <button onClick={() => setPanelOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-800 text-zinc-400" aria-label="Close panel">x</button>
        </div>

        {/* Selected element properties */}
        {selectedRoom && (
          <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Room</p>

            {/* Room type selector */}
            <div className="grid grid-cols-2 gap-1 mb-3">
              {ROOM_TYPES.map(([type, preset]) => (
                <button key={type}
                  onClick={() => updateRoom(selectedRoom.id, { type, floorColor: preset.floorColor, wallColor: preset.wallColor })}
                  className={`px-2 py-1.5 rounded-lg text-xs text-left transition-colors
                    ${selectedRoom.type === type ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {([['Floor', 'floorColor'], ['Wall', 'wallColor']] as const).map(([label, key]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedRoom[key]}
                      onChange={(e) => updateRoom(selectedRoom.id, { [key]: e.target.value })}
                      className="w-7 h-7 rounded border border-zinc-600 bg-zinc-800 p-0.5 cursor-pointer" />
                    <code className="text-xs text-zinc-500 font-mono w-14">{selectedRoom[key].toUpperCase()}</code>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={deleteSelected}
              className="mt-3 w-full py-1.5 rounded-lg bg-red-900/50 text-red-400 text-xs hover:bg-red-900 transition-colors">
              Delete room
            </button>
          </div>
        )}

        {selectedFurni && (
          <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              {selectedFurni.icon} {selectedFurni.label}
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Colour</span>
              <input type="color" value={selectedFurni.color}
                onChange={(e) => updateFurni(selectedFurni.id, { color: e.target.value })}
                className="w-7 h-7 rounded border border-zinc-600 bg-zinc-800 p-0.5 cursor-pointer" />
            </div>
            <div className="flex gap-2">
              <button onClick={rotateSelected}
                className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors">
                ↻ Rotate 90°
              </button>
              <button onClick={deleteSelected}
                className="flex-1 py-1.5 rounded-lg bg-red-900/50 text-red-400 text-xs hover:bg-red-900 transition-colors">
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Furniture catalog */}
        <div className="flex-1 overflow-hidden">
          <FurnitureCatalog />
        </div>
      </aside>
    </div>
  )
}
