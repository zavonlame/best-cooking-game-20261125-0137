# Dapur Kilat — Best Cooking Game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/zavonlame/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/zavonlame/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A fast Indonesian warung cooking game for the make.fun Best Cooking Game bounty. Run a one-cook kitchen for a 150-second shift: take orders from the board, chop on the talenan, cook on the kompor, plate the dish, and serve it at the pass before the order burns out. Five original recipes — Nasi Goreng, Mie Ayam, Ayam Geprek, Omelet Sayur, Nasi Ayam — with combos, tips for fast service, and a rush hour at the end of the shift.

## Play

Serve it locally with `node serve.ts`, then open http://localhost:8080 in desktop Chrome.

- **WASD / Arrow keys** — move the chef
- **E / Space** — pick up, place, chop (hold), cook, plate, serve
- **Mouse** — click a nearby station to work it
- **Enter** — start, **R** — play again

## Layout

- `game/` — the game itself, plain static files, no network: `index.html` plus one module per job (`config`, `audio`, `input`, `kitchen`, `orders`, `chef`, `game`, `render`, `shots`, `main`). All art is drawn on canvas; all sound is synthesised with WebAudio.
- `screenshots/` — four real renders of the game (title, mid-shift, serving, shift end).
- `main.ts` — the hand-in: copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `serve.ts` — local play-test server only.
- `shots.json` — the four screenshot scenes.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
