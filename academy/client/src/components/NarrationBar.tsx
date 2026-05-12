import { Play, Pause, Square, Volume2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { useNarration } from "@/lib/useNarration";

type Props = {
  narration: ReturnType<typeof useNarration>;
  text: string;
  label?: string;
};

export function NarrationBar({ narration, text, label = "Narrate this lesson" }: Props) {
  const { supported, voices, voiceURI, setVoiceURI, rate, setRate, isSpeaking, isPaused, speak, pause, resume, stop } =
    narration;

  if (!supported) {
    return (
      <div
        className="rounded-lg border border-card-border bg-card/60 p-3 flex items-start gap-3 text-sm"
        data-testid="narration-unsupported"
      >
        <AlertTriangle className="size-4 mt-0.5 text-accent shrink-0" />
        <div>
          <div className="font-semibold">Voice narration not available in this browser</div>
          <div className="text-muted-foreground">You can still read every lesson below. Try Chrome, Edge, or Safari for narration.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-card-border bg-card/80 backdrop-blur p-3 sm:p-4 shadow-md" data-testid="narration-bar">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 mr-1">
          <Volume2 className="size-4 text-primary" aria-hidden />
          <span className="text-xs font-display tracking-wider uppercase font-semibold text-muted-foreground hidden sm:inline">
            {label}
          </span>
        </div>

        {!isSpeaking || (isSpeaking && isPaused) ? (
          <Button
            size="sm"
            onClick={() => (isPaused ? resume() : speak(text))}
            data-testid="button-narrate-play"
            aria-label={isPaused ? "Resume narration" : "Play narration"}
          >
            <Play className="size-4 mr-1" />
            {isPaused ? "Resume" : "Play"}
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={pause} data-testid="button-narrate-pause" aria-label="Pause narration">
            <Pause className="size-4 mr-1" />
            Pause
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={stop}
          disabled={!isSpeaking && !isPaused}
          data-testid="button-narrate-stop"
          aria-label="Stop narration"
        >
          <Square className="size-4 mr-1" />
          Stop
        </Button>

        <div className="flex items-center gap-2 ml-auto">
          {voices.length > 0 && (
            <Select value={voiceURI ?? undefined} onValueChange={(v) => setVoiceURI(v)}>
              <SelectTrigger
                className="h-8 w-[160px] sm:w-[200px] text-xs"
                data-testid="select-narrate-voice"
                aria-label="Narration voice"
              >
                <SelectValue placeholder="Voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v.voiceURI} value={v.voiceURI} className="text-xs">
                    {v.name} {v.lang ? `· ${v.lang}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex items-center gap-2 w-[140px]" aria-label="Narration speed">
            <span className="text-[10px] font-display uppercase text-muted-foreground tracking-wider">Speed</span>
            <Slider
              min={0.6}
              max={1.4}
              step={0.05}
              value={[rate]}
              onValueChange={(v) => setRate(v[0])}
              data-testid="slider-narrate-rate"
              aria-label="Narration speed"
            />
            <span className="text-xs font-mono tabular w-8 text-right text-muted-foreground">{rate.toFixed(2)}×</span>
          </div>
        </div>
      </div>
    </div>
  );
}
