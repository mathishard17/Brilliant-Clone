import { useCallback, useRef, useState } from 'react'
import { getVoiceClipAudio } from '../services/voiceGeneration'
import { getVoiceClip, type VoiceClipRequest, type VoiceClipResponse, type VoiceClipStatus } from '../voice'
import { useLesson } from './useLesson'
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
  const { clipKey, lessonId, themePreference } = request
  const activeTheme = resolveLesson1Theme(profile.themePreference, profile.themePacks)
  const requestClip = getVoiceClip(clipKey, activeTheme)
  const requestKey = `${lessonId}:${clipKey}:${themePreference}:${requestClip?.scriptHash ?? 'missing'}`
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
    const nextResponse = await getVoiceClipAudio({ lessonId, clipKey, themePreference }, activeTheme)
    responseRef.current = { requestKey, response: nextResponse }
    setState((current) => ({
      ...current,
      requestKey,
      caption: nextResponse.caption,
      loading: false,
      status: nextResponse.status,
    }))
    return nextResponse
  }, [activeTheme, clipKey, lessonId, requestKey, themePreference])

  const play = useCallback(async () => {
    const nextResponse = await loadClip()
    if (!nextResponse.audioUrl) {
      setState((current) => ({
        ...current,
        requestKey,
        caption: nextResponse.caption,
        error: 'Voice audio is not ready yet. Read the caption instead.',
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
      await audio.play()
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
  }, [loadClip, requestKey])

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
