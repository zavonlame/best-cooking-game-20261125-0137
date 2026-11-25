// Dapur Kilat — boot: one canvas, one loop, one game. With ?shot=start|play|
// serve|end the world is staged once and the frame is frozen, so a
// screenshot is the game itself, mid-shift, every time.
import { VIEW } from './config.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');

const game = new Game();
const input = new Input(canvas);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
let frozen = false;
if (shot) {
  stageShot(shot, game);
  frozen = true;
}

// ?selftest=1 plays a full dish hands-free: take rice, cook it, chop and cook
// chicken, plate both, serve the matching order, and reports PASS/FAIL in
// the document title for headless checking.
if (params.get('selftest')) {
  const results = [];
  const check = (name, ok) => results.push(`${name}:${ok ? 'ok' : 'FAIL'}`);
  const fakeInput = (press) => ({
    axis: () => ({ x: 0, y: 0 }),
    interactHeld: () => false,
    interactPressed: () => press,
    startPressed: () => false,
    restartPressed: () => false,
    consumeMouseClick: () => null,
    endFrame: () => {},
  });
  const step = (seconds, press = false) => {
    let first = true;
    for (let t = 0; t < seconds; t += 1 / 60) {
      game.update(1 / 60, fakeInput(press && first));
      first = false;
    }
  };
  const near = (id) => {
    const s = game.stations.find((st) => st.id === id);
    game.chef.x = s.x + s.w / 2;
    game.chef.y = s.y + s.h + 30;
  };
  try {
    game.start();
    check('start', game.screen === 'play');
    near('crate-nasi');
    step(0.05, true);
    check('take-rice', game.chef.carry?.ing === 'nasi');
    near('stove-1');
    step(0.05, true);
    check('place-stove', game.stations.find((s) => s.id === 'stove-1').item?.ing === 'nasi');
    step(5);
    const rice = game.stations.find((s) => s.id === 'stove-1').item;
    check('rice-cooked', rice?.cooked >= 1 && rice?.stage === 'cooked');
    step(0.05, true);
    check('take-cooked', game.chef.carry?.ing === 'nasi');
    near('counter-b');
    step(0.05, true);
    check('counter-rice', game.stations.find((s) => s.id === 'counter-b').item?.ing === 'nasi');
    near('crate-ayam');
    step(0.05, true);
    check('take-chicken', game.chef.carry?.ing === 'ayam');
    near('board');
    step(0.05, true);
    check('board-chicken', game.stations.find((s) => s.id === 'board').item?.ing === 'ayam');
    // hold E to chop
    const holdInput = { ...fakeInput(false), interactHeld: () => true };
    for (let t = 0; t < 2; t += 1 / 60) game.update(1 / 60, holdInput);
    check('chicken-chopped', game.stations.find((s) => s.id === 'board').item?.chopped >= 1);
    step(0.05, true);
    check('take-chopped', game.chef.carry?.ing === 'ayam');
    near('stove-2');
    step(0.05, true);
    step(6);
    const chicken = game.stations.find((s) => s.id === 'stove-2').item;
    check('chicken-cooked', chicken?.cooked >= 1 && chicken?.stage === 'cooked');
    step(0.05, true);
    check('take-chicken-cooked', game.chef.carry?.ing === 'ayam');
    near('counter-a');
    step(0.05, true);
    check('counter-chicken', game.stations.find((s) => s.id === 'counter-a').item?.ing === 'ayam');
    near('plates');
    step(0.05, true);
    check('take-plate', game.chef.carry?.kind === 'plate');
    near('counter-b');
    step(0.05, true);
    check('plate-rice', game.chef.carry?.items?.length === 1);
    near('counter-a');
    step(0.05, true);
    check('plate-full', game.chef.carry?.items?.length === 2);
    // force the matching order, then serve it
    const { RECIPES } = await import('./config.js');
    const recipe = RECIPES.find((r) => r.id === 'nasi-ayam');
    game.board.orders = [{ id: 99, name: recipe.name, recipe, tLeft: 60, tMax: 65 }];
    near('serve');
    step(0.05, true);
    check('served', game.served === 1 && game.coins > 0);
    document.title = `SELFTEST ${results.every((r) => r.endsWith(':ok')) ? 'PASS' : 'FAIL'} — ${results.join(' ')}`;
  } catch (err) {
    document.title = `SELFTEST ERROR ${err.message} — ${results.join(' ')}`;
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!frozen) {
    game.update(dt, input);
    input.endFrame();
  }
  render(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
