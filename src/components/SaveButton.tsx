import { useEffect, useRef, useState } from 'react'
import { useHomeStore } from '../store/useHomeStore'
import { saveProject } from '../lib/projectService'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SaveButton() {
  const [status, setStatus] = useState<SaveStatus>('idle')
  // Fix #5: hold the pending timer so we can cancel it if the component unmounts
  // before the 2-3 second delay fires, avoiding a setState-on-unmounted-component warning.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const projectId      = useHomeStore((s) => s.projectId)
  const projectName    = useHomeStore((s) => s.projectName)
  const roomDimensions = useHomeStore((s) => s.roomDimensions)
  const wallColor      = useHomeStore((s) => s.wallColor)
  const floorColor     = useHomeStore((s) => s.floorColor)
  const furnitureItems = useHomeStore((s) => s.furnitureItems)
  const setProjectId   = useHomeStore((s) => s.setProjectId)

  async function handleSave() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('saving')
    try {
      const id = await saveProject({ projectId, projectName, roomDimensions, wallColor, floorColor, furnitureItems })
      setProjectId(id)
      setStatus('saved')
      timerRef.current = setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      console.error('Save failed:', err)
      setStatus('error')
      timerRef.current = setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const label =
    status === 'saving' ? 'Saving…'       :
    status === 'saved'  ? 'Saved ✓'       :
    status === 'error'  ? 'Error — retry' : 'Save'

  return (
    <button
      className={`save-button save-button--${status}`}
      type="button"
      onClick={handleSave}
      disabled={status === 'saving'}
      aria-label={label}
    >
      {label}
    </button>
  )
}
