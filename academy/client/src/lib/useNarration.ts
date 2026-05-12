import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useNarration — wraps the browser Web Speech API for play/pause/stop control.
 * Falls back gracefully when speechSynthesis is unavailable.
 * Does not use localStorage or any persistent browser storage.
 */
export function useNarration() {
  const supported =
    typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load voices when available. Browsers populate this asynchronously.
  useEffect(() => {
    if (!supported) return;
    const update = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      if (!voiceURI && list.length) {
        // Prefer an English voice
        const preferred =
          list.find((v) => /en[-_]US/i.test(v.lang) && /Google|Samantha|Microsoft/i.test(v.name)) ||
          list.find((v) => /^en/i.test(v.lang)) ||
          list[0];
        setVoiceURI(preferred?.voiceURI ?? null);
      }
    };
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, [supported, voiceURI]);

  // Stop narration on unmount
  useEffect(() => {
    return () => {
      if (supported) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentText(null);
    utteranceRef.current = null;
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      try {
        // Cancel any current utterance so we always start fresh
        window.speechSynthesis.cancel();
      } catch {}
      const utt = new SpeechSynthesisUtterance(text);
      const voice = voices.find((v) => v.voiceURI === voiceURI);
      if (voice) utt.voice = voice;
      utt.rate = rate;
      utt.pitch = 1;
      utt.volume = 1;
      utt.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      utt.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        setCurrentText(null);
      };
      utt.onerror = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utteranceRef.current = utt;
      setCurrentText(text);
      try {
        window.speechSynthesis.speak(utt);
      } catch {}
    },
    [supported, voices, voiceURI, rate]
  );

  const pause = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch {}
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch {}
  }, [supported]);

  return {
    supported,
    voices,
    voiceURI,
    setVoiceURI,
    rate,
    setRate,
    isSpeaking,
    isPaused,
    currentText,
    speak,
    pause,
    resume,
    stop,
  };
}
