type BrowserAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

let audioContext: AudioContext | null = null
let lastPlayedAt = 0

interface RgbColor {
  r: number
  g: number
  b: number
}

function getAudioContext(): AudioContext | null {
  const AudioContextConstructor =
    window.AudioContext ?? (window as BrowserAudioWindow).webkitAudioContext

  if (!AudioContextConstructor) return null
  audioContext ??= new AudioContextConstructor()
  return audioContext
}

function parseHexColor(value: string): RgbColor | null {
  const hex = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1]
  if (!hex) return null

  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : hex

  const color = Number.parseInt(normalized, 16)
  if (!Number.isFinite(color)) return null

  return {
    r: (color >> 16) & 255,
    g: (color >> 8) & 255,
    b: color & 255,
  }
}

function parseRgbColor(value: string): RgbColor | null {
  const channels = value
    .trim()
    .match(/^rgba?\(([^)]+)\)$/i)?.[1]
    ?.split(',')
    .slice(0, 3)
    .map((channel) => Number.parseFloat(channel.trim()))

  if (!channels || channels.length !== 3 || channels.some((channel) => !Number.isFinite(channel))) {
    return null
  }

  const [r, g, b] = channels
  return { r, g, b }
}

function getHue({ r, g, b }: RgbColor) {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min

  if (delta === 0) return 190

  let hue: number
  if (max === red) {
    hue = ((green - blue) / delta) % 6
  } else if (max === green) {
    hue = (blue - red) / delta + 2
  } else {
    hue = (red - green) / delta + 4
  }

  return (hue * 60 + 360) % 360
}

function getThemeHue(source?: Element) {
  if (!source) return 190

  const style = window.getComputedStyle(source)
  const themeColor =
    style.getPropertyValue('--node-neon') ||
    style.getPropertyValue('--schema-neon') ||
    style.getPropertyValue('--theme-accent')

  const color = parseHexColor(themeColor) ?? parseRgbColor(themeColor)
  return color ? getHue(color) : 190
}

function getThemeTapFrequency(source?: Element) {
  const pentatonicSteps = [0, 2, 4, 7, 9] as const
  const step = pentatonicSteps[Math.floor(getThemeHue(source) / 72)] ?? 0

  return 174.61 * 2 ** (step / 12)
}

function createNoiseBuffer(context: AudioContext, duration: number) {
  const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration))
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < sampleCount; i += 1) {
    const progress = i / sampleCount
    data[i] = (Math.random() * 2 - 1) * (1 - progress) ** 2
  }

  return buffer
}

export function playButtonTapSound(source?: Element) {
  const now = performance.now()
  if (now - lastPlayedAt < 45) return
  lastPlayedAt = now

  try {
    const context = getAudioContext()
    if (!context) return
    if (context.state === 'suspended') void context.resume()

    const start = context.currentTime
    const end = start + 0.085
    const rootFrequency = getThemeTapFrequency(source)
    const masterGain = context.createGain()
    const toneFilter = context.createBiquadFilter()
    const tone = context.createOscillator()
    const shimmer = context.createOscillator()
    const noise = context.createBufferSource()
    const noiseFilter = context.createBiquadFilter()
    const noiseGain = context.createGain()

    masterGain.gain.setValueAtTime(0.0001, start)
    masterGain.gain.exponentialRampToValueAtTime(0.052, start + 0.01)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, end)

    toneFilter.type = 'lowpass'
    toneFilter.frequency.setValueAtTime(1800, start)
    toneFilter.Q.setValueAtTime(0.6, start)

    tone.type = 'sine'
    tone.frequency.setValueAtTime(rootFrequency, start)
    tone.frequency.exponentialRampToValueAtTime(rootFrequency * 0.92, end)

    shimmer.type = 'sine'
    shimmer.frequency.setValueAtTime(rootFrequency * 2.01, start)
    shimmer.frequency.exponentialRampToValueAtTime(rootFrequency * 1.88, end)

    noise.buffer = createNoiseBuffer(context, 0.026)
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(1450, start)
    noiseFilter.Q.setValueAtTime(0.85, start)
    noiseGain.gain.setValueAtTime(0.012, start)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.032)

    tone.connect(toneFilter)
    shimmer.connect(toneFilter)
    toneFilter.connect(masterGain)
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(masterGain)
    masterGain.connect(context.destination)

    tone.start(start)
    shimmer.start(start + 0.006)
    noise.start(start)
    tone.stop(end + 0.01)
    shimmer.stop(end + 0.01)
    noise.stop(start + 0.035)
  } catch {
    // Button sounds are decorative; never block the click path.
  }
}
