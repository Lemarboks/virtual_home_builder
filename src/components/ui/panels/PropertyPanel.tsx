'use client'
import { usePropertyStore } from '@/store/usePropertyStore'
import type { FenceStyle } from '@/types/property'

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 mt-4">{children}</p>
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-zinc-300 shrink-0">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
function Stepper({ value, min, max, step = 1, onChange }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-bold hover:bg-zinc-600 active:bg-zinc-500"
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(1)))}>−</button>
      <span className="w-12 text-center text-sm text-white font-mono">{value}</span>
      <button className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-bold hover:bg-zinc-600 active:bg-zinc-500"
        onClick={() => onChange(Math.min(max, +(value + step).toFixed(1)))}>+</button>
    </div>
  )
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-zinc-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

export function PropertyPanel() {
  const property   = usePropertyStore((s) => s.property)
  const setProperty = usePropertyStore((s) => s.setProperty)

  return (
    <div className="space-y-1">
      <Label>Lot Size</Label>
      <Row label="Width (m)">
        <Stepper value={property.lotWidth}  min={10} max={60} onChange={(v) => setProperty({ lotWidth: v })} />
      </Row>
      <Row label="Depth (m)">
        <Stepper value={property.lotDepth}  min={15} max={80} onChange={(v) => setProperty({ lotDepth: v })} />
      </Row>

      <Label>Driveway</Label>
      <Row label="Enabled">
        <Toggle checked={property.hasDriveway} onChange={(v) => setProperty({ hasDriveway: v })} />
      </Row>
      {property.hasDriveway && (
        <>
          <Row label="Side">
            <select className="bg-zinc-700 text-white text-sm rounded-lg px-2 py-1 border border-zinc-600"
              value={property.drivewaySide}
              onChange={(e) => setProperty({ drivewaySide: e.target.value as 'left'|'center'|'right' })}>
              {['left','center','right'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Row>
          <Row label="Surface">
            <select className="bg-zinc-700 text-white text-sm rounded-lg px-2 py-1 border border-zinc-600"
              value={property.drivewaySurface}
              onChange={(e) => setProperty({ drivewaySurface: e.target.value as 'concrete'|'asphalt'|'pavers' })}>
              {['concrete','asphalt','pavers'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Row>
        </>
      )}

      <Label>Swimming Pool</Label>
      <Row label="Enabled">
        <Toggle checked={property.hasPool} onChange={(v) => setProperty({ hasPool: v })} />
      </Row>
      {property.hasPool && (
        <>
          <Row label="Width (m)">
            <Stepper value={property.poolWidth} min={2} max={12} onChange={(v) => setProperty({ poolWidth: v })} />
          </Row>
          <Row label="Length (m)">
            <Stepper value={property.poolDepth} min={4} max={20} onChange={(v) => setProperty({ poolDepth: v })} />
          </Row>
        </>
      )}

      <Label>Boundary Fence</Label>
      <Row label="Enabled">
        <Toggle checked={property.hasFence} onChange={(v) => setProperty({ hasFence: v })} />
      </Row>
      {property.hasFence && (
        <Row label="Style">
          <select className="bg-zinc-700 text-white text-sm rounded-lg px-2 py-1 border border-zinc-600"
            value={property.fenceStyle}
            onChange={(e) => setProperty({ fenceStyle: e.target.value as FenceStyle })}>
            {['wood','metal','brick-wall'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </Row>
      )}

      <Label>Sidewalk</Label>
      <Row label="Enabled">
        <Toggle checked={property.hasSidewalk} onChange={(v) => setProperty({ hasSidewalk: v })} />
      </Row>
    </div>
  )
}
