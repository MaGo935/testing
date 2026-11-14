// Cena Three.js: câmera, luzes, mapa, arma e modelo dos jogadores
const scene = new T.Scene();
scene.background = new T.Color(0x9ec8e8);
scene.fog = new T.Fog(0x9ec8e8, 30, 90);
const cam = new T.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 200);
scene.add(cam);
const ren = new T.WebGLRenderer({ antialias: true });
ren.setSize(innerWidth, innerHeight);
document.body.prepend(ren.domElement);
scene.add(new T.HemisphereLight(0xffffff, 0x665544, 1));
const sun = new T.DirectionalLight(0xffffff, 0.6);
sun.position.set(20, 40, 10);
scene.add(sun);
const fl = new T.Mesh(
  new T.PlaneGeometry(80, 80),
  new T.MeshLambertMaterial({ color: 0xc2b280 }),
);
fl.rotation.x = -Math.PI / 2;
scene.add(fl);
const wm = B.map((b, i) => {
  const m = new T.Mesh(
    new T.BoxGeometry(b.w, b.h, b.d),
    new T.MeshLambertMaterial({ color: i % 2 ? 0x9a8a6a : 0x7a6a50 }),
  );
  m.position.set(b.x, b.y, b.z);
  scene.add(m);
  return m;
});
const gun = new T.Mesh(
  new T.BoxGeometry(0.1, 0.12, 0.55),
  new T.MeshLambertMaterial({ color: 0x222222 }),
);
gun.position.set(0.25, -0.22, -0.5);
cam.add(gun);
function mk(id, team) {
  const g = new T.Group(),
    c = team === "T" ? 0xdd9933 : 0x4477ff;
  const b = new T.Mesh(
    new T.BoxGeometry(0.6, 1, 0.4),
    new T.MeshLambertMaterial({ color: c }),
  );
  b.position.y = 0.8;
  const h = new T.Mesh(
    new T.BoxGeometry(0.3, 0.3, 0.3),
    new T.MeshLambertMaterial({ color: 0xf0c8a0 }),
  );
  h.position.y = 1.5;
  b.userData = { pid: id };
  h.userData = { pid: id, head: true };
  g.add(b, h);
  return g;
}
