'use client'
import dynamic from 'next/dynamic'
import { usePropertyStore } from '@/store/usePropertyStore'
import { Sidebar }         from './ui/Sidebar'
import { Header }          from './ui/Header'
import { FloorPlanEditor } from './floorplan/FloorPlanEditor'
import { MobileWalkControls } from './ui/MobileWalkControls'

const Scene = dynamic(
  () => import('./canvas/Scene').then((m) => m.Scene),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 grid place-items-center bg-zinc-900 text-zinc-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading 3D scene…</span>
        </div>
      </div>
    ),
  },
)

function FPSOverlay() {
  const cameraMode    = usePropertyStore((s) => s.view.cameraMode)
  const appView       = usePropertyStore((s) => s.view.appView)
  const setCameraMode = usePropertyStore((s) => s.setCameraMode)
  if (cameraMode !== 'fps' || appView !== '3d') return null
  return (
    <div className="absolute inset-0 pointer-events-none z-10 hidden flex-col items-center justify-end pb-8 sm:flex">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-5 h-5">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white/60" />
          <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-white/60" />
        </div>
      </div>
      <div className="bg-black/50 backdrop-blur-sm text-white/80 text-xs rounded-xl px-4 py-2.5 flex items-center gap-4 pointer-events-auto">
        <span>Click canvas to lock mouse</span>
        <span className="text-white/40">|</span>
        <span><kbd className="bg-white/10 rounded px-1.5 py-0.5 font-mono">WASD</kbd> Move</span>
        <span><kbd className="bg-white/10 rounded px-1.5 py-0.5 font-mono">Shift</kbd> Sprint</span>
        <span><kbd className="bg-white/10 rounded px-1.5 py-0.5 font-mono">Esc</kbd> Exit</span>
        <button className="ml-2 text-red-400 hover:text-red-300 transition-colors"
          onClick={() => setCameraMode('orbit')}>✕ Exit walk</button>
      </div>
    </div>
  )
}

export function AppShell() {
  const appView = usePropertyStore((s) => s.view.appView)
  const cameraMode = usePropertyStore((s) => s.view.cameraMode)

  return (
    <div className="flex min-h-0 flex-col h-full bg-zinc-950">
      <Header />

      {appView === '2d' ? (
        /* ── Floor plan editor (full width, no 3D sidebar) ── */
        <div className="flex-1 min-h-0 overflow-hidden">
          <FloorPlanEditor />
        </div>
      ) : (
        /* ── 3D scene with sidebar ── */
        <div className="relative flex flex-1 min-h-0 overflow-hidden">
          <Sidebar />
          <main className="flex-1 relative overflow-hidden pb-12 sm:pb-0">
            <Scene />
            <FPSOverlay />
            {cameraMode === 'fps' && <MobileWalkControls />}
          </main>
        </div>
      )}
    </div>
  )
}
