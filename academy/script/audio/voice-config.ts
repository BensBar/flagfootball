export const VOICE = {
  id: "nPczCjzI2devNBz1zQrb", // Brian
  name: "Coach Cam",
  model: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_64",
  settings: {
    stability: 0.45,
    similarity_boost: 0.75,
    style: 0.35,
    use_speaker_boost: true,
  },
} as const;

export type VoiceConfig = typeof VOICE;
