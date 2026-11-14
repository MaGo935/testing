// Lógica de host (vida, mortes, respawn) rodando no navegador
// ---- lógica de host (mesma do server.js, rodando no navegador) ----
const H = {
  P: new Map(),
  tx: {},
  n: 1,
  sp: (t) => ({ x: Math.random() * 60 - 30, z: t === "T" ? -35 : 35 }),
  bc(o) {
    H.P.forEach((p) => p.tx(o));
  },
  drop(id) {
    H.P.delete(id);
    delete H.tx[id];
  },
  handle(id, m) {
    let p = H.P.get(id);
    if (m.t === "join" && !p) {
      const team = m.team === "T" ? "T" : "CT",
        s = H.sp(team);
      p = {
        id,
        tx: H.tx[id],
        name: String(m.name || "Player").slice(0, 12),
        team,
        ...s,
        y: 0,
        yaw: 0,
        hp: 100,
        alive: true,
        k: 0,
        d: 0,
        last: 0,
      };
      H.P.set(id, p);
      p.tx({ t: "init", id, ...s });
    } else if (!p) return;
    else if (m.t === "s" && p.alive) {
      if ([m.x, m.y, m.z, m.yaw].every(Number.isFinite))
        Object.assign(p, { x: m.x, y: m.y, z: m.z, yaw: m.yaw });
    } else if (m.t === "hit") {
      const v = H.P.get(m.id),
        now = Date.now();
      if (!v || !p.alive || !v.alive || v.team === p.team || now - p.last < 90)
        return;
      p.last = now;
      v.hp -= m.head ? 100 : 27;
      if (v.hp <= 0) {
        v.hp = 0;
        v.alive = false;
        v.d++;
        p.k++;
        H.bc({ t: "kill", k: p.name, v: v.name, head: !!m.head });
        setTimeout(() => {
          if (!H.P.has(v.id)) return;
          const s = H.sp(v.team);
          Object.assign(v, s, { hp: 100, alive: true, y: 0 });
          v.tx({ t: "respawn", ...s });
        }, 3000);
      }
    }
  },
};
