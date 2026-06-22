import { useEffect, useState } from 'react'
import { listProjects, loadProject, deleteProject } from '../lib/projectService'
import type { ProjectSummary } from '../lib/projectService'
import { useHomeStore } from '../store/useHomeStore'

interface Props {
  onBack: () => void
}

// Fix #7: hoist outside the component so the formatter object is created once,
// not on every render/call.
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit',
})

function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

export function LoadProjectsPage({ onBack }: Props) {
  const [projects, setProjects]     = useState<ProjectSummary[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [loadingId, setLoadingId]   = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadFromSaved = useHomeStore((s) => s.loadFromSaved)
  const resetProject  = useHomeStore((s) => s.resetProject)

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  async function handleLoad(id: string) {
    setError(null) // Fix #6: clear stale error before each operation
    setLoadingId(id)
    try {
      const data = await loadProject(id)
      loadFromSaved({ projectId: id, ...data })
      onBack()
    } catch (e) {
      setError(`Failed to load project: ${String(e)}`)
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this project? This cannot be undone.')) return
    setError(null) // Fix #6: clear stale error before each operation
    setDeletingId(id)
    try {
      await deleteProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      setError(`Failed to delete: ${String(e)}`)
    } finally {
      setDeletingId(null)
    }
  }

  function handleNew() {
    resetProject()
    onBack()
  }

  return (
    <div className="projects-page">
      <div className="projects-header">
        <button className="projects-back" type="button" onClick={onBack} aria-label="Back to editor">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Editor
        </button>
        <h1 className="projects-title">My Projects</h1>
        <button className="projects-new" type="button" onClick={handleNew}>
          + New project
        </button>
      </div>

      <div className="projects-body">
        {loading && <p className="projects-status">Loading…</p>}
        {error   && <p className="projects-status projects-status--error">{error}</p>}

        {!loading && !error && projects.length === 0 && (
          <div className="projects-empty">
            <p>No saved projects yet.</p>
            <button className="projects-new" type="button" onClick={handleNew}>Start a new project</button>
          </div>
        )}

        {projects.length > 0 && (
          <ul className="projects-list">
            {projects.map((p) => (
              <li key={p.id} className="project-card">
                <div className="project-card-info">
                  <strong className="project-card-name">{p.name}</strong>
                  <span className="project-card-date">Last saved {formatDate(p.updated_at)}</span>
                </div>
                <div className="project-card-actions">
                  <button
                    className="project-card-load"
                    type="button"
                    onClick={() => handleLoad(p.id)}
                    disabled={loadingId === p.id}
                  >
                    {loadingId === p.id ? 'Loading…' : 'Open'}
                  </button>
                  <button
                    className="project-card-delete"
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    aria-label={`Delete ${p.name}`}
                  >
                    {deletingId === p.id ? '…' : 'Delete'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
