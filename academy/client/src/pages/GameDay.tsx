import { useState } from "react";
import { Check, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoachAudio } from "@/lib/useCoachAudio";
import { NarrationBar } from "@/components/NarrationBar";

const CHECKLIST: { group: string; items: string[] }[] = [
  {
    group: "Night before",
    items: [
      "Pack your bag (uniform, cleats, water bottle, mouthguard)",
      "Fill your water bottle and put it in the fridge",
      "Lay out your uniform — top, shorts, socks, belt",
      "Eat a normal dinner (not something brand new)",
      "Aim for 9 hours of sleep",
    ],
  },
  {
    group: "Morning of",
    items: [
      "Eat a real breakfast at least 90 minutes before kickoff",
      "Hydrate — water, not soda or energy drinks",
      "Leave early — get to the field 30 minutes before",
      "Stretch and jog before warmups",
      "Find your coach and check in",
    ],
  },
  {
    group: "Right before kickoff",
    items: [
      "Run 3 short routes with your QB",
      "Pull 5 flags off a partner at game speed",
      "Drink water one more time",
      "Huddle up with your team — make eye contact, get loud",
      "Take three deep breaths",
    ],
  },
  {
    group: "During the game",
    items: [
      "Two hands on the ball when carrying",
      "Eyes on the hips when pulling flags",
      "Sprint back to the huddle",
      "Hype up a teammate every drive",
      "Listen to your coach — don't argue with refs",
    ],
  },
  {
    group: "After the game",
    items: [
      "Shake hands with the other team",
      "Hydrate and eat within 30 minutes",
      "Thank the refs and your coach",
      "Note one thing you did well + one thing to improve",
    ],
  },
];

export function GameDay() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const audio = useCoachAudio();

  const totalItems = CHECKLIST.reduce((acc, g) => acc + g.items.length, 0);
  const doneCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((doneCount / totalItems) * 100);

  const fullScript =
    "Game day checklist. " +
    CHECKLIST.map((g) => `${g.group}. ${g.items.join(". ")}.`).join(" ");

  const toggle = (key: string) =>
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <header className="mb-6">
        <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
          Locker Room
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
          Game-Day Checklist
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Print it in your brain. Tap items as you finish them.
        </p>
      </header>

      <div className="mb-6">
        <NarrationBar audio={audio} text={fullScript} label="Read the whole checklist" />
      </div>

      {/* Progress bar */}
      <div className="mb-6 rounded-xl border border-card-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="font-display font-bold tracking-tight">
            {doneCount}/{totalItems} done
          </div>
          <div className="text-muted-foreground tabular">{pct}%</div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${pct}%`, boxShadow: "0 0 12px hsl(142 88% 50% / 0.7)" }}
            aria-hidden
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setChecked({})} data-testid="button-reset-checklist">
            Reset
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const next: Record<string, boolean> = {};
              CHECKLIST.forEach((g) =>
                g.items.forEach((_, i) => (next[`${g.group}-${i}`] = true))
              );
              setChecked(next);
            }}
            data-testid="button-check-all"
          >
            Check all
          </Button>
        </div>
      </div>

      <div className="space-y-4" data-testid="checklist">
        {CHECKLIST.map((group) => (
          <section key={group.group} className="rounded-xl border border-card-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-lg tracking-tight">{group.group}</h2>
              <button
                onClick={() =>
                  audio.play({
                    id: `gameday:group:${group.group.replace(/\s+/g, "-").toLowerCase()}`,
                    text: `${group.group}. ${group.items.join(". ")}.`,
                  })
                }
                disabled={!audio.hasAudio && !audio.speechSupported}
                className="inline-flex items-center gap-1 text-xs font-display font-semibold uppercase tracking-wider text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                data-testid={`button-narrate-group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <Volume2 className="size-3.5" /> Hear
              </button>
            </div>
            <ul className="mt-3 space-y-1.5">
              {group.items.map((item, i) => {
                const key = `${group.group}-${i}`;
                const done = !!checked[key];
                return (
                  <li key={key}>
                    <button
                      onClick={() => toggle(key)}
                      data-testid={`checklist-item-${key}`}
                      aria-pressed={done}
                      className={`w-full flex items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        done
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-card-border bg-background hover:bg-accent/10"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${
                          done ? "bg-primary border-primary text-primary-foreground" : "border-card-border bg-card"
                        }`}
                        aria-hidden
                      >
                        {done && <Check className="size-3.5" />}
                      </span>
                      <span className={done ? "line-through text-muted-foreground" : ""}>{item}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
