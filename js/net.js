// Camada de rede: mensagens recebidas, saída da partida
const net = { on: false, send() {} };
function onMsg(m) {
  if (m.t === "init") {
    me.id = m.id;
    spawnMe(m);
    $("menu").style.display = "none";
  } else if (m.t === "p") snap(m.ps);
  else if (m.t === "respawn") spawnMe(m);
  else if (m.t === "kill") {
    const d = document.createElement("div");
    d.textContent = `${m.k} ➜ ${m.v}${m.head ? " (HS)" : ""}`;
    $("kf").append(d);
    setTimeout(() => d.remove(), 4000);
  }
}
function leave(msg) {
  net.on = false;
  me.alive = false;
  for (const i in others) {
    scene.remove(others[i].g);
    delete others[i];
  }
  $("code").textContent = "";
  $("menu").style.display = "flex";
  if (msg) alert(msg);
}
const hello = () => ({
  t: "join",
  name: $("nm").value || "Player",
  team: me.team,
});
function prep() {
  me.team = $("tm").value;
  ren.domElement.requestPointerLock();
}
