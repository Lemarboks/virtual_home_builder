'use client'
import { useEffect } from 'react'
import { usePropertyStore } from '@/store/usePropertyStore'
import { resetWalkControls, setTouchWalkEnabled, setWalkAction } from '@/lib/walkControls'
import type { WalkAction } from '@/lib/walkControls'

function HoldButton({ action, label, symbol }: { action: WalkAction; label: string; symbol: string }) {
  const release = () => setWalkAction(action, false)
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-10 w-10 touch-none select-none place-items-center rounded-xl border border-white/15 bg-black/55 text-lg font-bold text-white shadow-lg backdrop-blur-md active:bg-emerald-600"
      onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setWalkAction(action, true) }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(event) => event.preventDefault()}
    >
      {symbol}
    </button>
  )
}

export function MobileWalkControls() {
  const setCameraMode = usePropertyStore((state) => state.setCameraMode)

  useEffect(() => {
    setTouchWalkEnabled(true)
    return () => setTouchWalkEnabled(false)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-10 sm:hidden" aria-label="Mobile walk controls">
      <div className="pointer-events-auto absolute right-2 top-2 flex gap-2">
        <button
          type="button"
          className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md"
          onClick={() => { resetWalkControls(); setCameraMode('orbit') }}
        >
          Exit walk
        </button>
      </div>

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-4 w-4 opacity-60">
          <div className="absolute h-4 w-px translate-x-[7px] bg-white" />
          <div className="absolute h-px w-4 translate-y-[7px] bg-white" />
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-14 left-2 grid grid-cols-3 gap-1" aria-label="Move">
        <span />
        <HoldButton action="forward" label="Move forward" symbol="^" />
        <span />
        <HoldButton action="left" label="Move left" symbol="<" />
        <HoldButton action="backward" label="Move backward" symbol="v" />
        <HoldButton action="right" label="Move right" symbol=">" />
      </div>

      <div className="pointer-events-auto absolute bottom-14 left-1/2 -translate-x-1/2">
        <HoldButton action="sprint" label="Hold to run" symbol="R" />
      </div>

      <div className="pointer-events-auto absolute bottom-14 right-2 grid grid-cols-3 gap-1" aria-label="Look around">
        <span />
        <HoldButton action="lookUp" label="Look up" symbol="^" />
        <span />
        <HoldButton action="lookLeft" label="Turn left" symbol="<" />
        <HoldButton action="lookDown" label="Look down" symbol="v" />
        <HoldButton action="lookRight" label="Turn right" symbol=">" />
      </div>
    </div>
  )
}
