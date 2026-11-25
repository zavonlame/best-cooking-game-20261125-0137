// Dapur Kilat — staged scenes for screenshots (?shot=start|play|serve|end).
// Each scene builds a real game state with the game's own rules — orders on
// the board, food on the stations, a plate mid-assembly — and the renderer
// draws it exactly as a player would see it. Nothing is composited.
import { freshItem } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './game.js';

function findStation(game, id) {
  return game.stations.find((s) => s.id === id);
}

export function stageShot(name, game) {
  game.reset();
  const board = findStation(game, 'board');
  const stove1 = findStation(game, 'stove-1');
  const stove2 = findStation(game, 'stove-2');
  const counterB = findStation(game, 'counter-b');
  const counterA = findStation(game, 'counter-a');

  if (name === 'play') {
    game.screen = SCREEN_PLAY;
    game.time = 54;
    game.coins = 42;
    game.served = 3;
    game.combo = 2;
    game.bestCombo = 3;
    // Three live orders, one of them nearly out of time.
    game.board.orders = [
      { id: 1, name: 'Nasi Goreng', recipe: { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasi', 'telur', 'cabai'], price: 12 }, tLeft: 40, tMax: 65 },
      { id: 2, name: 'Mie Ayam', recipe: { id: 'mie-ayam', name: 'Mie Ayam', needs: ['mie', 'ayam', 'sayur'], price: 14 }, tLeft: 22, tMax: 65 },
      { id: 3, name: 'Ayam Geprek', recipe: { id: 'ayam-geprek', name: 'Ayam Geprek', needs: ['ayam', 'cabai'], price: 11 }, tLeft: 55, tMax: 65 },
    ];
    game.board.elapsed = 54;
    game.board.spawnIn = 6;
    // One dish mid-assembly: a plate on the counter with rice and egg, the
    // chef carrying the chilli the plate still needs.
    const plate = { kind: 'plate', items: [] };
    const nasi = freshItem('nasi'); nasi.cooked = 1; nasi.stage = 'cooked';
    const telur = freshItem('telur'); telur.cooked = 1; telur.stage = 'cooked';
    plate.items.push(nasi, telur);
    counterB.item = plate;
    // Chilli half-chopped on the board; chicken half-cooked on the stove.
    const cabai = freshItem('cabai');
    board.item = cabai;
    board.progress = 0.5;
    const ayam = freshItem('ayam'); ayam.chopped = 1; ayam.cooked = 0.6;
    stove1.item = ayam;
    const mie = freshItem('mie');
    counterA.item = mie;
    game.chef.x = 300;
    game.chef.y = 400;
    game.chef.dir = 1;
    game.chef.carry = { kind: 'item', ...freshItem('cabai') };
    return;
  }

  if (name === 'serve') {
    game.screen = SCREEN_PLAY;
    game.time = 96;
    game.coins = 58;
    game.served = 5;
    game.combo = 3;
    game.bestCombo = 3;
    game.board.orders = [
      { id: 7, name: 'Nasi Goreng', recipe: { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasi', 'telur', 'cabai'], price: 12 }, tLeft: 18, tMax: 65 },
      { id: 8, name: 'Omelet Sayur', recipe: { id: 'omelet', name: 'Omelet Sayur', needs: ['telur', 'sayur'], price: 9 }, tLeft: 47, tMax: 65 },
    ];
    game.board.elapsed = 96;
    // The finished plate, ready at the pass.
    const plate = { kind: 'plate', items: [] };
    const nasi = freshItem('nasi'); nasi.cooked = 1; nasi.stage = 'cooked';
    const telur = freshItem('telur'); telur.cooked = 1; telur.stage = 'cooked';
    const cabai = freshItem('cabai'); cabai.chopped = 1;
    plate.items.push(nasi, telur, cabai);
    game.chef.x = 980;
    game.chef.y = 265;
    game.chef.dir = 1;
    game.chef.carry = plate;
    game.chef.hint = 'E: Sajikan!';
    const ayam = freshItem('ayam'); ayam.chopped = 1; ayam.cooked = 1; ayam.stage = 'cooked';
    stove2.item = ayam;
    return;
  }

  if (name === 'end') {
    game.screen = SCREEN_OVER;
    game.time = 150;
    game.coins = 128;
    game.served = 9;
    game.failed = 2;
    game.combo = 0;
    game.bestCombo = 4;
    game.best = 128;
    return;
  }

  // start (default): the title screen over a kitchen that is already alive.
  game.screen = SCREEN_TITLE;
  const cabai = freshItem('cabai');
  board.item = cabai;
  board.progress = 0.35;
  const ayam = freshItem('ayam'); ayam.chopped = 1; ayam.cooked = 0.45;
  stove1.item = ayam;
  game.chef.x = 640;
  game.chef.y = 430;
  game.chef.dir = -1;
}
