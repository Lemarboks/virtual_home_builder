'use client'
import { usePropertyStore } from '@/store/usePropertyStore'

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5 mt-4">{children}</p>
}
function SliderRow({ label, value, min, max, step = 0.1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void
}) {
  return (
    <div className="py-1.5">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-zinc-300">{label}</span>
        <span className="text-sm text-white font-mono">{value.toFixed(1)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-emerald-500 cursor-pointer" />
    </div>
  )
}

const TIME_LABELS = ['00:00','06:00','09:00','12:00','15:00','18:00','21:00','00:00']

function timeLabel(t: number) {
  const h = Math.floor(t)
  const m = Math.round((t - h) * 60)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

export function LightingPanel() {
  const lighting    = usePropertyStore((s) => s.property.lighting)
  const setLighting = usePropertyStore((s) => s.setLighting)

  const presets = [
    { label: '☀️ Noon',   timeOfDay: 12, sunIntensity: 2.5, ambientIntensity: 0.7 },
    { label: '🌅 Dawn',   timeOfDay: 6.5, sunIntensity: 1.2, ambientIntensity: 0.4 },
    { label: '🌇 Dusk',   timeOfDay: 18.5, sunIntensity: 1.0, ambientIntensity: 0.3 },
    { label: '🌙 Night',  timeOfDay: 22,  sunIntensity: 0.05, ambientIntensity: 0.08 },
    { label: '☁️ Overcast', timeOfDay: 12, sunIntensity: 0.6, ambientIntensity: 1.1 },
  ]

  return (
    <div className="space-y-1">
      <Label>Time of Day</Label>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-zinc-300">Time</span>
        <span className="text-sm text-white font-mono">{timeLabel(lighting.timeOfDay)}</span>
      </div>
      <input type="range" min={0} max={24} step={0.25} value={lighting.timeOfDay}
        onChange={(e) => setLighting({ timeOfDay: parseFloat(e.target.value) })}
        className="w-full accent-amber-400 cursor-pointer" />

      <Label>Presets</Label>
      <div className="grid grid-cols-2 gap-1.5">
        {presets.map((p) => (
          <button key={p.label}
            onClick={() => setLighting({ timeOfDay: p.timeOfDay, sunIntensity: p.sunIntensity, ambientIntensity: p.ambientIntensity })}
            className="py-1.5 px-2 rounded-lg bg-zinc-700 text-xs text-zinc-200 hover:bg-zinc-600 text-left">
            {p.label}
          </button>
        ))}
      </div>

      <Label>Intensity</Label>
      <SliderRow label="Sun"     value={lighting.sunIntensity}     min={0} max={4} step={0.1} onChange={(v) => setLighting({ sunIntensity: v })} />
      <SliderRow label="Ambient" value={lighting.ambientIntensity} min={0} max={2} step={0.05} onChange={(v) => setLighting({ ambientIntensity: v })} />

      <Label>Shadows</Label>
      <div className="flex items-center justify-between py-1.5">
        <span className="text-sm text-zinc-300">Enabled</span>
        <button role="switch" aria-checked={lighting.shadowsEnabled}
          onClick={() => setLighting({ shadowsEnabled: !lighting.shadowsEnabled })}
          className={`relative w-10 h-5 rounded-full transition-colors ${lighting.shadowsEnabled ? 'bg-emerald-500' : 'bg-zinc-600'}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${lighting.shadowsEnabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>
    </div>
  )
}
