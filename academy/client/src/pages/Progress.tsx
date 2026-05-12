import { Link } from "wouter";
import { Trophy, CheckCircle2, Circle } from "lucide-react";
import { LESSONS } from "@/lib/content";
import { useProgress } from "@/components/ProgressCtx";

export function ProgressPage() {
  const { progress } = useProgress();
  let totalScore = 0;
  let totalPossible = 0;
  let completed = 0;
  let visited = 0;
  LESSONS.forEach((l) => {
    const p = progress[l.id];
    if (p?.visited) visited++;
    if (p?.score != null && p?.total != null) {
      totalScore += p.score;
      totalPossible += p.total;
      completed++;
    }
  });
  const accuracy = totalPossible ? Math.round((totalScore / totalPossible) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <header className="mb-6">
        <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
          Scoreboard
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">Your Progress</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Tracked in this session only — nothing is saved to your device. Refresh and it's a clean slate.
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <StatCard label="Lessons completed" value={`${completed}/${LESSONS.length}`} />
        <StatCard label="Lessons visited" value={`${visited}/${LESSONS.length}`} />
        <StatCard label="Quiz accuracy" value={`${accuracy}%`} highlight />
      </div>

      <ol className="space-y-2" data-testid="progress-list">
        {LESSONS.map((l, i) => {
          const p = progress[l.id];
          const taken = p?.score != null;
          const visitedThis = p?.visited;
          return (
            <li
              key={l.id}
              className="rounded-xl border border-card-border bg-card p-4 flex items-center gap-4"
              data-testid={`progress-row-${l.id}`}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary font-display font-extrabold text-sm">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold">
                  {l.emoji} {l.title}
                </div>
                <div className="text-sm text-muted-foreground">{l.subtitle}</div>
              </div>
              <div className="flex items-center gap-3">
                {taken ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-display font-bold text-primary">
                    <Trophy className="size-3.5" /> {p.score}/{p.total}
                  </span>
                ) : visitedThis ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-display font-bold text-accent-foreground">
                    <CheckCircle2 className="size-3.5" /> visited
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-xs font-display font-semibold text-muted-foreground">
                    <Circle className="size-3.5" /> not started
                  </span>
                )}
                <Link
                  href={`/lessons/${l.id}`}
                  className="text-xs font-display font-semibold uppercase tracking-wider text-primary hover:underline"
                  data-testid={`link-open-${l.id}`}
                >
                  Open →
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
      <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-3xl font-extrabold tabular ${highlight ? "text-primary text-glow-green" : ""}`}>
        {value}
      </div>
    </div>
  );
}
