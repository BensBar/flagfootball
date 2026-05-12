// Shared manifest types + helpers. The types are pure-TS and may be
// imported from `client/src/`. The `hashFor` helper uses Node's `crypto`
// and is intended for use from the build script only — clients should
// look up entries by logical ID, not recompute hashes.

import { createHash } from "node:crypto";

export type AlignmentTiming = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

export type ManifestEntry = {
  id: string;
  hash: string;
  mp3: string;
  timing: string;
  chars: number;
  durationMs?: number;
};

export type Manifest = {
  version: 1;
  voice: { id: string; name: string };
  entries: Record<string, ManifestEntry>;
};

// sha1(`${voiceId}|${model}|${text.trim()}`) — hex.
export function hashFor(text: string, voiceId: string, model: string): string {
  return createHash("sha1")
    .update(`${voiceId}|${model}|${text.trim()}`)
    .digest("hex");
}
