import { useEffect, useMemo, useRef, useState } from "react";
import { Play as PlayIcon, Pause, SkipBack, SkipForward, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAYS } from "@/lib/playbook";
import { playStepScript } from "@/lib/narrationScripts";
import { FieldDiagram } from "@/components/FieldDiagram";
import { useCoachAudio } from "@/lib/useCoachAudio";
import { useReducedMotion } from "@/components/ReducedMotionCtx";

export function Playbook() {
  const [activeId, setActiveId] = useState(PLAYS[0].id);
  const active = PLAYS.find((p) => p.id === activeId) ?? PLAYS[0];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [narrateOn, setNarrateOn] = useState(true);
  const reduced = useReducedMotion();
  const audio = useCoachAudio();
  const stepRef = useRef(0);
  stepRef.current = step;

  // Reset when changing plays
  useEffect(() => {
    setStep(0);
    setPlaying(false);
    audio.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Auto-advance when "playing"
  useEffect(() => {
    if (!playing) return;
    const interval = reduced ? 1800 : 2800;
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s + 1 >= active.steps.length) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, interval);
    return () => clearInterval(id);
  }, [playing, active.steps.length, reduced]);

  // Narrate the current step
  useEffect(() => {
    if (!narrateOn) return;
    if (!audio.hasAudio && !audio.speechSupported) return;
    const s = active.steps[step];
    if (!s) return;
    const txt = playStepScript(s);
    audio.play({ id: `play:${active.id}:step:${step}`, text: txt });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, activeId, narrateOn]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <header className="mb-6">
        <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
          The Playbook
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Animated Plays</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Step through each play like film room. Routes draw themselves, the ball flies, and we'll narrate the call.
        </p>
      </header>

      {/* Play picker */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6" role="tablist" aria-label="Plays">
        {PLAYS.map((p) => {
          const isActive = activeId === p.id;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(p.id)}
              data-testid={`button-play-${p.id}`}
              className={`text-left rounded-xl border p-4 transition-colors ${
                isActive
                  ? "border-primary/70 bg-primary/10 neon-border"
                  : "border-card-border bg-card hover-elevate"
              }`}
            >
              <div className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground">
                {p.category} · {p.difficulty}
              </div>
              <div className="font-display font-extrabold text-lg mt-0.5">{p.name}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.summary}</div>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* Diagram */}
        <div>
          <FieldDiagram
            play={active}
            step={step}
            playing={playing}
            reducedMotion={reduced}
          />

          {/* Controls */}
          <div className="mt-3 rounded-xl border border-card-border bg-card p-3 flex flex-wrap items-center gap-2 shadow-sm">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              data-testid="button-step-prev"
              aria-label="Previous step"
            >
              <SkipBack className="size-4" />
            </Button>
            {!playing ? (
              <Button size="sm" onClick={() => setPlaying(true)} data-testid="button-play-run" aria-label="Run the play">
                <PlayIcon className="size-4 mr-1" />
                Run the play
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setPlaying(false)} data-testid="button-play-pause" aria-label="Pause">
                <Pause className="size-4 mr-1" />
                Pause
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStep((s) => Math.min(active.steps.length - 1, s + 1))}
              disabled={step >= active.steps.length - 1}
              data-testid="button-step-next"
              aria-label="Next step"
            >
              <SkipForward className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStep(0);
                setPlaying(false);
              }}
              data-testid="button-play-reset"
              aria-label="Reset"
            >
              <RotateCcw className="size-4" />
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                variant={narrateOn ? "default" : "outline"}
                onClick={() => {
                  if (narrateOn) audio.stop();
                  setNarrateOn(!narrateOn);
                }}
                data-testid="button-toggle-narrate"
                aria-pressed={narrateOn}
                disabled={!audio.hasAudio && !audio.speechSupported}
              >
                {narrateOn ? <Volume2 className="size-4 mr-1" /> : <VolumeX className="size-4 mr-1" />}
                Narrate
              </Button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="mt-3 flex items-center gap-2" aria-label="Play step progress">
            {active.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                data-testid={`button-dot-${i}`}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-card-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step description / transcript */}
        <div className="space-y-3" data-testid="play-transcript">
          <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm">
            <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
              Now showing
            </div>
            <h2 className="font-display text-xl font-extrabold mt-1">{active.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{active.summary}</p>
          </div>

          <ol className="space-y-2">
            {active.steps.map((s, i) => {
              const isActive = i === step;
              return (
                <li key={i}>
                  <button
                    onClick={() => setStep(i)}
                    data-testid={`button-step-${i}`}
                    className={`w-full text-left rounded-xl border p-4 transition-colors ${
                      isActive
                        ? "border-primary/60 bg-primary/10"
                        : "border-card-border bg-card hover-elevate"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-md font-display font-extrabold text-xs ${
                          isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display font-bold text-sm">{s.title}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">{s.description}</div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Tip: keyboard arrows aren't bound — use the buttons or jump straight to any step.
      </p>
    </div>
  );
}
