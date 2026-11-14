// Constantes, atalhos e mapa (caixas + colisão)
const $ = (i) => document.getElementById(i),
  T = THREE,
  K = {};
const MAP = [
  [0, 2, -40, 80, 4, 1],
  [0, 2, 40, 80, 4, 1],
  [-40, 2, 0, 1, 4, 80],
  [40, 2, 0, 1, 4, 80],
  [0, 1.5, 0, 10, 3, 2],
  [-15, 1.5, -10, 2, 3, 14],
  [15, 1.5, 10, 2, 3, 14],
  [-10, 1, 15, 6, 2, 6],
  [10, 1, -15, 6, 2, 6],
  [0, 1.5, -25, 16, 3, 2],
  [0, 1.5, 25, 16, 3, 2],
  [-28, 1.5, 20, 8, 3, 8],
  [28, 1.5, -20, 8, 3, 8],
];
const B = MAP.map(([x, y, z, w, h, d]) => ({ x, y, z, w, h, d }));
const bx = (px, py, pz) =>
  B.find(
    (b) =>
      Math.abs(px - b.x) < b.w / 2 + 0.4 &&
      Math.abs(pz - b.z) < b.d / 2 + 0.4 &&
      py < b.y + b.h / 2 - 0.01 &&
      py + 1.8 > b.y - b.h / 2,
  );
