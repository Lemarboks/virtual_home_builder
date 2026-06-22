'use client'
import { usePropertyStore } from '@/store/usePropertyStore'

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 mt-4">{children}</p>
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-zinc-300">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-bold hover:bg-zinc-600"
        onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="w-10 text-center text-sm text-white font-mono">{value}</span>
      <button className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-bold hover:bg-zinc-600"
        onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  )
}
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-zinc-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

const GRASS_PALETTES = [
  { label: 'Lush',   color: '#5a8a3c' },
  { label: 'Dry',    color: '#8a9a50' },
  { label: 'Dark',   color: '#3a6030' },
  { label: 'Lime',   color: '#78b040' },
]

export function LandscapingPanel() {
  const ls    = usePropertyStore((s) => s.property.landscaping)
  const setLs = usePropertyStore((s) => s.setLandscaping)

  return (
    <div className="space-y-1">
      <Label>Trees</Label>
      <Row label="Count">
        <Stepper value={ls.treeCount} min={0} max={30} onChange={(v) => setLs({ treeCount: v })} />
      </Row>

      <Label>Bushes</Label>
      <Row label="Count">
        <Stepper value={ls.bushCount} min={0} max={40} onChange={(v) => setLs({ bushCount: v })} />
      </Row>

      <Label>Garden</Label>
      <Row label="Garden beds">
        <Toggle checked={ls.hasGardenBeds} onChange={(v) => setLs({ hasGardenBeds: v })} />
      </Row>
      <Row label="Rocks">
        <Toggle checked={ls.hasRocks} onChange={(v) => setLs({ hasRocks: v })} />
      </Row>

      <Label>Grass Colour</Label>
      <div className="grid grid-cols-2 gap-1.5">
        {GRASS_PALETTES.map(({ label, color }) => (
          <button key={color}
            onClick={() => setLs({ grassColor: color })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
              ${ls.grassColor === color ? 'ring-2 ring-emerald-400 bg-zinc-700' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          >
            <span className="w-4 h-4 rounded-full border border-zinc-600" style={{ background: color }} />
            <span className="text-zinc-200">{label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-sm text-zinc-300">Custom</span>
        <input type="color" value={ls.grassColor} onChange={(e) => setLs({ grassColor: e.target.value })}
          className="w-8 h-8 rounded-lg border border-zinc-600 bg-zinc-800 p-0.5 cursor-pointer" />
      </div>
    </div>
  )
}
