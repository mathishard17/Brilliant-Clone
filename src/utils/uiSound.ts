type BrowserAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

let audioContext: AudioContext | null = null
let lastPlayedAt = 0

function getAudioContext(): AudioContext | null {
  const AudioContextConstructor =
    window.AudioContext ?? (window as BrowserAudioWindow).webkitAudioContext

  if (!AudioContextConstructor) return null
  audioContext ??= new AudioContextConstructor()
  return audioContext
}

export function playButtonTapSound() {
  const now = performance.now()
  if (now - lastPlayedAt < 45) return
  lastPlayedAt = now

  try {
    const context = getAudioContext()
    if (!context) return

    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const start = context.currentTime
    const end = start + 0.055

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(620, start)
    oscillator.frequency.exponentialRampToValueAtTime(820, end)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.08, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, end)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(start)
    oscillator.stop(end + 0.01)
  } catch {
    // Button sounds are decorative; never block the click path.
  }
}
