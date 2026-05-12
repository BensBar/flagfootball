import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Award, Printer, RotateCcw, ArrowRight, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { LESSONS, type QuizQuestion } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/lib/useProgressStore";
import { useReducedMotion } from "@/components/ReducedMotionCtx";
import { Certificate } from "@/components/Certificate";

const EXAM_LENGTH = 12;
const PASS_PCT = 75;
const NAME_MAX = 32;
const NAME_PATTERN = /^[A-Za-z0-9 .'\-]+$/;

type ExamQuestion = {
  lessonId: string;
  lessonTitle: string;
  q: string;
  options: string[];
  correct: number;
  explain: string;
};

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildExam(): ExamQuestion[] {
  const pool: ExamQuestion[] = [];
  for (const lesson of LESSONS) {
    for (const q of lesson.quiz) {
      pool.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        q: q.q,
        options: q.options,
        correct: q.correct,
        explain: q.explain,
      });
    }
  }
  const picked = shuffle(pool).slice(0, Math.min(EXAM_LENGTH, pool.length));
  return picked.map((eq) => {
    const correctText = eq.options[eq.correct];
    const reshuffled = shuffle(eq.options);
    const newCorrect = reshuffled.indexOf(correctText);
    return { ...eq, options: reshuffled, correct: newCorrect };
  });
}

function sanitizeName(raw: string): string {
  return raw.trim().slice(0, NAME_MAX);
}

type Phase = "name" | "quiz" | "result";

export function Exam() {
  const { data, setStudentName, recordExamResult } = useProgressStore();
  const reduced = useReducedMotion();

  const [questions, setQuestions] = useState<ExamQuestion[]>(() => buildExam());
  const [phase, setPhase] = useState<Phase>(() => (data.studentName ? "quiz" : "name"));
  const [nameInput, setNameInput] = useState<string>(data.studentName ?? "");
  const [nameError, setNameError] = useState<string | null>(null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array.from({ length: EXAM_LENGTH }, () => null),
  );
  const [revealed, setRevealed] = useState<boolean>(false);
  const [recorded, setRecorded] = useState<boolean>(false);

  const total = questions.length;
  const score = useMemo(
    () => answers.reduce<number>((acc, a, i) => (a !== null && a === questions[i]?.correct ? acc + 1 : acc), 0),
    [answers, questions],
  );
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= PASS_PCT;

  const transition = reduced ? "" : "transition-colors";

  const handleNameSubmit = () => {
    const cleaned = sanitizeName(nameInput);
    if (!cleaned) {
      setNameError("Please enter your name.");
      return;
    }
    if (!NAME_PATTERN.test(cleaned)) {
      setNameError("Letters, numbers, spaces, hyphens, periods, and apostrophes only.");
      return;
    }
    setNameError(null);
    setStudentName(cleaned);
    setPhase("quiz");
  };

  const handlePick = (oi: number) => {
    if (revealed) return;
    const next = answers.slice();
    next[idx] = oi;
    setAnswers(next);
  };

  const handleSubmit = () => {
    if (answers[idx] === null) return;
    setRevealed(true);
  };

  const handleNext = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setRevealed(false);
      return;
    }
    // Finish — record once
    if (!recorded) {
      recordExamResult({
        score,
        total,
        takenAt: Date.now(),
        questions: questions.map((q) => q.lessonId),
      });
      setRecorded(true);
    }
    setPhase("result");
  };

  const handleRetake = () => {
    setQuestions(buildExam());
    setAnswers(Array.from({ length: EXAM_LENGTH }, () => null));
    setIdx(0);
    setRevealed(false);
    setRecorded(false);
    setPhase("quiz");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  // -------- NAME PHASE --------
  if (phase === "name") {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-12" data-testid="exam-name-screen">
        <header className="mb-6">
          <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
            Coach Cam Final Exam
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            Before we start…
          </h1>
          <p className="text-muted-foreground mt-2">
            What name should go on your certificate? You can use letters, numbers, spaces, hyphens,
            periods, and apostrophes (up to {NAME_MAX} characters).
          </p>
        </header>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNameSubmit();
          }}
          className="space-y-3 rounded-xl border border-card-border bg-card p-4"
        >
          <label htmlFor="exam-name" className="block text-sm font-display font-semibold">
            Your name
          </label>
          <input
            id="exam-name"
            type="text"
            maxLength={NAME_MAX}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Ben Stoll"
            className="w-full rounded-md border border-card-border bg-background px-3 py-2 text-base"
            data-testid="input-student-name"
            autoFocus
          />
          {nameError && (
            <div className="text-sm text-destructive" data-testid="text-name-error">
              {nameError}
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" data-testid="button-start-exam">
              Start exam <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // -------- RESULT PHASE --------
  if (phase === "result") {
    const misses = questions
      .map((q, i) => ({ q, i, picked: answers[i] }))
      .filter((m) => m.picked === null || m.picked !== m.q.correct);

    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10" data-testid="exam-result">
        <header className="mb-6">
          <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
            Coach Cam Final Exam
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
            {passed ? "You passed! 🏆" : "Almost there."}
          </h1>
        </header>

        <div className="rounded-xl border border-card-border bg-card p-5 mb-6">
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-display font-semibold">
                Score
              </div>
              <div className="font-display text-4xl font-extrabold text-primary text-glow-green" data-testid="text-exam-score">
                {score}/{total}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-display font-semibold">
                Percentage
              </div>
              <div className="font-display text-3xl font-extrabold tabular" data-testid="text-exam-pct">
                {pct}%
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-display font-semibold">
                Result
              </div>
              <div
                className={`font-display text-2xl font-extrabold ${passed ? "text-primary" : "text-destructive"}`}
                data-testid="text-exam-passfail"
              >
                {passed ? "PASS" : "Keep working"}
              </div>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              {passed && (
                <Button onClick={handlePrint} data-testid="button-print-certificate">
                  <Printer className="size-4 mr-1" />
                  Print certificate
                </Button>
              )}
              <Button variant="outline" onClick={handleRetake} data-testid="button-retake-exam">
                <RotateCcw className="size-4 mr-1" />
                Take it again
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-3">
            Passing score is {PASS_PCT}%. Certificate name:{" "}
            <span className="font-display font-semibold text-foreground">
              {data.studentName ?? "—"}
            </span>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {misses.length === 0 ? "Perfect run — nothing to review!" : "Review your misses"}
          </h2>
          {misses.map((m) => {
            const pickedText = m.picked === null ? "(no answer)" : m.q.options[m.picked];
            const correctText = m.q.options[m.q.correct];
            return (
              <div
                key={m.i}
                className="rounded-xl border border-card-border bg-card p-4 space-y-2"
                data-testid={`miss-${m.i}`}
              >
                <div className="font-display font-semibold text-sm sm:text-base">
                  <span className="text-primary mr-2">{m.i + 1}.</span>
                  {m.q.q}
                </div>
                <div className="grid gap-1 text-sm">
                  <div className="flex items-start gap-2" data-testid={`miss-${m.i}-your`}>
                    <XCircle className="size-4 mt-0.5 text-destructive shrink-0" />
                    <span>
                      <span className="text-muted-foreground">Your answer: </span>
                      <span className="font-medium">{pickedText}</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2" data-testid={`miss-${m.i}-correct`}>
                    <CheckCircle2 className="size-4 mt-0.5 text-primary shrink-0" />
                    <span>
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="font-medium">{correctText}</span>
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm">
                  {m.q.explain}
                </div>
                <Link
                  href={`/lessons/${m.q.lessonId}`}
                  data-testid={`link-remediation-${m.i}`}
                  className="inline-flex items-center gap-1 text-sm font-display font-semibold text-primary hover:underline"
                >
                  Review lesson: {m.q.lessonTitle}
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            );
          })}
        </section>

        {passed && data.studentName && (
          <Certificate studentName={data.studentName} score={score} total={total} />
        )}
      </div>
    );
  }

  // -------- QUIZ PHASE --------
  const current = questions[idx];
  const picked = answers[idx];
  const isCorrect = revealed && picked !== null && picked === current.correct;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10" data-testid="exam-quiz">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
          <Award className="size-4 text-accent" />
          Coach Cam Final Exam
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
          Question {idx + 1} of {total}
        </h1>
        <div className="mt-3 h-2 w-full rounded-full bg-card border border-card-border overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${((idx + (revealed ? 1 : 0)) / total) * 100}%` }}
            aria-hidden
            data-testid="exam-progress-bar"
          />
        </div>
      </header>

      <div className="rounded-xl border border-card-border bg-card p-5 space-y-4" data-testid={`exam-question-${idx}`}>
        <div className="font-display font-semibold text-base sm:text-lg">{current.q}</div>

        <div className="grid gap-2">
          {current.options.map((opt, oi) => {
            const isPicked = picked === oi;
            const isAnswer = current.correct === oi;
            let style = "border-card-border bg-background hover:bg-accent/10";
            if (revealed && isAnswer) {
              style = "border-primary/70 bg-primary/15";
            } else if (revealed && isPicked && !isAnswer) {
              style = "border-destructive/60 bg-destructive/10";
            } else if (revealed) {
              style = "border-card-border bg-background opacity-60";
            } else if (isPicked) {
              style = "border-primary/70 bg-primary/10";
            }
            return (
              <button
                key={oi}
                type="button"
                onClick={() => handlePick(oi)}
                disabled={revealed}
                aria-pressed={isPicked}
                data-testid={`exam-option-${idx}-${oi}`}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-base font-medium ${style} ${transition} disabled:cursor-default`}
              >
                <span className="inline-flex size-7 items-center justify-center rounded-md border border-card-border bg-secondary/60 font-display font-bold text-sm shrink-0">
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && isAnswer && <CheckCircle2 className="size-5 text-primary" aria-label="Correct" />}
                {revealed && isPicked && !isAnswer && (
                  <XCircle className="size-5 text-destructive" aria-label="Incorrect" />
                )}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              isCorrect ? "border-primary/30 bg-primary/10" : "border-destructive/30 bg-destructive/10"
            }`}
            data-testid={`exam-explain-${idx}`}
          >
            <span className={`font-semibold ${isCorrect ? "text-primary" : "text-destructive"}`}>
              {isCorrect ? "Correct!" : "Not quite."}
            </span>{" "}
            {current.explain}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          {!revealed ? (
            <Button
              onClick={handleSubmit}
              disabled={picked === null}
              data-testid="button-exam-submit"
            >
              Submit
            </Button>
          ) : (
            <Button onClick={handleNext} data-testid="button-exam-next">
              {idx + 1 < total ? "Next" : "Finish"} <ArrowRight className="size-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Exam;
