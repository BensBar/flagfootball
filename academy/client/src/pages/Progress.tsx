import { Link } from "wouter";
import { Trophy, CheckCircle2, Circle, RotateCcw, GraduationCap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LESSONS } from "@/lib/content";
import { useProgress } from "@/components/ProgressCtx";
import { useProgressStore } from "@/lib/useProgressStore";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function ProgressPage() {
  const { progress, resetAll } = useProgress();
  const { data } = useProgressStore();
  const { toast } = useToast();
  const studentName = data.studentName?.trim();
  const examHistory = Array.isArray(data.examHistory) ? data.examHistory : [];
  const recentExams = [...examHistory]
    .sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0))
    .slice(0, 5);

  const handleReset = () => {
    resetAll();
    try {
      toast({
        title: "Progress reset",
        description: "Your scoreboard is back to a clean slate.",
      });
    } catch {
      // toast is best-effort; the store update already triggers a re-render.
    }
  };

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
        {studentName ? (
          <h1
            className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1"
            data-testid="text-welcome-back"
          >
            Welcome back, <span className="text-primary text-glow-green">{studentName}</span>
          </h1>
        ) : (
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            Your Progress
          </h1>
        )}
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Saved on this device so you can pick up where you left off. Use “Reset progress” below to start fresh.
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

      {recentExams.length > 0 && (
        <section className="mt-8" data-testid="section-exam-history">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="size-5 text-primary" />
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wider">
              Final Exam history
            </h2>
          </div>
          <ol className="space-y-2">
            {recentExams.map((exam, i) => {
              const pct = exam.total ? Math.round((exam.score / exam.total) * 100) : 0;
              const when = exam.takenAt
                ? formatDistanceToNow(new Date(exam.takenAt), { addSuffix: true })
                : "";
              return (
                <li
                  key={`${exam.takenAt ?? i}-${i}`}
                  className="rounded-xl border border-card-border bg-card p-4 flex items-center gap-4"
                  data-testid={`exam-history-row-${i}`}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary font-display font-extrabold text-sm">
                    <Trophy className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold">
                      {exam.score}/{exam.total}{" "}
                      <span className="text-muted-foreground font-normal">· {pct}%</span>
                    </div>
                    {when && (
                      <div className="text-sm text-muted-foreground" data-testid={`exam-history-when-${i}`}>
                        {when}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="mt-10 border-t border-card-border pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="font-display font-bold">Reset progress</div>
          <p className="text-sm text-muted-foreground max-w-md">
            Clears every visited lesson, quiz score, and exam result from this device. This can’t be undone.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="self-start sm:self-auto"
              data-testid="button-reset-progress"
            >
              <RotateCcw className="size-4" />
              Reset progress
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-testid="dialog-reset-progress">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
              <AlertDialogDescription>
                This wipes every lesson, quiz, and final-exam result saved on this device. You’ll
                start with a clean scoreboard. There’s no undo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="dialog-reset-progress-cancel">
                Keep my progress
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                data-testid="dialog-reset-progress-confirm"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Yes, reset everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
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
