# Flag Football Academy — Project Handoff

**Project path:** `/home/user/workspace/flag-football-academy`
**Framework:** Express + Vite + React + Tailwind v3 + shadcn/ui (webapp fullstack template). No backend logic needed — the app is fully client-side. The Express server only serves the static client.
**Built for:** Ben Stoll · 8th-grade flag football learners.

## What the user sees

A polished, stadium-night-game web app that teaches flag football across 9 narrated lesson modules, an animated playbook, a route lab, a game-day checklist, and a session-only progress scoreboard. Strong custom identity: deep navy/turf background with chalk-line grid, neon green primary, electric yellow accent, athletic Oxanium + Space Grotesk typography. Custom inline-SVG logo and favicon (football + flag mark).

## Key files

- `client/index.html` — title, meta, custom SVG favicon, font CDN (Oxanium, Space Grotesk, JetBrains Mono), `dark` class on `<html>`.
- `client/src/index.css` — full design system rewrite (turf, chalk grid, neon borders, glow text, reduced-motion handling, all token replacements).
- `client/src/App.tsx` — hash router, ProgressProvider, ReducedMotionProvider, page wiring.
- `client/src/components/Logo.tsx` — custom inline-SVG logo with optional wordmark.
- `client/src/components/Shell.tsx` — sticky header, mobile nav, footer, progress chip.
- `client/src/components/FieldDiagram.tsx` — animated 100×60 SVG field with mowing-stripe turf, yard lines, animated route stroke-dash drawing, moving actors, ball-flight interpolation.
- `client/src/components/RouteDiagram.tsx` — single-route animated diagram for the Route Lab.
- `client/src/components/NarrationBar.tsx` — play/pause/stop, voice selector, speed slider, graceful fallback when speech synthesis is unavailable.
- `client/src/components/Quiz.tsx` — multiple-choice quiz with immediate feedback, score, reset, submit.
- `client/src/components/ProgressCtx.tsx` — session-only progress via React context (no storage APIs).
- `client/src/components/ReducedMotionCtx.tsx` — `prefers-reduced-motion` provider.
- `client/src/lib/content.ts` — all 9 lessons + section narration script builder + quiz banks.
- `client/src/lib/playbook.ts` — 3 animated plays (Slant & Flat, Smash Concept, Sweep Handoff) and the 5 core routes.
- `client/src/lib/useNarration.ts` — Web Speech API wrapper, voice list, play/pause/resume/stop.
- `client/src/pages/Home.tsx` — hero, animated chalk-line field, feature tiles, 9-module preview grid.
- `client/src/pages/Lessons.tsx` — lesson index + lesson page (narrate, sections with per-section narration, quiz, prev/next nav).
- `client/src/pages/Playbook.tsx` — play tabs, animated field, play/pause/step controls, optional step-by-step narration.
- `client/src/pages/Routes.tsx` — 5-route grid + detail card with coach's tip.
- `client/src/pages/GameDay.tsx` — 24-item checklist grouped into 5 phases with completion bar.
- `client/src/pages/Progress.tsx` — session scoreboard with quiz accuracy.

## Implemented features (vs. requirements)

1. **Custom visual identity** — stadium night-game palette (#0a1828 turf navy, neon green #17e07a primary, electric yellow #ffd233 accent), mowing-stripe turf pattern, chalk-grid overlay, stadium-light radial glow, neon text-glow, custom SVG logo + favicon, athletic display font (Oxanium).
2. **Nine lesson modules** — Basics, Field & Positions, Offense, Defense, Route Running, Flag Pulling, Rules/Safety/Sportsmanship, Practice Drills, Game-Day Checklist.
3. **Animated/interactive play diagrams** — Slant & Flat, Smash Concept, Sweep Handoff. Routes draw with stroke-dash, players move along paths, ball interpolates from QB to receiver. 5 must-know routes in the Route Lab.
4. **Narration via Web Speech API** — play/pause/stop, voice picker, speed slider, transcript visible (every word the narration reads is also on the page). Falls back gracefully with a friendly notice when `speechSynthesis` is unavailable.
5. **Quizzes with immediate feedback** — 9 short checkpoints (2-3 questions each), live "correct/incorrect" reveal, explanations, per-lesson score saved to React context only. Progress page shows accuracy across all completed lessons. No `localStorage`/`sessionStorage`/cookies used.
6. **Mobile responsive** — hamburger nav, fluid grids, font sizes, breakpoints at `sm`/`lg`. Keyboard accessibility (focus rings, `aria-label`s, `aria-pressed`, role=tab on play/route pickers). `data-testid` attributes on every interactive element. `prefers-reduced-motion` honored (animations disabled, instant transitions).
7. **`npm run build` passes** — verified twice. Bundle: 384 KB JS (124 KB gzip), 78 KB CSS (13 KB gzip).

## QA performed

- `npm run check` (tsc) — clean.
- `npm run build` — clean.
- Playwright screenshots at desktop (1280×900) and mobile (390×844) for: home, playbook, route lab, lessons index, lesson detail, game day, progress. All in `/home/user/workspace/ffa_*.png`.
- End-to-end quiz flow tested with Playwright: clicked options on Basics quiz, verified per-question explanation reveal, total score "2/3", submitted, then navigated to `/progress` and confirmed the row shows "2/3".
- Play step navigation tested: clicking next twice advances the SVG diagram from step 1 to step 3 with routes drawing as expected (screenshot `ffa_playbook_step3.png`).

## Commands

```bash
cd /home/user/workspace/flag-football-academy
npm install         # dependencies (already done)
npm run dev         # dev server on port 5000 (Vite + Express)
npm run check       # TypeScript type-check (passes)
npm run build       # production build (passes)
```

## v2 upgrade (Coach Cam)

The app now ships a "Coach Cam" voice powered by pre-generated **ElevenLabs** audio with the browser's Web Speech API as an automatic fallback. Highlights:

- **Audio pipeline** (`script/audio/`): `npm run audio` walks every narratable unit (lessons, playbook steps, route tips) and writes content-hashed MP3 + timing JSON files to `client/public/audio/`, plus a `manifest.json` mapping logical IDs (`lesson:basics:full`, `play:slant-flat:step:0`, `route:slant:tip`, etc.) to files. Idempotent (skip-if-cached), supports `--dry-run`, `--only=<prefix>`, `--force`. Requires `ELEVENLABS_API_KEY` in `.env.local` (gitignored; see `.env.example`).
- **Voice**: Brian (`nPczCjzI2devNBz1zQrb`), model `eleven_multilingual_v2`, mp3_44100_64. Single constant in `script/audio/voice-config.ts` — swap for a cloned voice anytime.
- **Runtime** (`client/src/lib/useCoachAudio.ts`): `HTMLAudioElement` + manifest lookup, automatic Web Speech fallback when the manifest is missing, an entry is missing, or the MP3 fails to load. Speed slider drives both `audio.playbackRate` and speech rate. Mode-aware badge in `NarrationBar` ("Coach Cam 🎙️" vs. "Browser voice").
- **Karaoke captions** (`client/src/components/CaptionedTranscript.tsx`): word-level highlight driven by ElevenLabs character-end timings. Plain text when in fallback mode or `prefers-reduced-motion`.
- **Persistent progress** (`client/src/lib/useProgressStore.ts`): `localStorage`-backed with versioned schema, cross-tab sync via `storage` event, pub/sub via `useSyncExternalStore`. `ProgressCtx` preserves its old API (`progress`, `markVisited`, `setScore`) and adds `resetAll()`. Reset UI on `/progress` with `AlertDialog` confirmation.
- **Animated defenders**: all 3 plays now show 5 defenders (2 CB, 1 LB, 2 S) moving along scheme-appropriate paths (Cover 2 zone for Slant & Flat / Smash, run fits for Sweep). Reuses existing `Actor.path` machinery.
- **Final exam** (`/exam`): 12-question shuffled pool drawn from every lesson quiz, options re-randomized, "Review your misses" with remediation links, printable certificate on pass (≥75%). Name prompt persists via `setStudentName`.
- **PWA**: `vite-plugin-pwa` with `autoUpdate`, web manifest, 192/512/maskable icons (generated from the inline Logo via `npm run icons`). Workbox precaches the shell (~544 KiB); `/audio/*` is runtime-cached with `StaleWhileRevalidate` (`coach-audio-v1`, 100 entries, 30 days). `usePWAInstall` hook for an install affordance.

## Commands (updated)

```bash
cd academy
npm install
npm run dev           # dev server on port 5000
npm run check         # tsc
npm run build         # production build (includes PWA service worker)
npm run audio         # generate ElevenLabs MP3s + manifest (needs ELEVENLABS_API_KEY)
npm run audio -- --dry-run             # list what would be generated
npm run audio -- --only=lesson:basics  # generate one lesson
npm run icons         # regenerate PWA icons (macOS sips)
```

## Limitations / notes

- The Web Speech API is browser-dependent. The app uses it as a graceful fallback whenever an ElevenLabs MP3 isn't available for a given ID (e.g., before `npm run audio` has been run, or for content added after the last audio build).
- Progress now persists in `localStorage` per device. To clear, use the "Reset progress" button on `/progress`.
- The template ships with Express + SQLite + Drizzle for backends; none are used here. The app still boots through the template's server because `npm run dev` runs it, but no API routes were added.

## Deployment instructions

The app is purely static client output. Deploy the built client folder:

```python
deploy_website(project_path="/home/user/workspace/flag-football-academy/dist/public")
```

The build artifacts are already produced at `dist/public/`. (Optional alternative: also start the Express server with `start_server` if the parent agent prefers the full server path, but it is not necessary — there are no `/api/*` endpoints.)

## Git

```
49bfbba feat: scaffold flag football academy with lessons, playbook, routes, gameday, progress
```
