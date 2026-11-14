// Arma em 3D (rifle + braços), animação de tiro/recarga, rastro, buraco de bala e partículas
const vm = new T.Group();
cam.add(vm);
const lam = (c) => new T.MeshLambertMaterial({ color: c });
const part = (w, h, d, c, x, y, z, rx = 0) => {
  const m = new T.Mesh(new T.BoxGeometry(w, h, d), lam(c));
  m.position.set(x, y, z);
  m.rotation.x = rx;
  vm.add(m);
  return m;
};
const limb = (a, b, w, c) => {
  const A = new T.Vector3(...a),
    Bv = new T.Vector3(...b),
    d = Bv.clone().sub(A);
  const m = new T.Mesh(new T.BoxGeometry(w, w, d.length()), lam(c));
  m.position.copy(A).add(Bv).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), d.normalize());
  vm.add(m);
};
const DARK = 0x2b2b2b,
  WOOD = 0x7a4a22,
  SKIN = 0xe0ac86,
  SLEEVE = 0x3b4a2e;
// rifle
part(0.07, 0.09, 0.38, DARK, 0, 0, 0); // corpo
part(0.075, 0.07, 0.22, WOOD, 0, -0.01, -0.28); // guarda-mão
part(0.05, 0.09, 0.22, WOOD, 0, -0.02, 0.28); // coronha
part(0.03, 0.02, 0.05, DARK, 0, 0.055, -0.08); // mira traseira
part(0.01, 0.04, 0.01, DARK, 0, 0.05, -0.55); // massa de mira
part(0.05, 0.16, 0.07, 0x1d1d1d, 0, -0.12, -0.03, 0.25); // carregador
part(0.045, 0.11, 0.05, DARK, 0, -0.09, 0.12, -0.3); // empunhadura
const barrel = new T.Mesh(
  new T.CylinderGeometry(0.015, 0.015, 0.3, 8).rotateX(Math.PI / 2),
  lam(0x151515),
);
barrel.position.set(0, 0.015, -0.45);
vm.add(barrel);
// braços e mãos
limb([0.03, -0.32, 0.5], [0.01, -0.13, 0.13], 0.08, SLEEVE); // direito
part(0.07, 0.07, 0.1, SKIN, 0, -0.1, 0.11);
limb([-0.14, -0.32, 0.3], [-0.01, -0.07, -0.27], 0.075, SLEEVE); // esquerdo
part(0.08, 0.06, 0.11, SKIN, 0, -0.06, -0.29);
// clarão do disparo
const mf = new T.Group();
mf.position.set(0, 0.02, -0.66);
vm.add(mf);
for (let i = 0; i < 2; i++) {
  const p = new T.Mesh(
    new T.PlaneGeometry(0.18, 0.18),
    new T.MeshBasicMaterial({
      color: 0xffcc55,
      transparent: true,
      opacity: 0.9,
      side: T.DoubleSide,
      depthWrite: false,
    }),
  );
  p.rotation.y = (i * Math.PI) / 2;
  mf.add(p);
}
mf.visible = false;

const BASE = new T.Vector3(0.18, -0.18, -0.45);
let rec = 0,
  flash = 0,
  bob = 0,
  rlv = 0;
function kick() {
  rec = 1;
  flash = 0.05;
  mf.visible = true;
  mf.rotation.z = Math.random() * 6;
}
function animWeapon(dt, moving) {
  vm.visible = me.alive;
  rec = Math.max(0, rec - dt * 9);
  flash -= dt;
  if (flash <= 0) mf.visible = false;
  bob += dt * (moving ? 10 : 1.5);
  rlv += ((me.rel ? 1 : 0) - rlv) * Math.min(1, dt * 8);
  vm.position.set(
    BASE.x + Math.sin(bob * 0.5) * 0.004,
    BASE.y - rlv * 0.18 + Math.abs(Math.sin(bob)) * (moving ? 0.006 : 0.002),
    BASE.z + rec * 0.05,
  );
  vm.rotation.set(rec * 0.07 + rlv * 0.6, 0, -rlv * 0.3);
}

// efeitos de impacto
const fx = [],
  holes = [],
  pg = new T.BoxGeometry(0.04, 0.04, 0.04),
  hg = new T.CircleGeometry(0.06, 8);
const hm = new T.MeshBasicMaterial({
  color: 0x111111,
  polygonOffset: true,
  polygonOffsetFactor: -2,
});
function burst(p, n, c, spd, life, cnt) {
  for (let i = 0; i < cnt; i++) {
    const m = new T.Mesh(
      pg,
      new T.MeshBasicMaterial({ color: c, transparent: true }),
    );
    m.position.copy(p);
    m.userData = {
      v: new T.Vector3(
        (Math.random() - 0.5) * spd,
        Math.random() * spd * 0.6,
        (Math.random() - 0.5) * spd,
      ).addScaledVector(n, spd * 0.6),
      l: life,
      L: life,
    };
    scene.add(m);
    fx.push(m);
  }
}
function hole(p, n) {
  const m = new T.Mesh(hg, hm);
  m.position.copy(p).addScaledVector(n, 0.012);
  m.lookAt(p.clone().add(n));
  scene.add(m);
  holes.push(m);
  if (holes.length > 60) scene.remove(holes.shift());
}
function tracer(a, b) {
  const l = new T.Line(
    new T.BufferGeometry().setFromPoints([a, b]),
    new T.LineBasicMaterial({ color: 0xffe9a0, transparent: true }),
  );
  l.userData = { l: 0.06, L: 0.06, line: true };
  scene.add(l);
  fx.push(l);
}
function updateFx(dt) {
  for (let i = fx.length - 1; i >= 0; i--) {
    const m = fx[i],
      u = m.userData;
    u.l -= dt;
    if (u.l <= 0) {
      scene.remove(m);
      m.geometry !== pg && m.geometry.dispose();
      m.material.dispose();
      fx.splice(i, 1);
      continue;
    }
    m.material.opacity = u.l / u.L;
    if (!u.line) {
      u.v.y -= 9 * dt;
      m.position.addScaledVector(u.v, dt);
    }
  }
}
function fire(h) {
  const end = h ? h.point : rc.ray.at(60, new T.Vector3());
  tracer(vm.localToWorld(new T.Vector3(0, 0.02, -0.62)), end);
  if (!h) return;
  const n = h.face.normal.clone().transformDirection(h.object.matrixWorld),
    u = h.object.userData;
  if (u.pid) {
    net.send({ t: "hit", id: u.pid, head: !!u.head });
    burst(h.point, n, 0xaa0000, 3, 0.5, 8);
    $("cross").style.borderColor = "red";
    setTimeout(() => ($("cross").style.borderColor = "#0f0"), 120);
  } else {
    hole(h.point, n);
    burst(h.point, n, 0xd8c9a0, 2.5, 0.4, 6);
  }
}
