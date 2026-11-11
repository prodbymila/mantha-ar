// Braun SK4 (1956, Dieter Rams y Hans Gugelot): "el ataúd de Blancanieves".
// Chapa blanca en U, laterales de madera, tapa de acrílico transparente.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, part, smooth } from './vespa3d.js?v=5';

const BLANCO = 0xf2f0ea, GRIS_DECK = 0xd9d7d1, GRIS = 0xb9b6b0, OSCURO = 0x3a3a3c, NEGRO = 0x161616, MADERA = 0x86562a, ROJO = 0xb8243a;

const W = 1.0, H = 0.4, D = 0.5;      // proporción real 58 × 24 × 29 cm

const acrilico = new THREE.MeshPhysicalMaterial({
  color: 0xdfeef2, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.16,
  clearcoat: 1, side: THREE.DoubleSide, depthWrite: false,
});
const lineaNegra = new THREE.LineBasicMaterial({ color: 0x111111 });

function clearPanel(w, h, d) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, h, d);
  g.add(new THREE.Mesh(geo, acrilico));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), lineaNegra));
  return g;
}

export function buildSK4() {
  const s = new THREE.Group();   // x = ancho, y = arriba, z = frente

  // cuerpo de chapa blanca
  const body = part(new RoundedBoxGeometry(W, H, D, 4, 0.025), BLANCO, 'paint');
  body.position.y = H / 2; s.add(body);

  // laterales de madera (olmo)
  for (const sx of [-1, 1]) {
    const side = part(new RoundedBoxGeometry(0.04, H + 0.02, D + 0.02, 3, 0.012), MADERA, 'wood');
    side.position.set(sx * (W / 2 + 0.02), H / 2 + 0.01, 0); s.add(side);
  }

  // tablero superior, apenas hundido
  const deck = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, 0.012, D - 0.06), mat(GRIS_DECK, 'matte'));
  deck.position.set(0, H + 0.002, 0); s.add(deck);

  // rejillas del frente (ranuras horizontales)
  const slot = (x, y, w) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.014, 0.01), mat(OSCURO, 'matte'));
    m.position.set(x, y, D / 2 + 0.002); s.add(m);
  };
  for (let i = 0; i < 9; i++) slot(-0.24, 0.07 + i * 0.032, 0.4);
  for (let i = 0; i < 5; i++) slot(0.27, 0.07 + i * 0.032, 0.32);

  // bandeja giradiscos: plato + disco + etiqueta
  const platter = new THREE.Group(); platter.position.set(-0.2, H + 0.012, 0.0); s.add(platter);
  const plate = part(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 48), GRIS, 'chrome');
  plate.position.y = 0.01; platter.add(plate);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.008, 64), new THREE.MeshPhysicalMaterial({ color: 0x0d0d0d, roughness: 0.25, clearcoat: 1 }));
  disc.position.y = 0.024; platter.add(disc);
  for (const r of [0.08, 0.11, 0.14]) {   // surcos que dejan ver el giro
    const g = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.003, 64), mat(0x2a2a2a, 'matte'));
    g.rotation.x = -Math.PI / 2; g.position.y = 0.029; platter.add(g);
  }
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 40), mat(ROJO, 'matte'));
  label.position.y = 0.026; platter.add(label);
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.012, 0.01), mat(BLANCO, 'matte'));
  mark.position.set(0.02, 0.028, 0); platter.add(mark);
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 10), mat(GRIS, 'chrome'));
  spindle.position.y = 0.035; platter.add(spindle);

  // brazo del tocadiscos
  const armPivot = new THREE.Group(); armPivot.position.set(0.03, H + 0.03, -0.14); s.add(armPivot);
  const base = part(new THREE.CylinderGeometry(0.025, 0.03, 0.03, 20), GRIS, 'chrome'); armPivot.add(base);
  const arm = new THREE.Group(); arm.position.y = 0.025; armPivot.add(arm);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.24, 10), mat(GRIS, 'chrome'));
  tube.rotation.z = Math.PI / 2; tube.position.x = -0.12; arm.add(tube);
  const head = part(new THREE.BoxGeometry(0.04, 0.015, 0.025), NEGRO, 'matte'); head.position.x = -0.245; arm.add(head);
  const restAngle = 0.55, playAngle = -0.05;
  arm.rotation.y = restAngle;

  // controles: perillas y dial de radio iluminado
  for (const [x, z, r] of [[0.15, 0.1, 0.03], [0.23, 0.1, 0.03], [0.15, -0.02, 0.025], [0.23, -0.02, 0.025]]) {
    const k = part(new THREE.CylinderGeometry(r, r, 0.03, 24), BLANCO, 'paint'); k.position.set(x, H + 0.02, z); s.add(k);
    const dot = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.003, r * 0.8), mat(OSCURO, 'matte'));
    dot.position.set(x, H + 0.037, z - r * 0.3); s.add(dot);
  }
  const dial = part(new THREE.BoxGeometry(0.06, 0.012, 0.3), 0xfff1b8, 'glow');
  dial.position.set(0.38, H + 0.01, 0.0); s.add(dial);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.016, 0.006), mat(ROJO, 'matte'));
  needle.position.set(0.38, H + 0.012, 0.05); s.add(needle);

  // tapa de acrílico, con bisagra atrás
  const hinge = new THREE.Group(); hinge.position.set(0, H + 0.01, -D / 2); s.add(hinge);
  const lid = new THREE.Group(); hinge.add(lid);
  const top = clearPanel(W + 0.02, 0.012, D); top.position.set(0, 0.1, D / 2); lid.add(top);
  for (const sx of [-1, 1]) {
    // costados de la tapa: trapecio transparente con canto de madera, como en el dibujo
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(D, 0); sh.lineTo(D, 0.1); sh.lineTo(0, 0.1); sh.lineTo(0, 0);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false });
    g.rotateY(-Math.PI / 2);
    const m = new THREE.Mesh(g, acrilico); m.position.set(sx * (W / 2 + 0.01), 0, 0); lid.add(m);
    const ln = new THREE.LineSegments(new THREE.EdgesGeometry(g), lineaNegra); ln.position.copy(m.position); lid.add(ln);
  }
  const edge = part(new THREE.BoxGeometry(W + 0.04, 0.02, 0.025), MADERA, 'wood'); edge.position.set(0, 0.1, D); lid.add(edge);

  s.position.y = 0;
  const root = new THREE.Group(); root.add(s);
  root.userData.reset = () => { hinge.rotation.x = 0; arm.rotation.y = restAngle; };
  root.userData.update = (now, t, dt) => {
    // 0.5–1.6 s: se abre la tapa · 1.6–2.4 s: el brazo va al disco · siempre gira el plato
    hinge.rotation.x = -1.75 * smooth(0.5, 1.6, t);
    arm.rotation.y = restAngle + (playAngle - restAngle) * smooth(1.6, 2.4, t);
    platter.rotation.y -= 3.5 * dt * smooth(1.2, 2.0, t);
  };
  return root;
}
