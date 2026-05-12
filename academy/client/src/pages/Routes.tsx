import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/playbook";
import { routeTipScript } from "@/lib/narrationScripts";
import { RouteDiagram } from "@/components/RouteDiagram";
import { useCoachAudio } from "@/lib/useCoachAudio";
import { NarrationBar } from "@/components/NarrationBar";

const COACH_TIPS: Record<string, string[]> = {
  slant:
    "Three quick steps, plant your outside foot, and burst inside at a 45° angle. Look for the ball right after your cut — it should be there fast. Catch with thumbs together.".split("|"),
  out:
    "Sell the deep route for five steps, then drive your inside foot into the ground and snap toward the sideline. Keep your shoulders square, then square back to the QB after the catch.".split("|"),
  curl:
    "Sprint straight upfield. At your depth (often 7-10 yards), stop hard and turn back toward the QB. Give them a big chest target. Drop your hips to stop fast — don't rise up.".split("|"),
  post:
    "Run straight at the cornerback's outside shoulder. Around 10 yards, plant the outside foot and angle to the goalposts. Look for the ball in stride — it'll lead you toward the middle.".split("|"),
  go:
    "All speed, no cut. Beat the defender to a spot 1 yard ahead of them and just keep going. Look for the ball over your inside shoulder. Catch in stride.".split("|"),
};

export function RoutesPage() {
  const [activeId, setActiveId] = useState(ROUTES[0].id);
  const active = ROUTES.find((r) => r.id === activeId) ?? ROUTES[0];
  const audio = useCoachAudio();

  const script = routeTipScript(active);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <header className="mb-6">
        <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
          Route Lab
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
          The Five Must-Know Routes
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Master these five and you can play any wide-receiver spot. Tap a route to see exactly where to cut.
        </p>
      </header>

      <div className="mb-6">
        <NarrationBar audio={audio} id={`route:${active.id}:tip`} text={script} label="Coach me on this route" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
        {/* Route picker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3" role="tablist" aria-label="Routes">
          {ROUTES.map((r) => {
            const isActive = activeId === r.id;
            return (
              <button
                key={r.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(r.id)}
                data-testid={`button-route-${r.id}`}
                className={`text-left rounded-xl border overflow-hidden transition-colors ${
                  isActive ? "border-primary/70 neon-border" : "border-card-border hover-elevate"
                }`}
              >
                <div className="bg-card p-3">
                  <RouteDiagram route={r} />
                </div>
                <div className="border-t border-card-border bg-card/60 p-3">
                  <div className="font-display font-extrabold text-base">{r.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.shortDescription}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        <div className="rounded-xl border border-card-border bg-card p-5 shadow-sm" data-testid="route-detail">
          <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
            Route Card
          </div>
          <h2 className="font-display text-2xl font-extrabold mt-1">{active.name}</h2>
          <p className="text-muted-foreground mt-1">{active.shortDescription}</p>

          <div className="mt-4 rounded-xl border border-card-border bg-background overflow-hidden">
            <div className="aspect-[1/2] sm:aspect-auto">
              <RouteDiagram route={active} />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="font-display font-bold text-sm uppercase tracking-wider text-primary">Coach's tip</div>
            <p className="text-sm leading-relaxed">{COACH_TIPS[active.id]?.[0]}</p>
          </div>

          <div className="mt-4 flex">
            <Button
              size="sm"
              variant="outline"
              onClick={() => audio.play({ id: `route:${active.id}:tip`, text: script })}
              disabled={!audio.hasAudio && !audio.speechSupported}
              data-testid="button-narrate-route"
            >
              <Volume2 className="size-4 mr-1" />
              Hear it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
