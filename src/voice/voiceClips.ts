import { LESSON_1_ID, LESSON_2_ID, LESSON_3_ID, LESSON_4_ID, LESSON_5_ID } from '../types/lesson'
import type { Lesson1ThemePack, ThemeVoiceScript } from '../themes/themeTypes'
import { createVoiceScriptHash } from './voiceCache'
import type { LessonVoiceClip, VoiceRevealPolicy } from './voiceTypes'
import { validateLessonVoiceClip } from './voiceValidation'

export type VoiceClipKey =
  | 'lesson1.screen1.welcome'
  | 'lesson1.screen2.anchorIntro'
  | 'lesson1.screen3.shoesIntro'
  | 'lesson1.screen4.shortcutIntro'
  | 'lesson1.screen3.tryAgain'
  | 'lesson1.screen4.complete'
  | 'lesson1.feedback.correct'
  | 'lesson1.feedback.tryAgain'
  | 'lesson2.screen1.arrangementsIntro'
  | 'lesson2.screen2.restrictionIntro'
  | 'lesson2.feedback.correct'
  | 'lesson2.feedback.tryAgain'
  | 'lesson3.screen1.combinationsIntro'
  | 'lesson3.screen2.duplicatesIntro'
  | 'lesson3.feedback.correct'
  | 'lesson3.feedback.tryAgain'
  | 'lesson4.screen1.spinnerIntro'
  | 'lesson4.screen2.compareIntro'
  | 'lesson4.feedback.correct'
  | 'lesson4.feedback.tryAgain'
  | 'lesson5.screen1.sampleSpaceIntro'
  | 'lesson5.screen2.outcomesIntro'
  | 'lesson5.screen3.fairnessIntro'
  | 'lesson5.feedback.correct'
  | 'lesson5.feedback.tryAgain'

function createLessonVoiceClip({
  lessonId,
  clipKey,
  text,
  revealPolicy,
  caption = text,
}: {
  lessonId: string
  clipKey: VoiceClipKey
  text: string
  revealPolicy: VoiceRevealPolicy
  caption?: string
}): LessonVoiceClip {
  return {
    lessonId,
    clipKey,
    text,
    revealPolicy,
    caption,
    scriptHash: createVoiceScriptHash(`${lessonId}:${clipKey}:${revealPolicy}:${text}`),
  }
}

export const VOICE_CLIPS: Record<VoiceClipKey, LessonVoiceClip> = {
  'lesson1.screen1.welcome': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen1.welcome',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Welcome! Tap the choices and build every unique look you can find.',
  }),
  'lesson1.screen2.anchorIntro': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen2.anchorIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Now try the Anchor Trick: lock a choice, then pair it with each matching choice.',
  }),
  'lesson1.screen3.shoesIntro': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen3.shoesIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Add the last category and watch how each finished look can change.',
  }),
  'lesson1.screen4.shortcutIntro': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen4.shortcutIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'The shortcut is to count the choices in each category, then multiply the groups.',
  }),
  'lesson1.screen3.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen3.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Try building the looks before answering, then count what changed.',
  }),
  'lesson1.screen4.complete': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.screen4.complete',
    revealPolicy: 'postCorrect',
    text: 'Great work! You used multiplication as a shortcut for counting choices.',
  }),
  'lesson1.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Great job! Keep going.',
  }),
  'lesson1.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_1_ID,
    clipKey: 'lesson1.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Look back at what you built.',
  }),
  'lesson2.screen1.arrangementsIntro': createLessonVoiceClip({
    lessonId: LESSON_2_ID,
    clipKey: 'lesson2.screen1.arrangementsIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Arrange the cards and watch how order changes each result.',
  }),
  'lesson2.screen2.restrictionIntro': createLessonVoiceClip({
    lessonId: LESSON_2_ID,
    clipKey: 'lesson2.screen2.restrictionIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Now add a rule and look for choices that still fit.',
  }),
  'lesson2.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_2_ID,
    clipKey: 'lesson2.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Nice work! Your arrangement thinking is on track.',
  }),
  'lesson2.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_2_ID,
    clipKey: 'lesson2.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Check which choices are still allowed.',
  }),
  'lesson3.screen1.combinationsIntro': createLessonVoiceClip({
    lessonId: LESSON_3_ID,
    clipKey: 'lesson3.screen1.combinationsIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Build groups where order does not matter, then compare what stays the same.',
  }),
  'lesson3.screen2.duplicatesIntro': createLessonVoiceClip({
    lessonId: LESSON_3_ID,
    clipKey: 'lesson3.screen2.duplicatesIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'When repeated items appear, sort matching groups so repeats do not sneak in.',
  }),
  'lesson3.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_3_ID,
    clipKey: 'lesson3.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Great check! Your grouping strategy is clear.',
  }),
  'lesson3.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_3_ID,
    clipKey: 'lesson3.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Look for groups that match.',
  }),
  'lesson4.screen1.spinnerIntro': createLessonVoiceClip({
    lessonId: LESSON_4_ID,
    clipKey: 'lesson4.screen1.spinnerIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'A spinner is a set of possible landing spots. Count the spaces before you choose.',
  }),
  'lesson4.screen2.compareIntro': createLessonVoiceClip({
    lessonId: LESSON_4_ID,
    clipKey: 'lesson4.screen2.compareIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Compare the spinner sections before deciding which outcome is more likely.',
  }),
  'lesson4.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_4_ID,
    clipKey: 'lesson4.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Nice work! Your chance thinking is on track.',
  }),
  'lesson4.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_4_ID,
    clipKey: 'lesson4.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Count the matching spinner spaces.',
  }),
  'lesson5.screen1.sampleSpaceIntro': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.screen1.sampleSpaceIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Tap spinner spaces to build the sample space tray before you decide what is fair.',
  }),
  'lesson5.screen2.outcomesIntro': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.screen2.outcomesIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Build the outcome list before judging whether the game feels fair.',
  }),
  'lesson5.screen3.fairnessIntro': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.screen3.fairnessIntro',
    revealPolicy: 'safeBeforeAnswer',
    text: 'A fair game gives each player matching chances. Compare the winning spaces before you decide.',
  }),
  'lesson5.feedback.correct': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.feedback.correct',
    revealPolicy: 'postCorrect',
    text: 'Great check! That game thinking is fair and clear.',
  }),
  'lesson5.feedback.tryAgain': createLessonVoiceClip({
    lessonId: LESSON_5_ID,
    clipKey: 'lesson5.feedback.tryAgain',
    revealPolicy: 'safeBeforeAnswer',
    text: 'Hmm, try again. Compare the winning spaces.',
  }),
}

function isVoiceClipKey(clipKey: string): clipKey is VoiceClipKey {
  return Object.hasOwn(VOICE_CLIPS, clipKey)
}

export function createThemedVoiceClip(
  baseClip: LessonVoiceClip,
  script: ThemeVoiceScript,
): LessonVoiceClip {
  const text = script.text.trim()
  const caption = script.caption?.trim() || text

  return {
    ...baseClip,
    text,
    caption,
    scriptHash: createVoiceScriptHash(
      `${baseClip.lessonId}:${baseClip.clipKey}:${baseClip.revealPolicy}:${text}`,
    ),
  }
}

export function getVoiceClip(clipKey: string, themePack?: Lesson1ThemePack | null): LessonVoiceClip | null {
  if (!isVoiceClipKey(clipKey)) return null

  const baseClip = VOICE_CLIPS[clipKey]
  const themedScript = themePack?.voice?.[clipKey]
  if (!themedScript) return baseClip

  const themedClip = createThemedVoiceClip(baseClip, themedScript)
  return validateLessonVoiceClip(themedClip).valid ? themedClip : baseClip
}

export function getLessonVoiceClips(lessonId: string): LessonVoiceClip[] {
  return Object.values(VOICE_CLIPS).filter((clip) => clip.lessonId === lessonId)
}
