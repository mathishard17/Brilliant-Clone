# Phase 9 — Flexible Theme Language

## Objective

Move beyond simple label replacement so themes can provide varied, age-appropriate lesson language while code still owns math.

## Why

Current theming mostly swaps nouns into fixed sentences. That is safe, but it can feel plug-and-chug. The next step is to let a validated theme pack provide short copy slots for headings, intros, transitions, hints, and summary language while keeping all answers, counts, section order, and correctness checks in code.

## Scope

Update:

- Theme pack contract and validation.
- Manual Royal and Space copy slots.
- AI prompt/schema so generated packs can include flexible copy.
- Lesson 1 screens that consume copy slots.
- Roadmap/docs explaining what AI may and may not write.

## Requirements

- AI may write flavor copy only inside bounded fields.
- AI must not write answers, equations, counts, section count, correctness rules, or arbitrary UI layout.
- Copy slots must be optional with deterministic fallbacks.
- Copy slots should preserve third-grade tone: concrete, short, encouraging, not babyish.
- The theme pack should support varied wording for Royal and Space without duplicating the math engine.

## Checklist

- [x] Theme contract includes bounded copy slots.
- [x] Validator enforces copy length and rejects answer leakage in flexible copy.
- [x] Royal and Space fallbacks include non-identical, polished copy.
- [x] AI prompt includes copy-slot schema and guardrails.
- [x] Lesson 1 consumes copy slots where useful without changing correctness.
- [x] Docs explain that flexible language can use AI APIs later, but deterministic fallback copy works first.

## Tests / Verification

- [x] `npm run lint`
- [x] `npm run build`
- [ ] Manual copy read-through: Royal and Space feel authored, not just noun-swapped.
- [ ] Manual AI failure test: fallback copy still renders.

## Done When

Lesson 1 has a safe path for richer theme language, with AI limited to validated flavor copy and code still owning the math.
