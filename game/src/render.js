// Dapur Kilat — drawing: the kitchen, the HUD, the chef, and every dish.
// All art is drawn with canvas shapes; there are no image assets.
import { FIELD, HUD_H, INGREDIENTS, VIEW, isReady } from './config.js';
import { KIND_BIN, KIND_BOARD, KIND_COUNTER, KIND_CRATE, KIND_PLATES, KIND_SERVE, KIND_STOVE, stationCenter } from './kitchen.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './game.js';

const TILE = 52;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'center', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// One ingredient, drawn as a little plate of food. Chopped food is cut into
// pieces; cooked food browns at the edges; burnt food is charcoal.
export function drawIngredient(ctx, item, x, y, r) {
  const def = INGREDIENTS[item.ing];
  ctx.save();
  ctx.translate(x, y);
  if (item.stage === 'burnt') {
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.4);
    ctx.lineTo(r * 0.4, r * 0.5);
    ctx.moveTo(r * 0.5, -r * 0.5);
    ctx.lineTo(-r * 0.3, r * 0.4);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const chopped = def.chop > 0 && item.chopped >= 1;
  const cooked = def.cook > 0 && item.cooked >= 1;
  if (item.ing === 'nasi') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, 2, r, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbbf9a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = cooked ? '#e8c98a' : '#f5f0dc';
    ctx.beginPath();
    ctx.ellipse(0, -2, r * 0.85, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.ing === 'telur') {
    ctx.fillStyle = '#fffdf4';
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.78, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cooked ? '#e8a13c' : '#f6c453';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.ing === 'cabai') {
    ctx.strokeStyle = def.color;
    ctx.lineWidth = r * 0.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (chopped) {
      ctx.moveTo(-r * 0.7, 0); ctx.lineTo(-r * 0.1, 0);
      ctx.moveTo(r * 0.1, -r * 0.3); ctx.lineTo(r * 0.7, -r * 0.3);
      ctx.moveTo(-r * 0.2, r * 0.4); ctx.lineTo(r * 0.5, r * 0.4);
    } else {
      ctx.arc(0, -r * 0.2, r * 0.75, Math.PI * 0.15, Math.PI * 0.85);
    }
    ctx.stroke();
    ctx.strokeStyle = '#2f7d32';
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, -r * 0.75);
    ctx.lineTo(-r * 0.9, -r * 1.05);
    ctx.stroke();
  } else if (item.ing === 'ayam') {
    ctx.fillStyle = cooked ? '#a35a1e' : '#d9915b';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.1, r * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f3e2c7';
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.35, r * 0.35);
    ctx.lineTo(r * 0.85, r * 0.85);
    ctx.stroke();
    ctx.fillStyle = '#f3e2c7';
    ctx.beginPath();
    ctx.arc(r * 0.85, r * 0.85, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    if (chopped) {
      ctx.strokeStyle = '#7a3c10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.5); ctx.lineTo(r * 0.3, r * 0.3);
      ctx.stroke();
    }
  } else if (item.ing === 'mie') {
    ctx.strokeStyle = cooked ? '#d99a26' : '#f2c14e';
    ctx.lineWidth = r * 0.26;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(0, (i - 1) * r * 0.45, r * 0.55, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }
  } else if (item.ing === 'sayur') {
    ctx.fillStyle = def.color;
    for (let i = 0; i < 3; i += 1) {
      const a = -0.6 + i * 0.6;
      ctx.beginPath();
      ctx.ellipse(Math.sin(a) * r * 0.5, -Math.cos(a) * r * 0.3, r * 0.42, r * 0.62, a, 0, Math.PI * 2);
      ctx.fill();
    }
    if (chopped) {
      ctx.fillStyle = '#2e7d32';
      for (let i = 0; i < 4; i += 1) {
        ctx.fillRect(-r * 0.7 + i * r * 0.36, -r * 0.2 + (i % 2) * r * 0.3, r * 0.28, r * 0.28);
      }
    }
  }
  ctx.restore();
}

function drawPlate(ctx, plate, x, y, r) {
  ctx.fillStyle = '#f8f8f8';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  ctx.stroke();
  plate.items.forEach((item, i) => {
    const a = -0.6 + (i * 1.1);
    drawIngredient(ctx, item, x + Math.cos(a) * r * 0.5, y - 6 + Math.sin(a) * r * 0.2, r * 0.55);
  });
}

function drawItem(ctx, item, x, y, r) {
  if (!item) return;
  if (item.kind === 'plate') { drawPlate(ctx, item, x, y, r); return; }
  drawIngredient(ctx, item, x, y, r);
}

function stationColors(kind) {
  switch (kind) {
    case KIND_CRATE: return ['#8a5a2b', '#6e451f'];
    case KIND_BOARD: return ['#b08954', '#8a6a3e'];
    case KIND_STOVE: return ['#4a4a52', '#33333a'];
    case KIND_COUNTER: return ['#c8a06a', '#a67c46'];
    case KIND_PLATES: return ['#e8e4d8', '#c9c2ae'];
    case KIND_SERVE: return ['#3f7d4e', '#2c5a37'];
    case KIND_BIN: return ['#5a5a5a', '#3d3d3d'];
    default: return ['#888', '#666'];
  }
}

function drawStation(ctx, s, time) {
  const [top, bottom] = stationColors(s.kind);
  ctx.fillStyle = bottom;
  rr(ctx, s.x + 2, s.y + 4, s.w, s.h, 10);
  ctx.fill();
  ctx.fillStyle = top;
  rr(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  rr(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.stroke();
  const cx = s.x + s.w / 2;
  const cy = s.y + s.h / 2;
  if (s.kind === KIND_CRATE) {
    drawIngredient(ctx, { ing: s.ing, chopped: 0, cooked: 0, stage: 'raw' }, cx, cy - 8, 20);
    text(ctx, INGREDIENTS[s.ing].label, cx, s.y + s.h - 12, 13, '#fff');
  } else if (s.kind === KIND_BOARD) {
    // a little knife, drawn, not an emoji: it must render in any browser
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 22);
    ctx.lineTo(cx + 12, cy - 2);
    ctx.stroke();
    ctx.strokeStyle = '#5a3a1a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy - 2);
    ctx.lineTo(cx + 22, cy + 6);
    ctx.stroke();
    text(ctx, 'TALENAN', cx, s.y + s.h - 12, 12, '#fff');
    if (s.item) {
      drawIngredient(ctx, s.item, cx, cy + 8, 18);
      if (s.progress > 0 && s.progress < 1) {
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 34, s.y + s.h - 26, 68, 8);
        ctx.fillStyle = '#ffd75e';
        ctx.fillRect(cx - 34, s.y + s.h - 26, 68 * s.progress, 8);
      }
    }
  } else if (s.kind === KIND_STOVE) {
    const on = !!s.item;
    ctx.fillStyle = on ? '#ff9a3c' : '#222';
    ctx.beginPath();
    ctx.arc(cx - 26, cy - 6, 15, 0, Math.PI * 2);
    ctx.arc(cx + 26, cy - 6, 15, 0, Math.PI * 2);
    ctx.fill();
    if (on) {
      ctx.fillStyle = 'rgba(255,150,50,0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 22 + Math.sin(time * 6) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, 'KOMPOR', cx, s.y + s.h - 12, 12, '#fff');
    if (s.item) {
      drawIngredient(ctx, s.item, cx, cy - 6, 17);
      if (s.item.cooked > 0 && s.item.cooked < 1) {
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 34, s.y + s.h - 26, 68, 8);
        ctx.fillStyle = s.item.cooked >= 1 ? '#8be28b' : '#ff9a3c';
        ctx.fillRect(cx - 34, s.y + s.h - 26, 68 * Math.min(1, s.item.cooked), 8);
      } else if (s.item.stage === 'cooked') {
        text(ctx, 'MATANG!', cx, s.y - 10, 13, '#8be28b');
      } else if (s.item.stage === 'burnt') {
        text(ctx, 'GOSONG!', cx, s.y - 10, 13, '#ff6b6b');
      }
    }
  } else if (s.kind === KIND_COUNTER) {
    text(ctx, 'MEJA', cx, s.y + s.h - 12, 12, '#fff');
    if (s.item) drawItem(ctx, s.item, cx, cy - 4, s.item.kind === 'plate' ? 26 : 18);
  } else if (s.kind === KIND_PLATES) {
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i === 0 ? '#fff' : '#ddd';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 6 - i * 7, 30, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    text(ctx, 'PIRING', cx, s.y + s.h - 12, 12, '#333');
  } else if (s.kind === KIND_SERVE) {
    text(ctx, 'SAJIKAN', cx, cy - 8, 22, '#fff');
    text(ctx, 'antar pesanan di sini', cx, s.y + s.h - 12, 12, '#dff0d8');
  } else if (s.kind === KIND_BIN) {
    ctx.fillStyle = '#d8d8d8';
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 16);
    ctx.lineTo(cx + 16, cy - 16);
    ctx.lineTo(cx + 12, cy + 14);
    ctx.lineTo(cx - 12, cy + 14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(cx - 20, cy - 22, 40, 6);
    text(ctx, 'SAMPAH', cx, s.y + s.h - 12, 12, '#fff');
  }
}

function drawChef(ctx, chef, time) {
  const bob = Math.sin(time * 10) * 1.5;
  const { x, y } = chef;
  ctx.save();
  ctx.translate(x, y + bob * 0.3);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // body (apron)
  ctx.fillStyle = '#f2f2f2';
  rr(ctx, -16, -6, 32, 26, 10);
  ctx.fill();
  ctx.fillStyle = '#3f7d4e';
  ctx.fillRect(-16, 8, 32, 6);
  // head
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -16, 13, 0, Math.PI * 2);
  ctx.fill();
  // toque
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-8, -26, 8, 0, Math.PI * 2);
  ctx.arc(0, -30, 9, 0, Math.PI * 2);
  ctx.arc(8, -26, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13, -28, 26, 6);
  // eyes face the walking direction
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(chef.dir * 4 - 4, -16, 1.8, 0, Math.PI * 2);
  ctx.arc(chef.dir * 4 + 5, -16, 1.8, 0, Math.PI * 2);
  ctx.fill();
  // carried thing above the head
  if (chef.carry) drawItem(ctx, chef.carry, 0, -52, 19);
  ctx.restore();
}

function drawOrderCard(ctx, order, x, y, w) {
  const urgent = order.tLeft < 15;
  const frac = Math.max(0, order.tLeft / order.tMax);
  ctx.fillStyle = urgent ? '#7a2e2e' : '#2c2c34';
  rr(ctx, x, y, w, 76, 10);
  ctx.fill();
  ctx.strokeStyle = urgent ? '#ff6b6b' : 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  rr(ctx, x, y, w, 76, 10);
  ctx.stroke();
  text(ctx, order.name, x + 12, y + 13, 13, '#fff', 'left');
  order.recipe.needs.forEach((ing, i) => {
    drawIngredient(ctx, { ing, chopped: 1, cooked: 1, stage: 'cooked' }, x + 26 + i * 44, y + 46, 14);
  });
  text(ctx, `${Math.ceil(order.tLeft)} dtk`, x + w - 12, y + 30, 12, urgent ? '#ff9a9a' : '#ccc', 'right');
  // timer bar
  ctx.fillStyle = '#111';
  ctx.fillRect(x + 12, y + 64, w - 24, 6);
  ctx.fillStyle = frac > 0.5 ? '#8be28b' : frac > 0.25 ? '#ffd75e' : '#ff6b6b';
  ctx.fillRect(x + 12, y + 64, (w - 24) * frac, 6);
}

function drawHUD(ctx, game) {
  ctx.fillStyle = '#1d1d22';
  ctx.fillRect(0, 0, VIEW.width, HUD_H);
  ctx.fillStyle = '#2e2e36';
  ctx.fillRect(0, HUD_H - 4, VIEW.width, 4);
  text(ctx, 'DAPUR KILAT', 16, 26, 24, '#ffd75e', 'left');
  text(ctx, game.rush ? 'RUSH HOUR!' : 'warung cepat saji', 16, 56, 13, game.rush ? '#ff6b6b' : '#aaa', 'left');
  // day timer
  const dayFrac = game.timeLeft / 150;
  ctx.fillStyle = '#111';
  rr(ctx, 220, 20, 220, 14, 7);
  ctx.fill();
  ctx.fillStyle = dayFrac > 0.25 ? '#ffd75e' : '#ff6b6b';
  rr(ctx, 220, 20, 220 * dayFrac, 14, 7);
  ctx.fill();
  text(ctx, `${Math.ceil(game.timeLeft)} dtk`, 330, 52, 15, '#fff');
  // coins + served
  text(ctx, `Koin ${game.coins}`, 500, 30, 20, '#ffd75e', 'left');
  text(ctx, `${game.served} disajikan`, 500, 58, 14, '#ddd', 'left');
  if (game.combo >= 2) text(ctx, `Kombo x${game.combo}`, 660, 30, 16, '#ff9a3c', 'left');
  // orders on the right
  game.board.orders.forEach((order, i) => {
    drawOrderCard(ctx, order, 760 + i * 130, 10, 122);
  });
}

function drawFloor(ctx, time) {
  ctx.fillStyle = '#a9805a';
  ctx.fillRect(FIELD.x, FIELD.y, FIELD.width, FIELD.height);
  ctx.fillStyle = '#9a7048';
  for (let y = FIELD.y; y < FIELD.y + FIELD.height; y += TILE) {
    for (let x = FIELD.x; x < FIELD.x + FIELD.width; x += TILE) {
      if (((x / TILE) + (y / TILE)) % 2 === 0) ctx.fillRect(x, y, TILE, TILE);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (let y = FIELD.y; y <= FIELD.y + FIELD.height; y += TILE) {
    ctx.beginPath(); ctx.moveTo(FIELD.x, y); ctx.lineTo(FIELD.x + FIELD.width, y); ctx.stroke();
  }
  for (let x = FIELD.x; x <= FIELD.x + FIELD.width; x += TILE) {
    ctx.beginPath(); ctx.moveTo(x, FIELD.y); ctx.lineTo(x, FIELD.y + FIELD.height); ctx.stroke();
  }
}

function drawHint(ctx, game) {
  const chef = game.chef;
  if (!chef.hint || game.screen !== SCREEN_PLAY) return;
  const label = chef.hint;
  ctx.font = '700 14px system-ui, sans-serif';
  const w = ctx.measureText(label).width + 24;
  const x = Math.max(8, Math.min(VIEW.width - w - 8, chef.x - w / 2));
  const y = chef.y - 106;
  ctx.fillStyle = 'rgba(20,20,26,0.88)';
  rr(ctx, x, y, w, 26, 13);
  ctx.fill();
  text(ctx, label, x + w / 2, y + 14, 14, '#fff');
}

function drawParticles(ctx, game) {
  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of game.floats) {
    ctx.globalAlpha = Math.min(1, f.life);
    text(ctx, f.text, f.x, f.y, 20, f.color);
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, game) {
  ctx.fillStyle = 'rgba(15,15,20,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'DAPUR KILAT', 640, 190, 72, '#ffd75e');
  text(ctx, 'Warung cepat saji — masak, sajikan, jangan sampai hangus!', 640, 250, 22, '#fff');
  text(ctx, 'WASD / Panah — jalan    •    E / Spasi — ambil, potong, masak, sajikan', 640, 320, 18, '#ddd');
  text(ctx, 'Klik stasiun terdekat juga bisa. Potong di talenan, masak di kompor,', 640, 352, 18, '#ddd');
  text(ctx, 'tata di piring, antar ke jendela SAJIKAN sebelum pesanan hangus.', 640, 380, 18, '#ddd');
  text(ctx, 'Menu: Nasi Goreng • Mie Ayam • Ayam Geprek • Omelet Sayur • Nasi Ayam', 640, 424, 17, '#ffd75e');
  const pulse = 0.7 + Math.sin(game.time * 4) * 0.3;
  ctx.globalAlpha = pulse;
  text(ctx, 'Tekan ENTER untuk mulai', 640, 500, 26, '#fff');
  ctx.globalAlpha = 1;
  text(ctx, 'Shift 150 detik • Kombo menaikkan tip • Jangan biarkan masakan gosong', 640, 548, 15, '#aaa');
}

function drawOver(ctx, game) {
  ctx.fillStyle = 'rgba(15,15,20,0.78)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'SHIFT SELESAI!', 640, 200, 56, '#ffd75e');
  text(ctx, `Koin: ${game.coins}  •  Disajikan: ${game.served}  •  Hangus: ${game.failed}`, 640, 280, 24, '#fff');
  text(ctx, `Kombo terbaik: x${game.bestCombo}`, 640, 326, 20, '#ff9a3c');
  const verdict = game.coins >= 120 ? 'Koki bintang lima! Warungmu ramai terus.'
    : game.coins >= 70 ? 'Dapur yang rapi — pelanggan pulang kenyang.'
    : game.coins >= 35 ? 'Lumayan! Besok lebih cepat lagi.'
    : 'Dapurmu masih berantakan — coba lagi, koki!';
  text(ctx, verdict, 640, 380, 20, '#ddd');
  const pulse = 0.7 + Math.sin(game.time * 4) * 0.3;
  ctx.globalAlpha = pulse;
  text(ctx, 'Tekan R untuk main lagi', 640, 460, 24, '#fff');
  ctx.globalAlpha = 1;
}

export function render(ctx, game) {
  ctx.save();
  if (game.shake > 0) {
    ctx.translate((Math.random() - 0.5) * 8 * game.shake * 4, (Math.random() - 0.5) * 8 * game.shake * 4);
  }
  drawFloor(ctx, game.time);
  for (const s of game.stations) drawStation(ctx, s, game.time);
  drawChef(ctx, game.chef, game.time);
  drawParticles(ctx, game);
  drawHUD(ctx, game);
  drawHint(ctx, game);
  if (game.screen === SCREEN_TITLE) drawTitle(ctx, game);
  if (game.screen === SCREEN_OVER) drawOver(ctx, game);
  if (game.flash > 0) {
    ctx.fillStyle = `rgba(255,60,60,${game.flash * 0.5})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
  ctx.restore();
}
