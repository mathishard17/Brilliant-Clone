import { useEffect, useMemo, useRef, useState } from 'react'
import { useVoiceClip } from '../hooks/useVoiceClip'
import { useLesson } from '../hooks/useLesson'
import { useAuth } from '../hooks/useAuth'
import {
  generateAnswerFeedback,
  type AnswerFeedbackRequest,
} from '../services/answerFeedbackGeneration'
import type { ThemePreference } from '../themes/themeTypes'
import type { StudentMemory } from '../types/user'
import {
  AI_ANSWER_FEEDBACK_CACHE_PREFIX,
  createLessonProgressSignature,
  createStableHash,
  readAiCache,
  writeAiCache,
} from '../utils/aiProgressCache'
import { renderLessonText } from '../utils/renderLessonText'

interface FeedbackVoiceCue {
  correctClipKey: string
  enabled: boolean
  lessonId: string
  playToken?: number | string | null
  themePreference: ThemePreference
  tryAgainClipKey: string
}

interface FeedbackBannerProps {
  message: string
  submissionKey?: number | string | null
  solution?: string
  variant: 'success' | 'error' | 'info'
  aiFeedback?: Omit<AnswerFeedbackRequest, 'fallbackFeedback' | 'outcome'>
  voiceCue?: FeedbackVoiceCue
}

interface AiFeedbackResult {
  key: string
  message: string
  mistakePattern: string | null
  source: 'generated' | 'fallback'
}

function getConceptMemoryForFeedback(memory: StudentMemory, conceptKey: string): AnswerFeedbackRequest['conceptMemory'] {
  const concept = memory.concepts[conceptKey]
  if (!concept) return undefined

  return {
    attempts: concept.attempts,
    correct: concept.correct,
    incorrect: concept.incorrect,
    hintsRequested: concept.hintsRequested,
    lastOutcome: concept.lastOutcome,
    lastMisconception: concept.lastMisconception,
  }
}

function getConversationContextForFeedback(
  memory: StudentMemory,
  conceptKey: string,
): NonNullable<AnswerFeedbackRequest['conversationContext']> {
  return memory.recentEvents
    .filter((event) => event.conceptKey === conceptKey)
    .slice(0, 5)
    .reverse()
    .map((event) => ({
      type: event.type,
      outcome: event.outcome,
      learnerAnswer: event.learnerAnswer,
      misconception: event.misconception,
    }))
}

function FeedbackVoiceCuePlayer({
  cue,
  message,
  variant,
}: {
  cue: FeedbackVoiceCue
  message: string
  variant: 'success' | 'error'
}) {
  const clipKey = variant === 'success' ? cue.correctClipKey : cue.tryAgainClipKey
  const outcome = variant === 'success' ? 'correct' : 'tryAgain'
  const cueKey = `${cue.lessonId}:${clipKey}:${cue.themePreference}:${variant}:${String(cue.playToken)}:${message}`
  const playedCueRef = useRef<string | null>(null)
  const { loading, play, playing } = useVoiceClip({
    lessonId: cue.lessonId,
    clipKey,
    feedbackContext: cue.playToken == null
      ? undefined
      : {
          outcome,
          message,
          nonce: String(cue.playToken),
        },
    themePreference: cue.themePreference,
  })

  useEffect(() => {
    if (cue.playToken == null || !cue.enabled || playedCueRef.current === cueKey) return
    playedCueRef.current = cueKey
    void play()
  }, [cue.enabled, cue.playToken, cueKey, play])

  return (
    <button
      type="button"
      className="feedback-banner__replay"
      onClick={() => void play()}
      disabled={!cue.enabled || loading || playing}
    >
      {playing ? 'Playing...' : loading ? 'Loading voice...' : 'Replay voice'}
    </button>
  )
}

export function FeedbackBanner({ aiFeedback, message, solution, submissionKey, variant, voiceCue }: FeedbackBannerProps) {
  const { profile } = useLesson()
  const { user } = useAuth()
  const aiActive = profile.aiEnabled && Boolean(aiFeedback) && variant !== 'info'
  const [aiResult, setAiResult] = useState<AiFeedbackResult | null>(null)
  const loadingRequestKeyRef = useRef<string | null>(null)
  const lessonProgressSignature = useMemo(() => (
    aiActive && aiFeedback
      ? createLessonProgressSignature(profile.lessons[aiFeedback.lessonId], aiFeedback.lessonId)
      : ''
  ), [aiActive, aiFeedback, profile.lessons])
  const resolvedSubmissionKey = submissionKey ?? voiceCue?.playToken ?? lessonProgressSignature
  const conceptMemory = useMemo(() => (
    aiActive && aiFeedback
      ? getConceptMemoryForFeedback(profile.studentMemory, aiFeedback.conceptKey)
      : undefined
  ), [aiActive, aiFeedback, profile.studentMemory])
  const conversationContext = useMemo(() => (
    aiActive && aiFeedback
      ? getConversationContextForFeedback(profile.studentMemory, aiFeedback.conceptKey)
      : []
  ), [aiActive, aiFeedback, profile.studentMemory])
  const conversationSignature = useMemo(() => (
    conversationContext
      .map((event) => [
        event.type,
        event.outcome ?? '',
        event.learnerAnswer ?? '',
        event.misconception ?? '',
      ].join(':'))
      .join('|')
  ), [conversationContext])
  const requestKey = useMemo(() => {
    if (!aiActive || !aiFeedback) return ''
    return [
      resolvedSubmissionKey,
      aiFeedback.lessonId,
      aiFeedback.conceptKey,
      variant,
      aiFeedback.problem,
      aiFeedback.correctAnswer,
      aiFeedback.attemptedAnswers?.join(',') ?? '',
      conversationSignature,
      message,
    ].join('|')
  }, [aiActive, aiFeedback, conversationSignature, message, resolvedSubmissionKey, variant])
  const aiFeedbackCacheKey = aiActive && aiFeedback
    ? [
        AI_ANSWER_FEEDBACK_CACHE_PREFIX,
        user?.uid ?? profile.username,
        aiFeedback.lessonId,
        createStableHash(requestKey),
      ].join(':')
    : ''
  const cachedAiResult = useMemo(() => {
    if (!aiFeedbackCacheKey || !requestKey) return null
    const cachedFeedback = readAiCache<{
      message: string
      mistakePattern: string | null
      source: 'generated' | 'fallback'
    }>(aiFeedbackCacheKey)
    return cachedFeedback
      ? {
          key: requestKey,
          ...cachedFeedback,
        }
      : null
  }, [aiFeedbackCacheKey, requestKey])
  const activeAiResult = aiResult?.key === requestKey ? aiResult : cachedAiResult
  const isWaitingForAi = Boolean(aiActive && !activeAiResult)
  const displayMessage = aiActive
    ? activeAiResult?.message ?? ''
    : message
  const displayVariant = variant
  const canPlayVoice = Boolean(voiceCue && displayVariant !== 'info' && (!aiActive || activeAiResult))
  const icon = displayVariant === 'success' ? '✅ ' : displayVariant === 'error' ? '❌ ' : ''

  useEffect(() => {
    if (!aiActive || !aiFeedback || !requestKey) {
      return
    }

    if (activeAiResult) return
    if (cachedAiResult) return
    if (loadingRequestKeyRef.current === requestKey) return

    loadingRequestKeyRef.current = requestKey
    const outcome = variant === 'success' ? 'correct' : 'incorrect'
    const previousMistakePattern = profile.studentMemory.concepts[aiFeedback.conceptKey]?.lastMisconception

    void generateAnswerFeedback({
      ...aiFeedback,
      fallbackFeedback: message,
      outcome,
      previousMistakePattern,
      conceptMemory,
      conversationContext,
    }).then((result) => {
      if (loadingRequestKeyRef.current !== requestKey) return
      const nextResult = {
        message: result.feedback,
        mistakePattern: outcome === 'incorrect' && result.mistakePattern ? result.mistakePattern : null,
        source: result.source,
      } as const
      writeAiCache(aiFeedbackCacheKey, nextResult)
      setAiResult({
        key: requestKey,
        ...nextResult,
      })
      loadingRequestKeyRef.current = null
    }).catch(() => {
      if (loadingRequestKeyRef.current === requestKey) {
        loadingRequestKeyRef.current = null
      }
    })
  }, [
    activeAiResult,
    aiActive,
    aiFeedback,
    aiFeedbackCacheKey,
    cachedAiResult,
    conceptMemory,
    conversationContext,
    message,
    profile.studentMemory.concepts,
    requestKey,
    variant,
  ])

  return (
    <div className={`feedback-banner feedback-banner--${displayVariant}`} role="status" aria-live="polite">
      {(aiActive || (canPlayVoice && voiceCue && displayVariant !== 'info')) && (
        <div className="feedback-banner__meta-row">
          {aiActive && (
            <span className="feedback-banner__ai-label">
              {activeAiResult?.source === 'generated'
                ? 'AI feedback'
                : activeAiResult?.source === 'fallback'
                  ? 'Feedback fallback'
                  : isWaitingForAi
                    ? 'Writing feedback...'
                    : 'AI feedback'}
            </span>
          )}
          {canPlayVoice && voiceCue && displayVariant !== 'info' && (
            <FeedbackVoiceCuePlayer cue={voiceCue} message={displayMessage} variant={displayVariant} />
          )}
        </div>
      )}
      {icon}
      {displayMessage && renderLessonText(displayMessage)}
      {displayVariant === 'success' && displayMessage && solution && (
        <div className="feedback-banner__solution">
          {renderLessonText(solution)}
        </div>
      )}
      {activeAiResult?.mistakePattern && (
        <span className="feedback-banner__pattern">Pattern: {activeAiResult.mistakePattern}</span>
      )}
    </div>
  )
}
