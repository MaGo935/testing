// Menu: criar partida, entrar por código, servidor dedicado
let tick;
$("host").onclick = () => {
  prep();
  const code = Array.from(
    { length: 4 },
    () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[(Math.random() * 31) | 0],
  ).join("");
  const peer = new Peer("csweb-" + code);
  peer.on("error", (e) =>
    e.type === "unavailable-id"
      ? $("host").click()
      : leave("Erro P2P: " + e.type),
  );
  peer.on("open", () => {
    H.tx[0] = onMsg;
    net.send = (m) => H.handle(0, m);
    net.on = true;
    clearInterval(tick);
    tick = setInterval(
      () =>
        H.bc({
          t: "p",
          ps: [...H.P.values()].map(
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
          ),
        }),
      50,
    );
    $("code").textContent =
      `Código: ${code}  |  ${location.href.split("#")[0]}#${code}`;
    H.handle(0, hello());
  });
  peer.on("connection", (c) => {
    const id = H.n++;
    H.tx[id] = (m) => c.open && c.send(m);
    c.on("data", (m) => H.handle(id, m));
    c.on("close", () => H.drop(id));
  });
};
$("join").onclick = () => {
  prep();
  const code = $("cd").value.trim().toUpperCase(),
    peer = new Peer();
  peer.on("error", (e) =>
    leave(
      e.type === "peer-unavailable"
        ? "Partida não encontrada"
        : "Erro P2P: " + e.type,
    ),
  );
  peer.on("open", () => {
    const c = peer.connect("csweb-" + code, { serialization: "json" });
    c.on("open", () => {
      net.send = (m) => c.send(m);
      net.on = true;
      c.send(hello());
    });
    c.on("data", onMsg);
    c.on("close", () => leave("O host desconectou"));
  });
};
$("srv").value = localStorage.srv || "wss://";
$("ded").onclick = () => {
  prep();
  localStorage.srv = $("srv").value;
  let ws;
  try {
    ws = new WebSocket($("srv").value);
  } catch (e) {
    return leave("URL inválida");
  }
  ws.onopen = () => {
    net.send = (m) => ws.send(JSON.stringify(m));
    net.on = true;
    net.send(hello());
  };
  ws.onerror = () => leave("Não foi possível conectar");
  ws.onclose = () => net.on && leave("Servidor desconectou");
  ws.onmessage = (e) => onMsg(JSON.parse(e.data));
};
if (location.hash) $("cd").value = location.hash.slice(1).toUpperCase();
