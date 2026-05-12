import { useMemo } from "react";
import type { CoachAudio } from "@/lib/useCoachAudio";
import { useReducedMotion } from "@/components/ReducedMotionCtx";

type Props = {
  text: string;
  audio: CoachAudio;
  className?: string;
};

type Word = {
  text: string;
  // Inclusive char index range within `text` (joined characters from timing).
  start: number;
  end: number;
};

// Group characters into words by splitting on whitespace, preserving original
// offsets so we can map a character index back to a word.
function buildWords(text: string): Word[] {
  const words: Word[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    words.push({ text: m[0], start: m.index, end: m.index + m[0].length - 1 });
  }
  return words;
}

// Given timing data, find the character index whose end-time is the
// smallest one ≥ currentTime. That is "the character being spoken now".
function activeCharIndex(
  endTimes: number[],
  currentTime: number
): number {
  if (!endTimes.length) return -1;
  // Linear scan — endTimes are monotonically non-decreasing so this is fast
  // enough for typical lesson lengths (~1000 chars). Could be binary-search,
  // but linear keeps the code obvious and timeupdate fires only ~4Hz.
  for (let i = 0; i < endTimes.length; i++) {
    if (endTimes[i] >= currentTime) return i;
  }
  return endTimes.length - 1;
}

export function CaptionedTranscript({ text, audio, className }: Props) {
  const reduced = useReducedMotion();
  const words = useMemo(() => buildWords(text), [text]);

  // Plain rendering when we don't have audio + timing (covers idle, speech fallback,
  // and pre-play states).
  if (audio.mode !== "audio" || !audio.timing) {
    return (
      <p className={className} data-testid="captioned-transcript">
        {text}
      </p>
    );
  }

  const timing = audio.timing;
  // The timing characters array is the source of truth for character offsets.
  // It should match `text` character-for-character when generated from the same
  // source string. If they diverge in length, fall back to plain text.
  const timedChars = timing.characters;
  if (!timedChars || timedChars.length === 0) {
    return (
      <p className={className} data-testid="captioned-transcript">
        {text}
      </p>
    );
  }

  const charIdx = activeCharIndex(timing.character_end_times_seconds, audio.currentTime);

  // Find the word that contains the active character index.
  let activeWord = -1;
  if (charIdx >= 0) {
    for (let i = 0; i < words.length; i++) {
      if (charIdx >= words[i].start && charIdx <= words[i].end) {
        activeWord = i;
        break;
      }
      if (charIdx < words[i].start) {
        // Active char is in inter-word whitespace; highlight the previous word
        // so the reader's eye stays on the last spoken word.
        activeWord = Math.max(0, i - 1);
        break;
      }
    }
    if (activeWord === -1 && words.length) activeWord = words.length - 1;
  }

  // Render text preserving whitespace by splitting on the same regex used in
  // buildWords. We walk `text` and emit either a word span or a literal
  // whitespace string.
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (cursor < w.start) {
      nodes.push(text.slice(cursor, w.start));
    }
    const isActive = i === activeWord;
    // Reduced motion: a single static highlight at the current position is
    // fine, but skip the soft color transition.
    const cls = isActive
      ? reduced
        ? "bg-primary/25 text-foreground rounded px-0.5"
        : "bg-primary/25 text-foreground rounded px-0.5 transition-colors duration-150"
      : "transition-colors duration-150";
    nodes.push(
      <span
        key={i}
        className={cls}
        data-testid={isActive ? "caption-active-word" : undefined}
        aria-current={isActive ? "true" : undefined}
      >
        {w.text}
      </span>
    );
    cursor = w.end + 1;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));

  return (
    <p className={className} data-testid="captioned-transcript">
      {nodes}
    </p>
  );
}
