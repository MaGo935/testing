// Loop principal do jogo
function loop(t) {
  requestAnimationFrame(loop);
  const dt = Math.min((t - prev) / 1000, 0.05);
  prev = t;
  if (me.alive && document.pointerLockElement) {
    move(dt);
    if (down) shoot(t);
  }
  cam.position.set(me.x, me.y + 1.6, me.z);
  cam.rotation.set(me.pitch, me.yaw, 0, "YXZ");
  for (const i in others) others[i].g.position.lerp(others[i].t, 0.3);
  if (net.on && me.alive && t - sent > 50) {
    sent = t;
    net.send({ t: "s", x: me.x, y: me.y, z: me.z, yaw: me.yaw });
  }
  $("st").textContent = me.alive
    ? `HP ${me.hp}   ${me.rel ? "RECARREGANDO" : me.ammo}/30`
    : "MORTO - renascendo...";
  ren.render(scene, cam);
}
requestAnimationFrame(loop);
