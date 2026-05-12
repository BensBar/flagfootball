// Generate Coach Cam audio for every narratable unit in the academy.
//
// Usage:
//   npm run audio -- --dry-run
//   npm run audio -- --only=lesson:basics
//   npm run audio -- --force
//
// Output:
//   client/public/audio/<hash>.mp3
//   client/public/audio/<hash>.json    (ElevenLabs timing)
//   client/public/audio/manifest.json  (logical id -> entry map)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";

import { VOICE } from "./voice-config.ts";
import { hashFor, type Manifest, type ManifestEntry } from "./manifest.ts";
import { ttsWithTimestamps } from "./elevenlabs.ts";
import { LESSONS, type LessonSection } from "../../client/src/lib/content.ts";
import { PLAYS, ROUTES, type Play } from "../../client/src/lib/playbook.ts";
import {
  lessonFullScript,
  lessonSectionScript,
  playStepScript,
  routeTipScript,
} from "../../client/src/lib/narrationScripts.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ACADEMY_ROOT = resolve(__dirname, "..", "..");
const AUDIO_DIR = resolve(ACADEMY_ROOT, "client", "public", "audio");
const MANIFEST_PATH = resolve(AUDIO_DIR, "manifest.json");

// ---------- args ----------

type Args = { dryRun: boolean; only?: string; force: boolean };

function parseArgs(argv: string[]): Args {
  const args: Args = { dryRun: false, force: false };
  for (const a of argv) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--force") args.force = true;
    else if (a.startsWith("--only=")) args.only = a.slice("--only=".length);
  }
  return args;
}

// ---------- env ----------

function loadEnv() {
  loadDotenv({ path: resolve(ACADEMY_ROOT, ".env.local") });
  loadDotenv({ path: resolve(ACADEMY_ROOT, ".env") });
}

// ---------- unit collection ----------

type Unit = { id: string; text: string };

function collectUnits(): Unit[] {
  const units: Unit[] = [];
  for (const lesson of LESSONS) {
    units.push({ id: `lesson:${lesson.id}:full`, text: lessonFullScript(lesson) });
    for (const section of lesson.sections) {
      const sid = (section as LessonSection & { id?: string }).id;
      if (!sid) {
        throw new Error(
          `Lesson "${lesson.id}" has a section "${section.heading}" without a stable id. Add one in content.ts.`,
        );
      }
      units.push({ id: `lesson:${lesson.id}:section:${sid}`, text: lessonSectionScript(section) });
    }
  }
  for (const play of PLAYS as Play[]) {
    play.steps.forEach((step, idx) => {
      const text = playStepScript(step);
      if (!text.trim()) return;
      units.push({ id: `play:${play.id}:step:${idx}`, text });
    });
  }
  for (const route of ROUTES) {
    units.push({ id: `route:${route.id}:tip`, text: routeTipScript(route) });
  }
  return units;
}

// ---------- io ----------

function ensureAudioDir() {
  if (!existsSync(AUDIO_DIR)) mkdirSync(AUDIO_DIR, { recursive: true });
}

function readExistingManifest(): Manifest {
  if (!existsSync(MANIFEST_PATH)) {
    return { version: 1, voice: { id: VOICE.id, name: VOICE.name }, entries: {} };
  }
  try {
    const raw = readFileSync(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw) as Manifest;
    return {
      version: 1,
      voice: { id: VOICE.id, name: VOICE.name },
      entries: parsed?.entries ?? {},
    };
  } catch {
    return { version: 1, voice: { id: VOICE.id, name: VOICE.name }, entries: {} };
  }
}

function sortedManifest(m: Manifest): Manifest {
  const sortedEntries: Record<string, ManifestEntry> = {};
  for (const key of Object.keys(m.entries).sort()) {
    sortedEntries[key] = m.entries[key];
  }
  return { version: 1, voice: m.voice, entries: sortedEntries };
}

// ---------- main ----------

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnv();

  if (!args.dryRun && !process.env.ELEVENLABS_API_KEY) {
    console.error("ELEVENLABS_API_KEY is not set. Add it to .env.local, or pass --dry-run.");
    process.exit(1);
  }

  ensureAudioDir();
  const manifest = readExistingManifest();

  const allUnits = collectUnits();
  const units = args.only ? allUnits.filter((u) => u.id.startsWith(args.only!)) : allUnits;

  if (args.only && units.length === 0) {
    console.warn(`No units matched --only=${args.only}.`);
  }

  let generated = 0;
  let cached = 0;
  let wouldGenerate = 0;
  let totalChars = 0;

  for (const unit of units) {
    const hash = hashFor(unit.text, VOICE.id, VOICE.model);
    const chars = unit.text.length;
    totalChars += chars;
    const mp3Rel = `audio/${hash}.mp3`;
    const timingRel = `audio/${hash}.json`;
    const mp3Abs = resolve(AUDIO_DIR, `${hash}.mp3`);
    const timingAbs = resolve(AUDIO_DIR, `${hash}.json`);

    const entry: ManifestEntry = {
      id: unit.id,
      hash,
      mp3: mp3Rel,
      timing: timingRel,
      chars,
    };

    if (args.dryRun) {
      console.log(`WOULD GENERATE ${unit.id} ${hash} (${chars} chars)`);
      wouldGenerate++;
      manifest.entries[unit.id] = entry;
      continue;
    }

    const cachedHit = existsSync(mp3Abs) && existsSync(timingAbs);
    if (cachedHit && !args.force) {
      console.log(`SKIP ${unit.id} (cached)`);
      cached++;
      manifest.entries[unit.id] = entry;
      continue;
    }

    console.log(`GENERATE ${unit.id} ${hash} (${chars} chars)`);
    const { audio, timing } = await ttsWithTimestamps(unit.text, VOICE);
    writeFileSync(mp3Abs, audio);
    writeFileSync(timingAbs, JSON.stringify(timing));

    const endTimes = timing.character_end_times_seconds;
    if (endTimes && endTimes.length) {
      entry.durationMs = Math.round(endTimes[endTimes.length - 1] * 1000);
    }
    manifest.entries[unit.id] = entry;
    generated++;
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(sortedManifest(manifest), null, 2) + "\n");

  const total = units.length;
  const estCost = (totalChars / 1000) * 0.3;
  if (args.dryRun) {
    console.log(
      `\n${wouldGenerate} would generate, ${total} total, ${totalChars} chars, est. cost $${estCost.toFixed(2)} (dry-run, no API calls)`,
    );
  } else {
    console.log(
      `\n${generated} generated, ${cached} cached, ${total} total, ${totalChars} chars, est. cost $${estCost.toFixed(2)}`,
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
