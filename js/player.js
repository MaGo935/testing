// Estado do jogador local, movimento, tiro, recarga e snapshots dos outros
const me = {
    x: 0,
    y: 0,
    z: 0,
    vy: 0,
    yaw: 0,
    pitch: 0,
    hp: 100,
    alive: false,
    id: null,
    team: "CT",
    ammo: 30,
    rel: false,
  },
  others = {};
let ac,
  down = false,
  lastShot = 0,
  sent = 0,
  prev = 0;
function beep() {
  ac = ac || new AudioContext();
  const o = ac.createOscillator(),
    g = ac.createGain(),
    t = ac.currentTime;
  o.type = "sawtooth";
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.1);
  g.gain.setValueAtTime(0.2, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(g).connect(ac.destination);
  o.start();
  o.stop(t + 0.1);
}
function reload() {
  if (me.rel || me.ammo === 30) return;
  me.rel = true;
  setTimeout(() => {
    me.ammo = 30;
    me.rel = false;
  }, 1800);
}
const rc = new T.Raycaster();
rc.far = 100;
function shoot(t) {
  if (!me.alive || me.rel || t - lastShot < 110) return;
  if (me.ammo <= 0) return reload();
  lastShot = t;
  me.ammo--;
  beep();
  me.pitch += 0.006;
  me.yaw += (Math.random() - 0.5) * 0.004;
  kick();
  rc.setFromCamera({ x: 0, y: 0 }, cam);
  const h = rc.intersectObjects([
    fl,
    ...wm,
    ...Object.values(others)
      .filter((o) => o.g.visible)
      .flatMap((o) => o.g.children),
  ])[0];
  fire(h);
  if (me.ammo === 0) reload();
}
function move(dt) {
  const f = (K.KeyW ? 1 : 0) - (K.KeyS ? 1 : 0),
    r = (K.KeyD ? 1 : 0) - (K.KeyA ? 1 : 0),
    s = (6 * dt) / (Math.hypot(f, r) || 1);
  const dx = (-Math.sin(me.yaw) * f + Math.cos(me.yaw) * r) * s,
    dz = (-Math.cos(me.yaw) * f - Math.sin(me.yaw) * r) * s;
  if (!bx(me.x + dx, me.y, me.z)) me.x += dx;
  if (!bx(me.x, me.y, me.z + dz)) me.z += dz;
  if (K.Space && me.ground) me.vy = 7;
  me.vy -= 20 * dt;
  const ny = me.y + me.vy * dt;
  me.ground = false;
  const b = bx(me.x, ny, me.z);
  if (b) {
    if (me.vy < 0) {
      me.y = b.y + b.h / 2;
      me.ground = true;
    }
    me.vy = 0;
  } else me.y = ny;
  if (me.y <= 0) {
    me.y = 0;
    me.vy = 0;
    me.ground = true;
  }
}
function snap(ps) {
  const seen = {};
  ps.forEach((p) => {
    if (p.id === me.id) {
      me.hp = p.hp;
      me.alive = p.alive;
      return;
    }
    seen[p.id] = 1;
    let o = others[p.id];
    if (!o) {
      o = others[p.id] = {
        g: mk(p.id, p.team),
        t: new T.Vector3(p.x, p.y, p.z),
      };
      o.g.position.copy(o.t);
      scene.add(o.g);
    }
    o.t.set(p.x, p.y, p.z);
    o.g.rotation.y = p.yaw;
    o.g.visible = p.alive;
  });
  for (const i in others)
    if (!seen[i]) {
      scene.remove(others[i].g);
      delete others[i];
    }
  $("sb").textContent = ps
    .sort((a, b) => b.k - a.k)
    .map((p) => `[${p.team}] ${p.name} ${p.k}/${p.d}`)
    .join("\n");
}
function spawnMe(m) {
  Object.assign(me, {
    x: m.x,
    y: 0,
    z: m.z,
    vy: 0,
    hp: 100,
    alive: true,
    ammo: 30,
    rel: false,
    yaw: me.team === "T" ? Math.PI : 0,
    pitch: 0,
  });
}
