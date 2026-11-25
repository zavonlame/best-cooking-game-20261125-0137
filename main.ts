// Dapur Kilat — the hand-in (Node 22, standard library only).
//
// The game is plain static files under game/ and the screenshots under
// screenshots/. This program copies both into the output directory the
// platform gives it (MAKEFUN_OUTPUT_DIR outside the grader, /output inside),
// then writes the dossier the judge reads with the vendored make.fun library.
// It runs twice and must write the same bytes both times, so it never reads
// the clock, the network, or anything outside this repository — the copies
// and the dossier below are a pure function of the files beside this one.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  }
  // Caps from the scorer: at most 4 screenshots of 256 KiB, a game of at most
  // 993 files and 48 MiB, and a dossier text of at most 160 KiB.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
