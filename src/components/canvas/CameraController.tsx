'use client'
import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { usePropertyStore } from '@/store/usePropertyStore'

export function CameraController() {
  const { camera } = useThree()
  const cameraMode  = usePropertyStore((s) => s.view.cameraMode)
  const lotDepth    = usePropertyStore((s) => s.property.lotDepth)
  const controlsRef = useRef<OrbitControlsImpl>(null)

  // Snap camera when mode changes
  useEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return

    switch (cameraMode) {
      case 'topdown':
        camera.position.set(0, 55, 0.01)
        ctrl.target.set(0, 0, 0)
        ctrl.minPolarAngle = 0
        ctrl.maxPolarAngle = 0.25
        break
      case 'orbit':
        camera.position.set(18, 22, lotDepth * 0.6)
        ctrl.target.set(0, 3, 0)
        ctrl.minPolarAngle = 0
        ctrl.maxPolarAngle = Math.PI / 2.05
        break
      case 'drone':
        camera.position.set(30, 35, 30)
        ctrl.target.set(0, 0, 0)
        ctrl.minPolarAngle = 0
        ctrl.maxPolarAngle = Math.PI / 3
        break
      case 'fps':
        camera.position.set(0, 1.7, lotDepth * 0.3)
        ctrl.target.set(0, 1.7, 0)
        ctrl.minPolarAngle = Math.PI / 4
        ctrl.maxPolarAngle = Math.PI * 0.6
        break
    }
    ctrl.update()
  }, [cameraMode, camera, lotDepth])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={cameraMode === 'fps' ? 2 : 8}
      maxDistance={cameraMode === 'topdown' ? 80 : 90}
      maxPolarAngle={cameraMode === 'topdown' ? 0.25 : Math.PI / 2.05}
      panSpeed={1.2}
      rotateSpeed={0.6}
      zoomSpeed={1.0}
    />
  )
}
