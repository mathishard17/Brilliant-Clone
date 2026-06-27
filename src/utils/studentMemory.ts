import type {
  StudentMemory,
  StudentMemoryConcept,
  StudentMemoryOutcome,
  StudentMemoryRecentEvent,
} from '../types/user'
import type { LessonProgress } from '../types/lesson'

const MEMORY_VERSION = 1 as const
const MAX_RECENT_EVENTS = 8
const MAX_MEMORY_LABELS = 4

export interface StudentMemoryEvent {
  type: 'challengeAttempt' | 'hintRequested'
  lessonId: string
  conceptKey: string
  label: string
  outcome?: StudentMemoryOutcome
  learnerAnswer?: string
  correctAnswer?: string
}

export interface StudentMemoryHintSummary {
  totalAttempts: number
  correctAttempts: number
  incorrectAttempts: number
  hintsRequested: number
  currentStreak: number
  strengths: string[]
  growthAreas: string[]
  currentConcept?: Pick<
    StudentMemoryConcept,
    'label' | 'attempts' | 'correct' | 'incorrect' | 'hintsRequested' | 'lastOutcome' | 'lastMisconception'
  >
}

export interface StudentMemoryStats {
  totalAttempts: number
  correctAttempts: number
  incorrectAttempts: number
  hintsRequested: number
  accuracy: number | null
}

export function createDefaultStudentMemory(): StudentMemory {
  return {
    version: MEMORY_VERSION,
    totalAttempts: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    hintsRequested: 0,
    currentStreak: 0,
    strengths: [],
    growthAreas: [],
    concepts: {},
    recentEvents: [],
  }
}

function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
}

function safeString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function safeStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value
        .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
        .map((entry) => entry.trim().slice(0, 80))
        .slice(0, MAX_MEMORY_LABELS)
    : []
}

function parseStudentMemoryConcept(value: unknown, conceptKey: string): StudentMemoryConcept | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const concept = value as Partial<StudentMemoryConcept>
  const label = safeString(concept.label, 80)
  const lessonId = safeString(concept.lessonId, 120)
  if (!label || !lessonId) return null

  const lastOutcome = concept.lastOutcome === 'correct' || concept.lastOutcome === 'incorrect'
    ? concept.lastOutcome
    : undefined

  return {
    conceptKey,
    label,
    lessonId,
    attempts: safeNumber(concept.attempts),
    correct: safeNumber(concept.correct),
    incorrect: safeNumber(concept.incorrect),
    hintsRequested: safeNumber(concept.hintsRequested),
    lastOutcome,
    lastMisconception: safeString(concept.lastMisconception, 120) || undefined,
    lastSeenAt: safeString(concept.lastSeenAt, 40) || undefined,
  }
}

function parseRecentEvent(value: unknown): StudentMemoryRecentEvent | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const event = value as Partial<StudentMemoryRecentEvent>
  if (event.type !== 'challengeAttempt' && event.type !== 'hintRequested') return null
  const lessonId = safeString(event.lessonId, 120)
  const conceptKey = safeString(event.conceptKey, 80)
  const label = safeString(event.label, 80)
  const createdAt = safeString(event.createdAt, 40)
  if (!lessonId || !conceptKey || !label || !createdAt) return null

  const outcome = event.outcome === 'correct' || event.outcome === 'incorrect'
    ? event.outcome
    : undefined

  return {
    type: event.type,
    lessonId,
    conceptKey,
    label,
    outcome,
    misconception: safeString(event.misconception, 120) || undefined,
    createdAt,
  }
}

export function parseStudentMemory(value: unknown): StudentMemory {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return createDefaultStudentMemory()
  const memory = value as Partial<StudentMemory>
  const rawConcepts = memory.concepts && typeof memory.concepts === 'object' && !Array.isArray(memory.concepts)
    ? memory.concepts
    : {}
  const concepts = Object.fromEntries(
    Object.entries(rawConcepts)
      .map(([key, concept]) => [safeString(key, 80), parseStudentMemoryConcept(concept, safeString(key, 80))] as const)
      .filter((entry): entry is readonly [string, StudentMemoryConcept] => entry[0].length > 0 && entry[1] !== null),
  )
  const recentEvents = Array.isArray(memory.recentEvents)
    ? memory.recentEvents.map(parseRecentEvent).filter((event): event is StudentMemoryRecentEvent => event !== null)
    : []

  return {
    version: MEMORY_VERSION,
    totalAttempts: safeNumber(memory.totalAttempts),
    correctAttempts: safeNumber(memory.correctAttempts),
    incorrectAttempts: safeNumber(memory.incorrectAttempts),
    hintsRequested: safeNumber(memory.hintsRequested),
    currentStreak: safeNumber(memory.currentStreak),
    strengths: safeStringList(memory.strengths),
    growthAreas: safeStringList(memory.growthAreas),
    concepts,
    recentEvents: recentEvents.slice(0, MAX_RECENT_EVENTS),
    updatedAt: safeString(memory.updatedAt, 40) || undefined,
  }
}

function inferMisconception(event: StudentMemoryEvent): string | undefined {
  if (event.type !== 'challengeAttempt' || event.outcome !== 'incorrect') return undefined
  const answer = Number(event.learnerAnswer)
  const correct = Number(event.correctAnswer)
  if (!Number.isFinite(answer) || !Number.isFinite(correct)) return 'Needs another strategy check'
  if (answer < correct) return 'May be missing some possible cases'
  if (answer > correct) return 'May be double-counting or adding extra cases'
  return 'Needs another strategy check'
}

function withoutLabel(values: string[], label: string) {
  return values.filter((value) => value.toLowerCase() !== label.toLowerCase())
}

function addLabel(values: string[], label: string) {
  return [label, ...withoutLabel(values, label)].slice(0, MAX_MEMORY_LABELS)
}

function summarizeConceptCounters(concepts: Record<string, StudentMemoryConcept>) {
  return Object.values(concepts).reduce(
    (totals, concept) => ({
      totalAttempts: totals.totalAttempts + concept.attempts,
      correctAttempts: totals.correctAttempts + concept.correct,
      incorrectAttempts: totals.incorrectAttempts + concept.incorrect,
      hintsRequested: totals.hintsRequested + concept.hintsRequested,
    }),
    {
      totalAttempts: 0,
      correctAttempts: 0,
      incorrectAttempts: 0,
      hintsRequested: 0,
    },
  )
}

export function recordStudentMemoryEvent(memory: StudentMemory, event: StudentMemoryEvent): StudentMemory {
  const now = new Date().toISOString()
  const conceptKey = event.conceptKey.trim().slice(0, 80)
  const label = event.label.trim().slice(0, 80)
  const lessonId = event.lessonId.trim().slice(0, 120)
  if (!conceptKey || !label || !lessonId) return memory

  const previousConcept = memory.concepts[conceptKey]
  const misconception = inferMisconception(event)
  const concept: StudentMemoryConcept = {
    conceptKey,
    label,
    lessonId,
    attempts: previousConcept?.attempts ?? 0,
    correct: previousConcept?.correct ?? 0,
    incorrect: previousConcept?.incorrect ?? 0,
    hintsRequested: previousConcept?.hintsRequested ?? 0,
    lastOutcome: previousConcept?.lastOutcome,
    lastMisconception: previousConcept?.lastMisconception,
    lastSeenAt: now,
  }

  let totalAttempts = memory.totalAttempts
  let correctAttempts = memory.correctAttempts
  let incorrectAttempts = memory.incorrectAttempts
  let hintsRequested = memory.hintsRequested
  let currentStreak = memory.currentStreak
  let strengths = memory.strengths
  let growthAreas = memory.growthAreas

  if (event.type === 'hintRequested') {
    hintsRequested += 1
    concept.hintsRequested += 1
    growthAreas = addLabel(growthAreas, label)
  } else {
    totalAttempts += 1
    concept.attempts += 1
    concept.lastOutcome = event.outcome

    if (event.outcome === 'correct') {
      correctAttempts += 1
      currentStreak += 1
      concept.correct += 1
      concept.lastMisconception = undefined
      strengths = addLabel(strengths, label)
      growthAreas = withoutLabel(growthAreas, label)
    } else {
      incorrectAttempts += 1
      currentStreak = 0
      concept.incorrect += 1
      concept.lastMisconception = misconception
      growthAreas = addLabel(growthAreas, label)
    }
  }

  const recentEvent: StudentMemoryRecentEvent = {
    type: event.type,
    lessonId,
    conceptKey,
    label,
    outcome: event.outcome,
    misconception,
    createdAt: now,
  }

  return {
    version: MEMORY_VERSION,
    totalAttempts,
    correctAttempts,
    incorrectAttempts,
    hintsRequested,
    currentStreak,
    strengths,
    growthAreas,
    concepts: {
      ...memory.concepts,
      [conceptKey]: concept,
    },
    recentEvents: [recentEvent, ...memory.recentEvents].slice(0, MAX_RECENT_EVENTS),
    updatedAt: now,
  }
}

export function clearStudentMemoryForLesson(memory: StudentMemory, lessonId: string): StudentMemory {
  const removedLabels = new Set<string>()
  const concepts = Object.fromEntries(
    Object.entries(memory.concepts).filter(([, concept]) => {
      if (concept.lessonId !== lessonId) return true
      removedLabels.add(concept.label.toLowerCase())
      return false
    }),
  )
  const recentEvents = memory.recentEvents.filter((event) => {
    if (event.lessonId !== lessonId) return true
    removedLabels.add(event.label.toLowerCase())
    return false
  })

  if (
    Object.keys(concepts).length === Object.keys(memory.concepts).length &&
    recentEvents.length === memory.recentEvents.length
  ) {
    return memory
  }

  const counters = summarizeConceptCounters(concepts)
  const withoutRemovedLabels = (labels: string[]) =>
    labels.filter((label) => !removedLabels.has(label.toLowerCase()))

  return {
    ...memory,
    ...counters,
    currentStreak: recentEvents.length === memory.recentEvents.length ? memory.currentStreak : 0,
    strengths: withoutRemovedLabels(memory.strengths),
    growthAreas: withoutRemovedLabels(memory.growthAreas),
    concepts,
    recentEvents,
    updatedAt: new Date().toISOString(),
  }
}

function addStats(first: StudentMemoryStats, second: StudentMemoryStats): StudentMemoryStats {
  const totalAttempts = first.totalAttempts + second.totalAttempts
  const correctAttempts = first.correctAttempts + second.correctAttempts
  const incorrectAttempts = first.incorrectAttempts + second.incorrectAttempts
  const gradedAttempts = correctAttempts + incorrectAttempts

  return {
    totalAttempts,
    correctAttempts,
    incorrectAttempts,
    hintsRequested: first.hintsRequested + second.hintsRequested,
    accuracy: gradedAttempts > 0 ? Math.round((correctAttempts / gradedAttempts) * 100) : null,
  }
}

function getWrongAttemptCount(value: Record<string, unknown>): number {
  const direct = value.wrongAttempts
  if (typeof direct === 'number' && Number.isFinite(direct)) return Math.max(0, Math.floor(direct))

  const practice = value.practiceWrongAttempts
  return typeof practice === 'number' && Number.isFinite(practice) ? Math.max(0, Math.floor(practice)) : 0
}

function getCorrectFlag(value: Record<string, unknown>): boolean | null {
  if (typeof value.isCorrect === 'boolean') return value.isCorrect
  if (typeof value.practiceCorrect === 'boolean') return value.practiceCorrect
  return null
}

function hasStoredAnswer(value: Record<string, unknown>): boolean {
  const answerKeys = ['answerInput', 'selectedAnswer', 'answer', 'practiceAnswer']
  return answerKeys.some((key) => {
    const entry = value[key]
    return (
      (typeof entry === 'string' && entry.trim().length > 0) ||
      (typeof entry === 'number' && Number.isFinite(entry)) ||
      typeof entry === 'boolean'
    )
  })
}

function getAnswerMapAttemptStats(value: unknown): StudentMemoryStats {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { totalAttempts: 0, correctAttempts: 0, incorrectAttempts: 0, hintsRequested: 0, accuracy: null }
  }

  const emptyStats: StudentMemoryStats = {
    totalAttempts: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    hintsRequested: 0,
    accuracy: null,
  }

  return Object.values(value as Record<string, unknown>).reduce<StudentMemoryStats>((totals, entry) => {
    if (entry === 'right' || entry === 'same') {
      return addStats(totals, {
        totalAttempts: 1,
        correctAttempts: 1,
        incorrectAttempts: 0,
        hintsRequested: 0,
        accuracy: 100,
      })
    }
    if (entry === 'wrong' || entry === 'different') {
      return addStats(totals, {
        totalAttempts: 1,
        correctAttempts: 0,
        incorrectAttempts: 1,
        hintsRequested: 0,
        accuracy: 0,
      })
    }
    return totals
  }, emptyStats)
}

function getProgressAttemptStats(value: unknown): StudentMemoryStats {
  if (!value || typeof value !== 'object') {
    return { totalAttempts: 0, correctAttempts: 0, incorrectAttempts: 0, hintsRequested: 0, accuracy: null }
  }

  if (Array.isArray(value)) {
    return value.reduce(
      (totals, entry) => addStats(totals, getProgressAttemptStats(entry)),
      { totalAttempts: 0, correctAttempts: 0, incorrectAttempts: 0, hintsRequested: 0, accuracy: null },
    )
  }

  const record = value as Record<string, unknown>
  const attemptedAnswers = Array.isArray(record.attemptedAnswers) ? record.attemptedAnswers : null
  const wrongAttempts = getWrongAttemptCount(record)
  const correctFlag = getCorrectFlag(record)
  const answerMapStats = getAnswerMapAttemptStats(record.answers)
  const ownAttempts = attemptedAnswers?.length ?? (correctFlag !== null || hasStoredAnswer(record) ? 1 : 0)
  const ownIncorrect = Math.min(wrongAttempts || (correctFlag === false ? ownAttempts : 0), ownAttempts)
  const ownCorrect = correctFlag === true
    ? Math.max(1, ownAttempts - ownIncorrect)
    : Math.max(0, ownAttempts - ownIncorrect)
  const ownStats = addStats(answerMapStats, {
    totalAttempts: ownAttempts,
    correctAttempts: ownCorrect,
    incorrectAttempts: ownIncorrect,
    hintsRequested: 0,
    accuracy: ownAttempts > 0 ? Math.round((ownCorrect / Math.max(ownCorrect + ownIncorrect, 1)) * 100) : null,
  })

  return Object.entries(record).reduce((totals, [key, entry]) => {
    if (key === 'attemptedAnswers' || key === 'answers') return totals
    return addStats(totals, getProgressAttemptStats(entry))
  }, ownStats)
}

export function getLessonProgressStats(lessons: Record<string, LessonProgress>): StudentMemoryStats {
  const emptyStats: StudentMemoryStats = {
    totalAttempts: 0,
    correctAttempts: 0,
    incorrectAttempts: 0,
    hintsRequested: 0,
    accuracy: null,
  }

  return Object.values(lessons).reduce((totals, lesson) => (
    addStats(totals, getProgressAttemptStats({
      screen1: lesson.screen1,
      screen3: lesson.screen3,
      sectionState: lesson.sectionState,
    }))
  ), emptyStats)
}

export function getStudentMemoryStats(memory: StudentMemory): StudentMemoryStats {
  const conceptStats = summarizeConceptCounters(memory.concepts)
  const recentHintRequests = memory.recentEvents.filter((event) => event.type === 'hintRequested').length

  const resolvedTotalAttempts =
    conceptStats.totalAttempts > 0
      ? conceptStats.totalAttempts
      : memory.totalAttempts
  const resolvedCorrectAttempts =
    conceptStats.correctAttempts + conceptStats.incorrectAttempts > 0
      ? conceptStats.correctAttempts
      : memory.correctAttempts
  const resolvedIncorrectAttempts =
    conceptStats.correctAttempts + conceptStats.incorrectAttempts > 0
      ? conceptStats.incorrectAttempts
      : memory.incorrectAttempts
  const resolvedHints =
    Math.max(conceptStats.hintsRequested, memory.hintsRequested, recentHintRequests)
  const gradedAttempts = resolvedCorrectAttempts + resolvedIncorrectAttempts

  return {
    totalAttempts: resolvedTotalAttempts,
    correctAttempts: resolvedCorrectAttempts,
    incorrectAttempts: resolvedIncorrectAttempts,
    hintsRequested: resolvedHints,
    accuracy: gradedAttempts > 0
      ? Math.round((resolvedCorrectAttempts / gradedAttempts) * 100)
      : null,
  }
}

export function summarizeStudentMemoryForHint(
  memory: StudentMemory,
  conceptKey: string,
): StudentMemoryHintSummary {
  const concept = memory.concepts[conceptKey]
  const stats = getStudentMemoryStats(memory)
  return {
    totalAttempts: stats.totalAttempts,
    correctAttempts: stats.correctAttempts,
    incorrectAttempts: stats.incorrectAttempts,
    hintsRequested: stats.hintsRequested,
    currentStreak: memory.currentStreak,
    strengths: memory.strengths,
    growthAreas: memory.growthAreas,
    currentConcept: concept
      ? {
          label: concept.label,
          attempts: concept.attempts,
          correct: concept.correct,
          incorrect: concept.incorrect,
          hintsRequested: concept.hintsRequested,
          lastOutcome: concept.lastOutcome,
          lastMisconception: concept.lastMisconception,
        }
      : undefined,
  }
}
