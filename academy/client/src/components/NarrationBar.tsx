import { Play, Pause, Square, AlertTriangle, Mic, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { CoachAudio } from "@/lib/useCoachAudio";

type Props = {
  audio: CoachAudio;
  text: string;
  id?: string;
  label?: string;
};

export function NarrationBar({ audio, text, id, label = "Narrate this lesson" }: Props) {
  const {
    mode,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop,
    playbackRate,
    setPlaybackRate,
    speechSupported,
    hasAudio,
  } = audio;

  // If neither audio nor speech is available, nothing useful we can do.
  if (!hasAudio && !speechSupported) {
    return (
      <div
        className="rounded-lg border border-card-border bg-card/60 p-3 flex items-start gap-3 text-sm"
        data-testid="narration-unsupported"
      >
        <AlertTriangle className="size-4 mt-0.5 text-accent shrink-0" />
        <div>
          <div className="font-semibold">Voice narration not available in this browser</div>
          <div className="text-muted-foreground">
            You can still read every lesson below. Try Chrome, Edge, or Safari for narration.
          </div>
        </div>
      </div>
    );
  }

  // Use audio mode when we have an id AND the manifest indicates audio is available.
  // The runtime fallback in useCoachAudio will demote to speech if anything fails.
  const onPlay = () => {
    if (isPaused) {
      resume();
      return;
    }
    // If no id was supplied, we have nothing to look up in the manifest;
    // pass a synthetic id that will never match and will fall straight through to speech.
    play({ id: id ?? "__no_id__", text });
  };

  // The badge only reflects committed state once playback starts.
  const showCoachCam = mode === "audio";
  const showBrowserVoice = mode === "speech";

  return (
    <div
      className="rounded-xl border border-card-border bg-card/80 backdrop-blur p-3 sm:p-4 shadow-md"
      data-testid="narration-bar"
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 mr-1">
          {showCoachCam ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-wider text-primary neon-border"
              data-testid="badge-coach-cam"
            >
              <Mic className="size-3" aria-hidden /> Coach Cam 🎙️
            </span>
          ) : showBrowserVoice ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground"
              data-testid="badge-browser-voice"
            >
              <Volume2 className="size-3" aria-hidden /> Browser voice
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground border border-card-border"
              data-testid="badge-narrate-idle"
            >
              <Volume2 className="size-3" aria-hidden /> {hasAudio ? "Coach Cam ready" : "Browser voice"}
            </span>
          )}
          <span className="text-xs font-display tracking-wider uppercase font-semibold text-muted-foreground hidden sm:inline">
            {label}
          </span>
        </div>

        {!isPlaying ? (
          <Button
            size="sm"
            onClick={onPlay}
            data-testid="button-narrate-play"
            aria-label={isPaused ? "Resume narration" : "Play narration"}
          >
            <Play className="size-4 mr-1" />
            {isPaused ? "Resume" : "Play"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={pause}
            data-testid="button-narrate-pause"
            aria-label="Pause narration"
          >
            <Pause className="size-4 mr-1" />
            Pause
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          data-testid="button-narrate-stop"
          aria-label="Stop narration"
        >
          <Square className="size-4 mr-1" />
          Stop
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2 w-[160px]" aria-label="Narration speed">
            <span className="text-[10px] font-display uppercase text-muted-foreground tracking-wider">Speed</span>
            <Slider
              min={0.75}
              max={1.5}
              step={0.05}
              value={[playbackRate]}
              onValueChange={(v) => setPlaybackRate(v[0])}
              data-testid="slider-narrate-rate"
              aria-label="Narration speed"
            />
            <span className="text-xs font-mono tabular w-8 text-right text-muted-foreground">
              {playbackRate.toFixed(2)}×
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
