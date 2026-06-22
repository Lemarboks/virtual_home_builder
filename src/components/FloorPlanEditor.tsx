import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useHomeStore } from '../store/useHomeStore'
import type { RoomDimensions } from '../types/home'
import { MaterialEditor } from './MaterialEditor'

const VIEW_SIZE = 280
const SCALE = 12
const MIN_ROOM_SIZE = 1
const MAX_ROOM_SIZE = 20

type Point = { x: number; y: number }
type Interaction =
  | { type: 'draw'; start: Point }
  | { type: 'resize-width' | 'resize-length' | 'resize-both' }

const fields: Array<{ key: keyof RoomDimensions; label: string }> = [
  { key: 'width', label: 'Width' },
  { key: 'length', label: 'Length' },
  { key: 'height', label: 'Wall height' },
]

export function FloorPlanEditor() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [interaction, setInteraction] = useState<Interaction | null>(null)
  const [draft, setDraft] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const dimensions = useHomeStore((state) => state.roomDimensions)
  const furnitureItems = useHomeStore((state) => state.furnitureItems)
  const selectedFurnitureId = useHomeStore((state) => state.selectedFurnitureId)
  const setDimension = useHomeStore((state) => state.setRoomDimension)
  const selectFurniture = useHomeStore((state) => state.setSelectedFurnitureId)

  const roomWidth = dimensions.width * SCALE
  const roomLength = dimensions.length * SCALE
  const roomX = (VIEW_SIZE - roomWidth) / 2
  const roomY = (VIEW_SIZE - roomLength) / 2

  const toPoint = (event: ReactPointerEvent<SVGElement>): Point => {
    const bounds = svgRef.current!.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(VIEW_SIZE, (event.clientX - bounds.left) * VIEW_SIZE / bounds.width)),
      y: Math.max(0, Math.min(VIEW_SIZE, (event.clientY - bounds.top) * VIEW_SIZE / bounds.height)),
    }
  }

  const beginDraw = (event: ReactPointerEvent<SVGSVGElement>) => {
    const start = toPoint(event)
    event.currentTarget.setPointerCapture(event.pointerId)
    setInteraction({ type: 'draw', start })
    setDraft({ x: start.x, y: start.y, width: 0, height: 0 })
    selectFurniture(null)
  }

  const beginResize = (
    event: ReactPointerEvent<SVGElement>,
    type: 'resize-width' | 'resize-length' | 'resize-both',
  ) => {
    event.stopPropagation()
    svgRef.current?.setPointerCapture(event.pointerId)
    setInteraction({ type })
  }

  const updateInteraction = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interaction) return
    const point = toPoint(event)

    if (interaction.type === 'draw') {
      setDraft({
        x: Math.min(interaction.start.x, point.x),
        y: Math.min(interaction.start.y, point.y),
        width: Math.abs(point.x - interaction.start.x),
        height: Math.abs(point.y - interaction.start.y),
      })
      return
    }

    if (interaction.type === 'resize-width' || interaction.type === 'resize-both') {
      setDimension('width', Math.min(MAX_ROOM_SIZE, Math.max(MIN_ROOM_SIZE, Math.abs(point.x - VIEW_SIZE / 2) * 2 / SCALE)))
    }
    if (interaction.type === 'resize-length' || interaction.type === 'resize-both') {
      setDimension('length', Math.min(MAX_ROOM_SIZE, Math.max(MIN_ROOM_SIZE, Math.abs(point.y - VIEW_SIZE / 2) * 2 / SCALE)))
    }
  }

  const finishInteraction = () => {
    if (interaction?.type === 'draw' && draft && draft.width >= SCALE && draft.height >= SCALE) {
      setDimension('width', Math.min(MAX_ROOM_SIZE, draft.width / SCALE))
      setDimension('length', Math.min(MAX_ROOM_SIZE, draft.height / SCALE))
    }
    setInteraction(null)
    setDraft(null)
  }

  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <div><p className="section-label">2D editor</p><h1>Floor plan</h1></div>
        <span className="room-badge">Room 01</span>
      </div>

      <p className="plan-instruction">Drag the grid to draw · Drag handles to resize</p>
      <svg
        ref={svgRef}
        className={`floor-plan-canvas ${interaction ? 'is-editing' : ''}`}
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        role="img"
        aria-label="Interactive top-down floor plan"
        onPointerDown={beginDraw}
        onPointerMove={updateInteraction}
        onPointerUp={finishInteraction}
        onPointerCancel={finishInteraction}
      >
        <defs>
          <pattern id="minor-grid" width={SCALE} height={SCALE} patternUnits="userSpaceOnUse">
            <path d={`M ${SCALE} 0 L 0 0 0 ${SCALE}`} className="grid-minor" />
          </pattern>
          <pattern id="major-grid" width={SCALE * 5} height={SCALE * 5} patternUnits="userSpaceOnUse">
            <rect width={SCALE * 5} height={SCALE * 5} fill="url(#minor-grid)" />
            <path d={`M ${SCALE * 5} 0 L 0 0 0 ${SCALE * 5}`} className="grid-major" />
          </pattern>
        </defs>
        <rect width={VIEW_SIZE} height={VIEW_SIZE} fill="url(#major-grid)" />
        <rect className="room-shape" x={roomX} y={roomY} width={roomWidth} height={roomLength} />
        <text className="room-size-label" x={VIEW_SIZE / 2} y={roomY - 7} textAnchor="middle">{dimensions.width.toFixed(1)} m</text>
        <text className="room-size-label" x={roomX - 7} y={VIEW_SIZE / 2} textAnchor="middle" transform={`rotate(-90 ${roomX - 7} ${VIEW_SIZE / 2})`}>{dimensions.length.toFixed(1)} m</text>

        {furnitureItems.map((item) => {
          const itemWidth = item.size[0] * SCALE
          const itemDepth = item.size[2] * SCALE
          const x = VIEW_SIZE / 2 + item.position[0] * SCALE
          const y = VIEW_SIZE / 2 + item.position[2] * SCALE
          return (
            <g
              className={`plan-furniture ${selectedFurnitureId === item.id ? 'is-selected' : ''}`}
              key={item.id}
              transform={`rotate(${item.rotation[1] * 180 / Math.PI} ${x} ${y})`}
              onPointerDown={(event) => { event.stopPropagation(); selectFurniture(item.id) }}
            >
              <rect x={x - itemWidth / 2} y={y - itemDepth / 2} width={itemWidth} height={itemDepth} rx={item.type === 'table' ? 7 : 2} fill={item.color} />
              <text x={x} y={y + 3} textAnchor="middle">{item.type.slice(0, 1).toUpperCase()}</text>
            </g>
          )
        })}

        <circle className="resize-handle" cx={roomX + roomWidth} cy={VIEW_SIZE / 2} r="5" onPointerDown={(event) => beginResize(event, 'resize-width')} />
        <circle className="resize-handle length" cx={VIEW_SIZE / 2} cy={roomY + roomLength} r="5" onPointerDown={(event) => beginResize(event, 'resize-length')} />
        <circle className="resize-handle corner" cx={roomX + roomWidth} cy={roomY + roomLength} r="6" onPointerDown={(event) => beginResize(event, 'resize-both')} />
        {draft && <rect className="room-draft" x={draft.x} y={draft.y} width={draft.width} height={draft.height} />}
      </svg>

      <div className="dimension-panel">
        <h2>Dimensions</h2>
        {fields.map(({ key, label }) => (
          <label className="dimension-field" key={key}>
            <span>{label}</span>
            <span className="input-shell"><input type="number" min="1" max="20" step="0.5" value={Number(dimensions[key].toFixed(2))} onChange={(event) => setDimension(key, Number(event.target.value))} /><span>m</span></span>
          </label>
        ))}
      </div>
      <MaterialEditor />
    </aside>
  )
}
