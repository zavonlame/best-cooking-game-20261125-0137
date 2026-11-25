// Dapur Kilat — the kitchen: where every station sits, what it holds, and how
// the chef bumps into it. Counters are the work surfaces; crates hand out raw
// ingredients; the board chops; the stoves cook; the pass serves.
import { FIELD, ING_KEYS, INGREDIENTS } from './config.js';

export const KIND_CRATE = 'crate';
export const KIND_BOARD = 'board';
export const KIND_STOVE = 'stove';
export const KIND_COUNTER = 'counter';
export const KIND_PLATES = 'plates';
export const KIND_SERVE = 'serve';
export const KIND_BIN = 'bin';

function station(id, kind, x, y, w, h, extra = {}) {
  return { id, kind, x, y, w, h, item: null, progress: 0, ...extra };
}

// The room: crates along the top wall, board left, stoves right, plates and
// the bin along the bottom, the serve window top-right, counters in between.
export function buildKitchen() {
  const stations = [];
  const crateY = FIELD.y + 8;
  const crateW = 104;
  const crateH = 72;
  ING_KEYS.forEach((ing, i) => {
    stations.push(station(`crate-${ing}`, KIND_CRATE, 24 + i * 116, crateY, crateW, crateH, { ing }));
  });
  stations.push(station('serve', KIND_SERVE, 1040, crateY, 216, crateH));
  stations.push(station('board', KIND_BOARD, 24, FIELD.y + 170, 128, 96));
  stations.push(station('counter-a', KIND_COUNTER, 24, FIELD.y + 300, 128, 96));
  stations.push(station('stove-1', KIND_STOVE, 1128, FIELD.y + 170, 128, 96));
  stations.push(station('stove-2', KIND_STOVE, 1128, FIELD.y + 300, 128, 96));
  stations.push(station('counter-b', KIND_COUNTER, 560, FIELD.y + 500, 160, 84));
  stations.push(station('plates', KIND_PLATES, 24, FIELD.y + 500, 128, 84));
  stations.push(station('bin', KIND_BIN, 1128, FIELD.y + 500, 128, 84));
  return stations;
}

export function stationCenter(s) {
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

// The nearest station whose edge the chef can reach, or null.
export function nearestStation(stations, x, y, range) {
  let best = null;
  let bestD = Infinity;
  for (const s of stations) {
    const cx = Math.max(s.x, Math.min(x, s.x + s.w));
    const cy = Math.max(s.y, Math.min(y, s.y + s.h));
    const d = Math.hypot(cx - x, cy - y);
    if (d < range && d < bestD) { best = s; bestD = d; }
  }
  return best;
}

// Push a moving circle out of every station rectangle and the room walls.
export function collide(stations, p, radius) {
  const minX = FIELD.x + radius;
  const maxX = FIELD.x + FIELD.width - radius;
  const minY = FIELD.y + radius;
  const maxY = FIELD.y + FIELD.height - radius;
  p.x = Math.max(minX, Math.min(maxX, p.x));
  p.y = Math.max(minY, Math.min(maxY, p.y));
  for (const s of stations) {
    const nx = Math.max(s.x, Math.min(p.x, s.x + s.w));
    const ny = Math.max(s.y, Math.min(p.y, s.y + s.h));
    const dx = p.x - nx;
    const dy = p.y - ny;
    const d2 = dx * dx + dy * dy;
    if (d2 < radius * radius) {
      if (d2 === 0) { p.y = s.y - radius; continue; }
      const d = Math.sqrt(d2);
      p.x = nx + (dx / d) * radius;
      p.y = ny + (dy / d) * radius;
    }
  }
}

export function ingredientLabel(ing) {
  return INGREDIENTS[ing].label;
}
