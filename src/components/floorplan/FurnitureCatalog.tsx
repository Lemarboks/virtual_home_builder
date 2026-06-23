'use client'
import { FURNITURE_CATALOG } from '@/types/floorplan'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'

export function FurnitureCatalog() {
  const pendingDef     = useFloorPlanStore((s) => s.pendingFurnitureDef)
  const setPending     = useFloorPlanStore((s) => s.setPendingFurniture)
  const setActiveTool  = useFloorPlanStore((s) => s.setActiveTool)

  const categories = [...new Set(FURNITURE_CATALOG.map((d) => d.category))]

  function pick(type: string) {
    const def = FURNITURE_CATALOG.find((d) => d.type === type)!
    setPending(def)
    setActiveTool('furniture')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
        <p className="text-sm font-semibold text-white">Furniture</p>
        <p className="text-xs text-zinc-500 mt-0.5">Click item, then click canvas to place</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-zinc-400 uppercase tracking-widest">{cat}</p>
            <div className="px-2 grid grid-cols-2 gap-1 pb-1">
              {FURNITURE_CATALOG.filter((d) => d.category === cat).map((d) => (
                <button key={d.type}
                  onClick={() => pick(d.type)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-colors
                    ${pendingDef?.type === d.type
                      ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'}`}
                >
                  <span
                    className="w-8 h-8 rounded-md flex items-center justify-center text-lg"
                    style={{ background: d.color + '40' }}
                  >
                    {d.icon}
                  </span>
                  <span className="text-xs leading-tight">{d.label}</span>
                  <span className="text-xs text-zinc-500">{d.width}×{d.depth}m</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
