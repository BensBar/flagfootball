import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useProgressStore } from "@/lib/useProgressStore";

type LessonState = {
  visited: boolean;
  score: number | null;
  total: number | null;
};

type Ctx = {
  progress: Record<string, LessonState>;
  markVisited: (id: string) => void;
  setScore: (id: string, score: number, total: number) => void;
  resetAll: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children, lessonIds }: { children: ReactNode; lessonIds: string[] }) {
  const store = useProgressStore();

  const value = useMemo<Ctx>(() => {
    const progress: Record<string, LessonState> = {};
    for (const id of lessonIds) {
      const quiz = store.data.quizScores[id];
      progress[id] = {
        visited: Boolean(store.data.lessonsVisited[id]),
        score: quiz ? quiz.correct : null,
        total: quiz ? quiz.total : null,
      };
    }
    return {
      progress,
      markVisited: store.markLessonVisited,
      setScore: store.recordQuizScore,
      resetAll: store.resetAll,
    };
  }, [store, lessonIds]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
