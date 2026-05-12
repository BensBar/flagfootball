import { useEffect, useMemo, useRef, useState } from "react";
import type { Actor, Play } from "@/lib/playbook";

type FieldDiagramProps = {
  play: Play;
  step: number; // 0-based step index
  playing: boolean;
  onProgress?: (p: number) => void;
  reducedMotion?: boolean;
};

const FIELD_W = 100;
const FIELD_H = 60;

function pathPoints(points: [number, number][]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
}

function lengthOf(points: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    total += Math.hypot(dx, dy);
  }
  return total;
}

function pointAt(points: [number, number][], t: number): [number, number] {
  if (!points || points.length === 0) return [0, 0];
  if (points.length === 1) return points[0];
  const total = lengthOf(points);
  if (total === 0) return points[0];
  const target = total * Math.max(0, Math.min(1, t));
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const segLen = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    if (acc + segLen >= target) {
      const localT = (target - acc) / segLen;
      return [
        points[i - 1][0] + (points[i][0] - points[i - 1][0]) * localT,
        points[i - 1][1] + (points[i][1] - points[i - 1][1]) * localT,
      ];
    }
    acc += segLen;
  }
  return points[points.length - 1];
}

function ActorMark({
  actor,
  position,
  highlighted,
}: {
  actor: Actor;
  position: [number, number];
  highlighted?: boolean;
}) {
  const isOffense = actor.color !== "defense";
  const fill = isOffense ? "hsl(142 88% 50%)" : "hsl(48 100% 58%)";
  const stroke = isOffense ? "hsl(215 60% 8%)" : "hsl(215 60% 8%)";
  return (
    <g transform={`translate(${position[0]}, ${position[1]})`} className={highlighted ? "anim-glow" : ""}>
      <circle r="2.6" fill={fill} stroke={stroke} strokeWidth="0.5" />
      <text
        textAnchor="middle"
        dy="0.9"
        fontSize="2.4"
        fontWeight="800"
        fill={stroke}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {actor.label}
      </text>
    </g>
  );
}

export function FieldDiagram({ play, step, playing, onProgress, reducedMotion }: FieldDiagramProps) {
  const totalSteps = play.steps.length;
  const stepProgress = useMemo(() => {
    // each step is one slice of the 0..1 timeline
    return totalSteps > 0 ? (step + 1) / totalSteps : 1;
  }, [step, totalSteps]);

  const [animT, setAnimT] = useState(0);
  const targetRef = useRef(stepProgress);
  targetRef.current = stepProgress;
  const rafRef = useRef<number | null>(null);

  // Smoothly animate animT toward targetRef.current when playing
  useEffect(() => {
    if (reducedMotion) {
      setAnimT(stepProgress);
      return;
    }
    let running = true;
    const tick = () => {
      if (!running) return;
      setAnimT((prev) => {
        const target = targetRef.current;
        if (Math.abs(prev - target) < 0.001) return target;
        // ease toward target
        const speed = playing ? 0.018 : 0.04;
        return prev + (target - prev) * speed;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [stepProgress, playing, reducedMotion]);

  useEffect(() => {
    onProgress?.(animT);
  }, [animT, onProgress]);

  // Determine where ball/pass should be rendered
  const passFromActor = play.actors.find((a) => a.id === play.passFrom);
  const passToActor = play.actors.find((a) => a.id === play.passTo);
  const showPass = play.passFrom && play.passTo && play.passReleaseAt != null && play.catchAt != null;
  let ballPos: [number, number] = passFromActor ? passFromActor.start : play.actors[0].start;

  // Ball logic: before pass release, ball is with QB (or carrier). During pass flight, interpolate.
  if (showPass && passFromActor && passToActor) {
    const release = play.passReleaseAt!;
    const catchAt = play.catchAt!;
    if (animT < release) {
      const qbPath = passFromActor.path ?? [passFromActor.start];
      ballPos = pointAt(qbPath, animT / Math.max(release, 0.001));
    } else if (animT < catchAt) {
      const releasePoint = pointAt(passFromActor.path ?? [passFromActor.start], 1);
      const catchPoint = pointAt(passToActor.path ?? [passToActor.start], catchAt);
      const local = (animT - release) / Math.max(catchAt - release, 0.001);
      ballPos = [
        releasePoint[0] + (catchPoint[0] - releasePoint[0]) * local,
        releasePoint[1] + (catchPoint[1] - releasePoint[1]) * local,
      ];
    } else {
      const carrier = play.actors.find((a) => a.id === play.ballCarrierAtEnd) ?? passToActor;
      ballPos = pointAt(carrier.path ?? [carrier.start], 1);
    }
  } else {
    const carrier = play.actors.find((a) => a.id === play.ballCarrierAtEnd) ?? play.actors[0];
    ballPos = pointAt(carrier.path ?? [carrier.start], animT);
  }

  const currentStep = play.steps[step];
  const highlighted = new Set(currentStep?.highlightActors ?? []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-card-border bg-[hsl(215,55%,9%)] shadow-lg">
      <svg
        viewBox={`-2 -2 ${FIELD_W + 4} ${FIELD_H + 4}`}
        className="block w-full"
        role="img"
        aria-label={`Play diagram for ${play.name}, step ${step + 1} of ${totalSteps}`}
        data-testid={`field-diagram-${play.id}`}
      >
        <defs>
          <pattern id="turf-mow" width="4" height={FIELD_H} patternUnits="userSpaceOnUse">
            <rect width="2" height={FIELD_H} fill="hsl(142 45% 14%)" />
            <rect x="2" width="2" height={FIELD_H} fill="hsl(142 42% 17%)" />
          </pattern>
          <radialGradient id="stadium-glow" cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor="hsl(142 90% 60% / 0.18)" />
            <stop offset="100%" stopColor="hsl(142 90% 60% / 0)" />
          </radialGradient>
        </defs>

        {/* Turf */}
        <rect x="0" y="0" width={FIELD_W} height={FIELD_H} fill="url(#turf-mow)" />
        <rect x="0" y="0" width={FIELD_W} height={FIELD_H} fill="url(#stadium-glow)" />

        {/* End zones */}
        <rect x="0" y="0" width="8" height={FIELD_H} fill="hsl(215 60% 8%)" opacity="0.55" />
        <rect x={FIELD_W - 8} y="0" width="8" height={FIELD_H} fill="hsl(215 60% 8%)" opacity="0.55" />

        {/* Yard lines every 10 yards (10..90) */}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((x) => (
          <line
            key={x}
            x1={x}
            y1="0"
            x2={x}
            y2={FIELD_H}
            stroke="hsl(0 0% 100% / 0.18)"
            strokeWidth={x === 50 ? 0.4 : 0.2}
          />
        ))}
        {/* Sidelines */}
        <rect
          x="0"
          y="0"
          width={FIELD_W}
          height={FIELD_H}
          fill="none"
          stroke="hsl(0 0% 100% / 0.35)"
          strokeWidth="0.4"
        />

        {/* Yard numbers */}
        {[20, 30, 40, 50, 60, 70, 80].map((x) => (
          <text
            key={`n-${x}`}
            x={x}
            y={FIELD_H - 2}
            textAnchor="middle"
            fontSize="2"
            fill="hsl(0 0% 100% / 0.22)"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            {x === 50 ? 50 : x > 50 ? 100 - x : x}
          </text>
        ))}

        {/* Line of scrimmage marker */}
        <line
          x1={30}
          y1="0"
          x2={30}
          y2={FIELD_H}
          stroke="hsl(48 100% 58%)"
          strokeWidth="0.3"
          strokeDasharray="0.6 0.6"
          opacity="0.7"
        />

        {/* Defender pursuit paths — subtle traces so the matchup reads visually */}
        {play.actors
          .filter((a) => a.color === "defense" && a.path && a.path.length > 1)
          .map((a) => (
            <g key={`dp-${a.id}`}>
              <path
                d={pathPoints(a.path!)}
                fill="none"
                stroke="hsl(48 100% 58% / 0.28)"
                strokeWidth="0.5"
                strokeDasharray="0.8 1.2"
                strokeLinecap="round"
              />
            </g>
          ))}

        {/* Offense route paths */}
        {play.actors
          .filter((a) => a.color !== "defense" && a.path && a.path.length > 1)
          .map((a) => {
            const total = lengthOf(a.path!);
            return (
              <g key={`p-${a.id}`}>
                {/* full route shadow */}
                <path
                  d={pathPoints(a.path!)}
                  fill="none"
                  stroke="hsl(142 88% 50% / 0.25)"
                  strokeWidth="0.6"
                  strokeDasharray="1 1"
                />
                {/* animated drawn portion */}
                <path
                  d={pathPoints(a.path!)}
                  fill="none"
                  stroke="hsl(142 88% 55%)"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeDasharray={total}
                  strokeDashoffset={total * (1 - animT)}
                  style={{ filter: "drop-shadow(0 0 1px hsl(142 88% 50% / 0.8))" }}
                />
                {/* arrow head at end */}
                {animT > 0.95 && (
                  <circle
                    cx={a.path![a.path!.length - 1][0]}
                    cy={a.path![a.path!.length - 1][1]}
                    r="0.9"
                    fill="hsl(142 88% 60%)"
                  />
                )}
              </g>
            );
          })}

        {/* Actors */}
        {play.actors.map((a) => {
          const path = a.path && a.path.length > 1 ? a.path : null;
          const pos = path ? pointAt(path, animT) : a.start;
          return <ActorMark key={a.id} actor={a} position={pos} highlighted={highlighted.has(a.id)} />;
        })}

        {/* Ball */}
        <g transform={`translate(${ballPos[0]}, ${ballPos[1]})`}>
          <ellipse rx="1.4" ry="0.85" fill="hsl(22 92% 58%)" stroke="hsl(0 0% 100%)" strokeWidth="0.15" />
          <path d="M -0.7 0 H 0.7 M -0.2 -0.3 V 0.3 M 0.2 -0.3 V 0.3" stroke="hsl(0 0% 100%)" strokeWidth="0.15" />
        </g>

        {/* Step badge */}
        <g transform={`translate(2, 4)`}>
          <rect
            x="0"
            y="0"
            rx="1"
            ry="1"
            width="20"
            height="5"
            fill="hsl(215 60% 8% / 0.85)"
            stroke="hsl(142 88% 50%)"
            strokeWidth="0.2"
          />
          <text
            x="10"
            y="3.6"
            textAnchor="middle"
            fontSize="2.4"
            fontWeight="800"
            fill="hsl(142 88% 55%)"
            style={{ fontFamily: "var(--font-display)" }}
          >
            STEP {step + 1} / {totalSteps}
          </text>
        </g>
      </svg>
    </div>
  );
}
