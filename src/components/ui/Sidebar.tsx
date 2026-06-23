'use client'
import { useState } from 'react'
import { usePropertyStore } from '@/store/usePropertyStore'
import { PropertyPanel } from './panels/PropertyPanel'
import { BuildingPanel } from './panels/BuildingPanel'
import { LightingPanel } from './panels/LightingPanel'
import { LandscapingPanel } from './panels/LandscapingPanel'
import { MaterialsPanel } from './panels/MaterialsPanel'
import type { ActivePanel } from '@/types/property'

const PANELS: { id: ActivePanel; label: string; icon: string }[] = [
  { id: 'property', label: 'Property', icon: 'P' },
  { id: 'building', label: 'Building', icon: 'B' },
  { id: 'materials', label: 'Materials', icon: 'M' },
  { id: 'landscaping', label: 'Garden', icon: 'G' },
  { id: 'lighting', label: 'Lighting', icon: 'L' },
]

export function Sidebar() {
  const activePanel = usePropertyStore((s) => s.view.activePanel)
  const setActivePanel = usePropertyStore((s) => s.setActivePanel)
  const [panelOpen, setPanelOpen] = useState(false)

  function choosePanel(id: ActivePanel) {
    if (activePanel === id) setPanelOpen((open) => !open)
    else {
      setActivePanel(id)
      setPanelOpen(true)
    }
  }

  return (
    <aside className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col-reverse sm:pointer-events-auto sm:static sm:flex-row sm:h-full">
      <nav className="pointer-events-auto flex h-12 w-full flex-row items-center justify-around gap-0.5 border-t border-zinc-800 bg-zinc-950/95 px-1 backdrop-blur-md sm:h-full sm:w-14 sm:flex-col sm:justify-start sm:gap-1 sm:border-r sm:border-t-0 sm:px-0 sm:py-3 sm:bg-zinc-950 sm:backdrop-blur-none shrink-0">
        {PANELS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => choosePanel(id)}
            title={label}
            aria-label={label}
            aria-expanded={activePanel === id && panelOpen}
            className={`flex h-10 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-bold leading-none transition-colors sm:h-11 sm:w-11 sm:flex-none sm:text-sm ${
              activePanel === id
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            <span>{icon}</span>
            <span className="text-[8px] font-medium sm:hidden">{label}</span>
          </button>
        ))}
      </nav>

      <div className={`${panelOpen ? 'flex' : 'hidden'} pointer-events-auto absolute inset-x-0 bottom-12 max-h-[min(44dvh,22rem)] flex-col overflow-hidden rounded-t-2xl border-x border-t border-zinc-700 bg-zinc-900/98 shadow-2xl backdrop-blur-md sm:static sm:flex sm:h-full sm:max-h-none sm:w-64 sm:rounded-none sm:border-l-0 sm:border-t-0 sm:border-r sm:border-zinc-800 sm:bg-zinc-900 sm:shadow-none sm:backdrop-blur-none`}>
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2.5 sm:py-3 shrink-0">
          <h2 className="text-sm font-semibold text-white">
            {PANELS.find((panel) => panel.id === activePanel)?.label}
          </h2>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white sm:hidden"
            aria-label="Close settings"
          >
            x
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4 sm:px-4 sm:pb-6 scrollbar-thin scrollbar-thumb-zinc-700">
          {activePanel === 'property' && <PropertyPanel />}
          {activePanel === 'building' && <BuildingPanel />}
          {activePanel === 'landscaping' && <LandscapingPanel />}
          {activePanel === 'lighting' && <LightingPanel />}
          {activePanel === 'materials' && <MaterialsPanel />}
        </div>
      </div>
    </aside>
  )
}
