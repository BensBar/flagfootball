import { useState } from "react";
import { Check, X, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion } from "@/lib/content";

type Props = {
  lessonId: string;
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
};

export function Quiz({ lessonId, questions, onComplete }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [revealed, setRevealed] = useState<boolean[]>(() => questions.map(() => false));
  const [submitted, setSubmitted] = useState(false);

  const score = answers.reduce<number>(
    (acc, a, i) => (a === questions[i].correct ? acc + 1 : acc),
    0
  );
  const allAnswered = answers.every((a) => a !== null);

  const handlePick = (qi: number, oi: number) => {
    if (submitted) return;
    if (revealed[qi]) return; // already revealed
    const nextAnswers = [...answers];
    nextAnswers[qi] = oi;
    const nextRevealed = [...revealed];
    nextRevealed[qi] = true;
    setAnswers(nextAnswers);
    setRevealed(nextRevealed);
  };

  const submit = () => {
    setSubmitted(true);
    onComplete(Number(score), questions.length);
  };

  const reset = () => {
    setAnswers(questions.map(() => null));
    setRevealed(questions.map(() => false));
    setSubmitted(false);
  };

  return (
    <div className="space-y-4" data-testid={`quiz-${lessonId}`}>
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15 text-accent font-display font-bold text-lg neon-border-yellow">
          ?
        </div>
        <div>
          <div className="font-display text-base font-bold tracking-tight">Quick Checkpoint</div>
          <div className="text-xs text-muted-foreground">Tap an answer — you'll see feedback right away.</div>
        </div>
      </div>

      {questions.map((q, qi) => (
        <div
          key={qi}
          className="rounded-xl border border-card-border bg-card p-4 space-y-3"
          data-testid={`question-${lessonId}-${qi}`}
        >
          <div className="font-display font-semibold text-sm sm:text-base">
            <span className="text-primary mr-2">{qi + 1}.</span>
            {q.q}
          </div>
          <div className="grid gap-2">
            {q.options.map((opt, oi) => {
              const picked = answers[qi] === oi;
              const correct = q.correct === oi;
              const show = revealed[qi];
              let style = "border-card-border bg-background hover:bg-accent/10";
              if (show && correct) {
                style = "border-primary/70 bg-primary/15 text-foreground";
              } else if (show && picked && !correct) {
                style = "border-destructive/60 bg-destructive/10";
              } else if (show) {
                style = "border-card-border bg-background opacity-60";
              }
              return (
                <button
                  key={oi}
                  onClick={() => handlePick(qi, oi)}
                  disabled={revealed[qi]}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${style} disabled:cursor-default`}
                  data-testid={`option-${lessonId}-${qi}-${oi}`}
                  aria-pressed={picked}
                >
                  <span className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-md border border-card-border bg-secondary/60 font-display font-bold text-xs">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </span>
                  {show && correct && <Check className="size-4 text-primary" aria-label="Correct" />}
                  {show && picked && !correct && <X className="size-4 text-destructive" aria-label="Incorrect" />}
                </button>
              );
            })}
          </div>
          {revealed[qi] && (
            <div
              className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm anim-fade-up"
              data-testid={`explain-${lessonId}-${qi}`}
            >
              <span className="font-semibold text-primary">
                {answers[qi] === q.correct ? "Nice — you got it." : "Almost!"}
              </span>{" "}
              {q.explain}
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          size="sm"
          disabled={!allAnswered || submitted}
          onClick={submit}
          data-testid={`button-submit-quiz-${lessonId}`}
        >
          <Trophy className="size-4 mr-1" />
          {submitted ? "Submitted" : "Save score"}
        </Button>
        <Button size="sm" variant="outline" onClick={reset} data-testid={`button-reset-quiz-${lessonId}`}>
          <RotateCcw className="size-4 mr-1" />
          Reset
        </Button>
        {allAnswered && (
          <div className="text-sm font-display font-semibold ml-auto" data-testid={`quiz-score-${lessonId}`}>
            Score:{" "}
            <span className="text-primary text-glow-green">
              {score}/{questions.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
