import { useHomeStore } from '../store/useHomeStore'

export function MaterialEditor() {
  const wallColor = useHomeStore((state) => state.wallColor)
  const floorColor = useHomeStore((state) => state.floorColor)
  const selectedFurnitureId = useHomeStore((state) => state.selectedFurnitureId)
  const selectedFurniture = useHomeStore((state) =>
    state.furnitureItems.find((item) => item.id === state.selectedFurnitureId),
  )
  const setWallColor = useHomeStore((state) => state.setWallColor)
  const setFloorColor = useHomeStore((state) => state.setFloorColor)
  const setFurnitureColor = useHomeStore((state) => state.setFurnitureColor)

  return (
    <section className="material-editor">
      <div className="material-heading">
        <div><p className="section-label">Appearance</p><h2>Materials</h2></div>
        <span className="material-icon" aria-hidden="true">◐</span>
      </div>
      <label className="color-control">
        <span><strong>Walls</strong><small>All room walls</small></span>
        <span className="color-value">
          <input type="color" value={wallColor} onChange={(event) => setWallColor(event.target.value)} />
          <code>{wallColor}</code>
        </span>
      </label>
      <label className="color-control">
        <span><strong>Floor</strong><small>Room flooring</small></span>
        <span className="color-value">
          <input type="color" value={floorColor} onChange={(event) => setFloorColor(event.target.value)} />
          <code>{floorColor}</code>
        </span>
      </label>
      <label className={`color-control ${selectedFurniture ? '' : 'is-disabled'}`}>
        <span><strong>Furniture</strong><small>{selectedFurniture ? `Selected ${selectedFurniture.type}` : 'Select an item in the room'}</small></span>
        <span className="color-value">
          <input
            type="color"
            value={selectedFurniture?.color ?? '#b8b8b8'}
            disabled={!selectedFurnitureId}
            onChange={(event) => {
              if (selectedFurnitureId) setFurnitureColor(selectedFurnitureId, event.target.value)
            }}
          />
          <code>{selectedFurniture?.color ?? '—'}</code>
        </span>
      </label>
    </section>
  )
}
