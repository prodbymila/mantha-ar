// Vespa 98 (Piaggio, 1946), con la estética de la capa:
// rojo de marcador, crema, gris y contorno negro de fibra.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// colores hex = colores reales en pantalla (evita el rosa lavado)
THREE.ColorManagement.legacyMode = false;

const ROJO = 0xa81c31, CREMA = 0xf1e9d6, GRIS = 0xb9b6b0, OSCURO = 0x3a3a3c, NEGRO = 0x161616;

const mats = {};
function mat(color, kind = 'paint') {
  const k = color + kind;
  if (!mats[k]) {
    mats[k] = new THREE.MeshPhysicalMaterial(
      kind === 'paint' ? { color, roughness: 0.38, metalness: 0.0, clearcoat: 0.6, clearcoatRoughness: 0.2, envMapIntensity: 0.55 }
      : kind === 'rubber' ? { color, roughness: 0.9, metalness: 0 }
      : kind === 'chrome' ? { color, roughness: 0.2, metalness: 0.9 }
      : kind === 'glow' ? { color, emissive: color, emissiveIntensity: 0.6, roughness: 0.3 }
      : { color, roughness: 0.6, metalness: 0 });
  }
  return mats[k];
}

// contorno tipo fibra negra: casco invertido empujado por la normal
const outlineMat = new THREE.ShaderMaterial({
  uniforms: { w: { value: 0.011 } },
  vertexShader: `uniform float w; void main(){ vec3 p = position + normalize(normal) * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
  fragmentShader: `void main(){ gl_FragColor = vec4(0.06,0.06,0.07,1.0); }`,
  side: THREE.BackSide,
});

function part(geo, color, kind, { outline = true } = {}) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, mat(color, kind)));
  if (outline) g.add(new THREE.Mesh(geo, outlineMat));
  return g;
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function deform(geo, fn) {
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  return geo;
}

// curva suave (Catmull-Rom) por los puntos [x, y]; devuelve y(x)
function curve(pts) {
  const c = new THREE.SplineCurve(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const S = c.getSpacedPoints(400);
  return (x) => {
    if (x <= S[0].x) return S[0].y;
    for (let i = 1; i < S.length; i++) if (x <= S[i].x) {
      const t = (x - S[i - 1].x) / (S[i].x - S[i - 1].x || 1);
      return S[i - 1].y + (S[i].y - S[i - 1].y) * t;
    }
    return S[S.length - 1].y;
  };
}

// --- carrocería trasera: volumen continuo (loft) con secciones superelípticas
function rearBody() {
  const TOP = curve([[-1.04, 0.44], [-0.97, 0.6], [-0.8, 0.7], [-0.58, 0.735], [-0.38, 0.69], [-0.24, 0.55], [-0.14, 0.36], [-0.08, 0.24]]);
  const BOT = curve([[-1.04, 0.44], [-0.99, 0.34], [-0.86, 0.35], [-0.62, 0.37], [-0.44, 0.29], [-0.3, 0.2], [-0.08, 0.17]]);
  const WID = curve([[-1.04, 0.0], [-1.0, 0.11], [-0.9, 0.18], [-0.65, 0.205], [-0.4, 0.18], [-0.2, 0.13], [-0.08, 0.11]]);
  const N = 90, M = 56, p = 0.75;
  const pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, x = -1.04 + u * 0.96;
    const top = TOP(x), bot = BOT(x);
    const yc = (top + bot) / 2, ry = (top - bot) / 2;
    let rz = WID(x);
    if (i === 0) rz = 0;
    for (let j = 0; j < M; j++) {
      const a = (j / M) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
      // un poco más ancha abajo que arriba, como la chapa de la Vespa
      const wz = rz * (1 - 0.18 * Math.max(0, sn));
      pos.push(x, yc + ry * Math.sign(sn) * Math.pow(Math.abs(sn), p), wz * Math.sign(c) * Math.pow(Math.abs(c), p));
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * M + j, b = i * M + (j + 1) % M, c = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

// tapa lateral (cowl): media gota que cubre la rueda trasera por los costados
function cowl(side) {
  const geo = deform(new THREE.SphereGeometry(1, 40, 24), (v) => {
    if (v.z * side < 0) v.z *= 0.15;          // cara interna casi plana
    if (v.x > 0) v.y *= 1 - 0.25 * v.x;        // se afina hacia adelante
  });
  const g = part(geo, ROJO, 'paint');
  g.scale.set(0.3, 0.16, 0.075); g.position.set(-0.66, 0.44, side * 0.15);
  return g;
}

// --- escudo: perfil curvo, más angosto arriba y envolviendo las piernas
function legShield() {
  const s = new THREE.Shape();
  s.moveTo(0.34, 0.16);
  s.quadraticCurveTo(0.49, 0.46, 0.46, 0.9);
  s.lineTo(0.405, 0.9);
  s.quadraticCurveTo(0.42, 0.5, 0.24, 0.19);
  s.lineTo(0.34, 0.16);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.44, steps: 16, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 4, curveSegments: 24 });
  geo.translate(0, 0, -0.22);
  return deform(geo, (v) => {
    const k = smooth(0.2, 0.9, v.y);
    v.z *= 1 - 0.38 * k;           // se afina hacia arriba
    v.x -= 0.9 * v.z * v.z;        // envuelve hacia atrás en los costados
  });
}

// --- guardabarros delantero: arco extruido y redondeado
function frontFender() {
  const s = new THREE.Shape();
  const R1 = 0.2, R2 = 0.25, a0 = -0.15, a1 = Math.PI + 0.25;
  s.absarc(0, 0, R2, a0, a1, false);
  s.absarc(0, 0, R1, a1, a0, true);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.12, steps: 8, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.04, bevelSegments: 5, curveSegments: 32 });
  geo.translate(0, 0, -0.06);
  return deform(geo, (v) => { const r = Math.hypot(v.x, v.y); v.z *= 0.8 + 0.6 * smooth(0.18, 0.26, r); });
}

function wheel(r = 0.13) {
  const g = new THREE.Group();
  g.add(part(new THREE.TorusGeometry(r, 0.048, 16, 40), NEGRO, 'rubber', { outline: false }));
  const rim = part(new THREE.CylinderGeometry(r * 0.66, r * 0.66, 0.075, 32), CREMA, 'paint');
  rim.rotation.x = Math.PI / 2; g.add(rim);
  const cap = part(new THREE.CylinderGeometry(r * 0.24, r * 0.28, 0.1, 20), GRIS, 'chrome', { outline: false });
  cap.rotation.x = Math.PI / 2; g.add(cap);
  for (let i = 0; i < 4; i++) {   // tuercas: se ve girar la rueda
    const n = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8), mat(OSCURO, 'chrome'));
    n.rotation.x = Math.PI / 2; const a = i * Math.PI / 2;
    n.position.set(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, 0); g.add(n);
  }
  return g;
}

export function buildVespa() {
  const v = new THREE.Group();          // x = adelante, y = arriba, z = costado

  v.add(part(rearBody(), ROJO, 'paint'));
  v.add(cowl(1)); v.add(cowl(-1));

  // piso con listones de goma
  const floor = part(new THREE.BoxGeometry(0.62, 0.05, 0.34), ROJO, 'paint');
  floor.position.set(0.04, 0.19, 0); v.add(floor);
  for (let i = -2; i <= 2; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.014, 0.022), mat(NEGRO, 'rubber'));
    s.position.set(0.03, 0.22, i * 0.058); v.add(s);
  }

  v.add(part(legShield(), ROJO, 'paint'));

  // columna de dirección + tapa del manubrio + manubrio
  const col = part(new THREE.CylinderGeometry(0.045, 0.055, 0.28, 20), ROJO, 'paint');
  col.position.set(0.44, 1.0, 0); col.rotation.z = -0.12; v.add(col);
  const head = part(new THREE.SphereGeometry(1, 32, 20), ROJO, 'paint');
  head.scale.set(0.1, 0.06, 0.1); head.position.set(0.43, 1.13, 0); v.add(head);
  const bar = part(new THREE.CylinderGeometry(0.018, 0.018, 0.64, 14), GRIS, 'chrome');
  bar.rotation.x = Math.PI / 2; bar.position.set(0.42, 1.15, 0); v.add(bar);
  for (const z of [-0.29, 0.29]) {
    const grip = part(new THREE.CylinderGeometry(0.028, 0.028, 0.13, 16), NEGRO, 'rubber');
    grip.rotation.x = Math.PI / 2; grip.position.set(0.42, 1.15, z); v.add(grip);
  }

  // horquilla (oscura, para que no parezca una raya) y guardabarros
  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.46, 10), mat(OSCURO, 'chrome'));
  fork.position.set(0.54, 0.4, 0.07); fork.rotation.z = -0.22; v.add(fork);
  const fender = part(frontFender(), ROJO, 'paint'); fender.position.set(0.6, 0.14, 0); v.add(fender);

  // farol sobre el guardabarros, como el 98 original
  const lamp = part(new THREE.CylinderGeometry(0.06, 0.07, 0.07, 28), ROJO, 'paint');
  lamp.rotation.z = Math.PI / 2; lamp.position.set(0.7, 0.41, 0); v.add(lamp);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.008, 8, 28), mat(GRIS, 'chrome'));
  ring.rotation.y = Math.PI / 2; ring.position.set(0.737, 0.41, 0); v.add(ring);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.055, 28), mat(0xfff1b8, 'glow'));
  lens.rotation.y = Math.PI / 2; lens.position.set(0.738, 0.41, 0); v.add(lens);

  // asiento monoplaza sobre resorte
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.1, 12), mat(OSCURO, 'chrome'));
  post.position.set(-0.36, 0.74, 0); v.add(post);
  const seatGeo = deform(new THREE.SphereGeometry(1, 36, 18), (p) => { if (p.y < 0) p.y *= 0.35; p.z *= 1 - 0.35 * smooth(-0.2, 1, p.x); });
  const seat = part(seatGeo, CREMA, 'leather'); seat.scale.set(0.2, 0.065, 0.15); seat.position.set(-0.38, 0.8, 0); v.add(seat);

  // parrilla trasera
  const rack = part(new THREE.BoxGeometry(0.22, 0.016, 0.16), GRIS, 'chrome');
  rack.position.set(-0.72, 0.74, 0); rack.rotation.z = -0.1; v.add(rack);

  // luz trasera
  const tl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 10), mat(0xe2402e, 'glow'));
  tl.scale.set(0.6, 1, 1.3); tl.position.set(-1.07, 0.45, 0); v.add(tl);

  // ruedas
  const fw = wheel(); fw.position.set(0.6, 0.14, 0); v.add(fw);
  const rw = wheel(); rw.position.set(-0.65, 0.14, 0); v.add(rw);

  v.position.set(0.12, 0, 0);
  const root = new THREE.Group(); root.add(v);
  root.userData.wheels = [fw, rw];
  return root;
}

export function setupRenderer(renderer, scene) {
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xfff6e8, 0x6b5a48, 0.5));
  const d = new THREE.DirectionalLight(0xffffff, 1.4);
  d.position.set(1.5, 3, 2.5); scene.add(d);
}
