import type { StudentMemory } from '../types/user'

export const MIN_SOLUTION_REVEAL_WRONG_ATTEMPTS = 3
const MAX_SOLUTION_REVEAL_WRONG_ATTEMPTS = 6

function getConceptEvents(memory: StudentMemory, conceptKey: string) {
  return memory.recentEvents.filter((event) => event.conceptKey === conceptKey)
}

function getHintCountForConcept(memory: StudentMemory, conceptKey: string): number {
  const conceptHints = memory.concepts[conceptKey]?.hintsRequested ?? 0
  const recentHints = getConceptEvents(memory, conceptKey).filter((event) => (
    event.type === 'hintRequested'
  )).length
  return Math.max(conceptHints, recentHints)
}

function hasTriedAfterLatestHint(memory: StudentMemory, conceptKey: string): boolean {
  const conceptEvents = getConceptEvents(memory, conceptKey)
  const latestHintIndex = conceptEvents.findIndex((event) => event.type === 'hintRequested')
  if (latestHintIndex < 0) return false

  return conceptEvents.slice(0, latestHintIndex).some((event) => (
    event.type === 'challengeAttempt' && event.outcome === 'incorrect'
  ))
}

function hasReachedMaxRevealAttempts(wrongAttempts: number): boolean {
  return wrongAttempts >= MAX_SOLUTION_REVEAL_WRONG_ATTEMPTS
}

function clampRevealThreshold(threshold: number): number {
  return Math.min(
    MAX_SOLUTION_REVEAL_WRONG_ATTEMPTS,
    Math.max(MIN_SOLUTION_REVEAL_WRONG_ATTEMPTS, threshold),
  )
}

export function getSolutionRevealWrongAttemptThreshold(
  memory: StudentMemory,
  conceptKey: string,
): number {
  const concept = memory.concepts[conceptKey]
  const conceptEvents = getConceptEvents(memory, conceptKey)
  const recentConceptAttempts = conceptEvents
    .filter((event) => event.type === 'challengeAttempt')
    .slice(0, 5)
  const recentConceptIncorrect = recentConceptAttempts.filter((event) => event.outcome === 'incorrect').length
  const recentConceptCorrect = recentConceptAttempts.filter((event) => event.outcome === 'correct').length
  const recentConceptHints = conceptEvents.filter((event) => event.type === 'hintRequested').slice(0, 3).length
  const gradedAttempts = memory.correctAttempts + memory.incorrectAttempts
  const accuracy = gradedAttempts > 0 ? memory.correctAttempts / gradedAttempts : 0
  let threshold = MIN_SOLUTION_REVEAL_WRONG_ATTEMPTS

  if (memory.currentStreak >= 3) threshold += 1
  if (memory.currentStreak >= 6) threshold += 1
  if (recentConceptCorrect >= 2 && recentConceptIncorrect === 0) threshold += 1
  if (concept && concept.correct >= 2 && concept.incorrect <= 1) threshold += 1
  if (gradedAttempts >= 6 && accuracy >= 0.8) threshold += 1

  if (recentConceptIncorrect >= 2) threshold -= 1
  if (recentConceptIncorrect >= 4) threshold -= 1
  if (recentConceptHints >= 2) threshold -= 1
  if (memory.currentStreak === 0 && recentConceptIncorrect > 0) threshold -= 1

  return clampRevealThreshold(threshold)
}

export function canRevealSolution({
  memory,
  conceptKey,
  wrongAttempts,
}: {
  memory: StudentMemory
  conceptKey: string
  wrongAttempts: number
}): boolean {
  const threshold = getSolutionRevealWrongAttemptThreshold(memory, conceptKey)
  const hasHint = getHintCountForConcept(memory, conceptKey) >= 1

  return (
    wrongAttempts >= threshold &&
    hasHint &&
    (hasTriedAfterLatestHint(memory, conceptKey) || hasReachedMaxRevealAttempts(wrongAttempts))
  )
}
