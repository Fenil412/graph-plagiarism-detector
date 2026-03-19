import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────────────
   GalaxyBackground — FULL SCREEN Solar System Scene

   KEY DESIGN:
   • Camera almost top-down (slight tilt) → solar system covers 100% display
   • Neptune's orbit fills the outer edge of the screen
   • All orbital rings visible as beautiful glowing ellipses
   • Stars, nebula, galaxy as deep background
   • Meteor shower streaks across the scene
   ───────────────────────────────────────────────────────────────────────── */

function makeDiscTexture(size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx  = canvas.getContext('2d')
  const half = size / 2
  const g    = ctx.createRadialGradient(half, half, 0, half, half, half)
  g.addColorStop(0.00, 'rgba(255,255,255,1.00)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.90)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.40)')
  g.addColorStop(1.00, 'rgba(255,255,255,0.00)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export default function GalaxyBackground({ opacity = 1 }) {
  const mountRef   = useRef(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    /* ── Renderer ──────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(0x00010a, 1)
    el.appendChild(renderer.domElement)

    /* ── Scene ─────────────────────────────────────────────── */
    const scene = new THREE.Scene()

    /*
      CAMERA: Nearly top-down with slight tilt
      ─────────────────────────────────────────
      Position: (0, 120, 18) → almost directly above, small forward lean
      FOV 80° → wide enough to show everything
      With this setup, Neptune at radius 100 fills the screen width perfectly.
      The slight z-offset gives planets a 3D perspective "depth" feel.
    */
    const camera = new THREE.PerspectiveCamera(80, el.clientWidth / el.clientHeight, 0.1, 8000)
    camera.position.set(0, 105, 16)
    camera.lookAt(0, 0, 0)

    const rand  = (a, b) => Math.random() * (b - a) + a
    const clock = new THREE.Clock()
    const disc  = makeDiscTexture(128)

    /* ════════════════════════════════════════════════════════
       1. STAR FIELD — 15 000 round specks
    ════════════════════════════════════════════════════════ */
    const N_STARS  = 15000
    const sPos     = new Float32Array(N_STARS * 3)
    const sCol     = new Float32Array(N_STARS * 3)
    const palette  = [
      [1.00, 1.00, 1.00],
      [0.73, 0.86, 1.00],
      [1.00, 0.87, 0.70],
      [0.80, 0.73, 1.00],
    ]
    for (let i = 0; i < N_STARS; i++) {
      const theta = rand(0, Math.PI * 2)
      const phi   = Math.acos(rand(-1, 1))
      const r     = rand(300, 3000)
      sPos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      sPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      sPos[i*3+2] = r * Math.cos(phi)
      const [R, G, B] = palette[i % palette.length]
      sCol[i*3]   = R; sCol[i*3+1] = G; sCol[i*3+2] = B
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
    starGeo.setAttribute('color',    new THREE.BufferAttribute(sCol, 3))
    const starMat = new THREE.PointsMaterial({
      size: 4.5, sizeAttenuation: true,
      vertexColors: true, transparent: true, opacity: 0.85,
      map: disc, alphaTest: 0.01, depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const stars = new THREE.Points(starGeo, starMat)
    scene.add(stars)

    /* ════════════════════════════════════════════════════════
       2. GALAXY SPIRAL — deep background
    ════════════════════════════════════════════════════════ */
    const N_GAL   = 10000
    const gPos    = new Float32Array(N_GAL * 3)
    const gCol    = new Float32Array(N_GAL * 3)
    const GA_R    = 1200
    const cA      = new THREE.Color('#7c3aed')
    const cB      = new THREE.Color('#2563eb')
    const cC      = new THREE.Color('#06b6d4')
    for (let i = 0; i < N_GAL; i++) {
      const r      = Math.pow(Math.random(), 0.6) * GA_R
      const arm    = ((i % 4) / 4) * Math.PI * 2
      const spin   = (r / GA_R) * 5
      const rx     = Math.pow(Math.random(), 3) * (Math.random()<0.5?1:-1) * 0.4 * r
      const ry     = Math.pow(Math.random(), 4) * (Math.random()<0.5?1:-1) * 0.06 * r
      const rz     = Math.pow(Math.random(), 3) * (Math.random()<0.5?1:-1) * 0.4 * r
      gPos[i*3]   = Math.cos(arm+spin)*r + rx
      gPos[i*3+1] = ry - 200
      gPos[i*3+2] = Math.sin(arm+spin)*r + rz - 600
      const t   = r / GA_R
      const col = t < 0.4
        ? new THREE.Color().lerpColors(cA, cB, t/0.4)
        : new THREE.Color().lerpColors(cB, cC, (t-0.4)/0.6)
      gCol[i*3]   = col.r; gCol[i*3+1] = col.g; gCol[i*3+2] = col.b
    }
    const galaxyGeo = new THREE.BufferGeometry()
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3))
    galaxyGeo.setAttribute('color',    new THREE.BufferAttribute(gCol, 3))
    const galaxyMat = new THREE.PointsMaterial({
      size: 6.0, sizeAttenuation: true,
      vertexColors: true, transparent: true, opacity: 0.70,
      map: disc, alphaTest: 0.01, depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const galaxy = new THREE.Points(galaxyGeo, galaxyMat)
    galaxy.rotation.x = -Math.PI / 8
    scene.add(galaxy)

    /* ════════════════════════════════════════════════════════
       3. NEBULA CLOUDS — large volumetric fillers
    ════════════════════════════════════════════════════════ */
    const NEBULA_CFG = [
      { c: 0x3300aa, p: [-600,  80, -900], r: 350, l: 4 },
      { c: 0x004477, p: [ 700, -80,-1100], r: 420, l: 5 },
      { c: 0x660088, p: [  80,-200, -800], r: 290, l: 4 },
      { c: 0x002255, p: [-300, 160,-1000], r: 380, l: 4 },
      { c: 0x770099, p: [ 400, 140, -700], r: 260, l: 3 },
    ]
    const nebulaMeshes = []
    NEBULA_CFG.forEach(({ c, p, r, l }) => {
      for (let i = 0; i < l; i++) {
        const geo = new THREE.SphereGeometry(r*(1+i*0.45), 14, 14)
        const mat = new THREE.MeshBasicMaterial({
          color: c, transparent: true, opacity: 0.025 - i*0.004,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
        })
        const m = new THREE.Mesh(geo, mat)
        m.position.set(...p)
        scene.add(m)
        nebulaMeshes.push({ m, base: mat.opacity, ph: rand(0, Math.PI*2) })
      }
    })

    /* ════════════════════════════════════════════════════════
       4. SOLAR SYSTEM — fills the entire screen
       ─────────────────────────────────────────────────────
       Camera at y=120, z=18 with FOV 80°:
       Visible half-width at y=0 plane ≈ 120 × tan(40°) ≈ 100 units
       → Neptune at radius=98 fills screen edge-to-edge
       → All other planets proportionally scaled inside
    ════════════════════════════════════════════════════════ */

    /* ── SUN ──────────────────────────────────────────────── */
    const SUN_RADIUS = 9
    const sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_RADIUS, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0xffee44 })
    )
    scene.add(sunMesh)

    // Layered sun corona
    const CORONA = [
      { r: SUN_RADIUS * 1.50, op: 0.45, col: 0xffdd00 },
      { r: SUN_RADIUS * 2.20, op: 0.22, col: 0xffaa00 },
      { r: SUN_RADIUS * 3.50, op: 0.11, col: 0xff7700 },
      { r: SUN_RADIUS * 5.50, op: 0.05, col: 0xff4400 },
      { r: SUN_RADIUS * 9.00, op: 0.02, col: 0xff2200 },
    ]
    const coronaMeshes = CORONA.map(({ r, op, col }) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 32, 32),
        new THREE.MeshBasicMaterial({
          color: col, transparent: true, opacity: op,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
        })
      )
      scene.add(m)
      return m
    })

    /* ── PLANETS ──────────────────────────────────────────── */
    /*
      Orbit radii are chosen so:
      • Mercury (innermost) barely clears the sun corona
      • Neptune (outermost, r=98) almost touches screen edges
      Each planet starts at an evenly-spaced initial angle
      so all 8 are spread around at load time.
    */
    const PLANETS = [
      { name:'Mercury', R: 14,  sz:0.80, col:0xbbbbbb, spd:2.40, tilt:0.01, incX: 0.05, incZ: 0.02 },
      { name:'Venus',   R: 22,  sz:1.30, col:0xe8cda0, spd:1.80, tilt:0.05, incX: -0.04, incZ: 0.06 },
      { name:'Earth',   R: 32,  sz:1.45, col:0x2299dd, spd:1.30, tilt:0.41, incX: 0.08, incZ: -0.03 },
      { name:'Mars',    R: 43,  sz:1.05, col:0xee4422, spd:0.95, tilt:0.44, incX: -0.10, incZ: 0.05 },
      { name:'Jupiter', R: 57,  sz:3.60, col:0xc8883a, spd:0.50, tilt:0.05, incX: 0.03, incZ: 0.12 },
      { name:'Saturn',  R: 71,  sz:2.90, col:0xe2c280, spd:0.30, tilt:0.47, incX: 0.15, incZ: -0.08, rings:true },
      { name:'Uranus',  R: 84,  sz:2.10, col:0x55dddd, spd:0.16, tilt:1.71, incX: -0.12, incZ: 0.10 },
      { name:'Neptune', R: 98,  sz:1.90, col:0x2255ff, spd:0.09, tilt:0.49, incX: 0.06, incZ: -0.15 },
    ]

    // Accent color per planet for orbit paths
    const ORBIT_COL = [
      0xcccccc, 0xddbb77, 0x44aaff,
      0xff6644, 0xffbb44, 0xddc055,
      0x44dddd, 0x4466ff,
    ]

    /* Build orbital path: line + inner glow tube + outer aura */
    const buildOrbitPath = (radiusX, radiusZ, inclinationX, inclinationZ, ellipseRotation, hexColor) => {
      const grp = new THREE.Group()

      // Fine line
      const pts = []
      for (let i = 0; i <= 512; i++) {
        const a = (i / 512) * Math.PI * 2
        pts.push(new THREE.Vector3(Math.cos(a)*radiusX, 0, Math.sin(a)*radiusZ))
      }
      const lMat = new THREE.LineBasicMaterial({
        color: hexColor, transparent: true, opacity: 0.50,
      })
      grp.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lMat))

      const scaleZ = radiusZ / radiusX

      // Inner glow tube
      const tMat = new THREE.MeshBasicMaterial({
        color: hexColor, transparent: true, opacity: 0.30,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const tMesh = new THREE.Mesh(new THREE.TorusGeometry(radiusX, 0.08, 8, 512), tMat)
      tMesh.rotation.x = Math.PI / 2
      tMesh.scale.set(1, scaleZ, 1)
      grp.add(tMesh)

      // Outer aura
      const aMat = new THREE.MeshBasicMaterial({
        color: hexColor, transparent: true, opacity: 0.08,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const aMesh = new THREE.Mesh(new THREE.TorusGeometry(radiusX, 0.40, 8, 256), aMat)
      aMesh.rotation.x = Math.PI / 2
      aMesh.scale.set(1, scaleZ, 1)
      grp.add(aMesh)

      // Apply 3D Inclination and Rotation
      grp.rotation.set(inclinationX, ellipseRotation, inclinationZ, 'YXZ')

      scene.add(grp)
      return { grp, lMat, tMat, aMat }
    }

    /* Build planet objects */
    const planetObjs = PLANETS.map((pd, idx) => {
      const RX = pd.R
      const RZ = pd.R * 0.65  // More pronounced ellipse
      const ellipseRotation = idx * (Math.PI / 3.5)  // Staggered angles for each orbit
      const inclinationX = pd.incX || 0
      const inclinationZ = pd.incZ || 0

      const orbit = buildOrbitPath(RX, RZ, inclinationX, inclinationZ, ellipseRotation, ORBIT_COL[idx])

      const container = new THREE.Group()
      container._phase = (idx / PLANETS.length) * Math.PI * 2
      scene.add(container)

      // Planet sphere
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(pd.sz, 32, 32),
        new THREE.MeshStandardMaterial({
          color: pd.col, roughness: 0.75, metalness: 0.15,
          emissive: new THREE.Color(pd.col).multiplyScalar(0.22),
        })
      )
      planet.rotation.z = pd.tilt
      container.add(planet)

      // Atmosphere glow
      const atmoMesh = new THREE.Mesh(
        new THREE.SphereGeometry(pd.sz * 2.0, 20, 20),
        new THREE.MeshBasicMaterial({
          color: pd.col, transparent: true, opacity: 0.14,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
        })
      )
      container.add(atmoMesh)

      // Position dot on orbit
      const dotGeo = new THREE.BufferGeometry()
      dotGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3))
      const dotMat = new THREE.PointsMaterial({
        size: pd.sz * 1.5 + 1.0, color: pd.col,
        transparent: true, opacity: 0.55,
        map: disc, alphaTest: 0.01,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      container.add(new THREE.Points(dotGeo, dotMat))

      // Euler for position calculation
      const orbitEuler = new THREE.Euler(inclinationX, ellipseRotation, inclinationZ, 'YXZ')

      // Saturn rings
      if (pd.rings) {
        const rMat = new THREE.MeshBasicMaterial({
          color: 0xccaa77, side: THREE.DoubleSide,
          transparent: true, opacity: 0.75,
        })
        const rMesh = new THREE.Mesh(new THREE.RingGeometry(pd.sz*1.5, pd.sz*2.7, 80), rMat)
        rMesh.rotation.x = Math.PI / 2.4
        container.add(rMesh)

        // Ring outer glow
        const rgMat = new THREE.MeshBasicMaterial({
          color: 0xddcc77, side: THREE.DoubleSide,
          transparent: true, opacity: 0.14,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
        const rgMesh = new THREE.Mesh(new THREE.RingGeometry(pd.sz*1.4, pd.sz*3.0, 80), rgMat)
        rgMesh.rotation.x = Math.PI / 2.4
        container.add(rgMesh)
      }

      return { container, planet, atmoMesh, orbit, RX, RZ, orbitEuler, ...pd }
    })

    /* Lighting */
    scene.add(new THREE.AmbientLight(0x111233, 0.40))
    const sun3Light = new THREE.PointLight(0xffeeaa, 6.0, 250)
    scene.add(sun3Light)

    /* ════════════════════════════════════════════════════════
       5. METEOR SHOWER
    ════════════════════════════════════════════════════════ */
    const meteors = []

    const spawnMeteor = () => {
      const sx     = rand(-160, 160)
      const sy     = rand(-60, 130)
      const sz     = rand(-50, 40)
      const angle  = rand(-1.1, -0.35)
      const length = rand(25, 70)
      const speed  = rand(70, 160)
      const big    = Math.random() < 0.18
      const hue    = rand(0.55, 0.88)
      const hCol   = new THREE.Color().setHSL(hue, 1.0, 0.92)

      const SEG = 32
      const pts = [], cols = []
      for (let s = 0; s <= SEG; s++) {
        const tt = s / SEG
        pts.push(new THREE.Vector3(
          sx + Math.cos(angle) * length * tt,
          sy + Math.sin(angle) * length * tt,
          sz,
        ))
        const b = 1 - tt
        cols.push(
          THREE.MathUtils.lerp(hCol.r, 1.0, b*0.75),
          THREE.MathUtils.lerp(hCol.g, 1.0, b*0.75),
          THREE.MathUtils.lerp(hCol.b, 1.0, b*0.75),
        )
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts)
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3))
      const mat = new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const line = new THREE.Line(geo, mat)
      scene.add(line)

      const hGeo = new THREE.BufferGeometry()
      hGeo.setAttribute('position', new THREE.Float32BufferAttribute([sx, sy, sz], 3))
      const hMat = new THREE.PointsMaterial({
        size: big ? 3.0 : 1.6,
        color: new THREE.Color().setHSL(0.14, 1, 0.97),
        transparent: true, opacity: 0,
        map: disc, alphaTest: 0.01,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
      const head = new THREE.Points(hGeo, hMat)
      scene.add(head)

      meteors.push({ line, geo, mat, head, hGeo, hMat,
        vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
        life: rand(0.6, 1.8), t: 0,
        maxOp: big ? rand(0.88,1.0) : rand(0.50,0.78), big,
      })
    }

    const burst = (n) => { for(let i=0;i<n;i++) setTimeout(spawnMeteor, i*rand(15,90)) }
    burst(7)
    let nxtS = rand(0.4, 2.0), nxtB = rand(6, 15)

    /* ── Resize ─────────────────────────────────────────────── */
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize)

    /* ── Mouse ─────────────────────────────────────────────── */
    let mx = 0, my = 0
    const mVec = new THREE.Vector2()
    const rc   = new THREE.Raycaster()
    const tip  = tooltipRef.current

    const onMouse = (e) => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
      mVec.set(mx, -my)
      rc.setFromCamera(mVec, camera)
      const hits = rc.intersectObjects(planetObjs.map(p => p.planet))
      if (hits.length > 0) {
        const pd = planetObjs.find(p => p.planet === hits[0].object)
        if (pd && tip) {
          tip.textContent = pd.name
          tip.style.left  = `${e.clientX}px`
          tip.style.top   = `${e.clientY}px`
          tip.classList.add('visible')
        }
      } else {
        tip?.classList.remove('visible')
      }
    }
    window.addEventListener('mousemove', onMouse)

    /* ════════════════════════════════════════════════════════
       ANIMATION LOOP
    ════════════════════════════════════════════════════════ */
    let frame, lastT = 0

    const animate = (now = 0) => {
      frame   = requestAnimationFrame(animate)
      const dt = Math.min((now - lastT) / 1000, 0.05)
      lastT   = now
      const t  = clock.getElapsedTime()

      /* Stars slow twinkling */
      starMat.opacity = 0.78 + Math.sin(t * 0.4) * 0.10

      /* Galaxy slow spin */
      galaxy.rotation.y = t * 0.006

      /* Sun pulse + corona */
      sunMesh.scale.setScalar(1 + Math.sin(t * 2.5) * 0.03)
      coronaMeshes.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(t * (0.4 + i*0.15)) * 0.07)
        const bases = [0.45, 0.22, 0.11, 0.05, 0.02]
        m.material.opacity = bases[i] * (0.80 + Math.sin(t*0.9+i) * 0.20)
      })

      /* Planets: inclined elliptical orbit via container movement */
      planetObjs.forEach(({ container, planet, atmoMesh, orbit, spd, RX, RZ, orbitEuler }, i) => {
        // Smooth elliptical motion
        const angle = container._phase + t * spd * 0.35
        const pos = new THREE.Vector3(Math.cos(angle) * RX, 0, Math.sin(angle) * RZ);
        
        // Apply 3D orbit transformation
        pos.applyEuler(orbitEuler);
        container.position.copy(pos);

        // Self-rotation
        planet.rotation.y += 0.004

        // Orbit path breathe
        const pulse = 0.88 + Math.sin(t * 0.30 + i * 0.7) * 0.12
        orbit.lMat.opacity = 0.45 * pulse
        orbit.tMat.opacity = 0.28 * pulse
        orbit.aMat.opacity = 0.07 * pulse

        // Atmosphere glow pulse
        atmoMesh.material.opacity = 0.12 + Math.sin(t*0.55+i)*0.05
      })

      /* Nebula breathe */
      nebulaMeshes.forEach(({ m, base, ph }, i) => {
        m.material.opacity = base * (0.65 + Math.sin(t*(0.18+i*0.05)+ph) * 0.35)
      })

      /* Meteors */
      nxtS -= dt; nxtB -= dt
      if (nxtS <= 0) { spawnMeteor(); nxtS = rand(0.5, 2.5) }
      if (nxtB <= 0) { burst(Math.floor(rand(5, 12))); nxtB = rand(7, 18) }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.t    += dt
        const p = m.t / m.life
        const alpha = p < 0.08 ? p/0.08 : p < 0.75 ? 1 : 1-(p-0.75)/0.25
        m.mat.opacity = alpha * m.maxOp
        m.line.position.x += m.vx * dt
        m.line.position.y += m.vy * dt
        if (m.head) {
          m.head.position.copy(m.line.position)
          m.hMat.opacity = alpha * (m.big ? 1.0 : 0.70)
        }
        if (p >= 1) {
          scene.remove(m.line); m.geo.dispose(); m.mat.dispose()
          if (m.head) { scene.remove(m.head); m.hGeo.dispose(); m.hMat.dispose() }
          meteors.splice(i, 1)
        }
      }

      /* Camera subtle parallax — stays mostly top-down */
      camera.position.x += (mx * 6  - camera.position.x) * 0.010
      camera.position.z += (my * -4 + 18 - camera.position.z) * 0.010
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouse)
      disc.dispose()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <>
      <div
        ref={mountRef}
        className="galaxy-bg-canvas"
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 0, pointerEvents: 'none',
          opacity, overflow: 'hidden',
        }}
      />
      <div className="nebula-cloud nebula-cloud--purple"  style={{ width:'70vw', height:'70vw', top:'-25vw',    left:'-20vw',  animationDuration:'11s' }} />
      <div className="nebula-cloud nebula-cloud--cyan"    style={{ width:'60vw', height:'60vw', bottom:'-15vw', right:'-12vw', animationDuration:'14s', animationDelay:'2s'  }} />
      <div className="nebula-cloud nebula-cloud--blue"    style={{ width:'55vw', height:'55vw', top:'20vh',     left:'55vw',   animationDuration:'17s', animationDelay:'1s'  }} />
      <div className="nebula-cloud nebula-cloud--magenta" style={{ width:'48vw', height:'48vw', bottom:'8vh',   left:'5vw',    animationDuration:'9s',  animationDelay:'4s'  }} />
      <div ref={tooltipRef} className="planet-tooltip" />
    </>
  )
}
