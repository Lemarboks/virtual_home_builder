'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { useFloorPlanStore } from '@/store/useFloorPlanStore'
import { ROOM_PRESETS } from '@/types/floorplan'
import type { Point, FPRoom, FPWall, FPFurniture } from '@/types/floorplan'

const SCALE   = 60          // SVG units per metre
const SNAP    = 0.25        // snap grid in metres
const WALL_W  = 0.2         // wall thickness in metres

/* ── coordinate helpers ───────────────────────────────────── */
function snap(v: number) { return Math.round(v / SNAP) * SNAP }
function snapPt(p: Point): Point { return { x: snap(p.x), y: snap(p.y) } }

function fromSVG(svgX: number, svgY: number, pan: Point, zoom: number): Point {
  return { x: (svgX - pan.x) / (SCALE * zoom), y: (svgY - pan.y) / (SCALE * zoom) }
}

function getSVGXY(e: React.MouseEvent<SVGSVGElement>): Point {
  const r = e.currentTarget.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function dist(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y) }

/* ── Room polygon ─────────────────────────────────────────── */
function RoomShape({ room, selected, scale, zoom }: { room: FPRoom; selected: boolean; scale: number; zoom: number }) {
  const S = scale * zoom
  const x = room.x * S, y = room.y * S, w = room.width * S, h = room.height * S
  const preset = ROOM_PRESETS[room.type]

  return (
    <g>
      <rect x={x} y={y} width={w} height={h}
        fill={room.floorColor} fillOpacity={0.85}
        stroke={selected ? '#3b82f6' : '#4a4a3a'}
        strokeWidth={selected ? 3 / zoom : 2 / zoom} />
      {/* Wall thickness overlay */}
      {[
        [x, y, w, WALL_W * S],
        [x, y + h - WALL_W * S, w, WALL_W * S],
        [x, y, WALL_W * S, h],
        [x + w - WALL_W * S, y, WALL_W * S, h],
      ].map(([rx, ry, rw, rh], i) => (
        <rect key={i} x={rx} y={ry} width={rw} height={rh} fill={room.wallColor} fillOpacity={0.9} />
      ))}
      {/* Room label */}
      <text
        x={x + w / 2} y={y + h / 2}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={13 / zoom} fill="#333" fontWeight="600" pointerEvents="none"
        fontFamily="system-ui, sans-serif"
      >
        {preset.label}
      </text>
      {/* Dimensions */}
      <text x={x + w / 2} y={y + h / 2 + 16 / zoom}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={9 / zoom} fill="#666" pointerEvents="none" fontFamily="system-ui, sans-serif">
        {room.width.toFixed(1)}m × {room.height.toFixed(1)}m
      </text>
    </g>
  )
}

/* ── Wall line ────────────────────────────────────────────── */
function WallLine({ wall, selected, zoom }: { wall: FPWall; selected: boolean; zoom: number }) {
  const s = SCALE * zoom
  const x1 = wall.x1 * s, y1 = wall.y1 * s, x2 = wall.x2 * s, y2 = wall.y2 * s
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={selected ? '#3b82f6' : '#2d3020'}
      strokeWidth={WALL_W * s}
      strokeLinecap="square" />
  )
}

/* ── Furniture rect ───────────────────────────────────────── */
function FurnitureRect({ item, selected, zoom }: { item: FPFurniture; selected: boolean; zoom: number }) {
  const s    = SCALE * zoom
  const cx   = item.x * s, cy = item.y * s
  const w    = item.width * s, h = item.depth * s
  const rot  = item.rotation
  return (
    <g transform={`translate(${cx},${cy}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h}
        fill={item.color} fillOpacity={0.9}
        stroke={selected ? '#3b82f6' : '#00000040'}
        strokeWidth={selected ? 2.5 / zoom : 1 / zoom}
        rx={2 / zoom} />
      <text x={0} y={0} textAnchor="middle" dominantBaseline="middle"
        fontSize={12 / zoom} pointerEvents="none"
        fontFamily="system-ui, sans-serif">
        {item.icon}
      </text>
      {(w > 30 / zoom) && (
        <text x={0} y={8 / zoom} textAnchor="middle" dominantBaseline="middle"
          fontSize={7 / zoom} fill="#333" pointerEvents="none" fontFamily="system-ui, sans-serif">
          {item.label}
        </text>
      )}
      {/* Rotation handle when selected */}
      {selected && (
        <circle cx={0} cy={-h / 2 - 10 / zoom} r={4 / zoom} fill="#3b82f6" />
      )}
    </g>
  )
}

/* ── Grid ─────────────────────────────────────────────────── */
function Grid({ pan, zoom }: { pan: Point; zoom: number }) {
  const S   = SCALE * zoom
  const id1 = 'fp-minor', id2 = 'fp-major'
  return (
    <defs>
      <pattern id={id1} width={S * SNAP} height={S * SNAP} patternUnits="userSpaceOnUse"
        patternTransform={`translate(${pan.x % (S * SNAP)},${pan.y % (S * SNAP)})`}>
        <path d={`M ${S * SNAP} 0 L 0 0 0 ${S * SNAP}`} fill="none" stroke="#e0ded6" strokeWidth="0.5" />
      </pattern>
      <pattern id={id2} width={S} height={S} patternUnits="userSpaceOnUse"
        patternTransform={`translate(${pan.x % S},${pan.y % S})`}>
        <rect width={S} height={S} fill={`url(#${id1})`} />
        <path d={`M ${S} 0 L 0 0 0 ${S}`} fill="none" stroke="#c8c6be" strokeWidth="1" />
      </pattern>
    </defs>
  )
}

/* ── Main canvas ──────────────────────────────────────────── */
export function FloorPlanCanvas() {
  const svgRef = useRef<SVGSVGElement>(null)

  /* view state */
  const [zoom, setZoom]   = useState(1)
  const [pan,  setPan]    = useState<Point>({ x: 420, y: 320 })

  /* draw state */
  const [roomDrag, setRoomDrag]     = useState<Point | null>(null)   // room rect drag start
  const [wallStart, setWallStart]   = useState<Point | null>(null)   // wall line start
  const [cursor, setCursor]         = useState<Point | null>(null)   // world cursor
  const [dragTarget, setDragTarget] = useState<{id: string; ox: number; oy: number} | null>(null)

  /* pan state */
  const [midPan, setMidPan] = useState<{sx: number; sy: number; px: number; py: number} | null>(null)

  const {
    rooms, walls, furniture,
    activeTool, selectedId, pendingFurnitureDef,
    addRoom, updateRoom, deleteRoom,
    addWall, deleteWall,
    addFurniture, updateFurniture, deleteFurniture,
    setActiveTool, setSelectedId, setPendingFurniture,
    deleteSelected, rotateSelected,
  } = useFloorPlanStore()

  /* keyboard shortcuts */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected()
      if (e.key === 'r' || e.key === 'R') rotateSelected()
      if (e.key === 'Escape') {
        setRoomDrag(null); setWallStart(null)
        setPendingFurniture(null); setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [deleteSelected, rotateSelected, setSelectedId, setPendingFurniture])

  /* scroll to zoom */
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = svg.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const factor = e.deltaY < 0 ? 1.1 : 0.91
      setZoom((z) => {
        const nz = Math.min(4, Math.max(0.3, z * factor))
        setPan((p) => ({ x: mx - (mx - p.x) * (nz / z), y: my - (my - p.y) * (nz / z) }))
        return nz
      })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  function worldPt(e: React.MouseEvent<SVGSVGElement>): Point {
    return snapPt(fromSVG(getSVGXY(e).x, getSVGXY(e).y, pan, zoom))
  }
  function rawPt(e: React.MouseEvent<SVGSVGElement>): Point {
    return fromSVG(getSVGXY(e).x, getSVGXY(e).y, pan, zoom)
  }

  /* ── pointer events ────────────────────────────────────── */
  function onMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    e.preventDefault()
    if (e.button === 1) {
      const { x, y } = getSVGXY(e)
      setMidPan({ sx: x, sy: y, px: pan.x, py: pan.y })
      return
    }
    const wp = worldPt(e)
    const tool = activeTool

    if (tool === 'room') {
      setRoomDrag(wp); setSelectedId(null)
    } else if (tool === 'wall') {
      if (!wallStart) { setWallStart(wp) }
      else {
        addWall({ x1: wallStart.x, y1: wallStart.y, x2: wp.x, y2: wp.y, hasDoor: false })
        setWallStart(wp)   // chain walls
      }
    } else if (tool === 'furniture' && pendingFurnitureDef) {
      const d = pendingFurnitureDef
      addFurniture({ type: d.type, label: d.label, x: wp.x, y: wp.y, width: d.width, depth: d.depth, rotation: 0, color: d.color, icon: d.icon })
    } else if (tool === 'erase') {
      hitTest(wp, (id) => {
        const r = rooms.find((r) => r.id === id)
        const w = walls.find((w) => w.id === id)
        if (r) deleteRoom(r.id)
        else if (w) deleteWall(w.id)
        else deleteFurniture(id)
      })
    } else if (tool === 'select') {
      hitTest(wp, (id) => {
        setSelectedId(id)
        const f = furniture.find((f) => f.id === id)
        const r = rooms.find((r) => r.id === id)
        if (f) setDragTarget({ id, ox: f.x - wp.x, oy: f.y - wp.y })
        if (r) setDragTarget({ id, ox: r.x - wp.x, oy: r.y - wp.y })
      }, () => { setSelectedId(null) })
    }
  }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const { x, y } = getSVGXY(e)
    const wp = snapPt(fromSVG(x, y, pan, zoom))
    setCursor(wp)

    if (midPan) {
      setPan({ x: midPan.px + (x - midPan.sx), y: midPan.py + (y - midPan.sy) })
      return
    }
    if (dragTarget) {
      const f = furniture.find((f) => f.id === dragTarget.id)
      const r = rooms.find((r)  => r.id  === dragTarget.id)
      if (f) updateFurniture(f.id, { x: wp.x + dragTarget.ox, y: wp.y + dragTarget.oy })
      if (r) updateRoom(r.id, { x: snap(wp.x + dragTarget.ox), y: snap(wp.y + dragTarget.oy) })
    }
  }

  function onMouseUp(e: React.MouseEvent<SVGSVGElement>) {
    if (midPan) { setMidPan(null); return }
    if (dragTarget) { setDragTarget(null); return }

    const wp = worldPt(e)
    if (activeTool === 'room' && roomDrag) {
      const x = Math.min(roomDrag.x, wp.x)
      const y = Math.min(roomDrag.y, wp.y)
      const width  = Math.abs(wp.x - roomDrag.x)
      const height = Math.abs(wp.y - roomDrag.y)
      if (width > 0.5 && height > 0.5) {
        const id = addRoom({ x, y, width, height, type: 'living', floorColor: '#e8dcc8', wallColor: '#c8b898' })
        setSelectedId(id)
      }
      setRoomDrag(null)
    }
  }

  function onDoubleClick(e: React.MouseEvent<SVGSVGElement>) {
    if (activeTool === 'wall') { setWallStart(null) }
  }

  function onRightClick(e: React.MouseEvent<SVGSVGElement>) {
    e.preventDefault()
    setRoomDrag(null); setWallStart(null)
    setPendingFurniture(null)
  }

  /* hit-test: find what's at world point */
  function hitTest(wp: Point, hit: (id: string) => void, miss?: () => void) {
    // furniture (front)
    for (const f of [...furniture].reverse()) {
      const hw = f.rotation % 180 === 0 ? f.width / 2 : f.depth / 2
      const hd = f.rotation % 180 === 0 ? f.depth / 2 : f.width / 2
      if (wp.x > f.x - hw && wp.x < f.x + hw && wp.y > f.y - hd && wp.y < f.y + hd) { hit(f.id); return }
    }
    // walls
    for (const w of [...walls].reverse()) {
      const dx = w.x2 - w.x1, dy = w.y2 - w.y1
      const len = Math.hypot(dx, dy)
      if (len < 0.01) continue
      const t = Math.max(0, Math.min(1, ((wp.x - w.x1) * dx + (wp.y - w.y1) * dy) / (len * len)))
      const px = w.x1 + t * dx, py = w.y1 + t * dy
      if (dist({ x: px, y: py }, wp) < WALL_W + 0.15) { hit(w.id); return }
    }
    // rooms
    for (const r of [...rooms].reverse()) {
      if (wp.x > r.x && wp.x < r.x + r.width && wp.y > r.y && wp.y < r.y + r.height) { hit(r.id); return }
    }
    miss?.()
  }

  /* ── render helpers ────────────────────────────────────── */
  const S = SCALE * zoom

  function previewRect() {
    if (activeTool !== 'room' || !roomDrag || !cursor) return null
    const x = Math.min(roomDrag.x, cursor.x) * S + pan.x
    const y = Math.min(roomDrag.y, cursor.y) * S + pan.y
    const w = Math.abs(cursor.x - roomDrag.x) * S
    const h = Math.abs(cursor.y - roomDrag.y) * S
    return <rect x={x} y={y} width={w} height={h} fill="#a8e0a820" stroke="#40a060" strokeWidth="1.5" strokeDasharray="6 3" />
  }

  function previewWall() {
    if (activeTool !== 'wall' || !wallStart || !cursor) return null
    return (
      <line
        x1={wallStart.x * S + pan.x} y1={wallStart.y * S + pan.y}
        x2={cursor.x * S + pan.x}    y2={cursor.y * S + pan.y}
        stroke="#2d3020" strokeWidth={WALL_W * S} strokeDasharray={`${4 / zoom} ${3 / zoom}`} opacity={0.6} />
    )
  }

  function ghostFurniture() {
    if (activeTool !== 'furniture' || !pendingFurnitureDef || !cursor) return null
    const d = pendingFurnitureDef
    const cx = cursor.x * S + pan.x, cy = cursor.y * S + pan.y
    const w = d.width * S, h = d.depth * S
    return (
      <g>
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h}
          fill={d.color} fillOpacity={0.5} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" rx="2" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          fontSize={13} fontFamily="system-ui">{d.icon}</text>
      </g>
    )
  }

  const cursorStyle =
    activeTool === 'room'      ? 'crosshair' :
    activeTool === 'wall'      ? 'crosshair' :
    activeTool === 'furniture' ? 'copy'      :
    activeTool === 'erase'     ? 'cell'      : 'default'

  return (
    <svg
      ref={svgRef}
      className="w-full h-full select-none"
      style={{ cursor: cursorStyle, background: '#f5f4ee' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
      onContextMenu={onRightClick}
    >
      {/* Grid definitions */}
      <Grid pan={pan} zoom={zoom} />
      <rect width="100%" height="100%" fill="url(#fp-major)" />

      {/* World-space group */}
      <g>
        {/* Rooms */}
        {rooms.map((r) => (
          <RoomShape key={r.id} room={r} selected={selectedId === r.id} scale={SCALE} zoom={zoom} />
        ))}

        {/* Internal walls */}
        {walls.map((w) => (
          <WallLine key={w.id} wall={w} selected={selectedId === w.id} zoom={zoom} />
        ))}

        {/* Furniture */}
        {furniture.map((f) => (
          <FurnitureRect key={f.id} item={f} selected={selectedId === f.id} zoom={zoom} />
        ))}
      </g>

      {/* Tool previews (screen space) */}
      {previewRect()}
      {previewWall()}
      {ghostFurniture()}

      {/* Origin cross */}
      <g opacity={0.25}>
        <line x1={pan.x - 8} y1={pan.y} x2={pan.x + 8} y2={pan.y} stroke="#606058" strokeWidth="1" />
        <line x1={pan.x} y1={pan.y - 8} x2={pan.x} y2={pan.y + 8} stroke="#606058" strokeWidth="1" />
      </g>
    </svg>
  )
}
