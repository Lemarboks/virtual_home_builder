'use client'
import { useState } from 'react'
import { usePropertyStore } from '@/store/usePropertyStore'
import { getSupabase } from '@/lib/supabase'
import type { CameraMode } from '@/types/property'
import type { AppView } from '@/store/usePropertyStore'

const CAMERA_MODES: { mode: CameraMode; icon: string; label: string }[] = [
  { mode: 'topdown', icon: '🗺', label: 'Top'   },
  { mode: 'orbit',   icon: '🔄', label: 'Orbit' },
  { mode: 'drone',   icon: '🚁', label: 'Drone' },
  { mode: 'fps',     icon: '👁', label: 'Walk'  },
]

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function Header() {
  const property      = usePropertyStore((s) => s.property)
  const isDirty       = usePropertyStore((s) => s.isDirty)
  const cameraMode    = usePropertyStore((s) => s.view.cameraMode)
  const appView       = usePropertyStore((s) => s.view.appView)
  const setCameraMode = usePropertyStore((s) => s.setCameraMode)
  const setAppView    = usePropertyStore((s) => s.setAppView)
  const markSaved     = usePropertyStore((s) => s.markSaved)
  const setProperty   = usePropertyStore((s) => s.setProperty)

  const [saveState, setSaveState] = useState<SaveState>('idle')

  async function handleSave() {
    setSaveState('saving')
    try {
      const payload = { id: property.id, name: property.name, data: property, updated_at: new Date().toISOString() }
      const { error } = await getSupabase().from('haven_projects').upsert(payload).eq('id', property.id)
      if (error) throw error
      markSaved()
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  const saveLabel =
    saveState === 'saving' ? 'Saving…' :
    saveState === 'saved'  ? 'Saved ✓' :
    saveState === 'error'  ? 'Error'   :
    isDirty ? 'Save *' : 'Save'

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-zinc-950 border-b border-zinc-800 shrink-0 z-10">

      {/* Brand + project name */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-600 grid place-items-center text-white font-bold text-sm">H</div>
        <span className="text-white font-semibold text-sm tracking-tight">Haven Pro</span>
        <span className="hidden sm:block text-zinc-600 text-xs">|</span>
        <input
          className="hidden sm:block bg-transparent text-zinc-300 text-sm outline-none hover:text-white focus:text-white w-40"
          value={property.name}
          onChange={(e) => setProperty({ name: e.target.value })}
          maxLength={60}
          spellCheck={false}
        />
        {isDirty && <span className="text-amber-400 text-xs">●</span>}
      </div>

      {/* Centre: view toggle + camera modes (3D only) */}
      <div className="flex items-center gap-2">
        {/* 2D / 3D view toggle */}
        <div className="flex items-center bg-zinc-900 rounded-xl p-0.5">
          {(['2d', '3d'] as AppView[]).map((v) => (
            <button key={v} onClick={() => setAppView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${appView === v ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
              {v === '2d' ? '⬛ Floor Plan' : '🏠 3D View'}
            </button>
          ))}
        </div>

        {/* Camera modes — only visible in 3D */}
        {appView === '3d' && (
          <div className="flex items-center gap-0.5 bg-zinc-900 rounded-xl p-0.5">
            {CAMERA_MODES.map(({ mode, icon, label }) => (
              <button key={mode} onClick={() => setCameraMode(mode)} title={label}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${cameraMode === mode ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
                <span>{icon}</span>
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center gap-2">
        <button onClick={handleSave} disabled={saveState === 'saving'}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
            ${saveState === 'saved'  ? 'bg-emerald-700 text-white' :
              saveState === 'error'  ? 'bg-red-700 text-white'     :
              saveState === 'saving' ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' :
              'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
          {saveLabel}
        </button>
      </div>
    </header>
  )
}
