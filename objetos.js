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

// Lámpara WG24 (Wagenfeld y Jucker, Bauhaus 1923): base de vidrio, caño, pantalla opalina.
export function buildLamp() {
  const g = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xe8f2f2, roughness: 0.05, transparent: true, opacity: 0.35, depthWrite: false });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.04, 48), glass); base.position.y = 0.02; g.add(base);
  g.add(at(cyl(0.225, 0.006, GRIS, 'chrome', 48), 0, 0.003, 0));
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.62, 24), glass); shaft.position.y = 0.35; g.add(shaft);
  g.add(at(cyl(0.008, 0.66, GRIS, 'chrome', 8), 0, 0.35, 0));
  g.add(at(cyl(0.07, 0.03, GRIS, 'chrome', 32), 0, 0.665, 0));
  const shadeMat = new THREE.MeshPhysicalMaterial({ color: 0xf6d44a, emissive: 0xf5c542, emissiveIntensity: 0.15, roughness: 0.25, clearcoat: 0.6 });
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), shadeMat);
  shade.position.y = 0.68; g.add(shade);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.008, 8, 48), mat(GRIS, 'chrome')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.68; g.add(rim);
  const chain = tube([V(0.06, 0.68, 0.0), V(0.08, 0.6, 0.02), V(0.07, 0.52, 0.03)], 0.004, GRIS, 'chrome', false, false); g.add(chain);
  g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 8), mat(GRIS, 'chrome')), 0.07, 0.51, 0.03));
  const light = new THREE.PointLight(0xffd36b, 0, 1.2); light.position.y = 0.7; g.add(light);
  return root(g, (now, t) => { const k = smooth(0.6, 1.2, t); shadeMat.emissiveIntensity = 0.15 + 0.9 * k; light.intensity = 1.2 * k; });
}

// Silla B3 / Wassily (Marcel Breuer, 1925): caño de acero curvado + cintas.
export function buildB3() {
  const g = new THREE.Group();
  const W = 0.36, R = 0.018;
  for (const s of [-1, 1]) {
    const z = s * W;
    // patín + apoyabrazos de cada lado, en un solo caño
    g.add(tube([V(-0.32, 0.02, z), V(0.3, 0.02, z), V(0.34, 0.08, z), V(0.3, 0.5, z), V(-0.25, 0.5, z), V(-0.3, 0.45, z), V(-0.32, 0.05, z)], R, GRIS, 'chrome', true));
    // respaldo inclinado
    g.add(tube([V(-0.3, 0.3, z), V(-0.38, 0.8, z * 0.85)], R, GRIS, 'chrome'));
  }
  g.add(tube([V(-0.38, 0.8, -W * 0.85), V(-0.38, 0.8, W * 0.85)], R, GRIS, 'chrome'));
  g.add(tube([V(0.3, 0.32, -W), V(0.3, 0.32, W)], R, GRIS, 'chrome'));
  g.add(tube([V(-0.3, 0.3, -W), V(-0.3, 0.3, W)], R, GRIS, 'chrome'));
  const strap = (w, h, x, y, z, rz = 0, ry = 0) => g.add(at(part(rbox(w, 0.012, h, 0.005), MADERA_CLARA, 'leather'), x, y, z, 0, ry, rz));
  strap(0.62, W * 2, 0, 0.33, 0, -0.12);                 // asiento
  strap(0.42, W * 1.7, -0.34, 0.6, 0, Math.PI / 2 - 0.16); // respaldo
  for (const s of [-1, 1]) g.add(at(part(rbox(0.5, 0.18, 0.012, 0.005), MADERA_CLARA, 'leather'), 0.02, 0.42, s * W));
  return root(g);
}

// Club Obrero (Ródchenko, París 1925): mesa de ajedrez con tablero que gira y dos sillas, rojo y negro.
export function buildClub() {
  const g = new THREE.Group();
  g.add(at(part(rbox(0.5, 0.06, 0.34, 0.01), ROJO), 0, 0.03, 0));
  g.add(at(part(rbox(0.08, 0.5, 0.08, 0.01), ROJO), 0, 0.28, 0));
  g.add(at(part(rbox(0.46, 0.04, 0.3, 0.01), NEGRO, 'matte'), 0, 0.53, 0));
  // tablero de ajedrez que pivotea
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#1a1a1a' : '#f2f0ea'; c.fillRect(i * 32, j * 32, 32, 32); }
  const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
  const board = new THREE.Group(); board.position.set(0, 0.56, 0); g.add(board);
  board.add(part(rbox(0.3, 0.025, 0.3, 0.006), ROJO));
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.5 }));
  top.rotation.x = -Math.PI / 2; top.position.y = 0.014; board.add(top);
  for (const s of [-1, 1]) {
    const ch = new THREE.Group(); ch.position.set(s * 0.48, 0, 0); ch.rotation.y = s > 0 ? Math.PI : 0; g.add(ch);
    ch.add(at(part(rbox(0.26, 0.04, 0.26, 0.008), ROJO), 0, 0.3, 0));
    for (const [x, z] of [[-0.11, -0.11], [-0.11, 0.11], [0.11, -0.11], [0.11, 0.11]]) ch.add(at(part(rbox(0.035, 0.3, 0.035, 0.006), ROJO), x, 0.15, z));
    ch.add(at(part(rbox(0.035, 0.42, 0.26, 0.008), NEGRO, 'matte'), -0.13, 0.52, 0, 0, 0, 0.1));
  }
  return root(g, (now, t) => { board.rotation.y = smooth(0.6, 2.0, t) * Math.PI / 2 + Math.sin(now / 1500) * 0.05; });
}

// Silla de Tatlin (Moscú 1927, prototipo de Rogozhin): madera curvada en voladizo.
export function buildTatlin() {
  const g = new THREE.Group();
  const W = 0.22;
  for (const s of [-1, 1]) {
    g.add(tube([V(-0.3, 0.02, s * W), V(0.25, 0.02, s * W * 1.1), V(0.36, 0.12, s * W * 1.1), V(0.3, 0.3, s * W), V(0.18, 0.42, s * W * 0.95),
      V(0.0, 0.45, s * W * 0.9), V(-0.18, 0.5, s * W * 0.85), V(-0.24, 0.72, s * W * 0.7), V(-0.2, 0.86, s * W * 0.5)], 0.024, MADERA, 'wood'));
  }
  g.add(tube([V(-0.3, 0.02, -W), V(-0.36, 0.02, 0), V(-0.3, 0.02, W)], 0.024, MADERA, 'wood'));
  g.add(tube([V(-0.2, 0.86, -W * 0.5), V(-0.18, 0.9, 0), V(-0.2, 0.86, W * 0.5)], 0.024, MADERA, 'wood'));
  const seatGeo = deform(new THREE.CylinderGeometry(1, 1, 0.04, 40), (v) => { v.y += 0.06 * v.x * v.x; });
  const seat = part(seatGeo, CREMA, 'leather'); seat.scale.set(0.2, 1, 0.21); seat.position.set(0.08, 0.45, 0); g.add(seat);
  const back = part(rbox(0.04, 0.22, W * 1.4, 0.015), MADERA_CLARA, 'wood'); back.position.set(-0.21, 0.72, 0); back.rotation.z = 0.25; g.add(back);
  return root(g);
}

// Molinos Minetti (Córdoba, 1918): silos de grano y torre de elevación.
export function buildMolino() {
  const g = new THREE.Group();
  const BEIGE = 0xd9b98a;
  for (let i = 0; i < 5; i++) {
    const x = -0.36 + i * 0.16;
    g.add(at(cyl(0.08, 0.7, BEIGE, 'matte', 32), x, 0.35, 0.06));
    g.add(at(part(new THREE.SphereGeometry(0.08, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), BEIGE, 'matte'), x, 0.7, 0.06));
  }
  g.add(at(part(rbox(0.82, 0.08, 0.2, 0.01), 0xb89b70, 'matte'), -0.04, 0.78, 0.06));
  const tower = part(rbox(0.22, 1.0, 0.3, 0.01), 0xc9a877, 'matte'); tower.position.set(0.5, 0.5, 0); g.add(tower);
  for (let j = 0; j < 5; j++) for (const x of [0.46, 0.54]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.07), mat(0x2b3440, 'matte')); w.position.set(x, 0.2 + j * 0.17, 0.152); g.add(w);
  }
  g.add(at(part(rbox(0.26, 0.06, 0.34, 0.01), 0x8f3b2a, 'matte'), 0.5, 1.03, 0));
  // espigas de trigo
  for (let k = 0; k < 3; k++) g.add(tube([V(-0.55 + k * 0.04, 0, 0.25), V(-0.56 + k * 0.05, 0.2, 0.25), V(-0.58 + k * 0.07, 0.34, 0.25)], 0.006, 0xc59a3a, 'matte', false, false));
  return root(g);
}

// Fábrica Militar de Aviones (Córdoba, 1927): nave con techo diente de sierra y un avión que da vueltas.
export function buildFMA() {
  const g = new THREE.Group();
  const GR = 0x8e969d;
  g.add(at(part(rbox(1.0, 0.36, 0.5, 0.01), GR, 'matte'), 0, 0.18, 0));
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.25, 0); s.lineTo(0, 0.14); s.lineTo(0, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false }); geo.translate(0, 0, -0.25);
    g.add(at(part(geo, 0x6f777e, 'matte'), -0.5 + i * 0.25, 0.36, 0));
  }
  for (let i = 0; i < 5; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.1), mat(0x24303a, 'matte')); w.position.set(-0.38 + i * 0.19, 0.2, 0.252); g.add(w);
  }
  g.add(at(part(rbox(0.2, 0.22, 0.02, 0.005), 0x5a2d22, 'matte'), 0.0, 0.11, 0.25));
  g.add(at(cyl(0.04, 0.4, 0x6f777e, 'matte', 16), 0.4, 0.55, -0.15));
  // avión
  const plane = new THREE.Group(), orbit = new THREE.Group(); orbit.position.set(0, 0.85, 0); orbit.add(plane); g.add(orbit);
  plane.position.set(0.45, 0, 0); plane.rotation.y = Math.PI / 2;
  plane.add(at(part(new THREE.CapsuleGeometry(0.035, 0.25, 6, 16), 0xa7aeb4), 0, 0, 0, 0, 0, Math.PI / 2));
  plane.add(at(part(rbox(0.07, 0.012, 0.42, 0.005), 0xa7aeb4), 0.02, 0.0, 0));
  plane.add(at(part(rbox(0.05, 0.01, 0.16, 0.004), 0xa7aeb4), -0.15, 0.01, 0));
  plane.add(at(part(rbox(0.05, 0.08, 0.01, 0.004), 0xa7aeb4), -0.15, 0.04, 0));
  const prop = new THREE.Group(); prop.position.set(0.17, 0, 0); plane.add(prop);
  prop.add(at(part(rbox(0.006, 0.14, 0.02, 0.003), NEGRO, 'matte'), 0, 0, 0));
  return root(g, (now, t, dt) => { orbit.rotation.y -= 0.9 * dt; prop.rotation.x += 30 * dt; plane.position.y = 0.03 * Math.sin(now / 400); });
}

// Silla BKF (Grupo Austral, 1938): dos U de hierro entrelazadas + cuero colgado.
export function buildBKF() {
  const g = new THREE.Group();
  const R = 0.014;
  g.add(tube([V(-0.32, 0, -0.32), V(-0.38, 0.72, -0.34), V(0.0, 0.42, -0.4), V(0.34, 0.62, -0.34), V(0.32, 0, -0.3)], R, NEGRO, 'matte'));
  g.add(tube([V(-0.32, 0, 0.32), V(-0.38, 0.72, 0.34), V(0.0, 0.42, 0.4), V(0.34, 0.62, 0.34), V(0.32, 0, 0.3)], R, NEGRO, 'matte'));
  g.add(tube([V(-0.32, 0, -0.32), V(-0.05, 0.05, 0), V(-0.32, 0, 0.32)], R, NEGRO, 'matte'));
  g.add(tube([V(0.32, 0, -0.3), V(0.05, 0.05, 0), V(0.32, 0, 0.3)], R, NEGRO, 'matte'));
  // cuero: superficie que cuelga entre las cuatro puntas
  const geo = new THREE.PlaneGeometry(1, 1, 24, 24);
  deform(geo, (v) => {
    const u = v.x + 0.5, w = v.y + 0.5;                         // u: atrás→adelante, w: costado
    const x = -0.36 + u * 0.68, z = (w - 0.5) * 0.66;
    const y = 0.7 - u * 0.15 - Math.sin(Math.PI * u) * 0.38 * (0.75 + 0.25 * Math.sin(Math.PI * w)) + (u > 0.85 ? 0.1 * (u - 0.85) / 0.15 : 0);
    v.set(x, y, z * (1 - 0.15 * Math.sin(Math.PI * u)));
  });
  const sling = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0x5b3420, roughness: 0.55, clearcoat: 0.3, side: THREE.DoubleSide }));
  g.add(sling);
  return root(g);
}

// ============ UT5 ============

// Silla Eames (Charles y Ray Eames, 1950): cáscara blanca, patas de madera y varillas.
export function buildEames() {
  const g = new THREE.Group();
  const shellGeo = deform(new THREE.SphereGeometry(1, 48, 32, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), (v) => {
    v.y = -v.y;                                         // cuenco
    if (v.x < 0) v.y += (-v.x) * 1.6 * smooth(-0.1, 0.4, v.y + 0.2);   // respaldo que sube atrás
  });
  const shell = part(shellGeo, BLANCO, 'paint'); shell.scale.set(0.26, 0.26, 0.25); shell.position.set(0, 0.48, 0); g.add(shell);
  shell.children[0].material = new THREE.MeshPhysicalMaterial({ color: BLANCO, roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide });
  for (const [x, z] of [[-0.15, -0.15], [-0.15, 0.15], [0.15, -0.15], [0.15, 0.15]]) {
    g.add(tube([V(x * 0.5, 0.44, z * 0.5), V(x * 1.25, 0, z * 1.25)], 0.016, MADERA_CLARA, 'wood'));
  }
  g.add(tube([V(-0.1, 0.22, -0.1), V(0.1, 0.22, 0.1)], 0.005, OSCURO, 'chrome', false, false));
  g.add(tube([V(-0.1, 0.22, 0.1), V(0.1, 0.22, -0.1)], 0.005, OSCURO, 'chrome', false, false));
  return root(g);
}

// auto genérico: carrocería redondeada + cabina con vidrios + ruedas
function car({ L, H, W, cabL, cabH, cabX, color, wheelR = 0.11, round = 0.08, hub = GRIS }) {
  const g = new THREE.Group();
  g.add(at(part(rbox(L, H, W, round, 4), color), 0, wheelR + H / 2 - 0.02, 0));
  const cab = part(deform(rbox(cabL, cabH, W * 0.9, round * 0.8, 4), (v) => { v.x *= 1 - 0.18 * (v.y / cabH + 0.5); }), color);
  cab.position.set(cabX, wheelR + H - 0.02 + cabH / 2 - 0.01, 0); g.add(cab);
  const gm = glassMat();
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(rbox(cabL * 0.72, cabH * 0.62, 0.01, 0.02), gm); w.position.set(cabX, cab.position.y + 0.01, s * W * 0.455); g.add(w);
  }
  const ws = new THREE.Mesh(rbox(0.01, cabH * 0.6, W * 0.72, 0.02), gm); ws.position.set(cabX + cabL * 0.43, cab.position.y + 0.01, 0); ws.rotation.z = 0.25; g.add(ws);
  const wheels = [];
  for (const x of [-L * 0.32, L * 0.32]) for (const s of [-1, 1]) {
    const w = carWheel(wheelR, 0.08, hub); w.position.set(x, wheelR, s * W * 0.47); g.add(w); wheels.push(w);
  }
  for (const s of [-1, 1]) {
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 10), mat(0xfff1b8, 'glow')), L / 2 - 0.01, wheelR + H * 0.6, s * W * 0.32));
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), mat(0xe2402e, 'glow')), -L / 2 + 0.01, wheelR + H * 0.6, s * W * 0.34));
  }
  g.add(at(part(rbox(0.03, 0.04, W * 1.02, 0.01), GRIS, 'chrome'), L / 2 + 0.005, wheelR + 0.03, 0));
  g.add(at(part(rbox(0.03, 0.04, W * 1.02, 0.01), GRIS, 'chrome'), -L / 2 - 0.005, wheelR + 0.03, 0));
  return { g, wheels };
}

// Mazda R360 Coupé (Matsuda, 1960): kei car celeste.
export function buildR360() {
  const { g, wheels } = car({ L: 0.9, H: 0.2, W: 0.42, cabL: 0.44, cabH: 0.2, cabX: -0.06, color: 0x6d9bc8, wheelR: 0.08, round: 0.09 });
  return root(g, spinWheels(wheels, 4));
}

// Walkman TPS-L2 (Sony, 1979): azul y plata, ventana del casete y auriculares naranja.
export function buildWalkman() {
  const g = new THREE.Group();
  g.add(at(part(rbox(0.6, 0.4, 0.13, 0.03), 0x2f5aa8), 0, 0.2, 0));
  g.add(at(part(rbox(0.6, 0.12, 0.135, 0.02), 0xc9ccd1, 'chrome'), 0, 0.34, 0));
  const win = new THREE.Mesh(rbox(0.36, 0.17, 0.01, 0.015), glassMat(0x223040)); win.position.set(-0.02, 0.17, 0.066); g.add(win);
  const reels = [];
  for (const x of [-0.1, 0.06]) {
    const r = new THREE.Group(); r.position.set(x, 0.17, 0.072); g.add(r); reels.push(r);
    r.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.004, 6), mat(BLANCO, 'matte')), 0, 0, 0, Math.PI / 2));
  }
  for (let i = 0; i < 5; i++) g.add(at(part(rbox(0.07, 0.035, 0.06, 0.008), 0xd9dbe0, 'chrome'), -0.2 + i * 0.09, 0.41, 0));
  g.add(at(part(rbox(0.06, 0.045, 0.03, 0.01), 0xf08a24), 0.24, 0.08, 0.07));
  // auriculares
  const band = tube([V(0.12, 0.42, -0.02), V(0.2, 0.72, 0), V(0.42, 0.82, 0), V(0.62, 0.66, 0), V(0.64, 0.42, -0.02)], 0.01, GRIS, 'chrome');
  g.add(band);
  for (const x of [0.12, 0.64]) g.add(at(part(new THREE.SphereGeometry(0.06, 20, 14), 0xf08a24, 'matte'), x, 0.4, 0.0));
  g.add(tube([V(0.25, 0.4, 0.0), V(0.4, 0.3, 0.05), V(0.36, 0.1, 0.06), V(0.3, 0.05, 0.04)], 0.004, NEGRO, 'rubber', false, false));
  return root(g, (now, t, dt) => reels.forEach((r) => (r.rotation.z -= 4 * dt * smooth(0.6, 1, t))));
}

// Rastrojero (IAME, Córdoba 1952): pick-up verde.
export function buildRastrojero() {
  const g = new THREE.Group(); const VERDE = 0x5a8f3a, wR = 0.11;
  g.add(at(part(rbox(0.36, 0.22, 0.46, 0.06), VERDE), 0.36, wR + 0.12, 0));                 // capot
  g.add(at(part(rbox(0.3, 0.42, 0.48, 0.05), VERDE), 0.08, wR + 0.22, 0));                   // cabina
  const gm = glassMat();
  g.add(at(new THREE.Mesh(rbox(0.01, 0.16, 0.38, 0.02), gm), 0.235, wR + 0.33, 0, 0, 0, 0.12));
  for (const s of [-1, 1]) g.add(at(new THREE.Mesh(rbox(0.2, 0.14, 0.01, 0.02), gm), 0.08, wR + 0.33, s * 0.242));
  g.add(at(part(rbox(0.56, 0.2, 0.5, 0.02), VERDE), -0.36, wR + 0.1, 0));                   // caja
  g.add(at(part(rbox(0.52, 0.03, 0.44, 0.01), 0x3d6427, 'matte'), -0.36, wR + 0.19, 0));
  for (let i = 0; i < 5; i++) g.add(at(part(rbox(0.01, 0.14, 0.04, 0.004), 0x2d2d2d, 'chrome'), 0.545, wR + 0.12, -0.16 + i * 0.08));
  for (const s of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 10), mat(0xfff1b8, 'glow')), 0.53, wR + 0.2, s * 0.18));
  const wheels = [];
  for (const x of [0.36, -0.4]) for (const s of [-1, 1]) { const w = carWheel(wR, 0.08); w.position.set(x, wR, s * 0.24); g.add(w); wheels.push(w); }
  return root(g, spinWheels(wheels));
}

// IKA Estanciera (Córdoba 1957): rural amarilla tipo Jeep.
export function buildEstanciera() {
  const g = new THREE.Group(); const AM = 0xe7c43c, wR = 0.12;
  g.add(at(part(rbox(0.3, 0.24, 0.42, 0.04), AM), 0.42, wR + 0.13, 0));
  g.add(at(part(rbox(0.72, 0.46, 0.48, 0.05), AM), -0.08, wR + 0.24, 0));
  g.add(at(part(rbox(0.74, 0.03, 0.5, 0.01), BLANCO), -0.08, wR + 0.48, 0));
  const gm = glassMat();
  for (const s of [-1, 1]) for (const x of [-0.32, -0.08, 0.15]) g.add(at(new THREE.Mesh(rbox(0.18, 0.15, 0.01, 0.02), gm), x, wR + 0.36, s * 0.242));
  g.add(at(new THREE.Mesh(rbox(0.01, 0.16, 0.4, 0.02), gm), 0.275, wR + 0.36, 0));
  for (let i = 0; i < 7; i++) g.add(at(part(rbox(0.01, 0.16, 0.025, 0.004), 0x2d2d2d, 'matte'), 0.572, wR + 0.13, -0.15 + i * 0.05));
  for (const s of [-1, 1]) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 10), mat(0xfff1b8, 'glow')), 0.57, wR + 0.22, s * 0.17));
  g.add(at(part(rbox(0.05, 0.05, 0.5, 0.01), GRIS, 'chrome'), 0.6, wR + 0.02, 0));
  const wheels = [];
  for (const x of [0.36, -0.36]) for (const s of [-1, 1]) { const w = carWheel(wR, 0.09); w.position.set(x, wR, s * 0.23); g.add(w); wheels.push(w); }
  return root(g, spinWheels(wheels));
}

// Magiclick (Aurora, 1968): encendedor piezoeléctrico; al apretar el botón, chispa.
export function buildMagiclick() {
  const g = new THREE.Group();
  g.add(at(part(rbox(0.16, 0.9, 0.1, 0.045, 5), 0x1e1e20), 0, 0.45, 0));
  g.add(at(part(new THREE.CylinderGeometry(0.035, 0.05, 0.14, 24), GRIS, 'chrome'), 0, 0.97, 0));
  const btn = part(rbox(0.05, 0.12, 0.03, 0.012), 0xd23a3a); btn.position.set(0, 0.6, 0.055); g.add(btn);
  g.add(at(part(rbox(0.12, 0.06, 0.012, 0.01), GRIS, 'chrome'), 0, 0.3, 0.051));
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0 }));
  spark.position.y = 1.07; g.add(spark);
  const light = new THREE.PointLight(0x9fd8ff, 0, 0.8); light.position.y = 1.07; g.add(light);
  return root(g, (now, t) => {
    const ph = (t % 2.2) / 2.2, press = ph < 0.12 ? Math.sin(ph / 0.12 * Math.PI) : 0;
    btn.position.z = 0.055 - 0.02 * press;
    const k = ph > 0.06 && ph < 0.16 ? 1 - Math.abs(ph - 0.11) / 0.05 : 0;
    spark.material.opacity = k; spark.scale.setScalar(0.6 + k); light.intensity = 2 * k;
  });
}

// ============ UT6 ============

// Motocompo (Honda, 1981): caja roja que se despliega: manubrio y asiento salen.
export function buildMotocompo() {
  const g = new THREE.Group();
  g.add(at(part(rbox(0.72, 0.34, 0.24, 0.04), 0xd23a2e), 0, 0.26, 0));
  g.add(at(part(rbox(0.5, 0.06, 0.245, 0.01), 0x2a2a2a, 'matte'), 0.02, 0.18, 0));
  const wheels = [];
  for (const x of [-0.27, 0.27]) { const w = carWheel(0.09, 0.07); w.position.set(x, 0.09, 0); g.add(w); wheels.push(w); }
  const bar = new THREE.Group(); bar.position.set(0.3, 0.43, 0); g.add(bar);
  bar.add(at(cyl(0.015, 0.4, GRIS, 'chrome', 10), 0, 0.2, 0));
  bar.add(at(cyl(0.013, 0.34, NEGRO, 'rubber', 10), 0, 0.4, 0, Math.PI / 2));
  const seat = new THREE.Group(); seat.position.set(-0.22, 0.43, 0); g.add(seat);
  seat.add(at(cyl(0.015, 0.2, GRIS, 'chrome', 10), 0, 0.1, 0));
  seat.add(at(part(rbox(0.18, 0.04, 0.14, 0.015), NEGRO, 'matte'), 0, 0.21, 0));
  return root(g, (now, t, dt) => {
    const k = smooth(0.6, 1.5, t);
    bar.scale.y = 0.05 + 0.95 * k; seat.scale.y = 0.05 + 0.95 * smooth(1.0, 1.8, t); bar.rotation.z = 0.15 * k;
    wheels.forEach((w) => (w.rotation.z -= 3 * dt * smooth(1.8, 2.2, t)));
  });
}

// iMac G3 (Apple 1998, Jonathan Ive): frente blanco, carcasa traslúcida Bondi Blue.
export function buildIMac() {
  const g = new THREE.Group();
  const front = part(rbox(0.12, 0.62, 0.66, 0.06, 4), BLANCO); front.position.set(0.18, 0.4, 0); front.rotation.y = Math.PI / 2; g.add(front);
  front.position.set(0, 0.4, 0.16);
  const blue = new THREE.MeshPhysicalMaterial({ color: 0x1f8fa6, roughness: 0.15, transparent: true, opacity: 0.78, clearcoat: 1 });
  const backGeo = deform(rbox(0.6, 0.56, 0.42, 0.12, 5), (v) => { const k = (0.21 - v.z) / 0.42; v.x *= 1 - 0.35 * k; v.y *= 1 - 0.3 * k; });
  const back = new THREE.Mesh(backGeo, blue); back.position.set(0, 0.42, -0.1); g.add(back);
  const screenMat = new THREE.MeshPhysicalMaterial({ color: 0x14202a, emissive: 0x3aa0c8, emissiveIntensity: 0.05, roughness: 0.08, clearcoat: 1 });
  const scr = new THREE.Mesh(rbox(0.46, 0.36, 0.01, 0.03), screenMat); scr.position.set(0, 0.45, 0.225); g.add(scr);
  g.add(at(new THREE.Mesh(rbox(0.5, 0.04, 0.012, 0.015), blue), 0, 0.19, 0.222));
  g.add(at(part(rbox(0.3, 0.06, 0.3, 0.02), BLANCO), 0, 0.03, -0.02));
  g.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 10, 24, Math.PI), blue), 0, 0.7, -0.12, 0, 0, 0));
  // teclado traslúcido
  g.add(at(part(rbox(0.5, 0.03, 0.17, 0.02), 0xdfe4e6), 0, 0.015, 0.46));
  return root(g, (now, t) => { screenMat.emissiveIntensity = 0.05 + 0.5 * smooth(0.6, 1.4, t); });
}

// Game Boy Advance (Nintendo 2001): apaisada, violeta.
export function buildGBA() {
  const g = new THREE.Group(); const VI = 0x5b3a96;
  const body = part(deform(rbox(0.8, 0.42, 0.1, 0.05, 5), (v) => { const k = Math.abs(v.x) / 0.4; v.y *= 1 + 0.12 * smooth(0.55, 1, k); }), VI);
  body.position.y = 0.25; g.add(body);
  g.add(at(new THREE.Mesh(rbox(0.36, 0.26, 0.01, 0.025), glassMat(0x2a2a30)), 0, 0.27, 0.052));
  const scrMat = new THREE.MeshPhysicalMaterial({ color: 0x8fa07a, emissive: 0x9fb588, emissiveIntensity: 0.05, roughness: 0.4 });
  g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.18), scrMat), 0, 0.27, 0.058));
  g.add(at(part(rbox(0.1, 0.03, 0.02, 0.008), OSCURO, 'matte'), -0.28, 0.27, 0.055));
  g.add(at(part(rbox(0.03, 0.1, 0.02, 0.008), OSCURO, 'matte'), -0.28, 0.27, 0.055));
  for (const [x, y] of [[0.25, 0.25], [0.32, 0.3]]) g.add(at(part(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 20), 0xd9d6e6), x, y, 0.055, Math.PI / 2));
  for (const s of [-1, 1]) g.add(at(part(rbox(0.16, 0.04, 0.08, 0.015), 0x7a5cb5), s * 0.3, 0.47, -0.01));
  return root(g, (now, t) => { scrMat.emissiveIntensity = 0.05 + 0.45 * smooth(0.6, 1.2, t) * (0.9 + 0.1 * Math.sin(now / 90)); });
}

// Renault 12 (Gaston Juchet, 1969; IKA-Renault Córdoba 1971–94): sedán verde oliva con humo.
export function buildR12() {
  const { g, wheels } = car({ L: 1.1, H: 0.22, W: 0.46, cabL: 0.52, cabH: 0.2, cabX: -0.05, color: 0x7f8a2e, wheelR: 0.1, round: 0.05 });
  const puffs = [];
  for (let i = 0; i < 4; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd9b56a, transparent: true, opacity: 0.8, roughness: 1 }));
    g.add(p); puffs.push(p);
  }
  return root(g, (now, t, dt) => {
    spinWheels(wheels)(now, t, dt);
    puffs.forEach((p, i) => {
      const ph = ((now / 1000 + i * 0.4) % 1.6) / 1.6;
      p.position.set(-0.6 - ph * 0.35, 0.14 + ph * 0.25, 0.12); p.scale.setScalar(0.5 + ph * 1.4); p.material.opacity = 0.75 * (1 - ph);
    });
  });
}

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
