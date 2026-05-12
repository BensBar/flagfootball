// Single source of truth for narration scripts. Imported by both
// script/audio/generate.ts (to produce MP3s) and the React pages
// (to render CaptionedTranscript and pass `text` to useCoachAudio).
//
// Keeping these in lock-step means the spoken audio matches the
// displayed text byte-for-byte, so ElevenLabs character-level timings
// align perfectly with the karaoke highlight.

import type { Lesson, LessonSection } from "./content";
import type { Play, PlayStep, RoutePattern } from "./playbook";

/**
 * What the lesson page narrates when you press the top-of-page Play button.
 * Matches the concatenated <CaptionedTranscript> bodies on the page.
 */
export function lessonFullScript(lesson: Lesson): string {
  return lesson.sections.map((s) => s.body).join("\n\n");
}

/**
 * What a per-section narrate button speaks. Matches the body text shown
 * in that section's <CaptionedTranscript>.
 */
export function lessonSectionScript(section: LessonSection): string {
  return section.body;
}

/**
 * What a play step narrates. Matches the title + description shown
 * in the play-step transcript list.
 */
export function playStepScript(step: PlayStep): string {
  return `${step.title}. ${step.description}`;
}

/**
 * What a route tip narrates. Matches the shortDescription shown
 * on the route detail card. (Coach tips are shown separately and
 * not part of the spoken clip.)
 */
export function routeTipScript(route: RoutePattern): string {
  return route.shortDescription;
}
