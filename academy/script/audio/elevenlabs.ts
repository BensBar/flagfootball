import { VOICE, type VoiceConfig } from "./voice-config.ts";
import type { AlignmentTiming } from "./manifest.ts";

type ElevenLabsResponse = {
  audio_base64: string;
  alignment?: AlignmentTiming;
  normalized_alignment?: AlignmentTiming;
};

const BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function ttsWithTimestamps(
  text: string,
  voice: VoiceConfig = VOICE,
): Promise<{ audio: Buffer; timing: AlignmentTiming }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY is not set. Add it to .env.local before running live audio generation.",
    );
  }

  const url = `${BASE_URL}/${voice.id}/with-timestamps?output_format=${voice.outputFormat}`;
  const body = JSON.stringify({
    text,
    model_id: voice.model,
    voice_settings: voice.settings,
  });

  const backoffs = [1000, 2000, 4000];
  let lastErr: unknown;

  for (let attempt = 0; attempt <= backoffs.length; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body,
      });
    } catch (err) {
      lastErr = err;
      if (attempt < backoffs.length) {
        await sleep(backoffs[attempt]);
        continue;
      }
      throw err;
    }

    if (res.ok) {
      const json = (await res.json()) as ElevenLabsResponse;
      const timing = json.normalized_alignment ?? json.alignment;
      if (!timing) {
        throw new Error("ElevenLabs response missing alignment data.");
      }
      const audio = Buffer.from(json.audio_base64, "base64");
      return { audio, timing };
    }

    if (res.status === 401) {
      throw new Error(
        "ElevenLabs returned 401 Unauthorized. Check that ELEVENLABS_API_KEY is correct and your subscription allows multilingual_v2.",
      );
    }

    if ((res.status === 429 || res.status >= 500) && attempt < backoffs.length) {
      await sleep(backoffs[attempt]);
      continue;
    }

    const errText = await res.text().catch(() => "");
    throw new Error(
      `ElevenLabs request failed: ${res.status} ${res.statusText}${
        errText ? ` — ${errText.slice(0, 300)}` : ""
      }`,
    );
  }

  throw lastErr ?? new Error("ElevenLabs request failed after retries.");
}
