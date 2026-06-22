'use client'
import { usePropertyStore } from '@/store/usePropertyStore'
import type { HouseStyle, RoofType, WallMaterial } from '@/types/property'

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
function Stepper({ value, min, max, step=0.5, onChange }: { value: number; min: number; max: number; step?: number; onChange: (v:number)=>void }) {
  return (
    <div className="flex items-center gap-1">
      <button className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-bold hover:bg-zinc-600"
        onClick={() => onChange(Math.max(min, +(value-step).toFixed(1)))}>−</button>
      <span className="w-12 text-center text-sm text-white font-mono">{value}</span>
      <button className="w-7 h-7 rounded-lg bg-zinc-700 text-zinc-200 text-sm font-bold hover:bg-zinc-600"
        onClick={() => onChange(Math.min(max, +(value+step).toFixed(1)))}>+</button>
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
function ChipGroup<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o}
          onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors
            ${value === o ? 'bg-emerald-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
        >{o}</button>
      ))}
    </div>
  )
}
function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-600 bg-zinc-800 p-0.5" />
        <code className="text-xs text-zinc-400 font-mono">{value.toUpperCase()}</code>
      </div>
    </Row>
  )
}

export function BuildingPanel() {
  const house    = usePropertyStore((s) => s.property.house)
  const setHouse = usePropertyStore((s) => s.setHouse)

  return (
    <div className="space-y-1">
      <Label>Footprint</Label>
      <Row label="Width (m)">
        <Stepper value={house.width} min={6} max={25} onChange={(v) => setHouse({ width: v })} />
      </Row>
      <Row label="Depth (m)">
        <Stepper value={house.depth} min={6} max={20} onChange={(v) => setHouse({ depth: v })} />
      </Row>
      <Row label="Floors">
        <ChipGroup value={String(house.floors) as '1'|'2'} options={['1','2']}
          onChange={(v) => setHouse({ floors: parseInt(v) as 1|2 })} />
      </Row>
      <Row label="Wall Height">
        <Stepper value={house.wallHeight} min={2.4} max={4} onChange={(v) => setHouse({ wallHeight: v })} />
      </Row>

      <Label>Style</Label>
      <ChipGroup<HouseStyle>
        value={house.style}
        options={['modern','traditional','luxury','townhouse']}
        onChange={(v) => {
          const presets: Record<HouseStyle, Partial<typeof house>> = {
            modern:      { roofType:'flat',  wallMaterial:'render',  wallColor:'#f0ece4', roofColor:'#222', trimColor:'#111' },
            traditional: { roofType:'gable', wallMaterial:'brick',   wallColor:'#ffffff', roofColor:'#5a3020', trimColor:'#fff' },
            luxury:      { roofType:'hip',   wallMaterial:'render',  wallColor:'#e8e4dc', roofColor:'#333', trimColor:'#c0a840' },
            townhouse:   { roofType:'shed',  wallMaterial:'concrete', wallColor:'#d8d4cc', roofColor:'#444', trimColor:'#888' },
          }
          setHouse({ style: v, ...presets[v] })
        }}
      />

      <Label>Roof</Label>
      <Row label="Type">
        <ChipGroup<RoofType> value={house.roofType} options={['flat','gable','hip','shed']} onChange={(v) => setHouse({ roofType: v })} />
      </Row>
      {house.roofType !== 'flat' && (
        <Row label="Pitch">
          <Stepper value={house.roofPitch} min={0.1} max={0.7} step={0.05} onChange={(v) => setHouse({ roofPitch: v })} />
        </Row>
      )}

      <Label>Walls</Label>
      <Row label="Material">
        <ChipGroup<WallMaterial>
          value={house.wallMaterial}
          options={['brick','render','concrete','wood-cladding','stone']}
          onChange={(v) => setHouse({ wallMaterial: v })}
        />
      </Row>
      <ColorPicker label="Wall colour"   value={house.wallColor}   onChange={(v) => setHouse({ wallColor: v })} />
      <ColorPicker label="Roof colour"   value={house.roofColor}   onChange={(v) => setHouse({ roofColor: v })} />
      <ColorPicker label="Trim colour"   value={house.trimColor}   onChange={(v) => setHouse({ trimColor: v })} />
      <ColorPicker label="Glass colour"  value={house.windowColor} onChange={(v) => setHouse({ windowColor: v })} />

      <Label>Features</Label>
      <Row label="Garage">
        <Toggle checked={house.hasGarage} onChange={(v) => setHouse({ hasGarage: v })} />
      </Row>
      {house.hasGarage && (
        <Row label="Garage width">
          <Stepper value={house.garageWidth} min={3} max={9} onChange={(v) => setHouse({ garageWidth: v })} />
        </Row>
      )}
      <Row label="Porch">
        <Toggle checked={house.hasPorch} onChange={(v) => setHouse({ hasPorch: v })} />
      </Row>
      <Row label="Chimney">
        <Toggle checked={house.hasChimney} onChange={(v) => setHouse({ hasChimney: v })} />
      </Row>
    </div>
  )
}
