import { useSyncExternalStore } from "react";

const DEFAULT_STORAGE_KEY = "flagfootball-academy:progress:v1";

// Storage key can be overridden via Vite env (e.g., for test/dev isolation).
// Falls back to the default in non-Vite environments (SSR, tests without import.meta.env).
export const PROGRESS_STORAGE_KEY: string = (() => {
  try {
    const envKey = (import.meta as unknown as { env?: Record<string, string | undefined> }).env
      ?.VITE_PROGRESS_STORAGE_KEY;
    if (typeof envKey === "string" && envKey.length > 0) return envKey;
  } catch {
    // import.meta not available — use default.
  }
  return DEFAULT_STORAGE_KEY;
})();

const SCHEMA_VERSION = 1 as const;

export type LessonCompletion = { completedAt: number };
export type QuizScore = { correct: number; total: number; takenAt: number };
export type ExamResult = { score: number; total: number; takenAt: number; questions: string[] };

export type ProgressData = {
  version: typeof SCHEMA_VERSION;
  studentName?: string;
  lessonsVisited: Record<string, { visitedAt: number }>;
  lessonsCompleted: Record<string, LessonCompletion>;
  quizScores: Record<string, QuizScore>;
  gameDayChecks: Record<string, boolean>;
  examHistory: ExamResult[];
};

function emptyData(): ProgressData {
  return {
    version: SCHEMA_VERSION,
    lessonsVisited: {},
    lessonsCompleted: {},
    quizScores: {},
    gameDayChecks: {},
    examHistory: [],
  };
}

function safeRead(): ProgressData {
  try {
    if (typeof window === "undefined" || !window.localStorage) return emptyData();
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as Partial<ProgressData> | null;
    if (!parsed || parsed.version !== SCHEMA_VERSION) {
      try {
        window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
      } catch {
        // ignore
      }
      return emptyData();
    }
    return {
      ...emptyData(),
      ...parsed,
      version: SCHEMA_VERSION,
      lessonsVisited: parsed.lessonsVisited ?? {},
      lessonsCompleted: parsed.lessonsCompleted ?? {},
      quizScores: parsed.quizScores ?? {},
      gameDayChecks: parsed.gameDayChecks ?? {},
      examHistory: parsed.examHistory ?? [],
    };
  } catch {
    return emptyData();
  }
}

function safeWrite(data: ProgressData): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // SSR, privacy mode, or quota exceeded — silently ignore.
  }
}

type Listener = () => void;

let currentData: ProgressData | null = null;
const listeners = new Set<Listener>();

function getSnapshot(): ProgressData {
  if (currentData === null) currentData = safeRead();
  return currentData;
}

function getServerSnapshot(): ProgressData {
  return emptyData();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setData(updater: (prev: ProgressData) => ProgressData): void {
  const prev = getSnapshot();
  const next = updater(prev);
  if (next === prev) return;
  currentData = next;
  safeWrite(next);
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  try {
    window.addEventListener("storage", (e) => {
      if (e.key !== PROGRESS_STORAGE_KEY) return;
      currentData = safeRead();
      listeners.forEach((l) => l());
    });
  } catch {
    // ignore
  }
}

export type ProgressStoreApi = {
  data: ProgressData;
  setStudentName: (name: string) => void;
  markLessonVisited: (lessonId: string) => void;
  markLessonComplete: (lessonId: string) => void;
  recordQuizScore: (lessonId: string, correct: number, total: number) => void;
  toggleGameDayCheck: (key: string, value?: boolean) => void;
  recordExamResult: (result: Omit<ExamResult, "takenAt"> & { takenAt?: number }) => void;
  resetAll: () => void;
};

export function useProgressStore(): ProgressStoreApi {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    data,
    setStudentName: (name) => setData((prev) => ({ ...prev, studentName: name })),
    markLessonVisited: (lessonId) =>
      setData((prev) =>
        prev.lessonsVisited[lessonId]
          ? prev
          : { ...prev, lessonsVisited: { ...prev.lessonsVisited, [lessonId]: { visitedAt: Date.now() } } },
      ),
    markLessonComplete: (lessonId) =>
      setData((prev) => ({
        ...prev,
        lessonsVisited: prev.lessonsVisited[lessonId]
          ? prev.lessonsVisited
          : { ...prev.lessonsVisited, [lessonId]: { visitedAt: Date.now() } },
        lessonsCompleted: { ...prev.lessonsCompleted, [lessonId]: { completedAt: Date.now() } },
      })),
    recordQuizScore: (lessonId, correct, total) =>
      setData((prev) => ({
        ...prev,
        lessonsVisited: prev.lessonsVisited[lessonId]
          ? prev.lessonsVisited
          : { ...prev.lessonsVisited, [lessonId]: { visitedAt: Date.now() } },
        quizScores: { ...prev.quizScores, [lessonId]: { correct, total, takenAt: Date.now() } },
      })),
    toggleGameDayCheck: (key, value) =>
      setData((prev) => ({
        ...prev,
        gameDayChecks: { ...prev.gameDayChecks, [key]: value ?? !prev.gameDayChecks[key] },
      })),
    recordExamResult: (result) =>
      setData((prev) => ({
        ...prev,
        examHistory: [...prev.examHistory, { ...result, takenAt: result.takenAt ?? Date.now() }],
      })),
    resetAll: () => setData(() => emptyData()),
  };
}
