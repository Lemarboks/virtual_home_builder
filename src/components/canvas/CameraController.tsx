'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, PointerLockControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { PointerLockControls as PLCImpl } from 'three-stdlib'
import * as THREE from 'three'
import { usePropertyStore } from '@/store/usePropertyStore'
import { walkControls } from '@/lib/walkControls'

/* ── Orbit / top-down / drone camera ───────────────────────── */
function OrbitCamera() {
  const { camera } = useThree()
  const cameraMode  = usePropertyStore((s) => s.view.cameraMode)
  const lotDepth    = usePropertyStore((s) => s.property.lotDepth)
  const controlsRef = useRef<OrbitControlsImpl>(null)

  useEffect(() => {
    const ctrl = controlsRef.current
    if (!ctrl) return
    switch (cameraMode) {
      case 'topdown':
        camera.position.set(0, 55, 0.01)
        ctrl.target.set(0, 0, 0)
        ctrl.minPolarAngle = 0
        ctrl.maxPolarAngle = 0.22
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
    }
    ctrl.update()
  }, [cameraMode, camera, lotDepth])

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      minDistance={6}
      maxDistance={90}
      maxPolarAngle={cameraMode === 'topdown' ? 0.22 : Math.PI / 2.05}
      panSpeed={1.2}
      rotateSpeed={0.6}
      zoomSpeed={1.0}
    />
  )
}

/* ── First-person WASD controller ──────────────────────────── */
function FPSCamera() {
  const { camera, gl } = useThree()
  const lotW   = usePropertyStore((s) => s.property.lotWidth)
  const lotD   = usePropertyStore((s) => s.property.lotDepth)
  const plcRef = useRef<PLCImpl>(null)

  const keys = useRef<Record<string, boolean>>({})
  const vel  = useRef(new THREE.Vector3())
  const dir  = useRef(new THREE.Vector3())
  const fwd  = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())

  // Place camera at the front-door entry point
  useEffect(() => {
    camera.position.set(0, 1.7, lotD * 0.35)
    camera.rotation.set(0, Math.PI, 0)
  }, [camera, lotD])

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true }
    const up   = (e: KeyboardEvent) => { keys.current[e.code] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup',   up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup',   up)
    }
  }, [])

  const handleClick = useCallback(() => {
    plcRef.current?.lock()
  }, [])

  useFrame((_, delta) => {
    const ctrl = plcRef.current
    if (!ctrl?.isLocked && !walkControls.enabled) return

    if (walkControls.enabled) {
      const lookSpeed = 1.45 * delta
      if (walkControls.lookLeft) camera.rotation.y += lookSpeed
      if (walkControls.lookRight) camera.rotation.y -= lookSpeed
      if (walkControls.lookUp) camera.rotation.x += lookSpeed
      if (walkControls.lookDown) camera.rotation.x -= lookSpeed
      camera.rotation.order = 'YXZ'
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -Math.PI / 2 + 0.12, Math.PI / 2 - 0.12)
    }

    const speed  = keys.current.ShiftLeft || walkControls.sprint ? 10 : 5
    const k      = keys.current

    // Flatten camera's forward vector onto XZ plane
    camera.getWorldDirection(fwd.current)
    fwd.current.y = 0
    fwd.current.normalize()

    right.current.crossVectors(fwd.current, camera.up).normalize()

    dir.current.set(0, 0, 0)
    if (k.KeyW || k.ArrowUp || walkControls.forward) dir.current.addScaledVector(fwd.current, 1)
    if (k.KeyS || k.ArrowDown || walkControls.backward) dir.current.addScaledVector(fwd.current, -1)
    if (k.KeyA || k.ArrowLeft || walkControls.left) dir.current.addScaledVector(right.current, -1)
    if (k.KeyD || k.ArrowRight || walkControls.right) dir.current.addScaledVector(right.current, 1)

    if (dir.current.lengthSq() > 0) {
      dir.current.normalize().multiplyScalar(speed * delta)
      vel.current.lerp(dir.current, 0.2)
    } else {
      vel.current.lerp(new THREE.Vector3(), 0.15)
    }

    camera.position.add(vel.current)

    // Clamp inside lot boundaries
    const hw = lotW / 2 - 0.5, hd = lotD / 2 - 0.5
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -hw, hw)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -hd, hd)
    // Lock head height
    camera.position.y = 1.7
  })

  return (
    <>
      <PointerLockControls ref={plcRef} />
      {/* Invisible click catcher — triggers pointer lock */}
      <mesh position={[0, 1, 0]} onClick={handleClick} visible={false}>
        <boxGeometry args={[1000, 2, 1000]} />
        <meshBasicMaterial />
      </mesh>
    </>
  )
}

/* ── Exports the right controller for current mode ─────────── */
export function CameraController() {
  const cameraMode = usePropertyStore((s) => s.view.cameraMode)
  if (cameraMode === 'fps') return <FPSCamera />
  return <OrbitCamera />
}
