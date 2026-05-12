// All lesson content for Flag Football Academy
// Designed for 8th graders: clear, encouraging, age-appropriate.

export type QuizQuestion = {
  q: string;
  options: string[];
  correct: number; // index
  explain: string;
};

export type LessonSection = {
  id: string; // stable kebab-case id, unique within a lesson
  heading: string;
  body: string; // plain text (paragraph). Also used as narration source.
  bullets?: string[];
};

export type Lesson = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  durationMin: number;
  sections: LessonSection[];
  quiz: QuizQuestion[];
};

export const LESSONS: Lesson[] = [
  {
    id: "basics",
    emoji: "🏈",
    title: "Flag Football Basics",
    subtitle: "What the game is and how a play works",
    durationMin: 4,
    sections: [
      {
        id: "what-is-flag-football",
        heading: "What is flag football?",
        body: "Flag football is a version of American football where instead of tackling, a defender pulls a flag from a belt around the ball carrier's waist. It is fast, safe, and built around throwing, catching, and running smart routes. Most middle-school games are 5-on-5 or 7-on-7 on a shorter field.",
      },
      {
        id: "how-a-play-happens",
        heading: "How a play happens",
        body: "Each team gets four downs to either score or reach the next first-down line. The play starts with a snap from the center to the quarterback. The offense tries to move the ball forward by passing or handing it off. The play ends when a flag is pulled, the ball carrier steps out of bounds, the ball hits the ground, or a touchdown is scored.",
        bullets: [
          "A snap starts every play.",
          "Most flag rules do not allow running by the quarterback (check your league).",
          "No tackling, no diving, no stiff-arms.",
          "Touchdown is worth 6 points. Extra-point try is 1 point (from the 5) or 2 points (from the 10).",
        ],
      },
      {
        id: "what-you-need",
        heading: "What you need",
        body: "You need a flag belt with two flags, athletic shoes (cleats if your field allows), and water. Mouthguards are smart. No metal cleats, no jewelry, no hats with hard brims.",
      },
    ],
    quiz: [
      {
        q: "How does a defender stop the ball carrier in flag football?",
        options: ["Tackle them", "Pull a flag", "Block the throw with a stick", "Touch with two hands"],
        correct: 1,
        explain: "The defender pulls one of the flags from the ball carrier's belt to end the play.",
      },
      {
        q: "How many downs does the offense get?",
        options: ["3", "4", "5", "Unlimited"],
        correct: 1,
        explain: "Four downs to either score or reach the next first-down line, just like tackle football.",
      },
      {
        q: "A touchdown is worth how many points?",
        options: ["3", "6", "7", "1"],
        correct: 1,
        explain: "Six points for a touchdown. The extra-point try after is 1 or 2 points.",
      },
    ],
  },

  {
    id: "field",
    emoji: "🏟️",
    title: "The Field & Positions",
    subtitle: "Where everyone lines up",
    durationMin: 4,
    sections: [
      {
        id: "the-field",
        heading: "The field",
        body: "A typical flag field is 60 to 80 yards long with two 10-yard end zones. There are mid-field lines that act as first-down markers. Stay inside the sidelines -- stepping out ends the play right where your foot crossed the line.",
      },
      {
        id: "offensive-positions",
        heading: "Offensive positions",
        body: "The quarterback throws and runs the offense. The center snaps the ball. Receivers run routes and catch passes. A running back may take handoffs or short passes. In smaller 5-on-5 games, almost everyone is eligible to catch a pass.",
        bullets: [
          "QB — quarterback, throws the ball",
          "C — center, snaps the ball",
          "WR — wide receiver, runs routes",
          "RB — running back, handoffs and short passes",
        ],
      },
      {
        id: "defensive-positions",
        heading: "Defensive positions",
        body: "Defenders include rushers who try to pressure the quarterback, linebackers who patrol short and middle zones, and cornerbacks and safeties who cover receivers. The rusher must usually start 7 yards back from the line of scrimmage -- your league will tell you the exact rule.",
        bullets: [
          "Rusher — chases the QB after the snap",
          "LB — linebacker, defends short and middle zones",
          "CB — cornerback, covers a receiver",
          "S — safety, deepest defender",
        ],
      },
    ],
    quiz: [
      {
        q: "Which player snaps the ball to start a play?",
        options: ["Quarterback", "Center", "Safety", "Receiver"],
        correct: 1,
        explain: "The center snaps the ball back through their legs (or hand-snaps in some leagues).",
      },
      {
        q: "What ends a play immediately if it happens to the ball carrier?",
        options: ["A teammate yells", "Stepping out of bounds", "Catching a pass", "Throwing a flag"],
        correct: 1,
        explain: "If the ball carrier steps out, the play is over right where they stepped out.",
      },
    ],
  },

  {
    id: "offense",
    emoji: "🎯",
    title: "Offense",
    subtitle: "Moving the ball downfield",
    durationMin: 5,
    sections: [
      {
        id: "goal-of-the-offense",
        heading: "Goal of the offense",
        body: "Your job on offense is to move the ball forward and score. The smartest offenses share the ball, mix runs and passes, and make decisions fast. Every player has a job on every play -- even if you do not get the ball.",
      },
      {
        id: "reading-the-defense",
        heading: "Reading the defense",
        body: "Before the snap, look at how the defense is lined up. If defenders are far away, a short pass is open. If they are close, a deeper route can beat them. Coaches call this 'pre-snap read.' Talk with your quarterback so you both expect the same thing.",
        bullets: [
          "Count the defenders on each side",
          "Look at how deep safeties are playing",
          "Notice who is matched up on you",
        ],
      },
      {
        id: "protecting-the-ball",
        heading: "Protecting the ball",
        body: "Carry the ball with two hands when you can. Keep your flags clean -- that means do not let your shirt cover them, and do not grab a defender's hand to keep your flag on. That is called flag-guarding, and it is a penalty.",
      },
    ],
    quiz: [
      {
        q: "Looking at how the defense is set up before the snap is called what?",
        options: ["Trash talk", "Pre-snap read", "Time out", "Audible"],
        correct: 1,
        explain: "Pre-snap read: scan the defense and predict what they might do.",
      },
      {
        q: "Using your hand to block a defender from grabbing your flag is…",
        options: ["A smart move", "Flag-guarding (a penalty)", "Allowed only once", "An incomplete pass"],
        correct: 1,
        explain: "Flag-guarding is a penalty. Run with your flags exposed.",
      },
    ],
  },

  {
    id: "defense",
    emoji: "🛡️",
    title: "Defense",
    subtitle: "Stop the offense without tackling",
    durationMin: 5,
    sections: [
      {
        id: "goal-of-the-defense",
        heading: "Goal of the defense",
        body: "Defense wins games. Your job is to keep the offense from moving forward, force incompletions, and pull flags as soon as the ball is caught or carried. Speed and angles matter more than size.",
      },
      {
        id: "taking-the-right-angle",
        heading: "Taking the right angle",
        body: "When chasing a ball carrier, do not run straight at them -- they will juke you. Aim for a spot a few steps in front of where they are going. This is called your pursuit angle. Stay low, keep your eyes on their hips, and reach for the flag with both hands.",
        bullets: [
          "Eyes on the hips, not the head or hands",
          "Bend your knees and stay balanced",
          "Pull straight down on the flag",
        ],
      },
      {
        id: "man-and-zone-coverage",
        heading: "Man and zone coverage",
        body: "In man coverage, each defender follows one receiver wherever they go. In zone coverage, each defender protects an area of the field. Zone is easier to learn -- stay in your area, and if a receiver enters it, cover them until they leave.",
      },
    ],
    quiz: [
      {
        q: "Where should you look when chasing a ball carrier?",
        options: ["Their eyes", "Their hands", "Their hips", "Their feet"],
        correct: 2,
        explain: "Hips do not lie — they tell you which way the runner is actually going.",
      },
      {
        q: "In zone coverage, you cover…",
        options: ["One specific receiver", "An area of the field", "The quarterback", "Nobody — you rush"],
        correct: 1,
        explain: "Zone defenders guard an area. Anyone who enters becomes your responsibility.",
      },
    ],
  },

  {
    id: "routes",
    emoji: "📐",
    title: "Route Running",
    subtitle: "How to get open as a receiver",
    durationMin: 5,
    sections: [
      {
        id: "why-routes-matter",
        heading: "Why routes matter",
        body: "A route is the path you run after the snap. Good routes get you open, bad routes let defenders sit on you. The best receivers run routes the same way every time so their quarterback knows exactly where they will be.",
      },
      {
        id: "five-must-know-routes",
        heading: "Five must-know routes",
        body: "Learn these five and you can play any wide-receiver spot: the slant, the out, the curl, the post, and the go. Each cut is sharp -- plant your outside foot and explode in the new direction.",
        bullets: [
          "Slant — three steps then cut at 45° toward the middle",
          "Out — five steps then cut hard toward the sideline",
          "Curl — sprint then turn back to the quarterback",
          "Post — sprint then cut diagonally toward the goalposts",
          "Go — sprint straight downfield, no cut",
        ],
      },
      {
        id: "selling-the-route",
        heading: "Selling the route",
        body: "Run every route like it is a deep go. If the defender thinks you are running deep, a short cut will be wide open. Use a head fake or a small shoulder dip to freeze them before your real cut.",
      },
    ],
    quiz: [
      {
        q: "A 'slant' route cuts which direction?",
        options: ["Toward the sideline", "Diagonally toward the middle", "Backward", "Straight down the field"],
        correct: 1,
        explain: "A slant cuts at 45 degrees toward the middle of the field after a few quick steps.",
      },
      {
        q: "What is a 'go' route?",
        options: ["A trick play", "A sprint straight down the field, no cut", "A run handoff", "A short pass"],
        correct: 1,
        explain: "Go (or fly) routes are pure speed straight downfield.",
      },
    ],
  },

  {
    id: "flag-pulling",
    emoji: "✋",
    title: "Flag Pulling",
    subtitle: "The most important defensive skill",
    durationMin: 4,
    sections: [
      {
        id: "stance-and-approach",
        heading: "Stance and approach",
        body: "Get low. Bend your knees, not your back. Keep your feet shoulder-width apart and your hands ready. When you approach a runner, slow down a little so you can change direction with them.",
      },
      {
        id: "the-pull",
        heading: "The pull",
        body: "Aim for the flag belt at the runner's hips. Watch the hips, not the ball. Reach with both hands, grab one flag, and pull straight down -- never up, never sideways. Pulling sideways often misses; pulling down comes off clean.",
        bullets: [
          "Two hands ready",
          "Eyes on the hips",
          "Pull down, not across",
          "Yell 'FLAG!' so the play stops fast",
        ],
      },
      {
        id: "what-not-to-do",
        heading: "What not to do",
        body: "Do not push, grab a shirt, tackle, or trip. Do not dive at the runner's feet. If you miss the flag, recover quickly -- a teammate is coming behind you.",
      },
    ],
    quiz: [
      {
        q: "Which direction should you pull the flag?",
        options: ["Straight down", "Sideways", "Up and away", "Whichever feels right"],
        correct: 0,
        explain: "Pulling straight down releases the flag cleanly almost every time.",
      },
      {
        q: "Where should your eyes be on the ball carrier?",
        options: ["The football", "Their eyes", "Their hips", "Their shoes"],
        correct: 2,
        explain: "Hips tell you the runner's true direction. Eyes and shoulders can fake you out.",
      },
    ],
  },

  {
    id: "rules",
    emoji: "📏",
    title: "Rules, Safety & Sportsmanship",
    subtitle: "Play hard, play fair",
    durationMin: 5,
    sections: [
      {
        id: "common-penalties",
        heading: "Common penalties",
        body: "Most penalties are 5 yards. Flag-guarding, holding, offsides, and illegal contact are the big ones. A pass-interference penalty in the end zone is a spot foul -- the ball moves to the spot of the foul.",
        bullets: [
          "Flag-guarding — 5 yards, loss of down",
          "Holding — 5 yards",
          "Offsides — 5 yards",
          "Pass interference — 10 yards from the spot",
          "Unsportsmanlike conduct — 10 yards, can lead to ejection",
        ],
      },
      {
        id: "safety",
        heading: "Safety",
        body: "Flag football is safer than tackle, but injuries still happen. Warm up before games, hydrate, wear a mouthguard if you have one, and never play through head, neck, or joint pain. Tell a coach right away.",
      },
      {
        id: "sportsmanship",
        heading: "Sportsmanship",
        body: "Help your opponent up. Compliment a great catch, even if it was against you. Trash talk hurts teams more than it helps. Officials make calls in real time -- you can ask politely, but you do not get to argue.",
      },
    ],
    quiz: [
      {
        q: "Flag-guarding is when you…",
        options: [
          "Cover your flags with your hand or arm",
          "Pull two flags at once",
          "Block a kick",
          "Step out of bounds on purpose",
        ],
        correct: 0,
        explain: "Using your hand, arm, or the ball to protect your flag belt is flag-guarding.",
      },
      {
        q: "Which is the BEST example of good sportsmanship?",
        options: [
          "Yelling at the ref after a call",
          "Talking trash to the QB",
          "Helping an opponent up after a play",
          "Refusing to shake hands after the game",
        ],
        correct: 2,
        explain: "Helping someone up — even an opponent — is the heart of sportsmanship.",
      },
    ],
  },

  {
    id: "drills",
    emoji: "💪",
    title: "Practice Drills",
    subtitle: "How to get better on your own",
    durationMin: 4,
    sections: [
      {
        id: "catching",
        heading: "Catching",
        body: "Hold your hands out with thumbs together for chest-high passes, and pinkies together for low passes. Look the ball all the way into your hands. Practice with a friend, a wall, or a self-rebounder.",
      },
      {
        id: "footwork",
        heading: "Footwork",
        body: "Set up four cones in a square, about three yards apart. Sprint, shuffle, back-pedal, and shuffle. Twenty seconds on, ten seconds off. Three rounds. This builds the change-of-direction speed every flag player needs.",
        bullets: [
          "Square drill — 4 cones, 3 yards apart",
          "Ladder drill — quick feet, eyes up",
          "Mirror drill — partner moves, you copy",
        ],
      },
      {
        id: "flag-pulling-reps",
        heading: "Flag pulling reps",
        body: "Have a partner jog in a straight line. You shadow them and pull one flag with proper form. Switch. Do ten reps each, then add cuts and jukes. Make it game-speed once you have the technique.",
      },
    ],
    quiz: [
      {
        q: "When the ball is coming at your chest, your hands should form which shape?",
        options: ["Pinkies together", "Thumbs together", "One hand only", "Crossed fingers"],
        correct: 1,
        explain: "Thumbs together for high passes, pinkies together for low passes.",
      },
      {
        q: "Why do footwork drills?",
        options: [
          "They look cool",
          "They build change-of-direction speed",
          "To warm up your arms",
          "Because the coach said so",
        ],
        correct: 1,
        explain: "Quick feet help you cut, juke, and pull flags. They are the foundation of flag football.",
      },
    ],
  },

  {
    id: "gameday",
    emoji: "🚨",
    title: "Game-Day Checklist",
    subtitle: "Show up ready to play",
    durationMin: 3,
    sections: [
      {
        id: "night-before",
        heading: "Night before",
        body: "Pack your bag, fill your water bottle, and eat a normal dinner -- nothing wild or new. Set out your uniform. Aim for nine hours of sleep. A good warm body beats a tired strong one.",
      },
      {
        id: "morning-of",
        heading: "Morning of",
        body: "Eat a real breakfast at least 90 minutes before kickoff. Hydrate with water. Skip soda and energy drinks. Get to the field thirty minutes early so you can warm up without rushing.",
      },
      {
        id: "mindset",
        heading: "Mindset",
        body: "Confidence beats nerves. Picture yourself making the catch, pulling the flag, and celebrating with your team. Be a great teammate from warmup to handshake line. Have fun -- that is when you play your best.",
      },
    ],
    quiz: [
      {
        q: "How early should you get to the field?",
        options: ["Right at kickoff", "Five minutes early", "Thirty minutes early", "An hour late, like a star"],
        correct: 2,
        explain: "About 30 minutes early lets you stretch, warm up, and focus.",
      },
      {
        q: "Best pre-game drink?",
        options: ["Soda", "Energy drink", "Water", "Coffee"],
        correct: 2,
        explain: "Water — hydration powers everything you do on the field.",
      },
    ],
  },
];

// Build narration script for a lesson by concatenating its sections.
export function lessonNarrationScript(lesson: Lesson): string {
  const intro = `${lesson.title}. ${lesson.subtitle}.`;
  const body = lesson.sections
    .map((s) => `${s.heading}. ${s.body}${s.bullets ? " " + s.bullets.join(". ") : ""}`)
    .join(" ");
  return `${intro} ${body}`;
}
