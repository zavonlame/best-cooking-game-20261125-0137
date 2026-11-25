// Dapur Kilat — the chef: moves around the kitchen and works the stations.
// The chef carries one thing: a single ingredient, or a plate holding up to
// three ready items. Every interaction is one verb: take, place, chop, cook,
// add to plate, serve, or bin it.
import { CHEF, INGREDIENTS, isReady } from './config.js';
import {
  KIND_BIN, KIND_BOARD, KIND_COUNTER, KIND_CRATE, KIND_PLATES,
  KIND_SERVE, KIND_STOVE, collide, nearestStation,
} from './kitchen.js';

export class Chef {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 640;
    this.y = 430;
    this.dir = -1; // facing: -1 left, 1 right
    this.carry = null;
    this.chopping = 0;
    this.hint = '';
  }

  get carryingPlate() {
    return this.carry !== null && this.carry.kind === 'plate';
  }

  // What the chef is doing right now, for the hint bubble.
  describeTarget(station) {
    if (!station) return '';
    const carry = this.carry;
    switch (station.kind) {
      case KIND_CRATE: return carry ? 'Tangan penuh' : `Ambil ${INGREDIENTS[station.ing].label}`;
      case KIND_BOARD: {
        if (station.item) {
          const def = INGREDIENTS[station.item.ing];
          if (def.chop > 0 && station.item.chopped < 1) return 'Tahan E: Potong!';
          if (this.carryingPlate && isReady(station.item)) return 'E: Masukkan ke piring';
          return carry ? 'Papan penuh' : `Ambil ${INGREDIENTS[station.item.ing].label}`;
        }
        if (carry && carry.kind === 'item' && INGREDIENTS[carry.ing].chop > 0) return 'Taruh di talenan';
        return 'Talenan kosong';
      }
      case KIND_STOVE: {
        if (station.item) {
          if (station.item.stage === 'burnt') return carry ? 'Gosong!' : 'Ambil (gosong)';
          if (station.item.cooked >= 1) {
            if (this.carryingPlate && isReady(station.item)) return 'E: Masukkan ke piring';
            return carry ? 'Matang!' : `Ambil ${INGREDIENTS[station.item.ing].label}`;
          }
          return 'Memasak...';
        }
        if (carry && carry.kind === 'item' && INGREDIENTS[carry.ing].cook > 0) return 'Taruh di kompor';
        return 'Kompor kosong';
      }
      case KIND_COUNTER: {
        if (station.item) {
          if (station.item.kind === 'plate') return carry ? 'Meja penuh' : 'Ambil piring';
          if (this.carryingPlate && isReady(station.item)) return 'E: Masukkan ke piring';
          return carry ? 'Meja penuh' : `Ambil ${INGREDIENTS[station.item.ing].label}`;
        }
        return carry ? 'Taruh di meja' : 'Meja kosong';
      }
      case KIND_PLATES: return carry ? 'Tangan penuh' : 'Ambil piring';
      case KIND_SERVE: return this.carryingPlate ? 'E: Sajikan!' : 'Bawa piring ke sini';
      case KIND_BIN: return carry ? 'Buang' : 'Tempat sampah';
      default: return '';
    }
  }

  // One interaction step. `held` is true while the player holds E/Space.
  // Returns an event string for sounds and score popups, or null.
  interact(station, held, pressed, game) {
    if (!station) return null;
    const carry = this.carry;
    switch (station.kind) {
      case KIND_CRATE: {
        if (pressed && !carry) {
          this.carry = { kind: 'item', ...freshItemOf(station.ing) };
          return 'pickup';
        }
        return null;
      }
      case KIND_BOARD: {
        if (station.item) {
          const def = INGREDIENTS[station.item.ing];
          if (def.chop > 0 && station.item.chopped < 1) {
            if (held) {
              station.progress += 1 / def.chop / 60;
              this.chopping += 1 / 60;
              if (this.chopping > 0.28) { this.chopping = 0; game.sfx.chop(); game.burst(station.x + station.w / 2, station.y + 14, '#ffe08a', 3); }
              if (station.progress >= 1) {
                station.item.chopped = 1;
                station.progress = 0;
                game.sfx.chopped();
                return 'chopped';
              }
              return 'chopping';
            }
            return null;
          }
          if (pressed && this.carryingPlate && isReady(station.item) && this.carry.items.length < 3) {
            this.carry.items.push(station.item);
            station.item = null;
            station.progress = 0;
            return 'pickup';
          }
          if (pressed && !carry) { this.carry = { kind: 'item', ...station.item }; station.item = null; return 'pickup'; }
          return null;
        }
        if (pressed && carry && carry.kind === 'item' && INGREDIENTS[carry.ing].chop > 0) {
          station.item = { ...carry };
          this.carry = null;
          station.progress = 0;
          return 'place';
        }
        return null;
      }
      case KIND_STOVE: {
        if (station.item) {
          if (pressed && this.carryingPlate && isReady(station.item) && this.carry.items.length < 3) {
            this.carry.items.push(station.item);
            station.item = null;
            return 'pickup';
          }
          if (pressed && !carry) {
            this.carry = { kind: 'item', ...station.item };
            station.item = null;
            return 'pickup';
          }
          return null;
        }
        if (pressed && carry && carry.kind === 'item' && INGREDIENTS[carry.ing].cook > 0) {
          station.item = { ...carry };
          this.carry = null;
          station.progress = 0;
          game.sfx.sizzleStart();
          return 'place';
        }
        return null;
      }
      case KIND_COUNTER: {
        if (station.item) {
          if (station.item.kind === 'plate') {
            if (pressed && !carry) { this.carry = station.item; station.item = null; return 'pickup'; }
            return null;
          }
          if (pressed && this.carryingPlate && isReady(station.item) && this.carry.items.length < 3) {
            this.carry.items.push(station.item);
            station.item = null;
            return 'pickup';
          }
          if (pressed && !carry) {
            this.carry = { kind: 'item', ...station.item };
            station.item = null;
            return 'pickup';
          }
          return null;
        }
        if (pressed && carry && carry.kind === 'item') {
          station.item = { ...carry };
          this.carry = null;
          return 'place';
        }
        if (pressed && carry && carry.kind === 'plate') {
          station.item = carry;
          this.carry = null;
          return 'place';
        }
        return null;
      }
      case KIND_PLATES: {
        if (pressed && !carry) {
          this.carry = { kind: 'plate', items: [] };
          return 'pickup';
        }
        return null;
      }
      case KIND_SERVE: {
        if (pressed && this.carryingPlate) return game.servePlate(this);
        return null;
      }
      case KIND_BIN: {
        if (pressed && carry) {
          this.carry = null;
          return 'place';
        }
        return null;
      }
      default: return null;
    }
  }

  update(dt, input, stations, game) {
    const move = input.axis();
    this.x += move.x * CHEF.speed * dt;
    this.y += move.y * CHEF.speed * dt;
    if (move.x !== 0) this.dir = move.x > 0 ? 1 : -1;
    collide(stations, this, CHEF.radius);

    const target = nearestStation(stations, this.x, this.y, CHEF.interactRange);
    this.hint = this.describeTarget(target);

    // Mouse click on a nearby station interacts with it too.
    const click = input.consumeMouseClick();
    if (click) {
      const clicked = nearestStation(stations, click.x, click.y, 60);
      if (clicked && Math.hypot(clicked.x + clicked.w / 2 - this.x, clicked.y + clicked.h / 2 - this.y) < CHEF.interactRange + 40) {
        this.interact(clicked, true, true, game);
      }
    }
    if (target) {
      const event = this.interact(target, input.interactHeld(), input.interactPressed(), game);
      if (event === 'pickup') game.sfx.pickup();
      if (event === 'place') game.sfx.place();
      if (event === 'chopped') game.sfx.chopped();
    }
  }
}

function freshItemOf(ing) {
  return { ing, chopped: 0, cooked: 0, stage: 'raw' };
}
