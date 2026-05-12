import { Link, useParams } from "wouter";
import { useEffect, useMemo } from "react";
import { ArrowLeft, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { LESSONS } from "@/lib/content";
import { lessonFullScript, lessonSectionScript } from "@/lib/narrationScripts";
import { Button } from "@/components/ui/button";
import { useCoachAudio } from "@/lib/useCoachAudio";
import { NarrationBar } from "@/components/NarrationBar";
import { CaptionedTranscript } from "@/components/CaptionedTranscript";
import { Quiz } from "@/components/Quiz";
import { useProgress } from "@/components/ProgressCtx";

export function LessonsIndex() {
  const { progress } = useProgress();
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <header className="mb-8">
        <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
          The Curriculum
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">All Lessons</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Go in order or jump to what you need. Each lesson has a quick voice-narrated read-through and a short checkpoint.
        </p>
      </header>

      <ol className="space-y-3" data-testid="lesson-list">
        {LESSONS.map((l, i) => {
          const p = progress[l.id];
          const taken = p?.score !== null && p?.score !== undefined;
          return (
            <li key={l.id}>
              <Link
                href={`/lessons/${l.id}`}
                data-testid={`link-lesson-${l.id}`}
                className="block rounded-xl border border-card-border bg-card p-4 hover-elevate active-elevate-2"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary font-display text-lg font-extrabold">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-display font-bold text-base sm:text-lg truncate">
                        {l.emoji} {l.title}
                      </div>
                      {taken && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-display font-semibold text-primary">
                          <CheckCircle2 className="size-3" />
                          {p.score}/{p.total}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{l.subtitle}</div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock className="size-3.5" />
                    {l.durationMin} min
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LessonPage() {
  const params = useParams();
  const id = params.id as string;
  const idx = LESSONS.findIndex((l) => l.id === id);
  const lesson = LESSONS[idx];
  const audio = useCoachAudio();
  const { markVisited, setScore } = useProgress();

  useEffect(() => {
    if (lesson) markVisited(lesson.id);
    // Stop any current narration when navigating
    return () => audio.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const fullScript = useMemo(
    () => (lesson ? lessonFullScript(lesson) : ""),
    [lesson]
  );

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Lesson not found</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/lessons">Back to lessons</Link>
        </Button>
      </div>
    );
  }

  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        <Link href="/lessons" className="hover:text-foreground" data-testid="breadcrumb-lessons">
          Lessons
        </Link>
        <span className="mx-2">/</span>
        Module {idx + 1}
      </div>

      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight" data-testid="lesson-title">
          {lesson.emoji} {lesson.title}
        </h1>
        <p className="text-muted-foreground mt-2">{lesson.subtitle}</p>
        <div className="mt-3 flex items-center gap-3 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="size-3.5" /> {lesson.durationMin} min read · narrated
        </div>
      </header>

      <div className="mb-6">
        <NarrationBar
          audio={audio}
          id={`lesson:${lesson.id}:full`}
          text={fullScript}
          label="Listen to this lesson"
        />
      </div>

      <article className="space-y-6">
        {lesson.sections.map((s, i) => (
          <section
            key={i}
            className="rounded-xl border border-card-border bg-card p-5 shadow-sm"
            data-testid={`section-${lesson.id}-${i}`}
          >
            <div className="flex items-start gap-3">
              <div className="font-display text-primary font-extrabold text-xl tabular w-8 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold text-lg sm:text-xl tracking-tight">{s.heading}</h2>
                <CaptionedTranscript
                  text={lessonSectionScript(s)}
                  audio={audio}
                  className="mt-2 leading-relaxed text-foreground/90"
                />
                {s.bullets && (
                  <ul className="mt-3 space-y-1.5">
                    {s.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() =>
                    audio.play({
                      id: `lesson:${lesson.id}:section:${s.id}`,
                      text: lessonSectionScript(s),
                    })
                  }
                  className="mt-3 text-xs font-display font-semibold uppercase tracking-wider text-primary hover:underline disabled:opacity-50"
                  data-testid={`button-narrate-section-${lesson.id}-${i}`}
                  disabled={!audio.hasAudio && !audio.speechSupported}
                >
                  Read this section aloud →
                </button>
              </div>
            </div>
          </section>
        ))}
      </article>

      <div className="mt-10 rounded-xl border border-card-border bg-card p-5 shadow-sm">
        <Quiz
          lessonId={lesson.id}
          questions={lesson.quiz}
          onComplete={(s, t) => setScore(lesson.id, s, t)}
        />
      </div>

      <nav className="mt-10 flex items-center justify-between gap-3" aria-label="Lesson navigation">
        {prev ? (
          <Button asChild variant="outline" data-testid="button-prev-lesson">
            <Link href={`/lessons/${prev.id}`}>
              <ArrowLeft className="size-4 mr-1" />
              <span className="hidden sm:inline">Previous: </span>
              {prev.title}
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild data-testid="button-next-lesson">
            <Link href={`/lessons/${next.id}`}>
              <span className="hidden sm:inline">Next: </span>
              {next.title}
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        ) : (
          <Button asChild data-testid="button-finish-lessons">
            <Link href="/progress">
              Finish — see progress <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
