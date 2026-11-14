// Teclado, mouse e redimensionamento
addEventListener("keydown", (e) => {
  K[e.code] = true;
  if (e.code === "KeyR") reload();
});
addEventListener("keyup", (e) => (K[e.code] = false));
addEventListener("mousedown", () => {
  down = true;
  if ($("menu").style.display === "none" && !document.pointerLockElement)
    ren.domElement.requestPointerLock();
});
addEventListener("mouseup", () => (down = false));
addEventListener("mousemove", (e) => {
  if (!document.pointerLockElement) return;
  me.yaw -= e.movementX * 0.002;
  me.pitch = Math.max(-1.5, Math.min(1.5, me.pitch - e.movementY * 0.002));
});
addEventListener("resize", () => {
  cam.aspect = innerWidth / innerHeight;
  cam.updateProjectionMatrix();
  ren.setSize(innerWidth, innerHeight);
});
