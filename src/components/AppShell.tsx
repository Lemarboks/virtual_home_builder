'use client'
import dynamic from 'next/dynamic'
import { Sidebar } from './ui/Sidebar'
import { Header }  from './ui/Header'

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

export function AppShell() {
  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 relative overflow-hidden">
          <Scene />
        </main>
      </div>
    </div>
  )
}
