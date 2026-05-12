import { Link } from "wouter";
import { ArrowRight, Volume2, Flag, Map, ListChecks, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LESSONS } from "@/lib/content";
import { useProgress } from "@/components/ProgressCtx";

export function Home() {
  const { progress } = useProgress();
  const completed = Object.values(progress).filter((p) => p.score !== null).length;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-turf border-b border-card-border">
        <div className="absolute inset-0 bg-chalk-grid opacity-50" aria-hidden />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20 lg:py-24 relative">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-display font-semibold uppercase tracking-wider text-primary mb-4">
                <span className="size-1.5 rounded-full bg-primary animate-pulse" /> Live playbook · 8th-grade ready
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.02] tracking-tight">
                Learn flag football
                <br />
                <span className="text-primary text-glow-green">like a varsity QB.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base sm:text-lg text-muted-foreground">
                Nine fast lessons. Animated plays. Voice narration that reads every page out loud. Quick quizzes so you
                actually remember what you learned.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" data-testid="button-cta-start">
                  <Link href="/lessons">
                    Start Lesson 1 <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" data-testid="button-cta-playbook">
                  <Link href="/playbook">Open the Playbook</Link>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 max-w-md gap-3 text-center">
                <Stat n="9" label="Lessons" />
                <Stat n="3" label="Animated plays" />
                <Stat n="5" label="Core routes" />
              </div>
            </div>

            {/* Hero diagram: stylized field with chalk lines */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-3xl" aria-hidden />
              <svg
                viewBox="0 0 100 70"
                className="relative w-full rounded-2xl border border-card-border bg-[hsl(215,55%,9%)] shadow-2xl"
                role="img"
                aria-label="Stylized chalk-line play diagram"
              >
                <defs>
                  <pattern id="hero-mow" width="4" height="70" patternUnits="userSpaceOnUse">
                    <rect width="2" height="70" fill="hsl(142 45% 14%)" />
                    <rect x="2" width="2" height="70" fill="hsl(142 42% 17%)" />
                  </pattern>
                  <radialGradient id="hero-light" cx="50%" cy="0%" r="80%">
                    <stop offset="0%" stopColor="hsl(48 100% 60% / 0.18)" />
                    <stop offset="100%" stopColor="hsl(48 100% 60% / 0)" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="100" height="70" fill="url(#hero-mow)" />
                <rect x="0" y="0" width="100" height="70" fill="url(#hero-light)" />
                {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="70" stroke="hsl(0 0% 100% / 0.16)" strokeWidth="0.2" />
                ))}
                <line x1="30" y1="0" x2="30" y2="70" stroke="hsl(48 100% 58%)" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
                {/* Route arrows (slant & flat) */}
                <path
                  d="M 30 18 L 38 18 L 52 30"
                  fill="none"
                  stroke="hsl(142 88% 55%)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="2 1.5"
                  className="anim-dash"
                />
                <path
                  d="M 30 38 L 32 56 L 46 60"
                  fill="none"
                  stroke="hsl(48 100% 58%)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="2 1.5"
                  className="anim-dash"
                />
                <path
                  d="M 30 50 L 38 56 L 60 56"
                  fill="none"
                  stroke="hsl(200 100% 58%)"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="2 1.5"
                  className="anim-dash"
                />
                {/* O players */}
                {[
                  [30, 18, "X"],
                  [30, 30, "C"],
                  [24, 30, "QB"],
                  [30, 38, "RB"],
                  [30, 50, "Z"],
                ].map(([x, y, l], i) => (
                  <g key={i} transform={`translate(${x}, ${y})`}>
                    <circle r="2.6" fill="hsl(142 88% 50%)" stroke="hsl(215 60% 8%)" strokeWidth="0.4" />
                    <text textAnchor="middle" dy="0.9" fontSize="2.4" fontWeight="800" fill="hsl(215 60% 8%)" style={{ fontFamily: "var(--font-display)" }}>
                      {l}
                    </text>
                  </g>
                ))}
                {/* D players */}
                {[
                  [38, 18, "CB"],
                  [40, 30, "LB"],
                  [40, 50, "CB"],
                ].map(([x, y, l], i) => (
                  <g key={i} transform={`translate(${x}, ${y})`}>
                    <circle r="2.6" fill="hsl(48 100% 58%)" stroke="hsl(215 60% 8%)" strokeWidth="0.4" />
                    <text textAnchor="middle" dy="0.9" fontSize="2.4" fontWeight="800" fill="hsl(215 60% 8%)" style={{ fontFamily: "var(--font-display)" }}>
                      {l}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE TILES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureTile
            icon={<Volume2 className="size-5" />}
            title="Voice narration"
            body="Every lesson reads aloud with play/pause/stop. Pick the voice you like best."
          />
          <FeatureTile
            icon={<Flag className="size-5" />}
            title="Animated plays"
            body="Watch routes draw themselves. Step through every read like a film-room session."
          />
          <FeatureTile
            icon={<Map className="size-5" />}
            title="Route Lab"
            body="The five must-know routes. See exactly where to cut, and why."
          />
          <FeatureTile
            icon={<ListChecks className="size-5" />}
            title="Quick checkpoints"
            body={`Tiny quizzes after each lesson. You've finished ${completed}/${LESSONS.length}.`}
          />
        </div>
      </section>

      {/* CURRICULUM PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> The Curriculum
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Nine lessons. One playbook.</h2>
          </div>
          <Button asChild variant="outline" data-testid="button-see-all-lessons">
            <Link href="/lessons">See all lessons</Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LESSONS.map((l, i) => (
            <Link
              key={l.id}
              href={`/lessons/${l.id}`}
              data-testid={`card-lesson-${l.id}`}
              className="rounded-xl border border-card-border bg-card p-4 hover-elevate active-elevate-2 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary font-display font-bold text-lg">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                    Module {i + 1} · {l.durationMin} min
                  </div>
                  <div className="font-display font-bold text-base mt-0.5 truncate">
                    {l.emoji} {l.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{l.subtitle}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-lg border border-card-border bg-card px-3 py-2">
      <div className="font-display text-xl font-extrabold text-primary text-glow-green tabular">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
    </div>
  );
}

function FeatureTile({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-card-border bg-card p-4 shadow-sm">
      <div className="absolute -top-8 -right-8 size-20 rounded-full bg-primary/10 blur-2xl" aria-hidden />
      <div className="relative flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary mb-3">
        {icon}
      </div>
      <div className="font-display font-bold text-sm relative">{title}</div>
      <div className="text-sm text-muted-foreground mt-1 relative">{body}</div>
    </div>
  );
}
