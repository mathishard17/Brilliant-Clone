# Lesson 1 Voice Progress

This file is a handoff for agents adding voice to later lessons. Lesson 1 is the reference pattern: keep voice opt-in, keep captions visible, avoid answer leakage before a learner answers, and use short generic spoken feedback instead of reading the exact feedback banner text.

## What Lesson 1 Has Now

- A global `voiceEnabled` user preference, controlled from the app header.
- Theme-aware voice requests that pass the active `themePreference`.
- Manual replay buttons through `VoiceButton`.
- One-time autoplay for entry instructions and the Lesson 1 shortcut summary while the lesson/page is still incomplete.
- Generic correct/try-again feedback audio on challenge feedback banners.
- A non-voice completion tada sound when the learner clicks a final lesson finish button.
- Optional AI-generated theme-specific voice scripts in the saved theme pack.
- Client and API-route clip catalogs kept in sync.
- Cartesia generation through `/api/get-voice-clip`, with optional Firebase Storage caching for eligible generated MP3s when Firebase Admin credentials are configured.

## Lesson 1 Clip Keys

Lesson 1 clip keys live in `src/voice/voiceClips.ts` and must also be mirrored in the server `VOICE_CLIPS` catalog in `api/get-voice-clip.js`.

- `lesson1.screen1.welcome`: welcome/closet intro. Uses `safeBeforeAnswer`. Autoplays on the first dressing-room page when Voice is on.
- `lesson1.screen2.anchorIntro`: Anchor Trick intro. Uses `safeBeforeAnswer`. Autoplays on the Anchor Trick page.
- `lesson1.screen3.shoesIntro`: shoes challenge intro. Uses `safeBeforeAnswer`. Autoplays on the three-category challenge page.
- `lesson1.screen4.shortcutIntro`: shortcut summary intro. Uses `safeBeforeAnswer`. Autoplays before the lesson is completed, with manual replay still available.
- `lesson1.screen3.tryAgain`: safe try-again hint. Uses `safeBeforeAnswer`. Available in the catalog for targeted hint use.
- `lesson1.screen4.complete`: completion celebration. Uses `postCorrect` because it is safe after successful completion.
- `lesson1.feedback.correct`: generic correct-answer cue. Uses `postCorrect`; it says "Great job! Keep going."
- `lesson1.feedback.tryAgain`: generic wrong-answer cue. Uses `safeBeforeAnswer`; it says "Hmm, try again. Look back at what you built."

## Lesson 2-5 Rollout Keys

Lessons 2-5 follow the same shared-catalog rule: client clip keys in `src/voice/voiceClips.ts` must be mirrored in `api/get-voice-clip.js`.

- Lesson 2: `lesson2.screen1.arrangementsIntro`, `lesson2.screen2.restrictionIntro`, `lesson2.feedback.correct`, `lesson2.feedback.tryAgain`.
- Lesson 3: `lesson3.screen1.combinationsIntro`, `lesson3.screen2.duplicatesIntro`, `lesson3.feedback.correct`, `lesson3.feedback.tryAgain`.
- Lesson 4: `lesson4.screen1.spinnerIntro`, `lesson4.screen2.compareIntro`, `lesson4.feedback.correct`, `lesson4.feedback.tryAgain`.
- Lesson 5: `lesson5.screen1.sampleSpaceIntro`, `lesson5.screen2.outcomesIntro`, `lesson5.screen3.fairnessIntro`, `lesson5.feedback.correct`, `lesson5.feedback.tryAgain`.

## UI Wiring Pattern

Import `VoiceButton` into a screen, then place it near the instruction it supports:

```tsx
<VoiceButton
  autoPlay
  enabled={profile.voiceEnabled}
  lessonId={LESSON_1_ID}
  clipKey="lesson1.screen1.welcome"
  themePreference={profile.themePreference}
/>
```

Use `autoPlay` for page-entry instructions or tips where listening immediately helps the learner. Lesson 1 also autoplays the shortcut summary because it is a key wrap-up explanation. Leave autoplay off for anything that might be annoying if it starts immediately.

If a page has saved completion state, make `autoPlay` conditional so returning to a completed page does not speak again. Manual replay can remain available through the button.

Lesson 1 currently wires voice buttons in:

- `src/screens/DressingRoom.tsx`
- `src/screens/AnchorTrickLesson.tsx`
- `src/screens/ShoesChallenge.tsx`
- `src/screens/LessonSummary.tsx`

## Feedback Cue Pattern

Challenge feedback uses `FeedbackBanner` with a `voiceCue` object. This plays a generic success/error clip when Voice is on, but the visible feedback text stays unchanged.

```tsx
const [feedbackVoiceToken, setFeedbackVoiceToken] = useState(0)

function handleSubmit() {
  // Validate and save the learner's answer first.
  setFeedbackVoiceToken((token) => token + 1)
}

<FeedbackBanner
  variant={isCorrect ? 'success' : 'error'}
  voiceCue={{
    correctClipKey: 'lesson1.feedback.correct',
    enabled: profile.voiceEnabled,
    lessonId: LESSON_1_ID,
    playToken: feedbackVoiceToken || null,
    themePreference: profile.themePreference,
    tryAgainClipKey: 'lesson1.feedback.tryAgain',
  }}
  message={feedbackMessage}
/>
```

Keep these spoken cues short and generic. Do not copy the exact written feedback into the voice script, and do not reveal numbers, equations, or final answers in a `safeBeforeAnswer` try-again clip.

The `playToken` must be local component state, not persisted lesson progress. Increment it only after a fresh answer submission. This prevents saved correct feedback from speaking again when a learner reloads or returns to a completed page.

Lesson 1 currently wires feedback cues in:

- `src/screens/DressingRoom.tsx`
- `src/screens/ShoesChallenge.tsx`
- `src/screens/LessonSummary.tsx`

## Theme-Specific Voice Scripts

Generated theme packs can include an optional `voice` object keyed by stable clip keys:

```ts
voice: {
  'lesson1.screen1.welcome': {
    text: 'Theme-flavored narration for this clip.',
  },
}
```

The clip key is still code-owned. A generated theme may only provide `text` and optional `caption` for existing keys in `src/voice/voiceClips.ts`.

Custom themes are generated server-side by the `/api/generate-custom-theme` route using `OPENAI_API_KEY`. OpenAI only writes the data-only theme pack and optional voice scripts; Cartesia remains responsible for turning validated voice scripts into audio.

Client behavior:

- `useVoiceClip` resolves the active saved theme pack before requesting audio.
- If a valid themed script exists, the caption and fallback response use that script.
- The script hash includes the themed text, so changing generated voice copy creates a new cache key.
- If a themed script is unsafe or malformed, playback silently falls back to the static `VOICE_CLIPS` text.

Server behavior:

- The API route reads the signed-in user's saved `themePacks[LESSON_1_ID].voice` from Firestore.
- The API route does not trust arbitrary client-provided script text.
- The API route validates the themed script again before Cartesia generation.
- Cached MP3s are still stored by provider, theme preference, lesson ID, clip key, and script hash.

## Non-Voice Finish Tada

Lesson completion uses a small synthesized sound effect, not a human voice and not Cartesia. The helper is `playCompletionTada()` in `src/utils/completionSound.ts`.

Call it at the start of the final lesson completion handler:

```tsx
async function handleFinish() {
  playCompletionTada()
  await updateLesson({ completed: true, currentScreen: 0, lastLessonScreen: 5 })
}
```

This is wired for the final finish action in Lessons 1-5. Future lessons should use the same helper on the final `Finish Lesson` action only, not on intermediate clickthrough buttons such as "Continue", "Compare prizes", or "Check fairness".

## Backend Mirror Requirement

Every new client clip in `src/voice/voiceClips.ts` must also be added to the `VOICE_CLIPS` object in `api/get-voice-clip.js`. If the client knows a clip but the API route does not, the local middleware or deployed route will reject the request.

After changing `api/get-voice-clip.js`, restart the local dev server if it is already running.

## Safety Rules To Copy

- Use `safeBeforeAnswer` for instructions, setup, hints, and wrong-answer nudges that can play before a learner has solved the task.
- Use `postCorrect` for celebrations or explanations that are only safe after a correct answer.
- Keep `safeBeforeAnswer` scripts free of digits, number words, equations, and reveal-style wording.
- Treat generated theme voice text as optional; invalid generated scripts must fall back to static catalog text.
- Captions should match the spoken clip.
- Feedback voice should support the written message without repeating it exactly.
- Feedback voice needs a fresh local `playToken`; do not play just because a saved feedback banner mounted.
- Do not autoplay feedback clips manually through `VoiceButton`; let `FeedbackBanner` own success/error cues.

## Rollout Template For Another Lesson

1. Add the lesson ID import to `src/voice/voiceClips.ts` if it is not already imported.
2. Add 1-3 safe instructional clips for the lesson.
3. Add one `feedback.correct` clip with `postCorrect`.
4. Add one `feedback.tryAgain` clip with `safeBeforeAnswer`.
5. Mirror all new clip definitions in `api/get-voice-clip.js`.
6. Add `VoiceButton` to the most useful instruction screens.
7. Add `voiceCue` to success/error `FeedbackBanner` instances.
8. If the clip should be theme-scriptable, add it to the AI theme generation prompt's `voice` object.
9. Add `playCompletionTada()` to the final lesson finish handler if the lesson does not already have it.
10. Run `npm run lint` and `npm run build`.
11. Manually smoke-test with Voice Off and Voice On.
12. Restart the local dev server after backend catalog changes if it is already running.

## Manual QA Checklist

- Voice Off shows the replay controls as disabled and does not generate clips.
- Voice On plays page-entry clips only where `autoPlay` is set.
- Completed pages do not autoplay old instruction audio on re-entry.
- Replay still works after autoplay.
- Correct and wrong answers play different generic clips.
- The spoken feedback does not match the on-screen feedback word-for-word.
- Wrong-answer clips do not leak the answer.
- Captions appear for every manual voice button.
- Generated theme voice scripts use theme words without changing the math.
- Unsafe generated theme voice scripts fall back to static voice text.
- The same clip uses cached audio after first generation when Storage is available.
- The final finish button plays the non-voice tada once per click.
