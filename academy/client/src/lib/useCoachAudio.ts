import { useCallback, useEffect, useRef, useState } from "react";
import { loadManifest, getEntry, type AlignmentTiming, type Manifest } from "./audioManifest";
import { useNarration } from "./useNarration";

export type AudioMode = "audio" | "speech" | "idle";

export type CoachAudio = {
  play: (opts: { id: string; text: string }) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setPlaybackRate: (rate: number) => void;
  mode: AudioMode;
  isPlaying: boolean;
  isPaused: boolean;
  currentId: string | null;
  currentTime: number;
  duration: number;
  playbackRate: number;
  timing: AlignmentTiming | null;
  hasAudio: boolean;
  speechSupported: boolean;
};

const clampRate = (r: number) => Math.max(0.75, Math.min(1.5, r));

export function useCoachAudio(): CoachAudio {
  const speech = useNarration();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const manifestRef = useRef<Manifest | null | undefined>(undefined);

  const [mode, setMode] = useState<AudioMode>("idle");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPaused, setAudioPaused] = useState(false);
  const [timing, setTiming] = useState<AlignmentTiming | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [hasAudio, setHasAudio] = useState(false);

  // Lazy-init audio element on first use (avoids SSR issues).
  const getAudio = useCallback((): HTMLAudioElement | null => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      a.playbackRate = playbackRate;
      audioRef.current = a;
    }
    return audioRef.current;
  }, [playbackRate]);

  // Wire audio element listeners
  useEffect(() => {
    const a = getAudio();
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onMeta = () => setDuration(isFinite(a.duration) ? a.duration : 0);
    const onPlay = () => {
      setAudioPlaying(true);
      setAudioPaused(false);
    };
    const onPause = () => {
      // Distinguish pause vs ended: 'ended' fires its own event after pause.
      setAudioPaused(true);
      setAudioPlaying(false);
    };
    const onEnded = () => {
      setAudioPlaying(false);
      setAudioPaused(false);
      setCurrentTime(0);
      setMode("idle");
      setCurrentId(null);
      setTiming(null);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, [getAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        try {
          a.pause();
          a.src = "";
        } catch {}
      }
      try {
        speech.stop();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load manifest once
  useEffect(() => {
    let cancelled = false;
    loadManifest().then((m) => {
      if (cancelled) return;
      manifestRef.current = m;
      setHasAudio(!!m && Object.keys(m.entries ?? {}).length > 0);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const fallbackToSpeech = useCallback(
    (id: string, text: string) => {
      const a = audioRef.current;
      if (a) {
        try {
          a.pause();
        } catch {}
      }
      setCurrentTime(0);
      setDuration(0);
      setTiming(null);
      setAudioPlaying(false);
      setAudioPaused(false);
      setMode("speech");
      setCurrentId(id);
      if (speech.supported && text) {
        speech.speak(text);
      } else {
        setMode("idle");
        setCurrentId(null);
      }
    },
    [speech]
  );

  const play = useCallback(
    async ({ id, text }: { id: string; text: string }) => {
      // Cancel anything currently playing.
      const a = audioRef.current;
      if (a) {
        try {
          a.pause();
        } catch {}
      }
      try {
        speech.stop();
      } catch {}
      setAudioPlaying(false);
      setAudioPaused(false);
      setCurrentTime(0);
      setDuration(0);
      setTiming(null);

      // Ensure manifest is loaded (singleton — cheap after first call).
      const manifest = manifestRef.current ?? (await loadManifest());
      manifestRef.current = manifest;
      if (manifest && Object.keys(manifest.entries ?? {}).length > 0) {
        setHasAudio(true);
      }
      const entry = getEntry(manifest, id);

      if (!entry) {
        fallbackToSpeech(id, text);
        return;
      }

      const el = getAudio();
      if (!el) {
        fallbackToSpeech(id, text);
        return;
      }

      // Pre-fetch timing JSON in parallel; non-fatal if it fails.
      const timingUrl = `/${entry.timing.replace(/^\/+/, "")}`;
      fetch(timingUrl)
        .then((r) => (r.ok ? r.json() : null))
        .then((t: AlignmentTiming | null) => {
          if (t && t.characters) setTiming(t);
        })
        .catch(() => {
          /* timing is optional for captions; ignore */
        });

      const mp3Url = `/${entry.mp3.replace(/^\/+/, "")}`;
      el.src = mp3Url;
      el.playbackRate = playbackRate;
      setMode("audio");
      setCurrentId(id);

      try {
        await el.play();
      } catch {
        fallbackToSpeech(id, text);
        return;
      }

      // If the underlying resource fails (404), the 'error' event fires
      // after play(). Attach a one-shot error listener that flips to speech.
      const onError = () => {
        el.removeEventListener("error", onError);
        fallbackToSpeech(id, text);
      };
      el.addEventListener("error", onError, { once: true });
    },
    [fallbackToSpeech, getAudio, playbackRate, speech]
  );

  const pause = useCallback(() => {
    if (mode === "audio") {
      audioRef.current?.pause();
    } else if (mode === "speech") {
      speech.pause();
    }
  }, [mode, speech]);

  const resume = useCallback(() => {
    if (mode === "audio") {
      audioRef.current?.play().catch(() => {});
    } else if (mode === "speech") {
      speech.resume();
    }
  }, [mode, speech]);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
        a.currentTime = 0;
      } catch {}
    }
    try {
      speech.stop();
    } catch {}
    setAudioPlaying(false);
    setAudioPaused(false);
    setCurrentTime(0);
    setDuration(0);
    setTiming(null);
    setMode("idle");
    setCurrentId(null);
  }, [speech]);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      const r = clampRate(rate);
      setPlaybackRateState(r);
      if (audioRef.current) audioRef.current.playbackRate = r;
      speech.setRate(r);
    },
    [speech]
  );

  const isPlaying = mode === "audio" ? audioPlaying : mode === "speech" ? speech.isSpeaking && !speech.isPaused : false;
  const isPaused = mode === "audio" ? audioPaused : mode === "speech" ? speech.isPaused : false;

  return {
    play,
    pause,
    resume,
    stop,
    setPlaybackRate,
    mode,
    isPlaying,
    isPaused,
    currentId,
    currentTime: mode === "audio" ? currentTime : 0,
    duration: mode === "audio" ? duration : 0,
    playbackRate,
    timing: mode === "audio" ? timing : null,
    hasAudio,
    speechSupported: speech.supported,
  };
}
