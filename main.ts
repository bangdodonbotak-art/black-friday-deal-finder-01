// Deal Radar — black-friday-deal-finder-01 entry (Node 22, standard library
// only). The site is this directory's app/ folder: plain static files, no
// build step, ES modules + CSS, every deal in its own data file. This
// program hands it in: it copies app/ and screenshots/ from beside this
// file to /output and writes /output/dossier.json, the summary the judge
// reads (the screenshots, the first load's files and bytes, and the source),
// built with the vendored make.fun library. vendor/makefun-frontend.ts
// must stay exactly as the kit shipped it: the scorer rebuilds the dossier
// with its own copy and compares the two byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });

  const shotsOut = join(outputDir, "screenshots");
  mkdirSync(shotsOut, { recursive: true });
  const shotsIn = join(repoRoot, "screenshots");
  if (existsSync(shotsIn)) {
    cpSync(shotsIn, shotsOut, { recursive: true });
  }

  // The gate's own caps, as the kit documents them: the dossier text is
  // capped at 160 KiB, at most 4 screenshots of 256 KiB each, app/ at most
  // 993 files and directories totalling 16 MiB.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  writeFileSync(join(outputDir, "dossier.json"), dossier);
}

handIn();
