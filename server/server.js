const http = require("http"),
  fs = require("fs"),
  path = require("path"),
  os = require("os");
const { WebSocketServer } = require("ws");

const ROOT = path.join(__dirname, "..");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
};
const srv = http.createServer((q, s) => {
  let u = decodeURIComponent(q.url.split("?")[0]);
  if (u === "/") u = "/index.html";
  const f = path.join(ROOT, u);
  if (
    !f.startsWith(ROOT + path.sep) ||
    f.startsWith(path.join(ROOT, "server"))
  ) {
    s.writeHead(403);
    return s.end();
  }
  fs.readFile(f, (e, d) => {
    s.writeHead(e ? 404 : 200, {
      "Content-Type": MIME[path.extname(f)] || "application/octet-stream",
    });
    s.end(d);
  });
});
const wss = new WebSocketServer({ server: srv });
const P = new Map();
let nid = 1;
const spawn = (t) => ({ x: Math.random() * 60 - 30, z: t === "T" ? -35 : 35 });
const send = (ws, o) => ws.readyState === 1 && ws.send(JSON.stringify(o));
const bc = (o) => P.forEach((p) => send(p.ws, o));

wss.on("connection", (ws) => {
  const id = nid++;
  let p = null;
  ws.on("message", (raw) => {
    let m;
    try {
      m = JSON.parse(raw);
    } catch {
      return;
    }
    if (m.t === "join" && !p) {
      const team = m.team === "T" ? "T" : "CT",
        s = spawn(team);
      p = {
        id,
        ws,
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
      P.set(id, p);
      send(ws, { t: "init", id, ...s });
    } else if (!p) return;
    else if (m.t === "s" && p.alive) {
      if ([m.x, m.y, m.z, m.yaw].every(Number.isFinite)) {
        p.x = m.x;
        p.y = m.y;
        p.z = m.z;
        p.yaw = m.yaw;
      }
    } else if (m.t === "hit") {
      const v = P.get(m.id),
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
        bc({ t: "kill", k: p.name, v: v.name, head: !!m.head });
        setTimeout(() => {
          if (!P.has(v.id)) return;
          const s = spawn(v.team);
          Object.assign(v, s, { hp: 100, alive: true, y: 0 });
          send(v.ws, { t: "respawn", ...s });
        }, 3000);
      }
    }
  });
  ws.on("close", () => P.delete(id));
});

setInterval(() => {
  const ps = [...P.values()].map(
    ({ id, name, team, x, y, z, yaw, hp, alive, k, d }) => ({
      id,
      name,
      team,
      x,
      y,
      z,
      yaw,
      hp,
      alive,
      k,
      d,
    }),
  );
  bc({ t: "p", ps });
}, 50);

const port = process.env.PORT || 3000;
srv.listen(port, "0.0.0.0", () => {
  console.log(`CS Web rodando na porta ${port}`);
  for (const l of Object.values(os.networkInterfaces()))
    for (const i of l)
      if (i.family === "IPv4" && !i.internal)
        console.log(`LAN: http://${i.address}:${port}`);
});
