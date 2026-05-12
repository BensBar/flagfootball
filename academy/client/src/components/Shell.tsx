import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Sparkles, ListChecks, Flag, Map, BookOpen, Megaphone, Award } from "lucide-react";
import { Logo } from "./Logo";
import { LESSONS } from "@/lib/content";
import { useProgress } from "./ProgressCtx";

const NAV = [
  { href: "/", label: "Home", icon: Sparkles, testid: "nav-home" },
  { href: "/playbook", label: "Playbook", icon: Flag, testid: "nav-playbook" },
  { href: "/routes", label: "Route Lab", icon: Map, testid: "nav-routes" },
  { href: "/lessons", label: "Lessons", icon: BookOpen, testid: "nav-lessons" },
  { href: "/gameday", label: "Game Day", icon: Megaphone, testid: "nav-gameday" },
  { href: "/progress", label: "Progress", icon: ListChecks, testid: "nav-progress" },
  { href: "/exam", label: "Final Exam", icon: Award, testid: "nav-exam" },
];

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { progress } = useProgress();

  const completed = Object.values(progress).filter((p) => p.score !== null).length;
  const total = LESSONS.length;

  const isActive = (href: string) => {
    if (href === "/") return location === "/" || location === "";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Stadium-light top stripe */}
      <div className="h-1.5 w-full stripe-yellow" aria-hidden />

      <header className="sticky top-0 z-40 border-b border-card-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center" data-testid="link-home-brand">
            <Logo withWordmark size={32} />
          </Link>

          <nav className="ml-6 hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV.map(({ href, label, icon: Icon, testid }) => (
              <Link
                key={href}
                href={href}
                data-testid={testid}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-card-border bg-card px-3 py-1 text-xs font-display font-semibold">
              <span className="size-2 rounded-full bg-primary animate-pulse" aria-hidden />
              <span className="tabular text-muted-foreground">PROGRESS</span>
              <span className="tabular text-primary text-glow-green">
                {completed}/{total}
              </span>
            </div>
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden inline-flex size-9 items-center justify-center rounded-md border border-card-border bg-card"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              data-testid="button-menu-toggle"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-card-border bg-card/95 backdrop-blur">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 gap-1" aria-label="Mobile">
              {NAV.map(({ href, label, icon: Icon, testid }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  data-testid={`mobile-${testid}`}
                  className={`inline-flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive(href)
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-16 border-t border-card-border bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div className="text-xs text-muted-foreground">
              <div className="font-display font-semibold tracking-wider uppercase">Flag Football Academy</div>
              <div>An interactive playbook for 8th-grade ballers.</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Built for Ben Stoll · Play hard, play smart, have fun.</div>
        </div>
      </footer>
    </div>
  );
}
