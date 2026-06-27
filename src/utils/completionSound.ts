import { claimExclusiveAudio, releaseExclusiveAudio } from './exclusiveAudio'

type BrowserAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

const TADA_NOTES = [
  { frequency: 523.25, start: 0, duration: 0.1 },
  { frequency: 659.25, start: 0.08, duration: 0.12 },
  { frequency: 783.99, start: 0.16, duration: 0.14 },
  { frequency: 1046.5, start: 0.3, duration: 0.32 },
] as const

function playNote(audioContext: AudioContext, output: AudioNode, frequency: number, start: number, duration: number) {
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const startTime = audioContext.currentTime + start
  const endTime = startTime + duration

  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(0.22, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

  oscillator.connect(gain)
  gain.connect(output)
  oscillator.start(startTime)
  oscillator.stop(endTime + 0.02)
}

export function playCompletionTada() {
  const AudioContextConstructor =
    window.AudioContext ?? (window as BrowserAudioWindow).webkitAudioContext

  if (!AudioContextConstructor) return

  const audioContext = new AudioContextConstructor()
  let closed = false
  function closeAudioContext() {
    if (closed) return
    closed = true
    void audioContext.close()
  }

  const audioSession = claimExclusiveAudio(closeAudioContext)
  const masterGain = audioContext.createGain()

  masterGain.gain.setValueAtTime(0.35, audioContext.currentTime)
  masterGain.connect(audioContext.destination)

  for (const note of TADA_NOTES) {
    playNote(audioContext, masterGain, note.frequency, note.start, note.duration)
  }

  window.setTimeout(() => {
    releaseExclusiveAudio(audioSession)
    closeAudioContext()
  }, 900)
}
