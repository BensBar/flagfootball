import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Shell } from "@/components/Shell";
import { ProgressProvider } from "@/components/ProgressCtx";
import { ReducedMotionProvider } from "@/components/ReducedMotionCtx";
import { LESSONS } from "@/lib/content";

import { Home } from "@/pages/Home";
import { LessonsIndex, LessonPage } from "@/pages/Lessons";
import { Playbook } from "@/pages/Playbook";
import { RoutesPage } from "@/pages/Routes";
import { GameDay } from "@/pages/GameDay";
import { ProgressPage } from "@/pages/Progress";
import { Exam } from "@/pages/Exam";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/playbook" component={Playbook} />
      <Route path="/routes" component={RoutesPage} />
      <Route path="/lessons" component={LessonsIndex} />
      <Route path="/lessons/:id" component={LessonPage} />
      <Route path="/gameday" component={GameDay} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/exam" component={Exam} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ReducedMotionProvider>
          <ProgressProvider lessonIds={LESSONS.map((l) => l.id)}>
            <Toaster />
            <Router hook={useHashLocation}>
              <Shell>
                <AppRouter />
              </Shell>
            </Router>
          </ProgressProvider>
        </ReducedMotionProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
