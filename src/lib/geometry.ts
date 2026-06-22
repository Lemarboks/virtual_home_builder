import * as THREE from 'three'

/** Gable roof: ridge runs along Z, slopes face ±X. */
export function buildGableRoof(
  width: number, depth: number,
  pitch: number, overhang: number,
): THREE.BufferGeometry {
  const hw  = width / 2 + overhang
  const hd  = depth / 2 + overhang
  const rh  = pitch * (width / 2)           // ridge height

  const verts: number[] = []
  const uvs:   number[] = []
  const idxs:  number[] = []
  let   vi = 0

  function quad(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    x3: number, y3: number, z3: number,
  ) {
    const b = vi
    verts.push(x0,y0,z0, x1,y1,z1, x2,y2,z2, x3,y3,z3)
    uvs.push(0,0, 1,0, 1,1, 0,1)
    idxs.push(b,b+1,b+2, b,b+2,b+3)
    vi += 4
  }

  function tri(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
  ) {
    const b = vi
    verts.push(x0,y0,z0, x1,y1,z1, x2,y2,z2)
    uvs.push(0,0, 1,0, 0.5,1)
    idxs.push(b, b+1, b+2)
    vi += 3
  }

  // Left slope  (+X side)
  quad( hw,0,-hd,  0,rh,-hd,  0,rh,hd,  hw,0,hd )
  // Right slope (-X side)
  quad(-hw,0,hd,  0,rh,hd,  0,rh,-hd, -hw,0,-hd )
  // Front gable end (-Z)
  tri(-hw,0,-hd,  0,rh,-hd,  hw,0,-hd )
  // Back gable end  (+Z)
  tri( hw,0, hd,  0,rh, hd, -hw,0, hd )
  // Soffit underside (flat ceiling of overhang) – thin reverse quad
  quad(-hw,0,-hd, hw,0,-hd, hw,0,hd, -hw,0,hd )

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs,   2))
  geo.setIndex(idxs)
  geo.computeVertexNormals()
  return geo
}

/** Hip roof: all four sides slope to a central ridge. */
export function buildHipRoof(
  width: number, depth: number,
  pitch: number, overhang: number,
): THREE.BufferGeometry {
  const hw  = width / 2 + overhang
  const hd  = depth / 2 + overhang
  const rh  = pitch * (width / 2)
  const rl  = Math.max(0.5, depth - width * pitch * 2)  // ridge length

  const verts: number[] = []
  const uvs:   number[] = []
  const idxs:  number[] = []
  let   vi = 0

  function quad(
    x0:number,y0:number,z0:number,
    x1:number,y1:number,z1:number,
    x2:number,y2:number,z2:number,
    x3:number,y3:number,z3:number,
  ) {
    const b = vi
    verts.push(x0,y0,z0, x1,y1,z1, x2,y2,z2, x3,y3,z3)
    uvs.push(0,0, 1,0, 1,1, 0,1)
    idxs.push(b,b+1,b+2, b,b+2,b+3)
    vi += 4
  }
  function tri(
    x0:number,y0:number,z0:number,
    x1:number,y1:number,z1:number,
    x2:number,y2:number,z2:number,
  ) {
    const b = vi
    verts.push(x0,y0,z0, x1,y1,z1, x2,y2,z2)
    uvs.push(0,0, 1,0, 0.5,1)
    idxs.push(b, b+1, b+2)
    vi += 3
  }

  const rz = rl / 2  // half ridge length

  // Front slope
  quad( hw,0,-hd,  rz,rh,0,  -rz,rh,0, -hw,0,-hd )
  // Back slope
  quad(-hw,0,hd, -rz,rh,0,  rz,rh,0,   hw,0, hd )
  // Left hip
  quad(-hw,0,-hd, -rz,rh,0, -hw,0,hd,  -hw,0,-hd )
  tri(-hw,0,-hd, -rz,rh,0, -hw,0,hd)
  // Right hip
  tri( hw,0,-hd,  hw,0,hd,  rz,rh,0)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs,   2))
  geo.setIndex(idxs)
  geo.computeVertexNormals()
  return geo
}

/** Procedural brick canvas texture. */
export function makeBrickTexture(res = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = res
  const ctx = c.getContext('2d')!
  const bW = res / 7, bH = res / 18, m = 3

  ctx.fillStyle = '#b8a898'
  ctx.fillRect(0, 0, res, res)

  for (let row = 0; row < 20; row++) {
    const offset = row % 2 === 0 ? 0 : bW / 2
    for (let col = -1; col < 9; col++) {
      const v = (Math.random() - 0.5) * 30
      const r = Math.round(Math.min(255, Math.max(0, 160 + v)))
      const g = Math.round(Math.min(255, Math.max(0, 90 + v * 0.4)))
      const b = Math.round(Math.min(255, Math.max(0, 70 + v * 0.3)))
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(col * bW + offset + m, row * bH + m, bW - m * 2, bH - m * 2)
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 2)
  return tex
}

/** Procedural concrete canvas texture. */
export function makeConcreteTexture(res = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = res
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#c8c4bc'
  ctx.fillRect(0, 0, res, res)
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * res, y = Math.random() * res
    const g = Math.round(180 + (Math.random() - 0.5) * 40)
    ctx.fillStyle = `rgba(${g},${g},${g},0.12)`
    ctx.fillRect(x, y, Math.random() * 4 + 1, Math.random() * 4 + 1)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

/** Procedural wood-plank canvas texture. */
export function makeWoodTexture(res = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = res
  const ctx = c.getContext('2d')!
  const plankH = res / 10
  const colors = ['#8B6343','#9B7353','#7B5333','#A07848']
  for (let row = 0; row < 12; row++) {
    ctx.fillStyle = colors[row % colors.length]
    ctx.fillRect(0, row * plankH, res, plankH - 2)
    for (let i = 0; i < res; i += 4) {
      const g = (Math.random() - 0.5) * 20
      const base = parseInt(colors[row % colors.length].slice(1), 16)
      const r = Math.min(255,(base >> 16) + g)
      ctx.fillStyle = `rgba(${r},${r - 40},${r - 60},0.1)`
      ctx.fillRect(i, row * plankH, 3, plankH - 2)
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 3)
  return tex
}

/** Procedural asphalt/road canvas texture. */
export function makeAsphaltTexture(res = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = res
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#2e2e2e'
  ctx.fillRect(0, 0, res, res)
  for (let i = 0; i < 5000; i++) {
    const g = Math.round(30 + Math.random() * 25)
    ctx.fillStyle = `rgba(${g},${g},${g},0.5)`
    ctx.fillRect(Math.random()*res, Math.random()*res, Math.random()*3+1, Math.random()*3+1)
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}

/** Procedural grass canvas texture. */
export function makeGrassTexture(baseColor: string, res = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = res
  const ctx = c.getContext('2d')!
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, res, res)
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * res, y = Math.random() * res
    const v = (Math.random() - 0.5) * 30
    ctx.strokeStyle = `rgba(0,${Math.round(100 + v)},0,0.15)`
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (Math.random()-0.5)*4, y - Math.random()*8); ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(8, 8)
  return tex
}

/** Procedural roof-tile canvas texture. */
export function makeRoofTileTexture(color: string, res = 512): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = res
  const ctx = c.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, res, res)
  const tW = res / 8, tH = res / 12
  for (let row = 0; row < 14; row++) {
    const offset = row % 2 === 0 ? 0 : tW / 2
    for (let col = -1; col < 10; col++) {
      ctx.fillStyle = `rgba(0,0,0,${0.06 + Math.random() * 0.08})`
      ctx.fillRect(col * tW + offset, row * tH, tW - 1, tH - 1)
    }
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 4)
  return tex
}

/** Compute sun position from time-of-day (0-24). */
export function sunPosition(timeOfDay: number): THREE.Vector3 {
  const t = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2
  const elevation = Math.sin(t) * 60
  const azimuth   = Math.cos(t) * 40
  return new THREE.Vector3(azimuth, Math.max(2, elevation), 20)
}
