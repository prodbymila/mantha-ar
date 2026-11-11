// Resto de los objetos de la capa, con la misma estética que la Vespa:
// colores de los marcadores que usaste, brillo suave y contorno negro.
// Convención: y = arriba, x = derecha (adelante en vehículos), z = hacia quien mira; apoyados en y = 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, part, deform, smooth } from './vespa3d.js?v=5';

const NEGRO = 0x161616, OSCURO = 0x3a3a3c, GRIS = 0xb9b6b0, BLANCO = 0xf2f0ea, CREMA = 0xf1e9d6;
const MADERA = 0x8a5a2e, MADERA_CLARA = 0xc89a62, ROJO = 0xb8243a;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const rbox = (w, h, d, r = 0.03, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2.1, h / 2.1, d / 2.1));
function at(obj, x, y, z, rx = 0, ry = 0, rz = 0) { obj.position.set(x, y, z); obj.rotation.set(rx, ry, rz); return obj; }
function tube(points, r, color, kind = 'chrome', closed = false, outline = true) {
  const c = new THREE.CatmullRomCurve3(points, closed, 'catmullrom', 0.2);
  return part(new THREE.TubeGeometry(c, Math.max(24, points.length * 12), r, 10, closed), color, kind, { outline });
}
function cyl(r, h, color, kind = 'paint', seg = 24, r2 = r) { return part(new THREE.CylinderGeometry(r, r2, h, seg), color, kind); }
function glassMat(color = 0x1d2a33) { return new THREE.MeshPhysicalMaterial({ color, roughness: 0.1, metalness: 0.2, clearcoat: 1 }); }
function root(g, update) { const r = new THREE.Group(); r.add(g); if (update) r.userData.update = update; return r; }

function carWheel(r = 0.13, w = 0.09, hub = GRIS) {
  const g = new THREE.Group();
  const t = part(new THREE.CylinderGeometry(r, r, w, 32), NEGRO, 'rubber'); t.rotation.x = Math.PI / 2; g.add(t);
  const h = part(new THREE.CylinderGeometry(r * 0.55, r * 0.55, w + 0.01, 24), hub, 'chrome', { outline: false }); h.rotation.x = Math.PI / 2; g.add(h);
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(r * 0.7, 0.012, w + 0.02), mat(OSCURO, 'matte'));
    n.rotation.z = i * Math.PI / 4; g.add(n);
  }
  return g;
}
function spinWheels(ws, speed = 3) { return (now, t, dt) => ws.forEach((w) => (w.rotation.z -= speed * dt)); }

// ============ UT4 ============








// ============ UT5 ============








// ============ UT6 ============





// Espalditas (Diana Cabeza, 2017; Planetario de Buenos Aires): banco de hormigón, dos respaldos espalda con espalda.
export function buildEspalditas() {
  const g = new THREE.Group();
  const conc = new THREE.MeshPhysicalMaterial({ color: 0x9a9d9f, roughness: 0.85 });
  // dos asientos de hormigón espalda con espalda: asiento bajo + respaldo curvo que se inclina
  for (const s of [-1, 1]) {
    const seat = part(rbox(0.5, 0.16, 0.34, 0.05, 4), 0x9a9d9f, 'matte'); seat.children[0].material = conc;
    seat.position.set(0, 0.08, s * 0.24); g.add(seat);
    const geo = deform(rbox(0.5, 0.5, 0.09, 0.04, 4), (v) => {
      const k = (v.y + 0.25) / 0.5;                       // 0 abajo → 1 arriba
      v.z += -s * 0.12 * k * k;                           // se curva hacia afuera
      v.x *= 1 - 0.3 * k * k;                             // se afina arriba, como una espalda
    });
    const back = part(geo, 0x9a9d9f, 'matte'); back.children[0].material = conc;
    back.position.set(0, 0.36, s * 0.04); g.add(back);
  }
  return root(g);
}

// ============ CENTRO: azar · artesanía · técnica (Ortega y Gasset) ============

const facet = (geo, color, rough = 0.8) => {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: rough, flatShading: true })));
  g.add(new THREE.Mesh(geo, part(new THREE.BoxGeometry(0, 0, 0), 0, 'matte').children[1].material));
  return g;
};
const rnd = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

// Fuego: leños cruzados y llamas que titilan.
export function buildFuego() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const log = part(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 14), 0x6b3f22, 'wood');
    log.rotation.set(Math.PI / 2, i * Math.PI / 3, 0.15); log.position.y = 0.07; g.add(log);
  }
  const flames = [];
  const cols = [0xe0452a, 0xf08a24, 0xf5c542];
  for (let i = 0; i < 3; i++) {
    const f = new THREE.Mesh(deform(new THREE.ConeGeometry(0.17 - i * 0.045, 0.5 - i * 0.1, 20, 6), (v) => { v.x += 0.05 * Math.sin(v.y * 9); }),
      new THREE.MeshBasicMaterial({ color: cols[i], toneMapped: false, transparent: true, opacity: 0.95 - i * 0.05 }));
    f.position.y = 0.33 - i * 0.03; g.add(f); flames.push(f);
  }
  const light = new THREE.PointLight(0xff9a3c, 1.5, 1.5); light.position.y = 0.4; g.add(light);
  return root(g, (now) => flames.forEach((f, i) => {
    f.scale.set(1 + 0.08 * Math.sin(now / 90 + i), 1 + 0.15 * Math.sin(now / 130 + i * 2), 1);
    f.rotation.y = now / 600 * (i % 2 ? 1 : -1); light.intensity = 1.3 + 0.4 * Math.sin(now / 70);
  }));
}

// Piedra tallada: núcleo de sílex con facetas.
export function buildPiedra() {
  const geo = deform(new THREE.IcosahedronGeometry(0.4, 1), (v) => { const n = rnd(v.x * 13 + v.y * 7 + v.z * 3); v.multiplyScalar(0.85 + 0.25 * n); v.y *= 0.6; });
  geo.computeVertexNormals();
  const g = facet(geo, 0x6f7a82); g.position.y = 0.25;
  return root(g, (now, t) => { g.rotation.y = t * 0.6; });
}

// Hacha de mano con mango.
export function buildHacha() {
  const g = new THREE.Group();
  g.add(at(part(new THREE.CylinderGeometry(0.035, 0.045, 0.9, 12), 0x8a5a2e, 'wood'), 0, 0.45, 0));
  const head = facet(deform(new THREE.OctahedronGeometry(0.2, 0), (v) => { v.x *= 1.4; v.z *= 0.45; if (v.x > 0) v.y *= 1.4; }), 0x7d858c);
  head.position.set(0.12, 0.82, 0); g.add(head);
  for (let i = 0; i < 4; i++) g.add(at(part(new THREE.TorusGeometry(0.05, 0.012, 6, 16), 0xc9a877, 'matte'), 0, 0.74 + i * 0.03, 0, Math.PI / 2));
  return root(g, (now, t) => { g.rotation.z = -0.25 + 0.25 * Math.sin(Math.min(t, 1.2) * Math.PI / 1.2); });
}

// Vasija de barro.
export function buildVasija() {
  const pts = [[0, 0], [0.16, 0], [0.24, 0.08], [0.3, 0.22], [0.28, 0.36], [0.18, 0.48], [0.11, 0.56], [0.12, 0.66], [0.15, 0.7], [0.13, 0.72]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = part(new THREE.LatheGeometry(pts, 48), 0xd9a44a, 'matte');
  g.children[0].material = new THREE.MeshPhysicalMaterial({ color: 0xd9a44a, roughness: 0.6, clearcoat: 0.2, side: THREE.DoubleSide });
  const band = part(new THREE.CylinderGeometry(0.302, 0.302, 0.05, 48, 1, true), 0x7a4a22, 'matte'); band.position.y = 0.3; band.children[0].material.side = THREE.DoubleSide;
  const r = new THREE.Group(); r.add(g); r.add(band);
  return root(r, (now, t) => { r.rotation.y = t * 0.8; });
}

// Yunque del herrero sobre un tronco; el martillo golpea y saltan chispas.
export function buildYunque() {
  const g = new THREE.Group();
  g.add(at(part(new THREE.CylinderGeometry(0.2, 0.22, 0.32, 20), 0x8a5a34, 'wood'), 0, 0.16, 0));
  const s = new THREE.Shape();
  s.moveTo(-0.32, 0); s.lineTo(0.18, 0); s.quadraticCurveTo(0.42, 0.02, 0.55, 0.06); s.quadraticCurveTo(0.32, 0.1, 0.2, 0.1);
  s.lineTo(0.12, 0.1); s.lineTo(0.12, -0.1); s.lineTo(0.18, -0.2); s.lineTo(-0.28, -0.2); s.lineTo(-0.22, -0.1); s.lineTo(-0.22, 0.0);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.2, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 }); geo.translate(0, 0, -0.1);
  g.add(at(part(geo, 0x4b5157, 'chrome'), -0.05, 0.53, 0));
  const ham = new THREE.Group(); ham.position.set(0.35, 0.75, 0.2); g.add(ham);
  ham.add(at(part(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 10), 0x8a5a2e, 'wood'), 0, 0, 0, 0, 0, Math.PI / 2 - 0.2));
  ham.add(at(part(rbox(0.08, 0.12, 0.08, 0.01), 0x3a3a3c, 'chrome'), -0.2, 0.04, 0));
  const sparks = [];
  for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffc04a, transparent: true })); g.add(p); sparks.push(p); }
  return root(g, (now, t) => {
    const ph = (t % 1.1) / 1.1, hit = ph < 0.25 ? ph / 0.25 : Math.max(0, 1 - (ph - 0.25) / 0.6);
    ham.rotation.z = -0.9 * (1 - hit);
    sparks.forEach((p, i) => {
      const k = ph > 0.25 && ph < 0.7 ? (ph - 0.25) / 0.45 : -1;
      p.visible = k >= 0; if (k < 0) return;
      const a = i / 8 * Math.PI * 2;
      p.position.set(0.15 + Math.cos(a) * 0.3 * k, 0.65 + 0.25 * k - 0.4 * k * k, Math.sin(a) * 0.3 * k); p.material.opacity = 1 - k;
    });
  });
}

// Telar manual: bastidor de madera, hilos y un tejido que crece.
export function buildTelarManual() {
  const g = new THREE.Group(); const M = 0x7a4a2e;
  for (const x of [-0.35, 0.35]) g.add(at(part(rbox(0.05, 0.8, 0.05, 0.01), M, 'wood'), x, 0.4, 0));
  for (const y of [0.15, 0.75]) g.add(at(part(new THREE.CylinderGeometry(0.03, 0.03, 0.74, 12), M, 'wood'), 0, y, 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 17; i++) g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.6, 4), mat(0xe8dcc0, 'matte')), -0.3 + i * 0.0375, 0.45, 0));
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1), new THREE.MeshStandardMaterial({ color: 0xb8643e, roughness: 0.9, side: THREE.DoubleSide }));
  g.add(cloth);
  const heddle = part(rbox(0.68, 0.03, 0.04, 0.008), M, 'wood'); g.add(heddle);
  return root(g, (now, t) => {
    const h = 0.05 + 0.3 * smooth(0.4, 3, t); cloth.scale.y = h; cloth.position.set(0, 0.17 + h / 2, 0.002);
    heddle.position.set(0, 0.2 + h + 0.03, 0.02 * Math.sin(now / 200));
  });
}



// Lamparita incandescente (Edison, 1879): se enciende el filamento.
export function buildFoco() {
  const g = new THREE.Group();
  const pts = [[0, 0.95], [0.12, 0.93], [0.25, 0.85], [0.32, 0.7], [0.3, 0.55], [0.2, 0.42], [0.13, 0.33], [0.12, 0.27]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), new THREE.MeshPhysicalMaterial({ color: 0xdff0f5, roughness: 0.05, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
  g.add(glass);
  const base = part(deform(new THREE.CylinderGeometry(0.12, 0.1, 0.2, 32, 8), (v) => { v.x *= 1 + 0.06 * Math.sin(v.y * 90); v.z *= 1 + 0.06 * Math.sin(v.y * 90); }), GRIS, 'chrome');
  base.position.y = 0.17; g.add(base);
  g.add(at(part(new THREE.CylinderGeometry(0.05, 0.03, 0.06, 16), NEGRO, 'matte'), 0, 0.04, 0));
  const filMat = new THREE.MeshStandardMaterial({ color: 0x5a3a20, emissive: 0xffb347, emissiveIntensity: 0 });
  for (const s of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.32, 6), mat(GRIS, 'chrome')), s * 0.05, 0.45, 0));
  const fil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.05, 0.6, 0), V(-0.03, 0.68, 0), V(0, 0.62, 0), V(0.03, 0.68, 0), V(0.05, 0.6, 0)]), 30, 0.006, 6), filMat);
  g.add(fil);
  const light = new THREE.PointLight(0xffc56b, 0, 1.6); light.position.y = 0.65; g.add(light);
  return root(g, (now, t) => { const k = smooth(0.7, 1.4, t) * (0.95 + 0.05 * Math.sin(now / 60)); filMat.emissiveIntensity = 2.5 * k; light.intensity = 1.6 * k; glass.material.emissive?.setHex(0); });
}

// ============ VERSIÓN AJUSTADA A LOS OBJETOS REALES ============
// ---------- carrocerías continuas (loft) ----------
// curva suave por puntos [x, y] (Catmull-Rom) → y(x)
function curveFn(pts) {
  const c = new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const S = c.getSpacedPoints(600);
  return (x) => {
    if (x <= S[0].x) return S[0].y;
    for (let i = 1; i < S.length; i++) if (x <= S[i].x) {
      const t = (x - S[i - 1].x) / (S[i].x - S[i - 1].x || 1);
      return S[i - 1].y + (S[i].y - S[i - 1].y) * t;
    }
    return S[S.length - 1].y;
  };
}
// Volumen cerrado a lo largo de x con secciones superelípticas (p<1 = más cuadrado).
// colorFn(x, y, z, normal) → color hex por vértice (para vidrios, parantes, etc.).
function loftGeo({ x0, x1, top, bot, wid, p = 0.5, N = 160, M = 96, colorFn }) {
  const T = curveFn(top), B = curveFn(bot), W = curveFn(wid);
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const x = x0 + (x1 - x0) * i / N;
    const yt = T(x), yb = B(x), yc = (yt + yb) / 2, ry = Math.max(0.001, (yt - yb) / 2);
    const rz = (i === 0 || i === N) ? 0.0001 : W(x);
    for (let j = 0; j < M; j++) {
      const a = (j / M) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      pos.push(x, yc + ry * Math.sign(s) * Math.pow(Math.abs(s), p), rz * Math.sign(c) * Math.pow(Math.abs(c), p));
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * M + j, b = i * M + (j + 1) % M, c = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M;
    idx.push(a, c, b, b, c, d);
  }
  // tapas
  const n0 = pos.length / 3; pos.push(x0, (T(x0) + B(x0)) / 2, 0);
  const n1 = pos.length / 3; pos.push(x1, (T(x1) + B(x1)) / 2, 0);
  for (let j = 0; j < M; j++) { idx.push(n0, j, (j + 1) % M); idx.push(n1, N * M + (j + 1) % M, N * M + j); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  if (colorFn) {
    const col = [], P = geo.attributes.position, Nn = geo.attributes.normal, c = new THREE.Color(), nv = new THREE.Vector3();
    for (let i = 0; i < P.count; i++) {
      nv.fromBufferAttribute(Nn, i);
      c.setHex(colorFn(P.getX(i), P.getY(i), P.getZ(i), nv, T(P.getX(i)))); col.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  }
  return geo;
}
// Pintura de carrocería con ventanillas recortadas por píxel (bordes nítidos):
// vidrio donde belt < y < top y xa < x < xb, salvo los parantes.
function bodyPart(geo, color = 0xffffff, win = null) {
  const g = part(geo, color, 'paint');
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.15, envMapIntensity: 0.6 });
  if (win) {
    const P = (win.pillars || []).slice(0, 4); while (P.length < 4) P.push(99);
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = 'varying vec3 vObj;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;');
      sh.fragmentShader = 'varying vec3 vObj;\nfloat gw;\n' + sh.fragmentShader
        .replace('#include <color_fragment>', `#include <color_fragment>
          {
            float inX = step(${win.xa.toFixed(3)}, vObj.x) * step(vObj.x, ${win.xb.toFixed(3)});
            float inY = step(${win.belt.toFixed(3)}, vObj.y) * step(vObj.y, ${win.top.toFixed(3)});
            float pil = 0.0;
            ${P.map((x) => `pil = max(pil, step(abs(vObj.x - (${x.toFixed(3)})), ${(win.pw || 0.02).toFixed(3)}));`).join('\n')}
            gw = inX * inY * (1.0 - pil);
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.012, 0.02, 0.03), gw);
          }`)
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.04, gw);');
    };
  }
  g.children[0].material = m;
  return g;
}
const VIDRIO = 0x1e2a33;
// regla de vidrios: entre la línea de cintura y el techo, dentro de [xa, xb], salvo parantes
function glassRule(color, { belt, xa, xb, pillars = [], roofNy = 0.8, pw = 0.025, roof = 0.03 }) {
  return (x, y, z, n, yt) => {
    if (y > belt && y < yt - roof && x > xa && x < xb && !pillars.some((px) => Math.abs(x - px) < pw)) return VIDRIO;
    return color;
  };
}
function rimWheel(r, w, hubColor = GRIS, hubcap = true) {
  const g = new THREE.Group();
  const tire = part(new THREE.TorusGeometry(r * 0.78, r * 0.24, 16, 40), NEGRO, 'rubber'); g.add(tire);
  const rim = part(new THREE.CylinderGeometry(r * 0.6, r * 0.6, w * 0.9, 32), hubColor, hubcap ? 'chrome' : 'paint', { outline: false });
  rim.rotation.x = Math.PI / 2; g.add(rim);
  const cap = part(new THREE.SphereGeometry(r * 0.32, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), GRIS, 'chrome', { outline: false });
  cap.rotation.x = Math.PI / 2; cap.position.z = w * 0.45; g.add(cap);
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, w + 0.01, 6), mat(OSCURO, 'chrome'));
    n.rotation.x = Math.PI / 2; n.position.set(Math.cos(i * Math.PI / 2) * r * 0.42, Math.sin(i * Math.PI / 2) * r * 0.42, 0.005); g.add(n);
  }
  g.rotation.y = 0;
  return g;
}
function wheelsAt(g, xs, r, zHalf, w = 0.08, hub = GRIS) {
  const ws = [];
  for (const x of xs) for (const s of [-1, 1]) {
    const wh = rimWheel(r, w, hub); wh.position.set(x, r, s * zHalf); if (s < 0) wh.rotation.y = Math.PI; g.add(wh); ws.push(wh);
  }
  return ws;
}
const spinAll = (ws, k = 3) => (now, t, dt) => ws.forEach((w) => (w.rotation.z += (w.rotation.y ? 1 : -1) * k * dt));
function lamp(g, x, y, z, r = 0.035, color = 0xfff1b8) {
  g.add(at(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(color, 'glow')), x, y, z, 0, 0, -Math.PI / 2));
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.16, 8, 24), mat(GRIS, 'chrome')), x, y, z, 0, Math.PI / 2, 0));
}
function bumper(g, x, y, w, depth = 0.025) {
  g.add(at(part(new THREE.CapsuleGeometry(0.018, w, 4, 12), GRIS, 'chrome'), x, y, 0, Math.PI / 2, 0, 0));
}

// Mazda R360 Coupé (1960): 2,98 m × 1,29 m × 1,29 m. Kei car de motor trasero, faros redondos en las aletas,
// luneta envolvente, tomas de aire detrás de las puertas.
export function buildR360() {
  const C = 0x8db3d9, g = new THREE.Group();
  const geo = loftGeo({
    x0: -0.5, x1: 0.5, p: 0.42,
    top: [[-0.5, 0.2], [-0.48, 0.32], [-0.42, 0.37], [-0.3, 0.42], [-0.18, 0.56], [-0.08, 0.62], [0.06, 0.62], [0.16, 0.57], [0.24, 0.43], [0.36, 0.39], [0.46, 0.35], [0.5, 0.22]],
    bot: [[-0.5, 0.2], [-0.47, 0.1], [-0.35, 0.08], [0.35, 0.08], [0.47, 0.1], [0.5, 0.22]],
    wid: [[-0.5, 0.12], [-0.45, 0.2], [-0.3, 0.215], [0.3, 0.215], [0.45, 0.2], [0.5, 0.12]],
  });
  g.add(bodyPart(geo, C, { belt: 0.44, top: 0.585, xa: -0.27, xb: 0.215, pillars: [-0.1], pw: 0.018 }));
  for (const s of [-1, 1]) {
    lamp(g, 0.475, 0.31, s * 0.135, 0.04);
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), mat(0xe2402e, 'glow')), -0.49, 0.3, s * 0.14));
    for (let i = 0; i < 4; i++) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.008, 0.01), mat(OSCURO, 'matte')), -0.3, 0.33 + i * 0.018, s * 0.212));
  }
  bumper(g, 0.5, 0.17, 0.36); bumper(g, -0.5, 0.17, 0.36);
  g.add(at(part(rbox(0.01, 0.035, 0.12, 0.008), GRIS, 'chrome'), 0.505, 0.26, 0));
  const ws = wheelsAt(g, [-0.3, 0.3], 0.085, 0.19, 0.06);
  return root(g, spinAll(ws));
}

// Renault 12 (Gaston Juchet, 1969; IKA-Renault Córdoba 1971–94): sedán de 3 volúmenes, 4,35 × 1,62 × 1,43 m,
// faros rectangulares a los lados de la parrilla, cola con baúl.
export function buildR12() {
  const C = 0x7b8530, g = new THREE.Group();
  const geo = loftGeo({
    x0: -0.55, x1: 0.55, p: 0.32,
    top: [[-0.55, 0.22], [-0.53, 0.38], [-0.4, 0.41], [-0.3, 0.42], [-0.18, 0.58], [-0.12, 0.6], [0.06, 0.6], [0.18, 0.43], [0.3, 0.39], [0.5, 0.36], [0.55, 0.24]],
    bot: [[-0.55, 0.22], [-0.53, 0.11], [0.53, 0.11], [0.55, 0.24]],
    wid: [[-0.55, 0.17], [-0.5, 0.2], [0.5, 0.2], [0.55, 0.17]],
  });
  g.add(bodyPart(geo, C, { belt: 0.43, top: 0.57, xa: -0.3, xb: 0.175, pillars: [-0.06], pw: 0.016 }));
  for (const s of [-1, 1]) {
    g.add(at(part(rbox(0.012, 0.05, 0.08, 0.008), 0xfff1b8, 'glow', { outline: false }), 0.553, 0.3, s * 0.12));
    g.add(at(part(rbox(0.012, 0.04, 0.07, 0.008), 0xe2402e, 'glow', { outline: false }), -0.553, 0.32, s * 0.13));
  }
  g.add(at(part(rbox(0.012, 0.04, 0.15, 0.006), OSCURO, 'matte', { outline: false }), 0.553, 0.3, 0));
  g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.025, 0.03), mat(GRIS, 'chrome')), 0.556, 0.3, 0));
  bumper(g, 0.56, 0.2, 0.38); bumper(g, -0.56, 0.2, 0.38);
  const ws = wheelsAt(g, [-0.34, 0.34], 0.1, 0.18, 0.07);
  const puffs = [];
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd9b56a, transparent: true, opacity: 0.8, roughness: 1 }));
    g.add(p); puffs.push(p);
  }
  return root(g, (now, t, dt) => {
    spinAll(ws)(now, t, dt);
    puffs.forEach((p, i) => {
      const ph = ((now / 1000 + i * 0.4) % 1.6) / 1.6;
      p.position.set(-0.6 - ph * 0.3, 0.14 + ph * 0.22, 0.12); p.scale.setScalar(0.5 + ph * 1.4); p.material.opacity = 0.75 * (1 - ph);
    });
  });
}

// Rastrojero (IAME, Córdoba 1952): pick-up utilitario; cabina redondeada, capot angosto entre guardabarros
// sueltos, parrilla de barras verticales y faros sobre los guardabarros, caja de carga atrás.
export function buildRastrojero() {
  const C = 0x5b8a3c, g = new THREE.Group(), wR = 0.1;
  // cabina
  g.add(bodyPart(loftGeo({
    x0: -0.08, x1: 0.24, p: 0.35,
    top: [[-0.08, 0.3], [-0.07, 0.6], [0.0, 0.66], [0.16, 0.66], [0.2, 0.6], [0.24, 0.42]],
    bot: [[-0.08, 0.3], [-0.07, 0.15], [0.24, 0.15]],
    wid: [[-0.08, 0.18], [-0.06, 0.22], [0.22, 0.22], [0.24, 0.2]],
  }), C, { belt: 0.47, top: 0.625, xa: -0.06, xb: 0.235, pillars: [0.15], pw: 0.016 }));
  // capot (angosto, redondeado)
  g.add(bodyPart(loftGeo({
    x0: 0.22, x1: 0.56, p: 0.45,
    top: [[0.22, 0.42], [0.3, 0.43], [0.5, 0.41], [0.56, 0.36]],
    bot: [[0.22, 0.2], [0.56, 0.2]],
    wid: [[0.22, 0.13], [0.5, 0.12], [0.56, 0.1]],
  }), C));
  // guardabarros delanteros sueltos + estribo
  for (const s of [-1, 1]) {
    const f = bodyPart(loftGeo({
      x0: 0.22, x1: 0.6, p: 0.6,
      top: [[0.22, 0.2], [0.3, 0.3], [0.42, 0.34], [0.54, 0.3], [0.6, 0.2]],
      bot: [[0.22, 0.17], [0.42, 0.24], [0.6, 0.17]],
      wid: [[0.22, 0.04], [0.3, 0.07], [0.54, 0.07], [0.6, 0.04]],
    }), C); f.position.z = s * 0.2; g.add(f);
    lamp(g, 0.53, 0.35, s * 0.2, 0.035);
    g.add(at(part(rbox(0.56, 0.015, 0.06, 0.005), OSCURO, 'matte'), 0.05, 0.16, s * 0.24));
  }
  for (let i = 0; i < 7; i++) g.add(at(part(rbox(0.01, 0.15, 0.012, 0.004), GRIS, 'chrome', { outline: false }), 0.563, 0.29, -0.075 + i * 0.025));
  // caja de carga
  g.add(at(part(rbox(0.6, 0.04, 0.46, 0.01), C), -0.4, 0.22, 0));
  for (const s of [-1, 1]) g.add(at(part(rbox(0.6, 0.2, 0.025, 0.008), C), -0.4, 0.33, s * 0.22));
  g.add(at(part(rbox(0.025, 0.2, 0.46, 0.008), C), -0.7, 0.33, 0));
  g.add(at(part(rbox(0.025, 0.2, 0.46, 0.008), C), -0.1, 0.33, 0));
  for (const s of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.04), mat(0xe2402e, 'glow')), -0.715, 0.3, s * 0.18));
  bumper(g, 0.6, 0.15, 0.42);
  const ws = wheelsAt(g, [-0.42, 0.42], wR, 0.205, 0.08);
  return root(g, spinAll(ws));
}

// IKA Estanciera (Córdoba 1957, versión del Willys Jeep Station Wagon): carrocería alta y recta, techo blanco,
// trompa en V con barras verticales, guardabarros planos, tres ventanillas por lado.
export function buildEstanciera() {
  const C = 0xe5c23d, g = new THREE.Group(), wR = 0.11;
  const body = part(rbox(0.82, 0.38, 0.46, 0.035, 4), C); body.position.set(-0.13, 0.42, 0); g.add(body);
  g.add(at(part(rbox(0.84, 0.035, 0.47, 0.015), BLANCO), -0.13, 0.62, 0));
  const gm = glassMat();
  for (const s of [-1, 1]) {
    for (const [x, w] of [[-0.44, 0.17], [-0.23, 0.2], [0.0, 0.18]]) g.add(at(new THREE.Mesh(rbox(w, 0.13, 0.008, 0.012), gm), x, 0.52, s * 0.232));
    g.add(at(part(rbox(0.8, 0.012, 0.01, 0.004), OSCURO, 'matte', { outline: false }), -0.13, 0.34, s * 0.232));
  }
  g.add(at(new THREE.Mesh(rbox(0.01, 0.13, 0.38, 0.012), gm), 0.282, 0.52, 0, 0, 0, 0.08));
  g.add(at(new THREE.Mesh(rbox(0.01, 0.12, 0.3, 0.012), gm), -0.542, 0.52, 0));
  // capot y guardabarros planos
  g.add(at(part(rbox(0.3, 0.17, 0.3, 0.025), C), 0.43, 0.33, 0));
  for (const s of [-1, 1]) {
    g.add(at(part(rbox(0.3, 0.05, 0.1, 0.012), C), 0.45, 0.27, s * 0.19));
    g.add(at(part(rbox(0.06, 0.09, 0.1, 0.012), C), 0.57, 0.23, s * 0.19));
  }
  // trompa en V con barras verticales
  for (const s of [-1, 1]) {
    const v = new THREE.Group(); v.position.set(0.58, 0.33, s * 0.075); v.rotation.y = -s * 0.5; g.add(v);
    v.add(part(rbox(0.012, 0.17, 0.17, 0.006), C));
    for (let i = 0; i < 5; i++) v.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.13, 0.012), mat(0x2d2d2d, 'matte')), 0.002, 0, -0.06 + i * 0.03));
    lamp(g, 0.6, 0.31, s * 0.19, 0.035);
  }
  bumper(g, 0.64, 0.17, 0.5); bumper(g, -0.56, 0.17, 0.46);
  g.add(at(part(rbox(0.012, 0.3, 0.38, 0.01), C), -0.545, 0.4, 0));
  const ws = wheelsAt(g, [-0.38, 0.4], wR, 0.245, 0.09);
  return root(g, spinAll(ws));
}

// Lámpara WG24 (Wagenfeld y Jucker, Bauhaus 1923–24): 36 cm de alto, base de vidrio de 18 cm, caño de vidrio
// con la varilla metálica adentro, pantalla de vidrio opalino (más de media esfera) sobre aro niquelado, cadenita.
export function buildLamp() {
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xeaf4f4, roughness: 0.04, transparent: true, opacity: 0.32, depthWrite: false, clearcoat: 1 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.035, 64), glass); base.position.y = 0.0175; g.add(base);
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.006, 8, 64), new THREE.LineBasicMaterial()), 0, 0.035, 0, Math.PI / 2));
  g.children[g.children.length - 1].material = mat(0xcfd8d8, 'chrome');
  g.add(at(cyl(0.05, 0.012, GRIS, 'chrome', 32), 0, 0.04, 0));                       // casquillo de la base
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.64, 32), glass); shaft.position.y = 0.36; g.add(shaft);
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.68, 10), mat(GRIS, 'chrome')), 0, 0.37, 0));
  g.add(at(cyl(0.07, 0.025, GRIS, 'chrome', 40), 0, 0.69, 0));                        // aro portapantalla
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.006, 8, 40), mat(GRIS, 'chrome')), 0, 0.703, 0, Math.PI / 2));
  const shadeMat = new THREE.MeshPhysicalMaterial({ color: 0xf6f1e4, emissive: 0xffd58a, emissiveIntensity: 0.05, roughness: 0.3, clearcoat: 0.5, transmission: 0 });
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.25, 64, 32, 0, Math.PI * 2, 0, Math.PI * 0.6), shadeMat);
  shade.position.y = 0.78; g.add(shade);
  const inner = new THREE.Mesh(shade.geometry, new THREE.MeshBasicMaterial({ color: 0xffe6b0, side: THREE.BackSide })); inner.position.copy(shade.position); inner.scale.setScalar(0.995); g.add(inner);
  const ol = part(shade.geometry, 0, 'matte').children[1]; ol.position.copy(shade.position); g.add(ol);
  // cadenita con bolita
  const chain = [];
  for (let i = 0; i < 14; i++) chain.push(V(0.09, 0.7 - i * 0.012, 0.0));
  g.add(tube(chain, 0.0035, GRIS, 'chrome', false, false));
  g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), mat(GRIS, 'chrome')), 0.09, 0.53, 0));
  const light = new THREE.PointLight(0xffcf80, 0, 1.4); light.position.y = 0.75; g.add(light);
  return root(g, (now, t) => { const k = smooth(0.6, 1.2, t); shadeMat.emissiveIntensity = 0.05 + 0.75 * k; light.intensity = 1.4 * k; });
}

// Silla B3 / "Wassily" (Marcel Breuer, Bauhaus 1925): 78 × 68 × 73 cm; caño de acero niquelado
// y cintas tensas de Eisengarn negro en asiento, respaldo y apoyabrazos.
export function buildB3() {
  const g = new THREE.Group(), R = 0.012, Z = 0.37, T = (pts) => g.add(tube(pts, R, 0xd7dadc, 'chrome'));
  for (const s of [-1, 1]) {
    const z = s * Z;
    // marco lateral cerrado: patín en el piso, parante delantero, apoyabrazos, parante trasero
    T([V(0.3, 0.012, z), V(-0.28, 0.012, z), V(-0.32, 0.05, z), V(-0.3, 0.55, z), V(-0.26, 0.58, z), V(0.27, 0.58, z), V(0.31, 0.54, z), V(0.32, 0.05, z), V(0.3, 0.012, z)]);
    // riel bajo del apoyabrazos (donde se tensa la cinta lateral)
    T([V(-0.27, 0.34, z), V(0.29, 0.34, z)]);
    // parante del respaldo, inclinado
    T([V(-0.27, 0.26, z * 0.86), V(-0.36, 0.5, z * 0.86), V(-0.42, 0.74, z * 0.86)]);
  }
  T([V(0.31, 0.42, -Z), V(0.31, 0.42, Z)]);                 // travesaño delantero del asiento
  T([V(-0.26, 0.27, -Z * 0.86), V(-0.26, 0.27, Z * 0.86)]); // travesaño trasero del asiento
  T([V(-0.42, 0.74, -Z * 0.86), V(-0.42, 0.74, Z * 0.86)]); // travesaño superior del respaldo
  T([V(-0.33, 0.43, -Z * 0.86), V(-0.33, 0.43, Z * 0.86)]); // travesaño inferior del respaldo
  T([V(-0.3, 0.02, -Z), V(-0.3, 0.02, Z)]);                 // unión trasera en el piso
  const CINTA = 0x1c1c1e;
  const strap = (a, b, w, nrm) => {             // cinta plana entre dos puntos
    const len = a.distanceTo(b), m = part(rbox(len, 0.008, w, 0.003), CINTA, 'leather');
    m.position.copy(a.clone().add(b).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(V(1, 0, 0), b.clone().sub(a).normalize());
    if (nrm) m.rotateX(nrm);
    g.add(m);
  };
  strap(V(-0.26, 0.28, 0), V(0.31, 0.42, 0), Z * 1.7);                      // asiento
  strap(V(-0.33, 0.44, 0), V(-0.42, 0.73, 0), Z * 1.45);                    // respaldo
  for (const s of [-1, 1]) g.add(at(part(rbox(0.5, 0.22, 0.008, 0.003), CINTA, 'leather'), 0.01, 0.46, s * Z));
  return root(g);
}

// Club Obrero (Ródchenko, pabellón soviético de París 1925): mesa de ajedrez con dos sillas fijas a la misma base;
// el tablero pivotea para darse vuelta. Rojo, negro y gris.
export function buildClub() {
  const g = new THREE.Group();
  g.add(at(part(rbox(1.1, 0.04, 0.36, 0.008), 0x2a2a2a, 'matte'), 0, 0.02, 0));        // base común
  g.add(at(part(rbox(0.08, 0.5, 0.26, 0.008), ROJO), 0, 0.29, 0));                      // pie de la mesa
  for (const s of [-1, 1]) g.add(at(part(rbox(0.04, 0.12, 0.3, 0.006), 0x2a2a2a, 'matte'), 0, 0.6, s * 0.0));
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#1a1a1a' : '#e8e4da'; c.fillRect(i * 32, j * 32, 32, 32); }
  const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
  const board = new THREE.Group(); board.position.set(0, 0.62, 0); g.add(board);   // pivota sobre el eje x
  board.add(part(rbox(0.32, 0.03, 0.32, 0.006), ROJO));
  for (const sgn of [1, -1]) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.28), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.5 }));
    f.rotation.x = -sgn * Math.PI / 2; f.position.y = sgn * 0.0155; board.add(f);
  }
  for (const s of [-1, 1]) {
    const ch = new THREE.Group(); ch.position.set(s * 0.36, 0, 0); ch.rotation.y = s > 0 ? Math.PI : 0; g.add(ch);
    ch.add(at(part(rbox(0.24, 0.035, 0.26, 0.006), ROJO), 0.02, 0.36, 0));             // asiento
    ch.add(at(part(rbox(0.04, 0.34, 0.2, 0.006), ROJO), 0.02, 0.19, 0));               // pie del asiento
    // respaldo alto: bastidor negro con tablillas
    for (const z of [-0.12, 0.12]) ch.add(at(part(rbox(0.03, 0.62, 0.03, 0.006), NEGRO, 'matte'), -0.11, 0.62, z));
    for (let i = 0; i < 4; i++) ch.add(at(part(rbox(0.025, 0.05, 0.24, 0.006), i % 2 ? 0x9a9d9f : NEGRO, 'matte'), -0.11, 0.48 + i * 0.12, 0));
  }
  return root(g, (now, t) => { board.rotation.x = smooth(0.8, 1.8, t) * Math.PI + (t > 1.8 ? smooth(4, 5, (t % 6)) * Math.PI : 0); });
}

// Silla de Tatlin (Moscú 1927, realizada por el estudiante Rogozhin): voladizo de madera curvada (fresno)
// en un trazo continuo, asiento redondeado y respaldo de lámina curvada.
export function buildTatlin() {
  const g = new THREE.Group(), W = 0.22, WOOD = 0xc29a63;
  for (const s of [-1, 1]) {
    g.add(tube([V(-0.32, 0.02, s * W), V(0.22, 0.02, s * W * 1.08), V(0.34, 0.08, s * W * 1.1), V(0.36, 0.2, s * W * 1.08), V(0.3, 0.33, s * W),
      V(0.17, 0.41, s * W * 0.95), V(-0.02, 0.43, s * W * 0.92), V(-0.16, 0.47, s * W * 0.88), V(-0.22, 0.62, s * W * 0.8), V(-0.22, 0.8, s * W * 0.72)], 0.022, WOOD, 'wood'));
  }
  g.add(tube([V(-0.32, 0.02, -W), V(-0.38, 0.02, 0), V(-0.32, 0.02, W)], 0.022, WOOD, 'wood'));
  g.add(tube([V(-0.22, 0.8, -W * 0.72), V(-0.24, 0.84, 0), V(-0.22, 0.8, W * 0.72)], 0.022, WOOD, 'wood'));
  const seatGeo = deform(new THREE.CylinderGeometry(1, 1, 0.035, 48), (v) => { v.y += 0.05 * v.x * v.x - 0.02 * (1 - v.z * v.z); });
  const seat = part(seatGeo, 0xe6d6b8, 'leather'); seat.scale.set(0.21, 1, 0.21); seat.position.set(0.07, 0.445, 0); g.add(seat);
  const backGeo = deform(rbox(0.025, 0.2, 0.36, 0.01, 3), (v) => { v.x -= 0.6 * v.z * v.z; });
  const back = part(backGeo, WOOD, 'wood'); back.position.set(-0.2, 0.7, 0); back.rotation.z = 0.12; g.add(back);
  return root(g);
}

// Silla BKF (Bonet, Kurchan y Ferrari Hardoy — Grupo Austral, 1938): dos varillas de hierro dobladas que se cruzan;
// el cuero cuelga de las cuatro puntas (las de atrás más altas) y forma la "mariposa".
export function buildBKF() {
  const g = new THREE.Group(), R = 0.008, K = 0x1a1a1a;
  const tips = { BL: V(-0.36, 0.9, -0.38), BR: V(-0.36, 0.9, 0.38), FL: V(0.4, 0.52, -0.4), FR: V(0.4, 0.52, 0.4) };
  // varilla 1: punta delantera izq → pie → cruce central bajo → pie → punta trasera der (y la otra espejada)
  g.add(tube([tips.FL, V(0.33, 0.25, -0.36), V(0.28, 0.0, -0.3), V(0.0, 0.08, -0.02), V(-0.28, 0.0, 0.3), V(-0.33, 0.4, 0.36), tips.BR], R, K, 'matte'));
  g.add(tube([tips.FR, V(0.33, 0.25, 0.36), V(0.28, 0.0, 0.3), V(0.0, 0.08, 0.02), V(-0.28, 0.0, -0.3), V(-0.33, 0.4, -0.36), tips.BL], R, K, 'matte'));
  // cuero: superficie que cuelga entre las cuatro puntas (bilineal + panza)
  const geo = new THREE.PlaneGeometry(1, 1, 32, 32);
  deform(geo, (v) => {
    const u = v.x + 0.5, w = v.y + 0.5;                     // u: 0 atrás → 1 adelante; w: 0 izq → 1 der
    const P = tips.BL.clone().multiplyScalar((1 - u) * (1 - w)).add(tips.BR.clone().multiplyScalar((1 - u) * w))
      .add(tips.FL.clone().multiplyScalar(u * (1 - w))).add(tips.FR.clone().multiplyScalar(u * w));
    const sag = Math.sin(Math.PI * Math.min(1, u * 1.05)) * (0.42 + 0.1 * Math.sin(Math.PI * w));
    P.y -= sag * (0.85 + 0.15 * (1 - u)); P.z *= 1 - 0.18 * Math.sin(Math.PI * u); P.x -= 0.05 * Math.sin(Math.PI * u);
    v.copy(P);
  });
  geo.computeVertexNormals();
  g.add(new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0x6e4220, roughness: 0.5, clearcoat: 0.35, side: THREE.DoubleSide })));
  for (const k of ['BL', 'BR', 'FL', 'FR']) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), mat(0x7a4a22, 'leather')), tips[k].x, tips[k].y - 0.01, tips[k].z));
  return root(g);
}

// Silla Eames DSW (Charles y Ray Eames, 1950): cáscara de una pieza (asiento + respaldo con bordes levantados),
// patas de madera tipo "dowel" y crucetas de alambre negro.
export function buildEames() {
  const g = new THREE.Group();
  const prof = curveFn([[0, 0.43], [0.1, 0.405], [0.22, 0.4], [0.32, 0.42], [0.42, 0.53], [0.52, 0.7], [0.6, 0.83]]);   // altura a lo largo del perfil
  const px = curveFn([[0, 0.24], [0.1, 0.15], [0.22, 0.02], [0.32, -0.1], [0.42, -0.17], [0.52, -0.2], [0.6, -0.22]]);  // x a lo largo del perfil
  const hw = curveFn([[0, 0.2], [0.1, 0.235], [0.25, 0.235], [0.38, 0.21], [0.5, 0.235], [0.6, 0.24]]);                    // medio ancho
  const surf = (t, uu, off) => {
    const s = uu * 2 - 1, w = hw(t * 0.6);
    const lift = 0.07 * Math.pow(Math.abs(s), 3);                 // bordes levantados (cuenco)
    return V(px(t * 0.6) - off * 0.4 * lift, prof(t * 0.6) + lift + off, s * w * (1 - 0.06 * Math.abs(s)));
  };
  const geo = new THREE.BufferGeometry(), NU = 40, NT = 50, pos = [], idx = [];
  for (const off of [0, -0.014]) for (let i = 0; i <= NT; i++) for (let j = 0; j <= NU; j++) { const p = surf(i / NT, j / NU, off); pos.push(p.x, p.y, p.z); }
  const L = (NT + 1) * (NU + 1);
  for (let i = 0; i < NT; i++) for (let j = 0; j < NU; j++) {
    const a = i * (NU + 1) + j, b = a + 1, c = a + NU + 1, d = c + 1;
    idx.push(a, c, b, b, c, d, L + a, L + b, L + c, L + b, L + d, L + c);
  }
  const edge = (a, b) => { idx.push(a, b, L + a, b, L + b, L + a); };
  for (let i = 0; i < NT; i++) { edge(i * (NU + 1), (i + 1) * (NU + 1)); edge((i + 1) * (NU + 1) + NU, i * (NU + 1) + NU); }
  for (let j = 0; j < NU; j++) { edge(j + 1, j); edge(NT * (NU + 1) + j, NT * (NU + 1) + j + 1); }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const shell = part(geo, BLANCO, 'paint'); shell.children[0].material = new THREE.MeshPhysicalMaterial({ color: 0xf3f1ea, roughness: 0.4, clearcoat: 0.5, side: THREE.DoubleSide });
  g.add(shell);
  // patas de madera y alambres
  const feet = [[0.21, 0.21], [0.21, -0.21], [-0.2, 0.21], [-0.2, -0.21]], tops = [[0.09, 0.1], [0.09, -0.1], [-0.08, 0.1], [-0.08, -0.1]];
  feet.forEach(([x, z], i) => {
    g.add(tube([V(tops[i][0], 0.385, tops[i][1]), V(x, 0.0, z)], 0.014, 0xc9a06a, 'wood'));
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10), mat(NEGRO, 'rubber')), x, 0.006, z));
  });
  const mid = (i) => { const [x, z] = feet[i], [tx, tz] = tops[i]; return V((x + tx) / 2, 0.2, (z + tz) / 2); };
  g.add(tube([mid(0), mid(3)], 0.004, NEGRO, 'chrome', false, false)); g.add(tube([mid(1), mid(2)], 0.004, NEGRO, 'chrome', false, false));
  g.add(tube([mid(0), mid(1)], 0.004, NEGRO, 'chrome', false, false)); g.add(tube([mid(2), mid(3)], 0.004, NEGRO, 'chrome', false, false));
  for (const [x, z] of tops) g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 16), mat(NEGRO, 'rubber')), x, 0.39, z));
  return root(g);
}

function label(text, w, h, { bg = 'rgba(0,0,0,0)', fg = '#222', font = 'bold 64px Helvetica, Arial', px = 512 } = {}) {
  const cv = document.createElement('canvas'); cv.width = px; cv.height = Math.round(px * h / w);
  const c = cv.getContext('2d'); c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height);
  c.fillStyle = fg; c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, cv.width / 2, cv.height / 2);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5 }));
}

// Walkman TPS-L2 (Sony 1979, Ibuka y Morita): 133,5 × 88,5 × 29 mm; cuerpo azul, frente plateado con la tapa
// del casete, teclas de piano arriba, botón naranja "hotline"; auriculares MDR-3L2 con almohadillas naranjas.
export function buildWalkman() {
  const g = new THREE.Group(), AZUL = 0x2c5aa8, PLATA = 0xc9ccd1;
  g.add(at(part(rbox(0.6, 0.4, 0.13, 0.025, 4), AZUL), 0, 0.2, 0));
  g.add(at(part(rbox(0.56, 0.3, 0.012, 0.012), PLATA, 'chrome'), 0, 0.175, 0.066));
  const win = new THREE.Mesh(rbox(0.34, 0.15, 0.008, 0.012), new THREE.MeshPhysicalMaterial({ color: 0x3a4652, roughness: 0.05, transparent: true, opacity: 0.55, clearcoat: 1 }));
  win.position.set(-0.04, 0.18, 0.075); g.add(win);
  g.add(at(part(rbox(0.3, 0.13, 0.01, 0.006), 0xeeeeea, 'matte', { outline: false }), -0.04, 0.18, 0.068));   // casete adentro
  const reels = [];
  for (const x of [-0.12, 0.04]) {
    const r = new THREE.Group(); r.position.set(x, 0.18, 0.074); g.add(r); reels.push(r);
    r.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 24), mat(0x3a2a20, 'matte')), 0, 0, 0, Math.PI / 2));
    r.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 6), mat(BLANCO, 'matte')), 0, 0, 0.002, Math.PI / 2));
  }
  const lb = label('WALKMAN', 0.2, 0.04, { fg: '#1f3f80' }); lb.position.set(0.17, 0.3, 0.0725); g.add(lb);
  for (let i = 0; i < 5; i++) g.add(at(part(rbox(0.075, 0.03, 0.08, 0.008), PLATA, 'chrome'), -0.2 + i * 0.085, 0.41, 0.01));
  g.add(at(part(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 20), 0xf08a24), 0.25, 0.41, 0.02));
  for (const x of [-0.31, -0.31]) g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12), mat(NEGRO, 'matte')), x, 0.12, 0.03, 0, 0, Math.PI / 2));
  // auriculares MDR-3L2
  g.add(tube([V(0.36, 0.42, 0), V(0.4, 0.66, 0), V(0.53, 0.76, 0), V(0.66, 0.66, 0), V(0.7, 0.42, 0)], 0.007, 0xd7dadc, 'chrome'));
  for (const x of [0.36, 0.7]) {
    g.add(at(part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 24), PLATA, 'chrome'), x, 0.38, 0, 0, 0, Math.PI / 2));
    const pad = part(new THREE.SphereGeometry(0.05, 20, 14), 0xf08a24, 'matte'); pad.scale.set(0.55, 1, 1);
    pad.position.set(x + (x < 0.5 ? 0.03 : -0.03), 0.38, 0); g.add(pad);
  }
  g.add(tube([V(0.36, 0.34, 0), V(0.4, 0.2, 0.04), V(0.35, 0.08, 0.06), V(0.3, 0.12, 0.04)], 0.004, NEGRO, 'rubber', false, false));
  return root(g, (now, t, dt) => reels.forEach((r) => (r.rotation.z -= 4 * dt * smooth(0.6, 1, t))));
}

// iMac G3 (Apple 1998, Jonathan Ive): todo en uno con CRT de 15", carcasa traslúcida Bondi Blue y frente "hielo",
// manija arriba atrás, parlantes debajo de la pantalla; teclado y mouse "puck" redondos.
export function buildIMac() {
  const g = new THREE.Group();
  const BONDI = new THREE.MeshPhysicalMaterial({ color: 0x1590a8, roughness: 0.12, transparent: true, opacity: 0.8, clearcoat: 1, side: THREE.DoubleSide });
  const ICE = new THREE.MeshPhysicalMaterial({ color: 0xeef3f4, roughness: 0.2, transparent: true, opacity: 0.95, clearcoat: 1 });
  // carcasa: 38 × 40 × 44 cm. Loft de adelante (x=0.22) hacia atrás, luego se gira para que el frente mire a +z
  const shellGeo = loftGeo({
    x0: -0.24, x1: 0.2, p: 0.5, N: 60, M: 64,
    top: [[-0.24, 0.26], [-0.18, 0.34], [-0.05, 0.41], [0.1, 0.44], [0.2, 0.44]],
    bot: [[-0.24, 0.26], [-0.18, 0.15], [0.0, 0.07], [0.2, 0.05]],
    wid: [[-0.24, 0.04], [-0.18, 0.11], [-0.05, 0.17], [0.1, 0.19], [0.2, 0.19]],
  });
  const shell = new THREE.Mesh(shellGeo, BONDI); const sh = new THREE.Group(); sh.add(shell);
  const ol = part(shellGeo, 0, 'matte').children[1]; sh.add(ol);
  sh.rotation.y = -Math.PI / 2; g.add(sh);
  // frente "hielo", pantalla y franja de parlantes
  const front = new THREE.Mesh(rbox(0.38, 0.4, 0.03, 0.06, 4), ICE); front.position.set(0, 0.245, 0.2); g.add(front);
  const scrMat = new THREE.MeshPhysicalMaterial({ color: 0x14202a, emissive: 0x4aa8d0, emissiveIntensity: 0.04, roughness: 0.06, clearcoat: 1 });
  const scr = new THREE.Mesh(rbox(0.28, 0.21, 0.02, 0.025), scrMat); scr.position.set(0, 0.295, 0.212); g.add(scr);
  const band = new THREE.Mesh(rbox(0.34, 0.075, 0.015, 0.03), BONDI); band.position.set(0, 0.115, 0.218); g.add(band);
  for (const s2 of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.026, 24), mat(0x0d5566, 'matte')), s2 * 0.12, 0.115, 0.227));
  g.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), mat(0x9aa3a8, 'chrome')), 0, 0.115, 0.227));
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 10, 28, Math.PI), BONDI), 0, 0.41, -0.13));
  g.add(at(new THREE.Mesh(rbox(0.2, 0.05, 0.16, 0.02), BONDI), 0, 0.025, 0.02));
  // teclado y mouse "puck"
  const kb = new THREE.Mesh(rbox(0.42, 0.025, 0.15, 0.02), BONDI); kb.position.set(0, 0.012, 0.42); g.add(kb);
  g.add(at(part(rbox(0.38, 0.012, 0.11, 0.008), 0xe3e8ea, 'matte'), 0, 0.03, 0.42));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.025, 32), BONDI), 0.3, 0.012, 0.42));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 24), ICE), 0.3, 0.027, 0.42));
  return root(g, (now, t) => { scrMat.emissiveIntensity = 0.04 + 0.6 * smooth(0.6, 1.4, t); });
}

// Game Boy Advance (Nintendo 2001): apaisada, 144,5 × 82 × 24,5 mm, color índigo; pantalla al centro,
// cruz a la izquierda, A y B a la derecha, Start/Select abajo a la izquierda, gatillos L y R arriba.
export function buildGBA() {
  const g = new THREE.Group(), VI = 0x4b3192;
  const body = part(deform(rbox(0.8, 0.44, 0.13, 0.06, 6), (v) => {
    const k = Math.abs(v.x) / 0.4;
    if (v.y < 0) v.y *= 1 + 0.18 * smooth(0.45, 0.95, k) - 0.1 * (1 - smooth(0.2, 0.6, k));   // agarres abultados abajo
  }), VI);
  body.position.y = 0.26; g.add(body);
  g.add(at(new THREE.Mesh(rbox(0.38, 0.27, 0.01, 0.03), glassMat(0x24242a)), 0, 0.28, 0.066));
  const scrMat = new THREE.MeshPhysicalMaterial({ color: 0x9aa58a, emissive: 0xa9c08e, emissiveIntensity: 0.04, roughness: 0.4 });
  g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.175), scrMat), 0, 0.28, 0.072));
  const gb = label('GAME BOY ADVANCE', 0.2, 0.025, { fg: '#ddd', font: 'bold 40px Helvetica' }); gb.position.set(0, 0.17, 0.0715); g.add(gb);
  g.add(at(part(rbox(0.1, 0.032, 0.02, 0.006), 0x2a2a2e, 'matte'), -0.29, 0.29, 0.07));
  g.add(at(part(rbox(0.032, 0.1, 0.02, 0.006), 0x2a2a2e, 'matte'), -0.29, 0.29, 0.07));
  g.add(at(part(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 24), 0xc9c6d6), 0.33, 0.32, 0.068, Math.PI / 2));   // A
  g.add(at(part(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 24), 0xc9c6d6), 0.25, 0.27, 0.068, Math.PI / 2));   // B
  for (const y of [0.16, 0.12]) g.add(at(part(new THREE.CylinderGeometry(0.011, 0.011, 0.016, 14), 0x2a2a2e, 'matte'), -0.27, y, 0.066, Math.PI / 2));
  for (let i = 0; i < 6; i++) g.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.006, 10), mat(0x1c1440, 'matte')), 0.27 + (i % 3) * 0.022, 0.13 + Math.floor(i / 3) * 0.022, 0.0665));
  g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), mat(0x6ad04a, 'glow')), -0.2, 0.36, 0.066));
  for (const s of [-1, 1]) g.add(at(part(rbox(0.18, 0.04, 0.09, 0.018), 0x5c45a8), s * 0.3, 0.48, -0.015));
  return root(g, (now, t) => { scrMat.emissiveIntensity = 0.04 + 0.45 * smooth(0.6, 1.2, t) * (0.92 + 0.08 * Math.sin(now / 90)); });
}

// Magiclick (Hugo Kogan para Aurora, 1968): encendedor piezoeléctrico de cocina; mango de ABS con el gatillo
// y caño largo de acero inoxidable con la boquilla. Al apretar, chispa.
export function buildMagiclick() {
  const g = new THREE.Group();
  const handle = part(deform(new THREE.CapsuleGeometry(0.045, 0.36, 8, 24), (v) => { v.z *= 0.75; }), 0x1c1c1e, 'paint');
  handle.position.y = 0.24; g.add(handle);
  g.add(at(part(new THREE.CylinderGeometry(0.03, 0.04, 0.05, 24), 0x1c1c1e, 'paint'), 0, 0.47, 0));
  g.add(at(part(new THREE.CylinderGeometry(0.016, 0.022, 0.5, 24), 0xd7dadc, 'chrome'), 0, 0.74, 0));
  g.add(at(part(new THREE.CylinderGeometry(0.02, 0.016, 0.04, 20), 0xd7dadc, 'chrome'), 0, 1.0, 0));
  for (let i = 0; i < 3; i++) g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.047, 0.004, 6, 24), mat(0x3a3a3c, 'matte')), 0, 0.1 + i * 0.03, 0, Math.PI / 2));
  const btn = part(rbox(0.035, 0.11, 0.03, 0.012), 0xd23a3a); btn.position.set(0, 0.33, 0.035); g.add(btn);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0, toneMapped: false }));
  spark.position.y = 1.04; g.add(spark);
  const light = new THREE.PointLight(0x9fd8ff, 0, 0.8); light.position.y = 1.04; g.add(light);
  return root(g, (now, t) => {
    const ph = (t % 2.2) / 2.2, press = ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) : 0;
    btn.position.z = 0.035 - 0.015 * press;
    const k = ph > 0.06 && ph < 0.16 ? 1 - Math.abs(ph - 0.11) / 0.05 : 0;
    spark.material.opacity = k; spark.scale.setScalar(0.6 + k); light.intensity = 2 * k;
  });
}

// Motocompo (Honda 1981): 1185 × 535 × 240 mm plegada, entra en el baúl del Honda City; manubrio y asiento
// se despliegan de la caja; ruedas de 8" metidas abajo.
export function buildMotocompo() {
  const g = new THREE.Group(), R = 0xd23a2e;
  const L = 1.0, H = 0.45, W = 0.2;
  g.add(at(part(deform(rbox(L, H, W, 0.04, 4), (v) => { if (v.y > 0 && v.x > 0.3) v.y -= (v.x - 0.3) * 0.25; }), R), 0, 0.075 + H / 2, 0));
  g.add(at(part(rbox(L * 0.98, 0.08, W + 0.004, 0.02), 0x2a2a2a, 'matte'), 0, 0.12, 0));
  const lb = label('HONDA', 0.18, 0.05, { fg: '#ffffff' });
  for (const s of [-1, 1]) { const m = lb.clone(); m.position.set(-0.15, 0.35, s * (W / 2 + 0.002)); m.rotation.y = s < 0 ? Math.PI : 0; g.add(m); }
  g.add(at(part(rbox(0.012, 0.05, 0.1, 0.008), 0xfff1b8, 'glow'), L / 2 + 0.003, 0.36, 0));
  g.add(at(part(rbox(0.012, 0.04, 0.08, 0.008), 0xe2402e, 'glow'), -L / 2 - 0.003, 0.38, 0));
  const ws = [];
  for (const x of [-0.36, 0.36]) { const w = rimWheel(0.085, 0.06); w.position.set(x, 0.085, 0); g.add(w); ws.push(w); }
  const bar = new THREE.Group(); bar.position.set(0.36, 0.5, 0); g.add(bar);
  bar.add(at(cyl(0.015, 0.42, 0xd7dadc, 'chrome', 12), 0, 0.21, 0));
  bar.add(at(cyl(0.013, 0.36, NEGRO, 'rubber', 12), 0, 0.42, 0, Math.PI / 2));
  const seat = new THREE.Group(); seat.position.set(-0.3, 0.52, 0); g.add(seat);
  seat.add(at(cyl(0.015, 0.22, 0xd7dadc, 'chrome', 12), 0, 0.11, 0));
  seat.add(at(part(rbox(0.2, 0.045, 0.14, 0.02), NEGRO, 'matte'), 0, 0.23, 0));
  return root(g, (now, t, dt) => {
    const k = smooth(0.6, 1.5, t);
    bar.scale.y = 0.05 + 0.95 * k; seat.scale.y = 0.05 + 0.95 * smooth(1.0, 1.8, t); bar.rotation.z = 0.18 * k;
    ws.forEach((w) => (w.rotation.z -= 3 * dt * smooth(1.8, 2.2, t)));
  });
}

// Fábrica Militar de Aviones (Córdoba, 1927): naves con techo de diente de sierra y, volando arriba,
// un Avro 504 (biplano que la FMA fabricó bajo licencia en sus primeros años).
export function buildFMA() {
  const g = new THREE.Group(), GR = 0x8e969d;
  g.add(at(part(rbox(1.0, 0.36, 0.5, 0.01), GR, 'matte'), 0, 0.18, 0));
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.25, 0); s.lineTo(0, 0.14); s.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false }); geo.translate(0, 0, -0.25);
    g.add(at(part(geo, 0x6f777e, 'matte'), -0.5 + i * 0.25, 0.36, 0));
    g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.12), glassMat(0x6d8fa3)), -0.5 + i * 0.25 - 0.003, 0.425, 0, 0, -Math.PI / 2, 0));
  }
  for (let i = 0; i < 5; i++) g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.1), mat(0x24303a, 'matte')), -0.38 + i * 0.19, 0.22, 0.252));
  g.add(at(part(rbox(0.22, 0.24, 0.02, 0.005), 0x5a2d22, 'matte'), 0.0, 0.12, 0.25));
  const lb = label('F. M. A.', 0.3, 0.05, { fg: '#20262b' }); lb.position.set(0, 0.32, 0.252); g.add(lb);
  g.add(at(cyl(0.04, 0.42, 0x6f777e, 'matte', 16), 0.4, 0.56, -0.15));
  // Avro 504
  const P = 0xc9c2a8, plane = new THREE.Group(), orbit = new THREE.Group(); orbit.position.set(0, 0.88, 0); orbit.add(plane); g.add(orbit);
  plane.position.set(0.48, 0, 0); plane.rotation.y = Math.PI / 2; plane.scale.setScalar(0.85);
  plane.add(at(part(deform(rbox(0.36, 0.06, 0.06, 0.02), (v) => { if (v.x < 0) { const k = -v.x / 0.18; v.y *= 1 - 0.5 * k; v.z *= 1 - 0.6 * k; } }), P), 0, 0, 0));
  plane.add(at(part(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 20), 0x8a8f94, 'chrome'), 0.19, 0, 0, 0, 0, Math.PI / 2));   // motor rotativo
  for (const y of [-0.035, 0.07]) plane.add(at(part(rbox(0.08, 0.008, 0.5, 0.004), P), 0.04, y, 0));                     // alas
  for (const z of [-0.18, 0.18, -0.07, 0.07]) plane.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.105, 6), mat(OSCURO, 'matte')), 0.04, 0.018, z));
  plane.add(at(part(rbox(0.05, 0.006, 0.17, 0.003), P), -0.17, 0.0, 0));
  plane.add(at(part(rbox(0.05, 0.06, 0.006, 0.003), P), -0.17, 0.03, 0));
  for (const z of [-0.05, 0.05]) { plane.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.06, 6), mat(OSCURO, 'matte')), 0.06, -0.06, z));
    plane.add(at(part(new THREE.CylinderGeometry(0.018, 0.018, 0.008, 16), NEGRO, 'rubber'), 0.06, -0.09, z, Math.PI / 2)); }
  const prop = new THREE.Group(); prop.position.set(0.215, 0, 0); plane.add(prop);
  prop.add(part(rbox(0.006, 0.17, 0.018, 0.003), 0x7a4a22, 'wood'));
  return root(g, (now, t, dt) => { orbit.rotation.y -= 0.8 * dt; prop.rotation.x += 30 * dt; plane.position.y = 0.025 * Math.sin(now / 400); plane.rotation.x = -0.25; });
}

// Molinos Minetti (Córdoba, 1917–18): batería de silos de hormigón y torre de elevación (el "molino").
export function buildMolino() {
  const g = new THREE.Group(), HORM = 0xd8c3a0;
  for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
    const x = -0.42 + i * 0.17, z = -0.08 + r * 0.17;
    g.add(at(cyl(0.085, 0.72, HORM, 'matte', 40), x, 0.36, z));
  }
  g.add(at(part(rbox(0.72, 0.09, 0.36, 0.01), 0xc8b08a, 'matte'), -0.165, 0.765, 0));                      // galería superior
  for (let i = 0; i < 6; i++) g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.04), mat(0x2b3440, 'matte')), -0.45 + i * 0.115, 0.765, 0.182));
  const tower = part(rbox(0.26, 1.02, 0.34, 0.01), 0xcfb48a, 'matte'); tower.position.set(0.38, 0.51, 0); g.add(tower);
  for (let j = 0; j < 5; j++) for (const x of [0.33, 0.43]) {
    g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.08), mat(0x2b3440, 'matte')), x, 0.16 + j * 0.17, 0.172));
    g.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.0225, 16, 0, Math.PI), mat(0x2b3440, 'matte')), x, 0.2 + j * 0.17, 0.172));
  }
  g.add(at(part(rbox(0.3, 0.05, 0.38, 0.01), 0x8f3b2a, 'matte'), 0.38, 1.045, 0));
  g.add(at(part(rbox(0.12, 0.12, 0.12, 0.01), 0xcfb48a, 'matte'), 0.38, 1.13, 0));
  const lb = label('MINETTI', 0.22, 0.05, { fg: '#5a2d22' }); lb.position.set(0.38, 0.97, 0.172); g.add(lb);
  return root(g);
}

// Crystal Palace (Joseph Paxton, Londres 1851): nave de hierro y vidrio prefabricados en tres escalones
// y un crucero central con bóveda de cañón más alta.
export function buildCrystal() {
  const g = new THREE.Group();
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
  c.fillStyle = 'rgba(150,205,230,0.5)'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#1f4f6a'; c.lineWidth = 5;
  for (let i = 0; i <= 128; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(128, i); c.stroke(); }
  c.lineWidth = 2; for (let i = 16; i < 128; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); }
  const tx = (rx, ry) => { const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.encoding = THREE.sRGBEncoding; return t; };
  const gl = (rx, ry) => new THREE.MeshStandardMaterial({ map: tx(rx, ry), transparent: true, roughness: 0.15, metalness: 0.3, side: THREE.DoubleSide, depthWrite: false });
  const edges = (m) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: 0x163a50 })); e.position.copy(m.position); e.rotation.copy(m.rotation); g.add(e); };
  const box = (w, h, d, y, rx, ry) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), gl(rx, ry)); m.position.y = y; g.add(m); edges(m); };
  box(1.3, 0.16, 0.42, 0.08, 16, 2);          // planta baja
  box(1.3, 0.12, 0.28, 0.22, 16, 2);          // segundo escalón
  box(1.3, 0.1, 0.14, 0.33, 16, 1);           // tercero
  const vault = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.3, 24, 1, true, 0, Math.PI), gl(16, 2));
  vault.rotation.set(0, 0, Math.PI / 2); vault.position.y = 0.38; g.add(vault);
  box(0.26, 0.5, 0.62, 0.25, 3, 6);           // crucero
  const tv = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.62, 32, 1, true, 0, Math.PI), gl(6, 4));
  tv.rotation.set(Math.PI / 2, Math.PI / 2, 0); tv.position.y = 0.5; g.add(tv);
  g.add(at(part(rbox(1.36, 0.02, 0.7, 0.008), 0xd9d6cc, 'matte'), 0, 0.01, 0));
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6), mat(OSCURO, 'matte')), 0, 0.69, 0));
  return root(g);
}

// Máquina de vapor de James Watt (1769–1788): balancín sobre columnas, cilindro con condensador separado
// y paralelogramo de Watt, biela con engranaje "sol y planeta", volante de inercia y regulador centrífugo.
export function buildWatt() {
  const g = new THREE.Group(), VERDE = 0x3f7a5c, HIERRO = 0x3a3d40, MAD = 0x7a4a2e;
  g.add(at(part(rbox(1.1, 0.06, 0.4, 0.01), 0x9a8f80, 'matte'), 0, 0.03, 0));                        // bancada de piedra
  // cilindro y condensador
  g.add(at(part(new THREE.CylinderGeometry(0.1, 0.1, 0.42, 32), VERDE), -0.36, 0.27, 0));
  for (const y of [0.07, 0.48]) g.add(at(part(new THREE.CylinderGeometry(0.115, 0.115, 0.03, 32), VERDE), -0.36, y, 0));
  g.add(at(part(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 20), HIERRO, 'chrome'), -0.2, 0.16, 0.08));
  g.add(tube([V(-0.27, 0.12, 0.05), V(-0.22, 0.12, 0.08)], 0.015, HIERRO, 'chrome'));
  // columnas y entablamento del balancín
  for (const z of [-0.12, 0.12]) g.add(at(part(rbox(0.06, 0.78, 0.06, 0.01), VERDE), 0, 0.42, z));
  g.add(at(part(rbox(0.12, 0.05, 0.32, 0.01), VERDE), 0, 0.83, 0));
  const beam = new THREE.Group(); beam.position.set(0, 0.88, 0); g.add(beam);
  beam.add(part(deform(rbox(0.9, 0.08, 0.06, 0.01, 2), (v) => { v.y *= 1 - 0.5 * Math.abs(v.x) / 0.45; }), MAD, 'wood'));
  beam.add(at(part(new THREE.CylinderGeometry(0.025, 0.025, 0.34, 16), HIERRO, 'chrome'), 0, 0, 0, Math.PI / 2));
  // vástago del pistón (con el paralelogramo simplificado) y biela
  const rod = part(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 10), 0xc0c4c8, 'chrome'); g.add(rod);
  const link = part(rbox(0.12, 0.012, 0.012, 0.004), HIERRO, 'chrome'); g.add(link);
  const conrod = part(new THREE.CylinderGeometry(0.014, 0.014, 0.6, 10), HIERRO, 'chrome'); g.add(conrod);
  // volante de inercia con rayos y "sol y planeta"
  const fly = new THREE.Group(); fly.position.set(0.42, 0.36, -0.1); g.add(fly);
  fly.add(part(new THREE.TorusGeometry(0.28, 0.025, 10, 48), HIERRO, 'chrome'));
  for (let i = 0; i < 6; i++) fly.add(at(part(rbox(0.56, 0.02, 0.02, 0.005), HIERRO, 'chrome'), 0, 0, 0, 0, 0, i * Math.PI / 6));
  fly.add(at(part(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 20), VERDE), 0, 0, 0, Math.PI / 2));
  g.add(at(part(rbox(0.06, 0.36, 0.06, 0.01), VERDE), 0.42, 0.18, -0.2));
  const planet = part(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), 0xb08d57, 'chrome'); g.add(planet);
  // regulador centrífugo
  const gov = new THREE.Group(); gov.position.set(0.2, 0.5, 0.1); g.add(gov);
  gov.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8), mat(0xb08d57, 'chrome')), 0, 0, 0));
  const arms = [];
  for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.y = 0.13; gov.add(a); arms.push([a, s]);
    a.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.12, 6), mat(0xb08d57, 'chrome')), 0, -0.06, 0));
    a.add(at(part(new THREE.SphereGeometry(0.025, 16, 12), 0xb08d57, 'chrome'), 0, -0.12, 0)); }
  g.add(at(cyl(0.012, 0.36, 0x9a8f80, 'matte', 10), 0.2, 0.18, 0.1));
  const ARM = 0.42, CRANK = 0.13;
  return root(g, (now, t, dt) => {
    const w = now / 1000 * 2.4, a = 0.16 * Math.sin(w);
    beam.rotation.z = a;
    const L = V(-0.36, 0, 0).applyAxisAngle(V(0, 0, 1), a).add(beam.position), R = V(ARM, 0, 0).applyAxisAngle(V(0, 0, 1), a).add(beam.position);
    rod.position.set(-0.36, (L.y + 0.48) / 2, 0); rod.scale.y = Math.max(0.05, (L.y - 0.48) / 0.4);
    link.position.set(L.x + 0.03, L.y, 0.04);
    fly.rotation.z = -w;
    const pl = V(fly.position.x + Math.cos(-w + Math.PI / 2) * CRANK, fly.position.y + Math.sin(-w + Math.PI / 2) * CRANK, 0.0);
    planet.position.copy(pl); planet.rotation.x = Math.PI / 2;
    const mid = R.clone().add(pl).multiplyScalar(0.5), dir = pl.clone().sub(R);
    conrod.position.copy(mid); conrod.scale.y = dir.length() / 0.6; conrod.quaternion.setFromUnitVectors(V(0, 1, 0), dir.normalize());
    gov.rotation.y += 5 * dt; arms.forEach(([arm, s]) => (arm.rotation.z = s * (0.5 + 0.15 * Math.sin(now / 900))));
  });
}
