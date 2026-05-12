// Singleton loader for /audio/manifest.json. Fetches once, caches, and
// returns null if the manifest can't be loaded (in which case all callers
// should fall back to Web Speech).
//
// The shared types live in script/audio/manifest.ts, but that path is
// outside the client tsconfig `include`. Rather than reshape tsconfig
// we duplicate the (small, stable) types here.

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

let cache: Manifest | null | undefined; // undefined = unloaded, null = load failed
let inflight: Promise<Manifest | null> | null = null;

export async function loadManifest(): Promise<Manifest | null> {
  if (cache !== undefined) return cache;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}audio/manifest.json`, { cache: "force-cache" });
      if (!res.ok) throw new Error(`manifest ${res.status}`);
      const m = (await res.json()) as Manifest;
      cache = m;
      return m;
    } catch {
      cache = null;
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export function getEntry(manifest: Manifest | null, id: string): ManifestEntry | null {
  return manifest?.entries?.[id] ?? null;
}
