// Animated play / route diagrams. SVG coords are in a 100x60 viewBox
// where x: 0 (own goal line) to 100 (opponent end zone), y: 0 (top sideline) to 60 (bottom sideline).
// Each "actor" has a starting position, a path (array of points), and a role.

export type Actor = {
  id: string;
  label: string; // short label drawn in the helmet circle
  role: "QB" | "C" | "WR" | "RB" | "DEF";
  color?: "offense" | "defense";
  start: [number, number];
  path?: [number, number][]; // points the actor moves through over the play's duration
};

export type PlayStep = {
  title: string;
  description: string;
  // 0..1 progress along each actor's path that should be highlighted at this step
  highlightActors?: string[];
};

export type Play = {
  id: string;
  name: string;
  category: "Pass Play" | "Route" | "Run Play";
  difficulty: "Beginner" | "Intermediate";
  summary: string;
  ballCarrierAtEnd: string; // actor id who has the ball at the end
  passFrom?: string; // actor id who throws (if any)
  passTo?: string; // actor id who catches (if any)
  passReleaseAt?: number; // 0..1 timeline progress when QB releases ball
  catchAt?: number; // 0..1 when catch happens
  actors: Actor[];
  steps: PlayStep[];
};

// Field layout helpers — line of scrimmage at x=30
const LOS = 30;
const Y_MID = 30;

export const PLAYS: Play[] = [
  {
    id: "slant-flat",
    name: "Slant & Flat",
    category: "Pass Play",
    difficulty: "Beginner",
    summary:
      "Two receivers cross paths — one slants over the middle while a running back leaks into the flat. One read for the QB.",
    ballCarrierAtEnd: "wr1",
    passFrom: "qb",
    passTo: "wr1",
    passReleaseAt: 0.55,
    catchAt: 0.75,
    actors: [
      { id: "c", label: "C", role: "C", color: "offense", start: [LOS, Y_MID] },
      { id: "qb", label: "QB", role: "QB", color: "offense", start: [LOS - 6, Y_MID] },
      {
        id: "wr1",
        label: "X",
        role: "WR",
        color: "offense",
        start: [LOS, 10],
        // 3-step then 45° slant toward middle
        path: [
          [LOS, 10],
          [LOS + 6, 10],
          [LOS + 18, 22],
          [LOS + 28, 30],
        ],
      },
      {
        id: "rb",
        label: "RB",
        role: "RB",
        color: "offense",
        start: [LOS - 4, Y_MID + 8],
        path: [
          [LOS - 4, Y_MID + 8],
          [LOS, 46],
          [LOS + 8, 50],
        ],
      },
      {
        id: "wr2",
        label: "Z",
        role: "WR",
        color: "offense",
        start: [LOS, 50],
        path: [
          [LOS, 50],
          [LOS + 14, 50],
          [LOS + 22, 50],
        ],
      },
      // Defenders (simple zone)
      { id: "d1", label: "CB", role: "DEF", color: "defense", start: [LOS + 6, 12] },
      { id: "d2", label: "LB", role: "DEF", color: "defense", start: [LOS + 8, Y_MID] },
      { id: "d3", label: "CB", role: "DEF", color: "defense", start: [LOS + 6, 48] },
    ],
    steps: [
      {
        title: "1. Pre-snap",
        description:
          "Two receivers split wide. The running back lines up next to the QB. Check the defense — if the cornerback over X is sitting deep, the slant is hot.",
        highlightActors: ["wr1", "rb"],
      },
      {
        title: "2. Snap",
        description:
          "The center snaps the ball. The QB takes a quick drop. X explodes off the line. The RB shows pass-block, then releases.",
        highlightActors: ["qb", "c"],
      },
      {
        title: "3. Routes break",
        description:
          "X takes three quick steps, plants the outside foot, and slants at 45° toward the middle. The RB drifts to the flat — wide open if the linebacker stays inside.",
        highlightActors: ["wr1", "rb"],
      },
      {
        title: "4. Throw & catch",
        description:
          "The QB throws to the slant in stride. Catch with thumbs together, tuck the ball, and run upfield. If the slant is covered, dump it to the RB in the flat.",
        highlightActors: ["qb", "wr1"],
      },
    ],
  },

  {
    id: "smash",
    name: "Smash Concept",
    category: "Pass Play",
    difficulty: "Intermediate",
    summary:
      "Receiver runs a short curl underneath while another receiver runs a corner route on top. The QB reads the deep defender.",
    ballCarrierAtEnd: "wr2",
    passFrom: "qb",
    passTo: "wr2",
    passReleaseAt: 0.6,
    catchAt: 0.8,
    actors: [
      { id: "c", label: "C", role: "C", color: "offense", start: [LOS, Y_MID] },
      { id: "qb", label: "QB", role: "QB", color: "offense", start: [LOS - 6, Y_MID] },
      {
        id: "wr1",
        label: "X",
        role: "WR",
        color: "offense",
        start: [LOS, 12],
        path: [
          [LOS, 12],
          [LOS + 10, 12],
          [LOS + 10, 14],
          [LOS + 8, 14],
        ],
      },
      {
        id: "wr2",
        label: "Z",
        role: "WR",
        color: "offense",
        start: [LOS, 20],
        path: [
          [LOS, 20],
          [LOS + 14, 20],
          [LOS + 26, 8],
          [LOS + 36, 4],
        ],
      },
      { id: "rb", label: "RB", role: "RB", color: "offense", start: [LOS - 4, Y_MID + 6] },
      { id: "d1", label: "CB", role: "DEF", color: "defense", start: [LOS + 8, 14] },
      { id: "d2", label: "S", role: "DEF", color: "defense", start: [LOS + 18, 18] },
      { id: "d3", label: "CB", role: "DEF", color: "defense", start: [LOS + 8, 48] },
    ],
    steps: [
      {
        title: "1. Setup",
        description:
          "Two receivers stack on the same side. Z lines up just inside X. Defenders show a single deep safety.",
      },
      {
        title: "2. Snap",
        description:
          "X runs a 5-yard curl, turning back to the QB. Z fires straight at the cornerback, then breaks toward the corner.",
        highlightActors: ["wr1", "wr2"],
      },
      {
        title: "3. Read the safety",
        description:
          "QB looks at the deep safety. If the safety jumps the corner route, throw the curl. If the safety stays middle, throw the corner.",
        highlightActors: ["qb"],
      },
      {
        title: "4. Deliver",
        description:
          "Throw with touch on the corner route — high and toward the sideline so only Z can catch it. On the curl, throw firm and on the chest.",
        highlightActors: ["wr2"],
      },
    ],
  },

  {
    id: "qb-sweep-handoff",
    name: "Sweep Handoff",
    category: "Run Play",
    difficulty: "Beginner",
    summary:
      "Quick handoff to the running back who runs to the sideline behind a receiver block. Great for short-yardage situations.",
    ballCarrierAtEnd: "rb",
    actors: [
      { id: "c", label: "C", role: "C", color: "offense", start: [LOS, Y_MID] },
      { id: "qb", label: "QB", role: "QB", color: "offense", start: [LOS - 5, Y_MID], path: [
        [LOS - 5, Y_MID],
        [LOS - 4, Y_MID + 4],
        [LOS - 3, Y_MID + 8],
      ]},
      {
        id: "rb",
        label: "RB",
        role: "RB",
        color: "offense",
        start: [LOS - 4, Y_MID + 8],
        path: [
          [LOS - 4, Y_MID + 8],
          [LOS, 44],
          [LOS + 8, 48],
          [LOS + 20, 50],
        ],
      },
      {
        id: "wr1",
        label: "X",
        role: "WR",
        color: "offense",
        start: [LOS, 50],
        path: [
          [LOS, 50],
          [LOS + 4, 50],
          [LOS + 4, 50],
        ],
      },
      { id: "wr2", label: "Z", role: "WR", color: "offense", start: [LOS, 10] },
      { id: "d1", label: "LB", role: "DEF", color: "defense", start: [LOS + 8, Y_MID] },
      { id: "d2", label: "CB", role: "DEF", color: "defense", start: [LOS + 6, 50] },
    ],
    steps: [
      {
        title: "1. Setup",
        description:
          "RB lines up beside the QB. X is split wide on the same side. The QB calls the cadence.",
      },
      {
        title: "2. Snap & pivot",
        description:
          "QB catches the snap, pivots, and meets the RB stride for stride to hand the ball off.",
        highlightActors: ["qb", "rb"],
      },
      {
        title: "3. Get the edge",
        description:
          "RB takes the ball, gets to the sideline FAST, and looks for the alley behind X.",
        highlightActors: ["rb"],
      },
      {
        title: "4. Up the sideline",
        description:
          "Once around the corner, turn upfield. Keep your flags clear, take what the defense gives you, and step out of bounds if you cannot beat them.",
        highlightActors: ["rb"],
      },
    ],
  },
];

// 5 must-know routes for the route lab
export type RoutePattern = {
  id: string;
  name: string;
  shortDescription: string;
  path: [number, number][]; // viewBox 60x60, receiver starts at (10, 50) going up
  cutAt?: number; // 0..1 marker for the cut point
};

export const ROUTES: RoutePattern[] = [
  {
    id: "slant",
    name: "Slant",
    shortDescription: "3 steps up, cut 45° to the middle.",
    path: [[10, 50], [10, 40], [25, 25]],
    cutAt: 0.45,
  },
  {
    id: "out",
    name: "Out",
    shortDescription: "5 steps up, cut hard to the sideline.",
    path: [[10, 50], [10, 28], [2, 28]],
    cutAt: 0.7,
  },
  {
    id: "curl",
    name: "Curl",
    shortDescription: "Sprint, turn back to the QB.",
    path: [[10, 50], [10, 22], [12, 28]],
    cutAt: 0.75,
  },
  {
    id: "post",
    name: "Post",
    shortDescription: "Sprint, cut diagonally toward the goalposts.",
    path: [[10, 50], [10, 22], [28, 6]],
    cutAt: 0.55,
  },
  {
    id: "go",
    name: "Go",
    shortDescription: "Straight downfield. No cut. All speed.",
    path: [[10, 50], [10, 5]],
  },
];
