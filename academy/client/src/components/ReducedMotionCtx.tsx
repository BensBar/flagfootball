import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const Ctx = createContext<boolean>(false);

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return <Ctx.Provider value={reduced}>{children}</Ctx.Provider>;
}

export function useReducedMotion() {
  return useContext(Ctx);
}
