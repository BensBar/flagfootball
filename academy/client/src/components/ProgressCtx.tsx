import { createContext, useContext, useState, type ReactNode } from "react";

type LessonState = {
  visited: boolean;
  score: number | null; // null = not taken
  total: number | null;
};

type Ctx = {
  progress: Record<string, LessonState>;
  markVisited: (id: string) => void;
  setScore: (id: string, score: number, total: number) => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children, lessonIds }: { children: ReactNode; lessonIds: string[] }) {
  const [progress, setProgress] = useState<Record<string, LessonState>>(() => {
    const o: Record<string, LessonState> = {};
    for (const id of lessonIds) o[id] = { visited: false, score: null, total: null };
    return o;
  });

  const markVisited = (id: string) =>
    setProgress((p) => ({ ...p, [id]: { ...(p[id] ?? { score: null, total: null }), visited: true } }));
  const setScore = (id: string, score: number, total: number) =>
    setProgress((p) => ({ ...p, [id]: { ...(p[id] ?? { visited: true }), visited: true, score, total } }));

  return (
    <ProgressContext.Provider value={{ progress, markVisited, setScore }}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
  return ctx;
}
