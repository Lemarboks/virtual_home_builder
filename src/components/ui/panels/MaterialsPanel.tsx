'use client'
import { usePropertyStore } from '@/store/usePropertyStore'
import type { WallMaterial } from '@/types/property'

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 mt-4">{children}</p>
}
function ColorRow({ label, sub, value, onChange }: { label: string; sub?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-zinc-800">
      <div>
        <p className="text-sm text-zinc-200">{label}</p>
        {sub && <p className="text-xs text-zinc-500">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-600 bg-zinc-800 p-0.5" />
        <code className="text-xs text-zinc-500 font-mono w-14">{value.toUpperCase()}</code>
      </div>
    </div>
  )
}

const MATERIAL_CHIPS: { id: WallMaterial; label: string; desc: string }[] = [
  { id: 'render',       label: 'Render',    desc: 'Smooth plaster' },
  { id: 'brick',        label: 'Brick',     desc: 'Classic red brick' },
  { id: 'concrete',     label: 'Concrete',  desc: 'Raw concrete' },
  { id: 'wood-cladding',label: 'Timber',    desc: 'Horizontal boards' },
  { id: 'stone',        label: 'Stone',     desc: 'Natural stone' },
]

const STYLE_PRESETS = [
  { label: '🏙 Modern',       wallColor: '#f0ece4', roofColor: '#1a1a1a', trimColor: '#111111', wallMaterial: 'render'  as WallMaterial },
  { label: '🏡 Traditional',  wallColor: '#f5f0e8', roofColor: '#5a3020', trimColor: '#ffffff', wallMaterial: 'brick'   as WallMaterial },
  { label: '💎 Luxury',       wallColor: '#e8e4dc', roofColor: '#2a2a2a', trimColor: '#c0a840', wallMaterial: 'render'  as WallMaterial },
  { label: '🌿 Coastal',      wallColor: '#dce8e8', roofColor: '#4a6a6a', trimColor: '#f0f8f8', wallMaterial: 'wood-cladding' as WallMaterial },
  { label: '🪵 Rustic',       wallColor: '#c8b090', roofColor: '#4a3020', trimColor: '#3a2010', wallMaterial: 'stone'   as WallMaterial },
  { label: '⬛ Industrial',   wallColor: '#888880', roofColor: '#303030', trimColor: '#505050', wallMaterial: 'concrete' as WallMaterial },
]

export function MaterialsPanel() {
  const house          = usePropertyStore((s) => s.property.house)
  const grassColor     = usePropertyStore((s) => s.property.landscaping.grassColor)
  const setHouse       = usePropertyStore((s) => s.setHouse)
  const setLandscaping = usePropertyStore((s) => s.setLandscaping)

  return (
    <div>
      <Label>Style Presets</Label>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {STYLE_PRESETS.map((p) => (
          <button key={p.label}
            onClick={() => setHouse({ wallColor: p.wallColor, roofColor: p.roofColor, trimColor: p.trimColor, wallMaterial: p.wallMaterial })}
            className="px-2 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 text-left transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      <Label>Wall Texture</Label>
      <div className="grid grid-cols-1 gap-1.5">
        {MATERIAL_CHIPS.map(({ id, label, desc }) => (
          <button key={id}
            onClick={() => setHouse({ wallMaterial: id })}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left
              ${house.wallMaterial === id ? 'bg-emerald-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'}`}>
            <span className="font-medium">{label}</span>
            <span className={`text-xs ${house.wallMaterial === id ? 'text-emerald-200' : 'text-zinc-500'}`}>{desc}</span>
          </button>
        ))}
      </div>

      <Label>Building Colours</Label>
      <ColorRow label="Wall"   sub="Exterior wall" value={house.wallColor}   onChange={(v) => setHouse({ wallColor: v })} />
      <ColorRow label="Roof"   sub="Roof surface"  value={house.roofColor}   onChange={(v) => setHouse({ roofColor: v })} />
      <ColorRow label="Trim"   sub="Frame & doors" value={house.trimColor}   onChange={(v) => setHouse({ trimColor: v })} />
      <ColorRow label="Glass"  sub="Window tint"   value={house.windowColor} onChange={(v) => setHouse({ windowColor: v })} />

      <Label>Landscape Colours</Label>
      <ColorRow label="Grass"  sub="Lawn"     value={grassColor}
        onChange={(v) => setLandscaping({ grassColor: v })} />
    </div>
  )
}
