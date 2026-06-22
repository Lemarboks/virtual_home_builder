'use client'
import { usePropertyStore } from '@/store/usePropertyStore'
import { PropertyPanel }    from './panels/PropertyPanel'
import { BuildingPanel }    from './panels/BuildingPanel'
import { LightingPanel }    from './panels/LightingPanel'
import { LandscapingPanel } from './panels/LandscapingPanel'
import type { ActivePanel } from '@/types/property'

const PANELS: { id: ActivePanel; label: string; icon: string }[] = [
  { id: 'property',    label: 'Property',    icon: '⬜' },
  { id: 'building',   label: 'Building',    icon: '🏠' },
  { id: 'materials',  label: 'Materials',   icon: '🎨' },
  { id: 'landscaping',label: 'Garden',      icon: '🌿' },
  { id: 'lighting',   label: 'Lighting',    icon: '☀️' },
]

export function Sidebar() {
  const activePanel  = usePropertyStore((s) => s.view.activePanel)
  const setActivePanel = usePropertyStore((s) => s.setActivePanel)

  return (
    <aside className="flex h-full">
      {/* Icon nav rail */}
      <nav className="flex flex-col items-center gap-1 w-14 py-3 bg-zinc-950 border-r border-zinc-800 shrink-0">
        {PANELS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            title={label}
            className={`flex flex-col items-center justify-center w-11 h-11 rounded-xl text-lg transition-colors
              ${activePanel === id ? 'bg-emerald-600 text-white' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'}`}
          >
            <span>{icon}</span>
          </button>
        ))}
      </nav>

      {/* Panel content */}
      <div className="flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white capitalize">
            {PANELS.find((p) => p.id === activePanel)?.label}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin scrollbar-thumb-zinc-700">
          {activePanel === 'property'    && <PropertyPanel />}
          {activePanel === 'building'    && <BuildingPanel />}
          {activePanel === 'landscaping' && <LandscapingPanel />}
          {activePanel === 'lighting'    && <LightingPanel />}
          {activePanel === 'materials'   && (
            <div className="text-zinc-500 text-sm mt-6 text-center">
              <p className="text-2xl mb-2">🎨</p>
              <p>Material editor</p>
              <p className="text-xs mt-1">Coming in Phase 3</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
