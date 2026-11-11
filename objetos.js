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

// =================== V3: autos, Motocompo y mesa de Ródchenko hechos sobre fotos de referencia ===================

const fnOrCurve = (v) => (typeof v === 'function' ? v : curveFn(v));
// arcos de rueda: la línea inferior de la carrocería sube en semicírculo sobre cada rueda
function archedBottom(rocker, wheels, R) {
  const base = fnOrCurve(rocker);
  return (x) => {
    let y = base(x);
    for (const wx of wheels.x) {
      const d = x - wx;
      if (Math.abs(d) < R) y = Math.max(y, wheels.y + Math.sqrt(R * R - d * d));
    }
    return y;
  };
}
// loft v3: acepta funciones, "tumble" (la cabina se angosta arriba de la cintura) y más resolución
function loft3({ x0, x1, top, bot, wid, p = 0.4, N = 220, M = 120, belt = 1, tumble = 0 }) {
  const T = fnOrCurve(top), B = fnOrCurve(bot), W = fnOrCurve(wid);
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const x = x0 + (x1 - x0) * i / N;
    const yt = T(x), yb = B(x), yc = (yt + yb) / 2, ry = Math.max(0.0005, (yt - yb) / 2);
    const rz = (i === 0 || i === N) ? 0.0001 : W(x);
    for (let j = 0; j < M; j++) {
      const a = (j / M) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      const y = yc + ry * Math.sign(s) * Math.pow(Math.abs(s), p);
      const k = y > belt ? 1 - tumble * Math.min(1, (y - belt) / Math.max(0.01, yt - belt)) : 1;
      pos.push(x, y, rz * k * Math.sign(c) * Math.pow(Math.abs(c), p));
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * M + j, b = i * M + (j + 1) % M, c = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M;
    idx.push(a, c, b, b, c, d);
  }
  const n0 = pos.length / 3; pos.push(x0, (T(x0) + B(x0)) / 2, 0);
  const n1 = pos.length / 3; pos.push(x1, (T(x1) + B(x1)) / 2, 0);
  for (let j = 0; j < M; j++) { idx.push(n0, j, (j + 1) % M); idx.push(n1, N * M + (j + 1) % M, N * M + j); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}
// pintura con: ventanillas (por píxel), juntas de puertas/capot (líneas finas) y pasaruedas oscuros
function paint3(color, { win, seams = [], hseams = [], shade = null } = {}) {
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.75 });
  const f = (v) => (+v).toFixed(4);
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = 'varying vec3 vObj;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;');
    let code = 'float gw = 0.0; float seam = 0.0;\n';
    if (win) {
      code += `float inX = smoothstep(${f(win.xa)}, ${f(win.xa + 0.004)}, vObj.x) * (1.0 - smoothstep(${f(win.xb - 0.004)}, ${f(win.xb)}, vObj.x));
        float inY = smoothstep(${f(win.belt)}, ${f(win.belt + 0.003)}, vObj.y) * (1.0 - smoothstep(${f(win.top - 0.003)}, ${f(win.top)}, vObj.y));
        float pil = 0.0;\n`;
      for (const [a, b] of win.pillars || []) code += `pil = max(pil, smoothstep(${f(a - 0.003)}, ${f(a)}, vObj.x) * (1.0 - smoothstep(${f(b)}, ${f(b + 0.003)}, vObj.x)));\n`;
      code += 'gw = inX * inY * (1.0 - pil);\n';
    }
    for (const s of seams) code += `seam = max(seam, (1.0 - smoothstep(0.0012, 0.0024, abs(vObj.x - (${f(s.x)})))) * step(${f(s.y0)}, vObj.y) * step(vObj.y, ${f(s.y1)}) * step(${f(s.zmin || 0.05)}, abs(vObj.z)));\n`;
    for (const s of hseams) code += `seam = max(seam, (1.0 - smoothstep(0.0012, 0.0024, abs(vObj.y - (${f(s.y)})))) * step(${f(s.x0)}, vObj.x) * step(vObj.x, ${f(s.x1)}) * step(${f(s.zmin || 0.05)}, abs(vObj.z)));\n`;
    code += 'diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.25, seam * 0.85);\n';
    code += 'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.010, 0.016, 0.022), gw);\n';
    if (shade) code += `diffuseColor.rgb *= mix(1.0, 0.25, step(vObj.y, ${f(shade)}) * step(abs(vObj.z), 1.0));\n`;
    sh.fragmentShader = 'varying vec3 vObj;\nfloat gwG;\n' + sh.fragmentShader
      .replace('#include <color_fragment>', '#include <color_fragment>\n{\n' + code + 'gwG = gw;\n}')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.02, gwG);');
  };
  m.customProgramCacheKey = () => 'p3' + JSON.stringify([win, seams, hseams, shade]);
  return m;
}
function body3(geo, mat3) { const g = part(geo, 0xffffff, 'paint'); g.children[0].material = mat3; return g; }

const CROMO = 0xe4e7ea;
function chromeMat() { return new THREE.MeshPhysicalMaterial({ color: 0xf0f2f4, metalness: 1, roughness: 0.12, envMapIntensity: 1.2 }); }
function rubberMat() { return new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.85 }); }
// neumático con perfil real (lathe), opcional banda blanca, y taza cromada
function tire3({ r = 0.09, w = 0.06, white = false, cap = 'dome', capColor = CROMO, rimColor = 0x2b2b2b } = {}) {
  const g = new THREE.Group();
  const prof = [];
  const rin = r * 0.62;
  for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + Math.PI * i / 16; prof.push(new THREE.Vector2(r - w * 0.18 + Math.cos(a) * w * 0.18 * 1.0, Math.sin(a) * w / 2)); }
  prof.unshift(new THREE.Vector2(rin, -w * 0.45)); prof.push(new THREE.Vector2(rin, w * 0.45));
  const tg = new THREE.LatheGeometry(prof, 48); tg.rotateX(Math.PI / 2);
  const tire = new THREE.Mesh(tg, rubberMat()); g.add(tire);
  const ol = part(tg, 0, 'matte').children[1]; g.add(ol);
  if (white) { const wr = new THREE.Mesh(new THREE.RingGeometry(rin * 1.04, r * 0.84, 48), new THREE.MeshStandardMaterial({ color: 0xf1efe8, roughness: 0.6 })); wr.position.z = w * 0.5 + 0.0015; g.add(wr); }
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(rin, rin, w * 0.85, 40), new THREE.MeshStandardMaterial({ color: rimColor, metalness: 0.2, roughness: 0.45 }));
  rim.rotation.x = Math.PI / 2; g.add(rim);
  const capG = cap === 'dome' ? new THREE.SphereGeometry(rin * 0.62, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.4) : new THREE.CylinderGeometry(rin * 0.95, rin * 0.98, 0.01, 40);
  const c = new THREE.Mesh(capG, cap === 'dome' ? chromeMat() : new THREE.MeshStandardMaterial({ color: capColor, metalness: 0.6, roughness: 0.3 }));
  if (cap === 'dome') { c.rotation.x = Math.PI / 2; c.position.z = w * 0.42 - rin * 0.62 * Math.cos(Math.PI * 0.4); }
  else { c.rotation.x = Math.PI / 2; c.position.z = w * 0.44; }
  g.add(c);
  for (let i = 0; i < 4; i++) {
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 6), new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.3 }));
    n.rotation.x = Math.PI / 2; n.position.set(Math.cos(i * Math.PI / 2) * rin * 0.35, Math.sin(i * Math.PI / 2) * rin * 0.35, w * 0.47 + 0.002); g.add(n);
  }
  return g;
}
function mountWheels(g, xs, y, z, opts) {
  const ws = [];
  for (const x of xs) for (const s of [-1, 1]) {
    const w = tire3(opts); w.position.set(x, y, s * z); if (s < 0) w.rotation.y = Math.PI; g.add(w); ws.push(w);
  }
  return ws;
}
const spin3 = (ws, r) => (now, t, dt) => ws.forEach((w) => (w.rotation.z += (w.rotation.y ? 1 : -1) * dt * 0.45 / r));
// faro redondo: aro cromado + lente con brillo
function roundLamp(g, x, y, z, r, { rotY = 0, color = 0xfff6d8, lens = true } = {}) {
  const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = rotY; g.add(grp);
  grp.add(at(new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.14, 12, 40), chromeMat()), 0, 0, 0, 0, Math.PI / 2));
  const l = new THREE.Mesh(new THREE.SphereGeometry(r * 0.95, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.28), new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: 0.25, roughness: 0.05, clearcoat: 1, transmission: 0 }));
  l.rotation.z = -Math.PI / 2; l.position.x = -r * 0.95 * Math.cos(Math.PI * 0.28) + 0.004; grp.add(l);
  return grp;
}
// paragolpes cromado que sigue la planta del auto
function bumper3(g, pts, r = 0.012) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => V(x, y, z)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(c, 64, r, 12, false), chromeMat()); g.add(m);
  const o = part(m.geometry, 0, 'matte').children[1]; g.add(o);
  for (const end of [pts[0], pts[pts.length - 1]]) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), chromeMat()), end[0], end[1], end[2]));
}
function trim(g, pts, r = 0.0035) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => V(x, y, z)));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 80, r, 8, false), chromeMat()));
}
function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}

// ---------- Mazda R360 Coupé (1960) ----------
// 2980 × 1290 × 1290 mm, distancia entre ejes 1760, neumáticos 4.80-10. Trompa lisa sin parrilla con "MAZDA" en letras,
// faros redondos altos en las aletas, espejos sobre los guardabarros, techo burbuja, motor atrás con rejillas en la tapa.
export function buildR360() {
  const g = new THREE.Group(), K = 1 / 2.98, C = 0x9cc0e0;
  const wx = [0.5 - 0.2, 0.5 - 0.2 - 1.76 * K], wr = 0.52 / 2 * K * 1.0, wy = wr;
  const top = curveFn([[-0.5, 0.16], [-0.495, 0.24], [-0.47, 0.285], [-0.4, 0.315], [-0.33, 0.335], [-0.24, 0.395], [-0.17, 0.425], [-0.05, 0.433],
    [0.03, 0.425], [0.1, 0.37], [0.14, 0.335], [0.3, 0.318], [0.42, 0.298], [0.475, 0.265], [0.497, 0.21], [0.5, 0.16]]);
  const rocker = curveFn([[-0.5, 0.16], [-0.49, 0.1], [-0.44, 0.075], [0.44, 0.07], [0.49, 0.1], [0.5, 0.16]]);
  const bot = archedBottom(rocker, { x: wx, y: wy }, wr * 1.18);
  const wid = curveFn([[-0.5, 0.13], [-0.47, 0.19], [-0.4, 0.212], [0.0, 0.216], [0.36, 0.212], [0.45, 0.195], [0.49, 0.16], [0.5, 0.12]]);
  const geo = loft3({ x0: -0.5, x1: 0.5, top, bot, wid, p: 0.36, belt: 0.32, tumble: 0.2 });
  g.add(body3(geo, paint3(C, {
    win: { xa: -0.335, xb: 0.142, belt: 0.322, top: 0.418, pillars: [[0.105, 0.12], [-0.115, -0.1], [-0.235, -0.205]] },
    seams: [{ x: 0.12, y0: 0.09, y1: 0.322, zmin: 0.12 }, { x: -0.115, y0: 0.085, y1: 0.322, zmin: 0.12 }],
    hseams: [{ y: 0.316, x0: 0.15, x1: 0.44, zmin: 0.0 }],
  })));
  // trompa: faros altos en las aletas, cuartos de luz abajo, emblema y letras MAZDA
  for (const s of [-1, 1]) {
    // los faros salen de las aletas en una "cápsula" del color de la carrocería
    const pod = part(new THREE.CylinderGeometry(0.04, 0.043, 0.09, 32), C, 'paint'); pod.children[0].material = paint3(C);
    pod.position.set(0.455, 0.262, s * 0.145); pod.rotation.z = Math.PI / 2 - 0.05; g.add(pod);
    roundLamp(g, 0.5, 0.264, s * 0.145, 0.034);
    const pk = part(new THREE.CylinderGeometry(0.016, 0.016, 0.04, 20), C, 'paint'); pk.children[0].material = paint3(C);
    pk.position.set(0.485, 0.19, s * 0.15); pk.rotation.z = Math.PI / 2; g.add(pk);
    roundLamp(g, 0.505, 0.19, s * 0.15, 0.014, { color: 0xffc66b });
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.013, 14, 10), new THREE.MeshPhysicalMaterial({ color: 0xd52a1c, emissive: 0x8a1208, roughness: 0.1 })), -0.492, 0.235, s * 0.15));
    // espejo sobre el guardabarros
    g.add(tube([V(0.36, 0.318, s * 0.17), V(0.365, 0.35, s * 0.18)], 0.003, CROMO, 'chrome', false, false));
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 10), chromeMat()), 0.365, 0.357, s * 0.18));
    // manija de la puerta y rejillas de aire atrás
    g.add(at(new THREE.Mesh(new THREE.CapsuleGeometry(0.003, 0.025, 4, 8), chromeMat()), 0.06, 0.29, s * 0.213, 0, 0, Math.PI / 2));
    for (let i = 0; i < 5; i++) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.004, 0.004), mat(0x223040, 'matte')), -0.29, 0.255 + i * 0.012, s * 0.211));
    // limpiaparabrisas
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.003, 0.09), mat(NEGRO, 'matte')), 0.135, 0.338, s * 0.05, 0, 0, 0.6));
  }
  const name = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.022), new THREE.MeshStandardMaterial({ map: canvasTex(512, 72, (c, w, h) => {
    c.fillStyle = '#e8ecef'; c.font = 'bold 52px Helvetica'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = '30px'; c.fillText('M A Z D A', w / 2, h / 2); }), transparent: true, metalness: 0.8, roughness: 0.2 }));
  name.position.set(0.4975, 0.24, 0); name.rotation.y = Math.PI / 2; g.add(name);
  g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.004, 24), chromeMat()), 0.455, 0.29, 0, 0, 0, Math.PI / 2 - 0.5));
  // tapa del motor con rejillas
  for (let i = 0; i < 7; i++) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.003, 0.09), mat(0x223040, 'matte')), -0.36 - i * 0.012, 0.329 - i * 0.0035, 0, 0, 0, -0.3));
  bumper3(g, [[0.49, 0.13, -0.19], [0.515, 0.13, -0.12], [0.52, 0.13, 0], [0.515, 0.13, 0.12], [0.49, 0.13, 0.19]], 0.009);
  bumper3(g, [[-0.48, 0.13, -0.19], [-0.512, 0.13, -0.12], [-0.517, 0.13, 0], [-0.512, 0.13, 0.12], [-0.48, 0.13, 0.19]], 0.009);
  g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.035), new THREE.MeshStandardMaterial({ map: canvasTex(256, 90, (c, w, h) => { c.fillStyle = '#f4f1e6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1b3a6b'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#1b3a6b'; c.font = 'bold 44px Helvetica'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('R360', w / 2, h / 2 + 2); }) })), -0.513, 0.175, 0, 0, -Math.PI / 2));
  const ws = mountWheels(g, wx, wy, 0.188, { r: wr, w: 0.05, white: true, cap: 'dome', rimColor: C });
  return root(g, spin3(ws, wr));
}

// ---------- Renault 12 (1969) ----------
// 4348 × 1616 × 1435 mm, entre ejes 2441. Tres volúmenes con trompa recta: faros rectangulares a los lados de una parrilla
// ancha de barras horizontales con el rombo, capot con nervio central, línea de hombros marcada, baúl largo y plano.
export function buildR12() {
  const g = new THREE.Group(), K = 1.1 / 4.348, C = 0x6f7a2a;
  const fx = 0.55 - 0.86 * K, wx = [fx, fx - 2.441 * K], wr = 0.57 / 2 * K, wy = wr;
  const top = curveFn([[-0.55, 0.11], [-0.548, 0.2], [-0.54, 0.228], [-0.5, 0.236], [-0.33, 0.243], [-0.28, 0.262], [-0.2, 0.33], [-0.16, 0.352], [-0.02, 0.356],
    [0.07, 0.35], [0.14, 0.27], [0.18, 0.245], [0.42, 0.233], [0.52, 0.226], [0.546, 0.212], [0.55, 0.11]]);
  const rocker = curveFn([[-0.55, 0.11], [-0.54, 0.068], [-0.5, 0.058], [0.5, 0.058], [0.54, 0.066], [0.55, 0.11]]);
  const bot = archedBottom(rocker, { x: wx, y: wy }, wr * 1.2);
  const wid = curveFn([[-0.55, 0.17], [-0.53, 0.198], [-0.45, 0.205], [0.45, 0.205], [0.53, 0.2], [0.55, 0.175]]);
  const geo = loft3({ x0: -0.55, x1: 0.55, top, bot, wid, p: 0.22, belt: 0.24, tumble: 0.2 });
  g.add(body3(geo, paint3(C, {
    win: { xa: -0.315, xb: 0.142, belt: 0.244, top: 0.345, pillars: [[-0.072, -0.058], [-0.225, -0.17]] },
    seams: [{ x: 0.13, y0: 0.07, y1: 0.244, zmin: 0.15 }, { x: -0.065, y0: 0.07, y1: 0.244, zmin: 0.15 }, { x: -0.2, y0: 0.08, y1: 0.244, zmin: 0.15 }],
    hseams: [{ y: 0.236, x0: -0.5, x1: -0.3, zmin: 0.0 }, { y: 0.23, x0: 0.18, x1: 0.53, zmin: 0.0 }],
  })));
  // línea de hombro cromada y nervio del capot
  for (const s of [-1, 1]) trim(g, [[-0.53, 0.205, s * 0.2], [0.0, 0.205, s * 0.206], [0.53, 0.205, s * 0.2]], 0.0028);
  g.add(at(part(rbox(0.32, 0.006, 0.09, 0.003), C, 'paint'), 0.36, 0.232, 0));
  // trompa: parrilla ancha de barras horizontales + faros rectangulares + rombo
  const grille = new THREE.Group(); grille.position.set(0.551, 0.17, 0); g.add(grille);
  grille.add(at(new THREE.Mesh(rbox(0.012, 0.06, 0.34, 0.006), new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 })), 0, 0, 0));
  for (let i = 0; i < 5; i++) grille.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.0035, 0.2), chromeMat()), 0.006, -0.022 + i * 0.011, 0));
  grille.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0025, 4, 4), chromeMat()), 0.009, 0, 0, 0, Math.PI / 2));
  for (const s of [-1, 1]) {
    const hl = new THREE.Group(); hl.position.set(0.553, 0.172, s * 0.135); g.add(hl);
    hl.add(new THREE.Mesh(rbox(0.01, 0.05, 0.07, 0.008), chromeMat()));
    hl.add(at(new THREE.Mesh(rbox(0.006, 0.042, 0.062, 0.006), new THREE.MeshPhysicalMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.3, roughness: 0.05, clearcoat: 1 })), 0.004, 0, 0));
    g.add(at(new THREE.Mesh(rbox(0.008, 0.014, 0.04, 0.004), new THREE.MeshPhysicalMaterial({ color: 0xffa640, emissive: 0x8a4a10, roughness: 0.1 })), 0.548, 0.128, s * 0.16));
    // luces traseras horizontales
    const tl = new THREE.Group(); tl.position.set(-0.551, 0.17, s * 0.145); g.add(tl);
    tl.add(new THREE.Mesh(rbox(0.008, 0.04, 0.09, 0.006), chromeMat()));
    tl.add(at(new THREE.Mesh(rbox(0.006, 0.032, 0.05, 0.005), new THREE.MeshPhysicalMaterial({ color: 0xc81e1e, emissive: 0x5a0a0a, roughness: 0.1 })), -0.004, 0, -s * 0.018));
    tl.add(at(new THREE.Mesh(rbox(0.006, 0.032, 0.03, 0.005), new THREE.MeshPhysicalMaterial({ color: 0xffa640, emissive: 0x5a3008, roughness: 0.1 })), -0.004, 0, s * 0.028));
    // manijas, espejo
    for (const x of [0.05, -0.12]) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.006), chromeMat()), x, 0.226, s * 0.204));
    g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.004, 0.002, 4, 4), chromeMat()), 0.4, 0.07, s * 0.21));
  }
  g.add(at(new THREE.Mesh(rbox(0.006, 0.012, 0.06, 0.003), chromeMat()), 0.12, 0.25, 0.19));   // espejo
  bumper3(g, [[0.5, 0.115, -0.205], [0.552, 0.115, -0.17], [0.562, 0.115, 0], [0.552, 0.115, 0.17], [0.5, 0.115, 0.205]], 0.008);
  bumper3(g, [[-0.5, 0.115, -0.205], [-0.552, 0.115, -0.17], [-0.562, 0.115, 0], [-0.552, 0.115, 0.17], [-0.5, 0.115, 0.205]], 0.008);
  for (const x of [0.563, -0.563]) for (const s of [-1, 1]) g.add(at(new THREE.Mesh(rbox(0.012, 0.03, 0.02, 0.005), rubberMat()), x, 0.112, s * 0.08));
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.025), new THREE.MeshStandardMaterial({ map: canvasTex(400, 90, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#eee'; c.font = 'bold 56px Helvetica'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('X 012345', w / 2, h / 2 + 3); }) }));
  plate.position.set(-0.551, 0.14, 0); plate.rotation.y = -Math.PI / 2; g.add(plate);
  const ws = mountWheels(g, wx, wy, 0.178, { r: wr, w: 0.045, cap: 'flat', capColor: 0xcfd3d6 });
  const puffs = [];
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd9b56a, transparent: true, opacity: 0.8, roughness: 1 }));
    g.add(p); puffs.push(p);
  }
  return root(g, (now, t, dt) => {
    spin3(ws, wr)(now, t, dt);
    puffs.forEach((p, i) => {
      const ph = ((now / 1000 + i * 0.4) % 1.6) / 1.6;
      p.position.set(-0.58 - ph * 0.3, 0.08 + ph * 0.2, 0.12); p.scale.setScalar(0.5 + ph * 1.4); p.material.opacity = 0.75 * (1 - ph);
    });
  });
}

// ---------- Rastrojero (IAME, Córdoba 1952) ----------
// Pick-up con mecánica Willys: guardabarros delanteros sueltos con los faros adentro, parrilla plana de barras
// verticales entre los guardabarros, parabrisas partido en dos, cabina con techo redondeado, estribos y caja de carga.
export function buildRastrojero() {
  const g = new THREE.Group(), C = 0x5a8a3a, D = 0x2a2a2a;
  const wx = [0.33, -0.36], wr = 0.085, wy = wr;
  const pm = paint3(C), pmCab = paint3(C, { win: { xa: -0.06, xb: 0.225, belt: 0.43, top: 0.585, pillars: [[0.145, 0.16], [0.198, 0.212]] },
    seams: [{ x: 0.15, y0: 0.18, y1: 0.43, zmin: 0.15 }, { x: -0.04, y0: 0.18, y1: 0.43, zmin: 0.15 }] });
  // cabina (con parabrisas partido: el parante central se hace con una franja de pintura vertical)
  const cab = loft3({ x0: -0.08, x1: 0.24, p: 0.3, belt: 0.43, tumble: 0.12,
    top: [[-0.08, 0.22], [-0.075, 0.55], [-0.04, 0.615], [0.05, 0.63], [0.17, 0.625], [0.205, 0.59], [0.232, 0.44], [0.24, 0.3]],
    bot: [[-0.08, 0.22], [-0.075, 0.17], [0.24, 0.17]],
    wid: [[-0.08, 0.2], [-0.07, 0.215], [0.23, 0.215], [0.24, 0.205]] });
  g.add(body3(cab, pmCab));
  g.add(at(part(rbox(0.012, 0.13, 0.014, 0.004), C, 'paint'), 0.214, 0.51, 0, 0, 0, 0.26));       // parante central del parabrisas
  // capot angosto con lomo
  g.add(body3(loft3({ x0: 0.22, x1: 0.57, p: 0.35, N: 120, M: 80,
    top: [[0.22, 0.43], [0.3, 0.432], [0.5, 0.425], [0.56, 0.405], [0.57, 0.35]],
    bot: [[0.22, 0.24], [0.57, 0.24]], wid: [[0.22, 0.12], [0.5, 0.115], [0.57, 0.105]] }), paint3(C, { hseams: [{ y: 0.405, x0: 0.24, x1: 0.55, zmin: 0.0 }] })));
  // parrilla plana de barras verticales (estilo Willys) entre los guardabarros
  const gr = new THREE.Group(); gr.position.set(0.572, 0.32, 0); g.add(gr);
  gr.add(part(rbox(0.014, 0.17, 0.2, 0.01), C, 'paint'));
  for (let i = 0; i < 9; i++) gr.add(at(new THREE.Mesh(rbox(0.008, 0.13, 0.009, 0.003), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 })), 0.005, 0, -0.08 + i * 0.02));
  // guardabarros delanteros sueltos, con faro adentro
  for (const s of [-1, 1]) {
    const fend = loft3({ x0: 0.13, x1: 0.62, p: 0.62, N: 120, M: 60,
      top: [[0.13, 0.2], [0.2, 0.28], [0.3, 0.33], [0.45, 0.345], [0.56, 0.33], [0.61, 0.28], [0.62, 0.22]],
      bot: (x) => Math.max(0.2, wy + Math.sqrt(Math.max(0, (wr * 1.35) ** 2 - (x - wx[0]) ** 2)) - 0.005),
      wid: [[0.13, 0.03], [0.22, 0.065], [0.55, 0.068], [0.62, 0.05]] });
    const f = body3(fend, pm); f.position.z = s * 0.205; g.add(f);
    roundLamp(g, 0.6, 0.3, s * 0.205, 0.032);
    // estribo
    g.add(at(part(rbox(0.44, 0.012, 0.07, 0.004), D, 'matte'), -0.02, 0.17, s * 0.225));
    // espejo y manija
    g.add(tube([V(0.22, 0.45, s * 0.215), V(0.24, 0.5, s * 0.27)], 0.003, CROMO, 'chrome', false, false));
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.005, 20), chromeMat()), 0.24, 0.5, s * 0.272, Math.PI / 2));
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.006), chromeMat()), -0.02, 0.41, s * 0.217));
  }
  // caja de carga
  const caja = new THREE.Group(); caja.position.set(-0.4, 0, 0); g.add(caja);
  caja.add(at(part(rbox(0.6, 0.025, 0.42, 0.005), D, 'matte'), 0, 0.2, 0));
  for (const s of [-1, 1]) {
    caja.add(at(body3(rbox(0.6, 0.17, 0.02, 0.006), pm), 0, 0.3, s * 0.2));
    caja.add(at(part(rbox(0.6, 0.012, 0.03, 0.004), D, 'matte'), 0, 0.39, s * 0.2));
    for (const x of [-0.2, 0.0, 0.2]) caja.add(at(part(rbox(0.018, 0.17, 0.026, 0.004), D, 'matte'), x, 0.3, s * 0.2));
    // guardabarros traseros
    const rf = loft3({ x0: -0.17, x1: 0.17, p: 0.6, N: 80, M: 48,
      top: (x) => wy + Math.sqrt(Math.max(0, 0.13 ** 2 - x * x)) + 0.012, bot: (x) => wy + Math.sqrt(Math.max(0, 0.12 ** 2 - x * x)) - 0.01,
      wid: [[-0.17, 0.02], [-0.12, 0.04], [0.12, 0.04], [0.17, 0.02]] });
    const r = body3(rf, pm); r.position.set(wx[1] + 0.4, 0, s * 0.215); caja.add(r);
    caja.add(at(new THREE.Mesh(rbox(0.01, 0.03, 0.04, 0.004), new THREE.MeshPhysicalMaterial({ color: 0xc81e1e, emissive: 0x5a0a0a, roughness: 0.1 })), -0.305, 0.28, s * 0.17));
  }
  caja.add(at(body3(rbox(0.02, 0.17, 0.42, 0.006), pm), -0.3, 0.3, 0));
  caja.add(at(body3(rbox(0.02, 0.17, 0.42, 0.006), pm), 0.29, 0.3, 0));
  bumper3(g, [[0.62, 0.17, -0.25], [0.635, 0.17, 0], [0.62, 0.17, 0.25]], 0.01);
  g.add(at(part(rbox(1.15, 0.03, 0.3, 0.005), D, 'matte'), -0.04, 0.13, 0));       // chasis
  const ws = mountWheels(g, wx, wy, 0.2, { r: wr, w: 0.055, cap: 'flat', capColor: 0x2f4a24 });
  return root(g, spin3(ws, wr));
}

// ---------- IKA Estanciera (Córdoba 1957; Willys Jeep Station Wagon) ----------
// Carrocería alta de chapa con laterales planos y nervaduras, techo blanco, parrilla vertical en "V" suave con los faros
// en las esquinas, guardabarros planos tipo ala, parabrisas en dos paños, tres ventanillas por lado y portón atrás.
export function buildEstanciera() {
  const g = new THREE.Group(), C = 0xe4bf38, W = 0xf3f1ea, D = 0x2a2a2a;
  const wx = [0.33, -0.36], wr = 0.1, wy = wr;
  const pm = paint3(C), pw = paint3(W);
  // carrocería principal (loft casi cuadrado)
  const bodyGeo = loft3({ x0: -0.56, x1: 0.2, p: 0.16, belt: 0.43, tumble: 0.05, N: 200, M: 120,
    top: [[-0.56, 0.2], [-0.558, 0.56], [-0.55, 0.585], [-0.5, 0.59], [0.12, 0.59], [0.17, 0.58], [0.197, 0.44], [0.2, 0.3]],
    bot: archedBottom([[-0.56, 0.2], [-0.555, 0.14], [0.2, 0.14]], { x: wx, y: wy }, wr * 1.3),
    wid: [[-0.56, 0.19], [-0.55, 0.205], [0.19, 0.205], [0.2, 0.195]] });
  g.add(body3(bodyGeo, paint3(C, {
    win: { xa: -0.545, xb: 0.195, belt: 0.43, top: 0.565, pillars: [[-0.385, -0.37], [-0.2, -0.185], [-0.01, 0.005], [0.155, 0.17]] },
    seams: [{ x: 0.0, y0: 0.15, y1: 0.43, zmin: 0.17 }, { x: -0.19, y0: 0.15, y1: 0.43, zmin: 0.17 }],
    hseams: [{ y: 0.3, x0: -0.55, x1: 0.18, zmin: 0.19 }, { y: 0.32, x0: -0.55, x1: 0.18, zmin: 0.19 }],
  })));
  g.add(at(body3(rbox(0.77, 0.03, 0.42, 0.014), pw), -0.18, 0.595, 0));                       // techo blanco
  g.add(at(part(rbox(0.01, 0.12, 0.002, 0.002), C, 'paint'), 0.19, 0.5, 0));                    // parante central del parabrisas
  // capot y guardabarros planos
  g.add(body3(loft3({ x0: 0.18, x1: 0.56, p: 0.2, N: 100, M: 80, top: [[0.18, 0.43], [0.4, 0.425], [0.55, 0.415], [0.56, 0.38]], bot: [[0.18, 0.27], [0.56, 0.27]],
    wid: [[0.18, 0.14], [0.56, 0.13]] }), pm));
  for (const s of [-1, 1]) {
    const fend = loft3({ x0: 0.08, x1: 0.61, p: 0.16, N: 160, M: 80,
      top: [[0.08, 0.2], [0.12, 0.33], [0.2, 0.365], [0.45, 0.372], [0.585, 0.365], [0.605, 0.34], [0.61, 0.3]],
      bot: archedBottom([[0.08, 0.2], [0.1, 0.165], [0.55, 0.17], [0.61, 0.22]], { x: [wx[0]], y: wy }, wr * 1.3),
      wid: [[0.08, 0.055], [0.15, 0.065], [0.6, 0.065], [0.61, 0.05]] });
    const f = body3(fend, pm); f.position.z = s * 0.195; g.add(f);
    g.add(at(part(rbox(0.36, 0.012, 0.06, 0.004), D, 'matte'), -0.1, 0.15, s * 0.22));          // estribo
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.006), chromeMat()), 0.13, 0.42, s * 0.207));
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.006, 0.006), chromeMat()), -0.06, 0.42, s * 0.207));
  }
  // parrilla en V suave, barras verticales, faros en las esquinas
  for (const s of [-1, 1]) {
    const half = new THREE.Group(); half.position.set(0.575, 0.33, s * 0.065); half.rotation.y = -s * 0.28; g.add(half);
    half.add(body3(rbox(0.012, 0.15, 0.14, 0.006), pm));
    for (let i = 0; i < 5; i++) half.add(at(new THREE.Mesh(rbox(0.008, 0.11, 0.012, 0.003), chromeMat()), 0.006, -0.005, -0.05 + i * 0.025));
    roundLamp(g, 0.6, 0.38, s * 0.19, 0.032);
    roundLamp(g, 0.6, 0.315, s * 0.19, 0.012, { color: 0xffc66b });
    g.add(at(new THREE.Mesh(rbox(0.008, 0.035, 0.03, 0.004), new THREE.MeshPhysicalMaterial({ color: 0xc81e1e, emissive: 0x5a0a0a, roughness: 0.1 })), -0.563, 0.33, s * 0.18));
  }
  bumper3(g, [[0.58, 0.19, -0.25], [0.62, 0.19, 0], [0.58, 0.19, 0.25]], 0.012);
  bumper3(g, [[-0.55, 0.17, -0.22], [-0.575, 0.17, 0], [-0.55, 0.17, 0.22]], 0.01);
  // rueda de auxilio en el portón
  const sp = tire3({ r: wr, w: 0.06, cap: 'flat', capColor: C }); sp.position.set(-0.6, 0.38, 0.07); sp.rotation.y = -Math.PI / 2; g.add(sp);
  const ws = mountWheels(g, wx, wy, 0.21, { r: wr, w: 0.06, cap: 'flat', capColor: 0xd8d4c8 });
  return root(g, spin3(ws, wr));
}

// ---------- Motocompo (Honda 1981) ----------
// 1185 × 535 × 240 mm plegada (45 kg). Caja roja de esquinas redondeadas, franja negra con "MOTOCOMPO" en blanco,
// faldón negro con rejillas, tapa superior negra, ruedas de 8" macizas; manubrio y asiento se despliegan.
export function buildMotocompo() {
  const g = new THREE.Group(), K = 1 / 1.185, R = 0xc6231b, D = 0x1b1b1b;
  const L = 1.0, Hb = 0.4, y0 = 0.09, Wd = 0.24 * K;
  const wx = [0.355, -0.355], wr = 0.09, wy = wr;
  const bodyGeo = loft3({ x0: -0.5, x1: 0.5, p: 0.18, N: 220, M: 120,
    top: [[-0.5, 0.25], [-0.497, 0.4], [-0.485, 0.455], [-0.45, 0.475], [0.42, 0.478], [0.47, 0.465], [0.493, 0.42], [0.5, 0.28]],
    bot: archedBottom([[-0.5, 0.25], [-0.495, 0.14], [-0.47, 0.11], [0.47, 0.11], [0.495, 0.14], [0.5, 0.25]], { x: wx, y: wy }, wr * 1.22),
    wid: [[-0.5, 0.06], [-0.49, 0.095], [-0.46, 0.102], [0.46, 0.102], [0.49, 0.095], [0.5, 0.06]] });
  g.add(body3(bodyGeo, paint3(R, { hseams: [{ y: 0.4, x0: -0.48, x1: 0.48, zmin: 0.08 }] })));
  // franja negra superior con "MOTOCOMPO" y faldón negro inferior
  const band = canvasTex(1024, 64, (c, w, h) => { c.fillStyle = '#151515'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = 'italic 900 46px Helvetica'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('MOTOCOMPO', 330, h / 2 + 2); });
  for (const s of [-1, 1]) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.05), new THREE.MeshStandardMaterial({ map: band, roughness: 0.5 }));
    b.position.set(0, 0.36, s * 0.1035); if (s < 0) { b.rotation.y = Math.PI; b.scale.x = -1; b.rotation.y = Math.PI; b.scale.x = 1; } g.add(b);
    const sk = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.07), new THREE.MeshStandardMaterial({ color: D, roughness: 0.6 }));
    sk.position.set(0, 0.2, s * 0.1033); if (s < 0) sk.rotation.y = Math.PI; g.add(sk);
    for (let i = 0; i < 6; i++) g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.035, 0.003), mat(0x3a3a3a, 'matte')), -0.12 - i * 0.022, 0.2, s * 0.1045));
    // rueda: aleta negra
  }
  g.add(at(part(rbox(0.86, 0.008, 0.16, 0.004), D, 'matte'), -0.01, 0.48, 0));                 // tapa superior negra
  g.add(at(part(rbox(0.12, 0.012, 0.13, 0.004), 0x2a2a2a, 'matte'), 0.36, 0.486, 0));           // alojamiento del manubrio
  // ruedas macizas de 8"
  const ws = [];
  for (const x of wx) { const w = tire3({ r: wr, w: 0.06, cap: 'flat', capColor: 0x222222 }); w.position.set(x, wy, 0); g.add(w); ws.push(w); }
  // luz delantera y trasera
  g.add(at(new THREE.Mesh(rbox(0.008, 0.035, 0.07, 0.006), new THREE.MeshPhysicalMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.3, roughness: 0.05 })), 0.501, 0.42, 0));
  g.add(at(new THREE.Mesh(rbox(0.008, 0.03, 0.06, 0.006), new THREE.MeshPhysicalMaterial({ color: 0xc81e1e, emissive: 0x5a0a0a, roughness: 0.1 })), -0.501, 0.43, 0));
  // manubrio desplegable: caño negro, manillar, puños, faro y espejo
  const bar = new THREE.Group(); bar.position.set(0.36, 0.49, 0); g.add(bar);
  bar.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.46, 16), new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.4, metalness: 0.4 })), 0, 0.23, 0));
  bar.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.36, 14), new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.4, metalness: 0.4 })), 0, 0.46, 0, Math.PI / 2));
  for (const s of [-1, 1]) bar.add(at(part(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 16), D, 'rubber'), 0, 0.46, s * 0.15, Math.PI / 2));
  bar.add(at(part(rbox(0.05, 0.04, 0.06, 0.012), 0x222222, 'matte'), 0.02, 0.43, 0));
  bar.add(at(new THREE.Mesh(rbox(0.006, 0.026, 0.045, 0.005), new THREE.MeshPhysicalMaterial({ color: 0xfff6d8, emissive: 0xfff0c0, emissiveIntensity: 0.4 })), 0.046, 0.43, 0));
  // asiento desplegable
  const seat = new THREE.Group(); seat.position.set(-0.3, 0.49, 0); g.add(seat);
  seat.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 14), chromeMat()), 0, 0.1, 0));
  seat.add(at(part(deform(rbox(0.22, 0.05, 0.13, 0.022, 4), (v) => { if (v.y > 0) v.y += 0.01 * (1 - (v.z / 0.065) ** 2); }), 0x1b1b1b, 'leather'), 0.0, 0.215, 0));
  return root(g, (now, t, dt) => {
    const k = smooth(0.6, 1.5, t);
    bar.scale.y = 0.04 + 0.96 * k; bar.rotation.z = 0.12 * k;
    seat.scale.y = 0.04 + 0.96 * smooth(1.0, 1.8, t);
    ws.forEach((w) => (w.rotation.z -= 3 * dt * smooth(1.8, 2.2, t)));
  });
}

// ---------- Mesa de ajedrez del Club Obrero (Ródchenko, París 1925; reconstrucción Van Abbemuseum) ----------
// Dos sillones enfrentados, uno rojo y uno negro, con respaldo alto de listones verticales, apoyabrazos de bastidor
// con barrotes y base de travesaños; en el medio la mesa: soporte trapezoidal (más ancho arriba) partido en diagonal
// rojo/negro, tablero cuadrado rojo y negro que gira, y un cajón para las piezas. Piezas geométricas en bloques.
export function buildClub() {
  const g = new THREE.Group(), RO = 0xc4301c, NE = 0x141414;
  const lac = (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const box = (w, h, d, c, x, y, z, rz = 0) => { const m = part(rbox(w, h, d, 0.004, 2), c, 'paint'); m.children[0].material = lac(c); return at(m, x, y, z, 0, 0, rz); };
  // sillón: x hacia la mesa; respaldo del lado de afuera
  function sillon(c, side) {
    const s = new THREE.Group(); s.position.x = side * 0.62; s.rotation.y = side > 0 ? Math.PI : 0; g.add(s);
    const S = 0.022;                                   // sección de los listones
    const X0 = -0.22, X1 = 0.2, Z = 0.24;
    // base: rectángulo en el piso + travesaños
    for (const z of [-Z, Z]) { s.add(box(X1 - X0, S, S, c, (X0 + X1) / 2, S / 2, z)); s.add(box(X1 - X0, S, S, c, (X0 + X1) / 2, 0.16, z)); }
    for (const x of [X0, X1]) { s.add(box(S, S, 2 * Z, c, x, S / 2, 0)); s.add(box(S, S, 2 * Z, c, x, 0.16, 0)); }
    // patas
    for (const x of [X0, X1]) for (const z of [-Z, Z]) s.add(box(S, x === X0 ? 0.98 : 0.56, S, c, x, (x === X0 ? 0.98 : 0.56) / 2, z));
    // asiento
    s.add(box(X1 - X0, 0.025, 2 * Z, c, (X0 + X1) / 2, 0.42, 0));
    // apoyabrazos con barrotes
    for (const z of [-Z, Z]) {
      s.add(box(X1 - X0 + 0.03, S, S * 1.4, c, (X0 + X1) / 2 + 0.015, 0.56, z));
      for (let i = 1; i <= 3; i++) s.add(box(S * 0.8, 0.13, S * 0.8, c, X0 + (X1 - X0) * i / 4, 0.49, z));
      s.add(box(X1 - X0, S * 0.8, S * 0.8, c, (X0 + X1) / 2, 0.3, z));
    }
    // respaldo alto con listones verticales
    s.add(box(S, S, 2 * Z, c, X0, 0.98, 0)); s.add(box(S, S, 2 * Z, c, X0, 0.62, 0));
    for (let i = -2; i <= 2; i++) s.add(box(S * 0.8, 0.36, S * 0.9, c, X0, 0.8, i * 0.08));
    return s;
  }
  sillon(RO, 1); sillon(NE, -1);
  // base común: mitad roja, mitad negra
  g.add(box(0.5, 0.012, 0.5, NE, -0.3, 0.006, 0)); g.add(box(0.5, 0.012, 0.5, RO, 0.3, 0.006, 0));
  // soporte trapezoidal de la mesa (más ancho arriba), partido en diagonal rojo/negro
  const trap = (c, pts) => {
    const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(([x, y]) => sh.lineTo(x, y)); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1 }); geo.translate(0, 0, -0.15);
    const m = part(geo, c, 'paint'); m.children[0].material = lac(c); g.add(m);
  };
  trap(NE, [[-0.1, 0.0], [0.0, 0.0], [-0.04, 0.66], [-0.22, 0.66]]);
  trap(RO, [[0.0, 0.0], [0.1, 0.0], [0.22, 0.66], [-0.04, 0.66]]);
  // cajón para las piezas, del lado rojo
  g.add(box(0.1, 0.09, 0.3, RO, 0.2, 0.715, 0));
  // tablero que gira (eje horizontal): 8×8 rojo y negro
  const tex = canvasTex(256, 256, (c, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#141414' : '#c8361f'; c.fillRect(i * 32, j * 32, 32, 32); } });
  const board = new THREE.Group(); board.position.set(-0.06, 0.69, 0); g.add(board);
  board.add(box(0.33, 0.03, 0.33, NE, 0, 0, 0));
  for (const sgn of [1, -1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45 })); f.rotation.x = -sgn * Math.PI / 2; f.position.y = sgn * 0.0155; board.add(f); }
  // piezas en bloques (dos filas por color)
  const pieces = new THREE.Group(); board.add(pieces);
  const cell = 0.3 / 8;
  for (let i = 0; i < 8; i++) for (const [row, c] of [[0, NE], [1, NE], [6, RO], [7, RO]]) {
    const tall = row === 0 || row === 7 ? [0.05, 0.04, 0.045, 0.06, 0.065, 0.045, 0.04, 0.05][i] : 0.03;
    const p = new THREE.Group(); p.position.set(-0.15 + cell * (row + 0.5), 0.016, -0.15 + cell * (i + 0.5)); pieces.add(p);
    p.add(at(box(cell * 0.7, tall * 0.6, cell * 0.7, c, 0, 0, 0), 0, tall * 0.3, 0));
    p.add(at(box(cell * 0.45, tall * 0.4, cell * 0.45, c, 0, 0, 0), 0, tall * 0.8, 0));
  }
  return root(g, (now, t) => {
    // el tablero da media vuelta a los 2 s y vuelve (como el original, que pivotea)
    const ph = t % 8; const k = smooth(2, 3, ph) - smooth(6, 7, ph);
    board.rotation.x = Math.PI * k; pieces.visible = k < 0.5;
  });
}
