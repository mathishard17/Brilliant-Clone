# Phase 0: Provider Spike

Goal: confirm the Cartesia-first decision with minimal API usage.

Status: complete. Cartesia is the first provider, and `provider-decision.md` records the decision.

## Inputs

- Current manual theme preferences: Royal, Space, Dinosaurs, Animals, Sports, Surprise.
- Existing safe theme copy patterns from `roadmap/update-lesson-theme.md`.
- Existing answer-leak rules from `.agents/skills/review-lesson/COMMON_MISTAKES.md`.
- No production credentials in the repo.

## Test Clips

Use a low-budget Cartesia smoke test only if needed before implementation:

- one neutral Lesson 1 welcome line
- one theme-specific line for the most important demo theme
- one safe try-again hint with no answer leakage
- optional: one Lesson 4 or 5 spinner/probability line
- optional: one completion celebration

Keep scripts under one sentence each. Stop after 1-3 generated clips if quality and latency are clearly good enough for the demo.

## Pronunciation Strategy

Because API budget is limited, do not generate a separate clip just to test every pronunciation. Prefer:

- text review first
- provider docs for pronunciation controls
- one generated clip with the riskiest demo words only
- manual rewrite if a word sounds bad

Riskiest demo words:

- `Silver Helmet`
- `probability`
- `sample space`

Leave broader pronunciation QA for the rollout phase.

## Compare

- voice quality for a 3rd-grade learning app
- theme fit without sounding distracting
- time from request to playable audio
- API shape and server integration effort
- caching/storage rights
- whether pronunciation controls exist; only test audio pronunciation for the riskiest demo words
- cost for demo usage and expected classroom usage
- kid-safe voice controls and moderation options
- whether the provider supports deterministic or repeatable voice settings

## Cartesia Confirmation Matrix

Record:

| Area | Result |
| --- | --- |
| Provider | Cartesia |
| Voice IDs / presets tested | |
| Average short-clip latency | |
| Cache permission confirmed | yes/no |
| API key can stay server-side | yes/no |
| Theme fit notes | |
| Pronunciation controls noted | |
| Audio pronunciation smoke test | pass/fail/not run |
| Cost notes | |
| Blocking risks | |

## Output

Create `roadmap/voice/provider-decision.md` with:

- selected provider: Cartesia
- backup provider: ElevenLabs only if Cartesia blocks
- chosen voice IDs or style presets
- known limitations
- estimated cost and caching plan
- evidence that cached lesson clips are allowed
- a short recommendation for Phase 1 defaults

Stop before implementation if the provider terms do not clearly allow caching generated lesson clips.

## Done When

- [x] Cartesia is confirmed as the first provider.
- [x] ElevenLabs is marked as backup only, with no API spend unless Cartesia blocks.
- [x] Rough style notes exist for each manual theme.
- [x] Client/server API boundaries are clear: `CARTESIA_API` stays server-only.
- [x] `provider-decision.md` exists.
- [ ] Cache rights still need confirmation before real audio generation.
