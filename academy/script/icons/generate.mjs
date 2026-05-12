#!/usr/bin/env node
// Generate PWA icons from the inline-SVG Logo design.
// Uses macOS `sips` for SVG -> PNG conversion (no extra npm deps needed).
// Run from academy/ root: `node script/icons/generate.mjs` (or `npm run icons`).
//
// Output PNGs are committed to client/public/. Re-run only if the source
// logo changes; otherwise leave the existing PNGs in place.

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..", "..", "client", "public");

const BG = "#0a1828";
const GREEN = "#17e07a";
const YELLOW = "#ffd233";

// Inner logo art on a 64x64 grid, matching client/src/components/Logo.tsx.
// Stroke color uses `currentColor` in the source; here we hard-code white-ish.
const logoArt = `
  <g>
    <path d="M14 8 L14 56" stroke="#e8f5ff" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 10 L34 10 L28 18 L34 26 L14 26 Z" fill="${YELLOW}" stroke="${YELLOW}" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="40" cy="40" rx="18" ry="11" transform="rotate(-18 40 40)" fill="none" stroke="${GREEN}" stroke-width="3.5"/>
    <path d="M30 40 H50 M36 35 V45 M40 35 V45 M44 35 V45" transform="rotate(-18 40 40)" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" fill="none"/>
  </g>
`;

// Wrap art into an SVG with a rounded-rect background filling the canvas.
function fullBleedSvg(size, radius) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${radius}" ry="${radius}" fill="${BG}"/>
  ${logoArt}
</svg>`;
}

// Maskable: art lives inside the inner 80% safe area; bg fills entire canvas
// so the OS may crop edges to any circle/squircle without clipping the mark.
function maskableSvg(size) {
  // viewBox is 80 units; outer 8 units on each side is the "unsafe" zone.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 80 80">
  <rect width="80" height="80" fill="${BG}"/>
  <g transform="translate(8 8)">
    ${logoArt}
  </g>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, svg: fullBleedSvg(512, 10) },
  { name: "icon-512.png", size: 512, svg: fullBleedSvg(512, 10) },
  { name: "icon-maskable-512.png", size: 512, svg: maskableSvg(512) },
  { name: "apple-touch-icon.png", size: 180, svg: fullBleedSvg(512, 10) },
];

const tmp = mkdtempSync(path.join(tmpdir(), "ffa-icons-"));
try {
  for (const t of targets) {
    const svgPath = path.join(tmp, t.name.replace(/\.png$/, ".svg"));
    const outPath = path.join(PUBLIC_DIR, t.name);
    writeFileSync(svgPath, t.svg, "utf8");
    // sips: rasterize SVG -> PNG, then resize to target square.
    execFileSync("sips", [
      "-s", "format", "png",
      "-z", String(t.size), String(t.size),
      svgPath, "--out", outPath,
    ], { stdio: "pipe" });
    console.log(`wrote ${path.relative(process.cwd(), outPath)} (${t.size}x${t.size})`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
