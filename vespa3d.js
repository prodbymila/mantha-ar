// Vespa 98 (Piaggio, 1946) low-poly, con la estética de la capa:
// colores de marcador (rojo + crema + gris) y contorno negro.
import * as THREE from 'three';

const ROJO = 0xc23a4c, CREMA = 0xf3ecdc, GRIS = 0xc9c6c0, NEGRO = 0x1a1a1a, MADERA = 0x9a6a3c;

const grad = (() => {
  const d = new Uint8Array([140, 210, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();

const toon = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });

// contorno tipo "fibra negra": casco invertido empujado por la normal
const outlineMat = new THREE.ShaderMaterial({
  uniforms: { w: { value: 0.016 } },
  vertexShader: `uniform float w; void main(){ vec3 p = position + normal * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }`,
  fragmentShader: `void main(){ gl_FragColor = vec4(0.07,0.07,0.07,1.0); }`,
  side: THREE.BackSide,
});

function part(geo, color, { outline = true } = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, toon(color));
  g.add(m);
  if (outline) g.add(new THREE.Mesh(geo, outlineMat));
  return g;
}

function wheel(r = 0.13) {
  const g = new THREE.Group();
  g.add(part(new THREE.TorusGeometry(r, 0.045, 10, 28), NEGRO, { outline: false }));
  const hub = part(new THREE.CylinderGeometry(r * 0.62, r * 0.62, 0.07, 24), CREMA);
  hub.rotation.x = Math.PI / 2; g.add(hub);
  const cap = part(new THREE.CylinderGeometry(r * 0.22, r * 0.22, 0.09, 16), GRIS);
  cap.rotation.x = Math.PI / 2; g.add(cap);
  return g;
}

export function buildVespa() {
  const v = new THREE.Group();          // x = adelante, y = arriba, z = costado

  // carrocería trasera: perfil de costado extruido con bisel grande (la "panza" de chapa)
  const bp = new THREE.Shape();
  bp.moveTo(-0.12, 0.2);
  bp.bezierCurveTo(-0.16, 0.42, -0.2, 0.62, -0.38, 0.68);
  bp.bezierCurveTo(-0.62, 0.74, -0.86, 0.66, -0.98, 0.5);
  bp.bezierCurveTo(-1.04, 0.42, -1.02, 0.32, -0.96, 0.28);
  bp.lineTo(-0.82, 0.3);
  bp.bezierCurveTo(-0.78, 0.42, -0.5, 0.44, -0.44, 0.28);
  bp.lineTo(-0.36, 0.17);
  bp.lineTo(-0.12, 0.2);
  const bGeo = new THREE.ExtrudeGeometry(bp, { depth: 0.26, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.08, bevelSegments: 6, curveSegments: 24 });
  bGeo.translate(0, 0, -0.13);
  v.add(part(bGeo, ROJO));
  // tapa lateral del motor (bulto del lado derecho, típico de la Vespa)
  const cowl = part(new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), ROJO);
  cowl.scale.set(0.26, 0.17, 0.09); cowl.rotation.x = Math.PI / 2; cowl.position.set(-0.66, 0.42, 0.2); v.add(cowl);
  const cowl2 = cowl.clone(); cowl2.rotation.x = -Math.PI / 2; cowl2.position.z = -0.2; v.add(cowl2);

  // piso (plataforma de los pies)
  const floor = part(new THREE.BoxGeometry(0.62, 0.05, 0.36), ROJO);
  floor.position.set(0.05, 0.2, 0); v.add(floor);
  // listones de goma del piso
  for (let i = -2; i <= 2; i++) {
    const s = part(new THREE.BoxGeometry(0.5, 0.012, 0.018), NEGRO, { outline: false });
    s.position.set(0.04, 0.228, i * 0.06); v.add(s);
  }

  // escudo (legshield) curvo: perfil extruido
  const sh = new THREE.Shape();
  sh.moveTo(0.34, 0.17);
  sh.quadraticCurveTo(0.48, 0.45, 0.45, 0.9);
  sh.lineTo(0.37, 0.9);
  sh.quadraticCurveTo(0.38, 0.5, 0.2, 0.2);
  sh.lineTo(0.34, 0.17);
  const shGeo = new THREE.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3, curveSegments: 16 });
  shGeo.translate(0, 0, -0.2);
  const shield = part(shGeo, ROJO); v.add(shield);

  // columna de dirección y manubrio
  const col = part(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 14), ROJO);
  col.position.set(0.43, 0.99, 0); col.rotation.z = -0.18; v.add(col);
  const bar = part(new THREE.CylinderGeometry(0.022, 0.022, 0.62, 10), GRIS);
  bar.rotation.x = Math.PI / 2; bar.position.set(0.41, 1.13, 0); v.add(bar);
  for (const z of [-0.3, 0.3]) {
    const grip = part(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), NEGRO, { outline: false });
    grip.rotation.x = Math.PI / 2; grip.position.set(0.41, 1.13, z); v.add(grip);
  }
  // tapa del manubrio
  const head = part(new THREE.SphereGeometry(1, 18, 12), ROJO);
  head.scale.set(0.11, 0.07, 0.13); head.position.set(0.42, 1.12, 0); v.add(head);

  // horquilla y guardabarros delantero con el farol (como el 98 original)
  const fork = part(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8), GRIS);
  fork.position.set(0.52, 0.42, 0.06); fork.rotation.z = -0.25; v.add(fork);
  const fenGeo = new THREE.TorusGeometry(0.19, 0.075, 10, 24, Math.PI * 0.95);
  const fender = part(fenGeo, ROJO);
  fender.position.set(0.6, 0.14, 0); fender.rotation.z = Math.PI * 0.03; fender.scale.set(1, 1, 1.25); v.add(fender);
  const lampBody = part(new THREE.CylinderGeometry(0.065, 0.075, 0.08, 18), ROJO);
  lampBody.rotation.z = Math.PI / 2; lampBody.position.set(0.68, 0.38, 0); v.add(lampBody);
  const lens = part(new THREE.CircleGeometry(0.058, 20), 0xfff3b0, { outline: false });
  lens.rotation.y = Math.PI / 2; lens.position.set(0.725, 0.38, 0); v.add(lens);

  // asiento monoplaza sobre su resorte
  const post = part(new THREE.CylinderGeometry(0.025, 0.035, 0.14, 8), GRIS);
  post.position.set(-0.34, 0.74, 0); v.add(post);
  const seat = part(new THREE.SphereGeometry(1, 20, 12), CREMA);
  seat.scale.set(0.2, 0.06, 0.14); seat.position.set(-0.36, 0.82, 0); v.add(seat);
  // parrilla / portaequipaje trasero
  const rack = part(new THREE.BoxGeometry(0.22, 0.02, 0.18), GRIS);
  rack.position.set(-0.7, 0.75, 0); rack.rotation.z = -0.12; v.add(rack);

  // luz trasera
  const tl = part(new THREE.BoxGeometry(0.03, 0.04, 0.07), 0xe0503c);
  tl.position.set(-1.07, 0.42, 0); v.add(tl);

  // ruedas
  const fw = wheel(); fw.position.set(0.6, 0.14, 0); v.add(fw);
  const rw = wheel(); rw.position.set(-0.64, 0.14, 0); v.add(rw);
  v.userData.wheels = [fw, rw];

  // centrar: origen en el medio del piso, apoyada en y=0
  v.position.set(0.05, -0.0, 0);
  const root = new THREE.Group(); root.add(v);
  root.userData.wheels = v.userData.wheels;
  return root;
}

export function addLights(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a66, 0.55));
  const d = new THREE.DirectionalLight(0xffffff, 0.75);
  d.position.set(1.5, 3, 2.5); scene.add(d);
}
