import { useCallback, useEffect, useState } from "react";

// Minimal type for the `beforeinstallprompt` event (not in lib.dom yet).
type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
};

/**
 * Captures the `beforeinstallprompt` event so the app can offer an "Install"
 * button at a moment of its choosing. Browsers only fire this event once per
 * session and only when install criteria are met (PWA manifest + service
 * worker + not already installed).
 *
 * SSR-safe: returns `canInstall: false` when `window` is undefined.
 */
export function usePWAInstall(): {
  canInstall: boolean;
  promptInstall: () => Promise<void>;
} {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null);
    }
  }, [deferred]);

  return { canInstall: deferred !== null, promptInstall };
}
