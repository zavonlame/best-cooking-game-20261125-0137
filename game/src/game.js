// Dapur Kilat — the game itself: state, the shift timer, cooking progress,
// serving, scoring, and the title / play / game-over screens.
import { DAY_LENGTH, INGREDIENTS, isReady, servePoints } from './config.js';
import { KIND_STOVE, buildKitchen } from './kitchen.js';
import { OrderBoard } from './orders.js';
import { Chef } from './chef.js';
import { SoundBank } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

export class Game {
  constructor() {
    this.sfx = new SoundBank();
    this.reset();
  }

  reset() {
    this.screen = SCREEN_TITLE;
    this.time = 0;
    this.coins = 0;
    this.served = 0;
    this.failed = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.best = 0;
    this.stations = buildKitchen();
    this.board = new OrderBoard();
    this.chef = new Chef();
    this.particles = [];
    this.floats = [];
    this.flash = 0;
    this.shake = 0;
  }

  get timeLeft() {
    return Math.max(0, DAY_LENGTH - this.time);
  }

  get rush() {
    return this.board.rush;
  }

  start() {
    this.reset();
    this.screen = SCREEN_PLAY;
    this.sfx.unlock();
    this.sfx.click();
  }

  burst(x, y, color, n) {
    for (let i = 0; i < n; i += 1) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 90,
        vy: -40 - Math.random() * 70,
        life: 0.5 + Math.random() * 0.3,
        max: 0.8,
        color,
        size: 3 + Math.random() * 4,
      });
    }
  }

  floatText(x, y, text, color) {
    this.floats.push({ x, y, text, color, life: 1.2 });
  }

  // The chef hands a plate to the pass: match it against the order board.
  servePlate(chef) {
    const plate = chef.carry;
    if (!plate || plate.kind !== 'plate') return null;
    const ready = plate.items.filter(isReady);
    if (ready.length !== plate.items.length) {
      this.sfx.wrong();
      this.shake = 0.25;
      return 'wrong';
    }
    const order = this.board.findMatch(plate.items);
    if (!order) {
      this.sfx.wrong();
      this.shake = 0.25;
      return 'wrong';
    }
    const points = servePoints(order.recipe, order.tLeft, order.tMax, this.combo);
    this.coins += points;
    this.served += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.board.remove(order);
    chef.carry = null;
    this.sfx.serve();
    this.sfx.coin();
    const pass = this.stations.find((s) => s.kind === 'serve');
    this.floatText(pass.x + pass.w / 2, pass.y - 8, `+${points}`, '#ffd75e');
    this.burst(pass.x + pass.w / 2, pass.y + pass.h / 2, '#ffd75e', 14);
    return 'served';
  }

  // Stoves cook on their own; burnt food stays until someone bins it.
  cookStoves(dt) {
    for (const stove of this.stations) {
      if (stove.kind !== KIND_STOVE || !stove.item) continue;
      const item = stove.item;
      const def = INGREDIENTS[item.ing];
      if (def.cook <= 0) continue;
      if (item.cooked < 1) {
        item.cooked = Math.min(1, item.cooked + dt / def.cook);
        if (Math.random() < dt * 6) {
          this.particles.push({
            x: stove.x + 20 + Math.random() * (stove.w - 40),
            y: stove.y + 10,
            vx: (Math.random() - 0.5) * 12,
            vy: -34 - Math.random() * 20,
            life: 0.9, max: 0.9, color: 'rgba(255,255,255,0.55)', size: 5 + Math.random() * 5,
          });
        }
        if (item.cooked >= 1) {
          item.stage = 'cooked';
          this.sfx.cooked();
          this.floatText(stove.x + stove.w / 2, stove.y - 8, 'Matang!', '#8be28b');
        }
      } else if (item.stage !== 'burnt') {
        item.cooked += dt / def.cook;
        if (item.cooked >= 1.6) {
          item.stage = 'burnt';
          this.floatText(stove.x + stove.w / 2, stove.y - 8, 'Gosong!', '#ff6b6b');
        }
      }
    }
  }

  update(dt, input) {
    if (this.screen === SCREEN_TITLE) {
      if (input.startPressed()) this.start();
      return;
    }
    if (this.screen === SCREEN_OVER) {
      if (input.restartPressed()) this.start();
      return;
    }
    this.time += dt;
    this.flash = Math.max(0, this.flash - dt);
    this.shake = Math.max(0, this.shake - dt);
    this.sfx.musicTick(this.time);

    const expired = this.board.update(dt);
    for (const order of expired) {
      this.failed += 1;
      this.combo = 0;
      this.flash = 0.35;
      this.sfx.expire();
      this.floatText(640, 130, `Pesanan ${order.name} hangus!`, '#ff6b6b');
    }

    this.cookStoves(dt);
    this.chef.update(dt, input, this.stations, this);

    for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floats) { f.y -= 34 * dt; f.life -= dt; }
    this.floats = this.floats.filter((f) => f.life > 0);

    if (this.time >= DAY_LENGTH) {
      this.screen = SCREEN_OVER;
      this.best = Math.max(this.best, this.coins);
      this.sfx.serve();
    }
  }
}
