import type { ReactNode } from 'react'
import { useHomeStore } from '../store/useHomeStore'
import type { FurnitureType, HomeTool } from '../types/home'

const icons: Record<HomeTool, ReactNode> = {
  wall: <><path d="M4 19V6l8-3 8 3v13"/><path d="M4 10h16M9 8v11m6-9v9"/></>,
  door: <><path d="M6 21V3h12v18"/><path d="M9 21V6h6v15"/><circle cx="13" cy="14" r=".6" fill="currentColor"/></>,
  window: <><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4v16M3 12h18"/></>,
  furniture: <><path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M3 11v7h18v-7M6 18v3m12-3v3"/></>,
  color: <><path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-1 1.3-2-.8-1.2 0-2.4 1.5-2.4H17A4 4 0 0 0 21 12a9 9 0 0 0-9-9Z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="10" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="7.5" r="1" fill="currentColor"/></>,
}

const tools: Array<{ id: HomeTool; label: string }> = [
  { id: 'wall', label: 'Wall' }, { id: 'door', label: 'Door' },
  { id: 'window', label: 'Window' }, { id: 'furniture', label: 'Furniture' },
  { id: 'color', label: 'Color' },
]

const furnitureTypes: FurnitureType[] = ['couch', 'bed', 'table', 'chair', 'cabinet']

export function Toolbar() {
  const selectedTool = useHomeStore((state) => state.selectedTool)
  const selectedFurnitureType = useHomeStore((state) => state.selectedFurnitureType)
  const setSelectedTool = useHomeStore((state) => state.setSelectedTool)
  const setSelectedFurnitureType = useHomeStore((state) => state.setSelectedFurnitureType)
  return (
    <aside className="toolbar" aria-label="Design tools">
      <p className="section-label">Build</p>
      <div className="tool-list">
        {tools.map((tool) => (
          <button className={`tool-button ${selectedTool === tool.id ? 'is-active' : ''}`} key={tool.id} onClick={() => setSelectedTool(tool.id)} type="button" aria-pressed={selectedTool === tool.id}>
            <svg viewBox="0 0 24 24" aria-hidden="true">{icons[tool.id]}</svg><span>{tool.label}</span>
          </button>
        ))}
      </div>
      {selectedTool === 'furniture' && (
        <div className="furniture-picker" aria-label="Furniture types">
          <p className="section-label">Place</p>
          {furnitureTypes.map((type) => (
            <button
              className={`furniture-type-button ${selectedFurnitureType === type ? 'is-active' : ''}`}
              key={type}
              onClick={() => setSelectedFurnitureType(type)}
              type="button"
              aria-pressed={selectedFurnitureType === type}
            >
              {type}
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
