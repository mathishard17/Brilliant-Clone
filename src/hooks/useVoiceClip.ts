import { useCallback, useRef, useState } from 'react'
import { getVoiceClipAudio } from '../services/voiceGeneration'
import {
  getLessonVoiceCacheVersion,
  getVoiceClip,
  type VoiceClipRequest,
  type VoiceClipResponse,
  type VoiceClipStatus,
} from '../voice'
import { useLesson } from './useLesson'
import { useAuth } from './useAuth'
import { DEFAULT_LESSON_1_THEMES } from '../themes/defaultThemes'
import { resolveLesson1Theme } from '../themes/themeResolver'
import { claimExclusiveAudio, releaseExclusiveAudio } from '../utils/exclusiveAudio'

interface UseVoiceClipState {
  caption: string | null
  error: string | null
  loading: boolean
  playing: boolean
  requestKey: string
  status: VoiceClipStatus | 'idle'
}

export function useVoiceClip(request: VoiceClipRequest) {
  const { profile } = useLesson()
  const { user } = useAuth()
  const { clipKey, feedbackContext, lessonId, themePreference } = request
  const activeTheme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const requestClip = getVoiceClip(clipKey, activeTheme)
  const defaultTheme = DEFAULT_LESSON_1_THEMES[profile.themePreference]
  const storageCacheScope =
    defaultTheme && JSON.stringify(activeTheme) === JSON.stringify(defaultTheme) ? 'global' : 'user'
  const lessonVoiceCacheVersion = getLessonVoiceCacheVersion(lessonId)
  const feedbackRequestKey = feedbackContext
    ? `${feedbackContext.outcome}:${feedbackContext.nonce}:${feedbackContext.message}`
    : 'static'
  const requestKey = `${lessonId}:${clipKey}:${themePreference}:${requestClip?.scriptHash ?? 'missing'}:${lessonVoiceCacheVersion}:${feedbackRequestKey}`
  const [state, setState] = useState<UseVoiceClipState>({
    caption: null,
    error: null,
    loading: false,
    playing: false,
    requestKey,
    status: 'idle',
  })
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioSessionRef = useRef<number | null>(null)
  const responseRef = useRef<{ requestKey: string; response: VoiceClipResponse } | null>(null)
  const isCurrentRequest = state.requestKey === requestKey

  const loadClip = useCallback(async (): Promise<VoiceClipResponse> => {
    if (responseRef.current?.requestKey === requestKey) return responseRef.current.response
    setState((current) => ({ ...current, requestKey, loading: true, error: null }))
    const nextResponse = await getVoiceClipAudio({
      lessonId,
      clipKey,
      cacheBust: lessonVoiceCacheVersion,
      feedbackContext,
      storageCacheScope,
      storageCacheUserId: user?.uid,
      themePreference,
    }, activeTheme)
    responseRef.current =
      nextResponse.status === 'ready' && nextResponse.audioUrl
        ? { requestKey, response: nextResponse }
        : null
    setState((current) => ({
      ...current,
      requestKey,
      caption: nextResponse.caption,
      loading: false,
      status: nextResponse.status,
    }))
    return nextResponse
  }, [
    activeTheme,
    clipKey,
    feedbackContext,
    lessonId,
    lessonVoiceCacheVersion,
    requestKey,
    storageCacheScope,
    themePreference,
    user?.uid,
  ])

  const playResponse = useCallback((nextResponse: VoiceClipResponse) => {
    if (!nextResponse.audioUrl) {
      const debugCopy = import.meta.env.DEV && nextResponse.debugError ? ` Debug: ${nextResponse.debugError}` : ''
      setState((current) => ({
        ...current,
        requestKey,
        caption: nextResponse.caption,
        error: `Voice audio is not ready yet. Read the caption instead.${debugCopy}`,
        playing: false,
      }))
      return
    }

    audioRef.current?.pause()
    if (audioSessionRef.current !== null) {
      releaseExclusiveAudio(audioSessionRef.current)
      audioSessionRef.current = null
    }
    const audio = new Audio(nextResponse.audioUrl)
    audioRef.current = audio
    const audioSession = claimExclusiveAudio(() => {
      audio.pause()
      audio.currentTime = 0
      if (audioRef.current === audio) audioRef.current = null
      if (audioSessionRef.current === audioSession) audioSessionRef.current = null
      setState((current) => ({ ...current, playing: false }))
    })
    audioSessionRef.current = audioSession
    audio.onended = () => {
      releaseExclusiveAudio(audioSession)
      if (audioSessionRef.current === audioSession) audioSessionRef.current = null
      setState((current) => ({ ...current, playing: false }))
    }
    audio.onerror = () => {
      releaseExclusiveAudio(audioSession)
      if (audioSessionRef.current === audioSession) audioSessionRef.current = null
      setState((current) => ({
        ...current,
        requestKey,
        error: 'Voice audio could not play. Read the caption instead.',
        playing: false,
      }))
    }

    try {
      setState((current) => ({ ...current, requestKey, error: null, playing: true }))
      void audio.play().catch(() => {
        releaseExclusiveAudio(audioSession)
        if (audioSessionRef.current === audioSession) audioSessionRef.current = null
        setState((current) => ({
          ...current,
          requestKey,
          error: 'Press play again if your browser blocked audio.',
          playing: false,
        }))
      })
    } catch {
      releaseExclusiveAudio(audioSession)
      if (audioSessionRef.current === audioSession) audioSessionRef.current = null
      setState((current) => ({
        ...current,
        requestKey,
        error: 'Press play again if your browser blocked audio.',
        playing: false,
      }))
    }
  }, [requestKey])

  const play = useCallback(async () => {
    const cachedResponse = responseRef.current?.requestKey === requestKey
      ? responseRef.current.response
      : null
    if (cachedResponse) {
      playResponse(cachedResponse)
      return
    }

    const nextResponse = await loadClip()
    playResponse(nextResponse)
  }, [loadClip, playResponse, requestKey])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    if (audioSessionRef.current !== null) {
      releaseExclusiveAudio(audioSessionRef.current)
      audioSessionRef.current = null
    }
    setState((current) => ({ ...current, playing: false }))
  }, [])

  return {
    caption: isCurrentRequest ? state.caption : null,
    error: isCurrentRequest ? state.error : null,
    loading: isCurrentRequest ? state.loading : false,
    playing: isCurrentRequest ? state.playing : false,
    status: isCurrentRequest ? state.status : 'idle',
    pause,
    play,
  }
}
