import type { RoutePattern } from "@/lib/playbook";

type Props = {
  route: RoutePattern;
  className?: string;
};

function pathOf(points: [number, number][]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
}
function totalLen(points: [number, number][]): number {
  let t = 0;
  for (let i = 1; i < points.length; i++) {
    t += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  }
  return t;
}

export function RouteDiagram({ route, className = "" }: Props) {
  const total = totalLen(route.path);
  const end = route.path[route.path.length - 1];
  return (
    <svg
      viewBox="0 0 30 60"
      className={`block w-full ${className}`}
      role="img"
      aria-label={`${route.name} route diagram`}
      data-testid={`route-diagram-${route.id}`}
    >
      {/* turf */}
      <rect x="0" y="0" width="30" height="60" fill="hsl(215 55% 9%)" />
      {[10, 20, 30, 40, 50].map((y) => (
        <line key={y} x1="0" y1={y} x2="30" y2={y} stroke="hsl(0 0% 100% / 0.08)" strokeWidth="0.15" />
      ))}
      {/* LOS */}
      <line x1="0" y1="50" x2="30" y2="50" stroke="hsl(48 100% 58%)" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
      {/* route */}
      <path
        d={pathOf(route.path)}
        fill="none"
        stroke="hsl(142 88% 50% / 0.3)"
        strokeWidth="0.6"
        strokeDasharray="1 1"
      />
      <path
        d={pathOf(route.path)}
        fill="none"
        stroke="hsl(142 88% 55%)"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeDasharray="3 2"
        style={{
          strokeDashoffset: 0,
          animation: "dashmove 1.6s linear infinite",
          filter: "drop-shadow(0 0 1px hsl(142 88% 50% / 0.8))",
        }}
      />
      {/* receiver start */}
      <circle cx={route.path[0][0]} cy={route.path[0][1]} r="1.6" fill="hsl(142 88% 50%)" stroke="hsl(215 60% 8%)" strokeWidth="0.3" />
      <text
        x={route.path[0][0]}
        y={route.path[0][1] + 0.7}
        textAnchor="middle"
        fontSize="1.6"
        fontWeight="800"
        fill="hsl(215 60% 8%)"
        style={{ fontFamily: "var(--font-display)" }}
      >
        WR
      </text>
      {/* arrow head */}
      <circle cx={end[0]} cy={end[1]} r="0.9" fill="hsl(142 88% 60%)" />
      {/* label */}
      <text
        x="2"
        y="6"
        fontSize="3.2"
        fontWeight="800"
        fill="hsl(142 88% 60%)"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {route.name.toUpperCase()}
      </text>
    </svg>
  );
}
