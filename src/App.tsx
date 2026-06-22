import { useState } from 'react'
import './App.css'
import { Canvas3D } from './components/Canvas3D'
import { FloorPlanEditor } from './components/FloorPlanEditor'
import { LoadProjectsPage } from './components/LoadProjectsPage'
import { SaveButton } from './components/SaveButton'
import { Toolbar } from './components/Toolbar'
import { useHomeStore } from './store/useHomeStore'

type View = 'editor' | 'projects'

function App() {
  const [view, setView] = useState<View>('editor')
  const projectName    = useHomeStore((s) => s.projectName)
  const projectId      = useHomeStore((s) => s.projectId)
  const setProjectName = useHomeStore((s) => s.setProjectName)

  if (view === 'projects') {
    return <LoadProjectsPage onBack={() => setView('editor')} />
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="Haven home">
          <span className="brand-mark">H</span><span>Haven</span>
        </a>

        <div className="project-title">
          <span className="status-dot" />
          <input
            className="project-name-input"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            aria-label="Project name"
            spellCheck={false}
          />
          {projectId && <span className="project-saved-badge">saved</span>}
        </div>

        <div className="header-actions">
          <button className="projects-button" type="button" onClick={() => setView('projects')}>
            My projects
          </button>
          <SaveButton />
        </div>
      </header>

      <section className="workspace">
        <Toolbar />
        <div className="canvas-panel">
          <Canvas3D />
          <div className="view-hint"><span>Drag to orbit · Scroll to zoom</span></div>
        </div>
        <FloorPlanEditor />
      </section>
    </main>
  )
}

export default App
