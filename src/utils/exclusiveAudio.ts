interface ExclusiveAudioSession {
  id: number
  stop: () => void
}

let activeSession: ExclusiveAudioSession | null = null
let nextSessionId = 1

export function claimExclusiveAudio(stop: () => void): number {
  const previousSession = activeSession
  activeSession = null
  previousSession?.stop()

  const id = nextSessionId
  nextSessionId += 1
  activeSession = { id, stop }
  return id
}

export function releaseExclusiveAudio(id: number) {
  if (activeSession?.id === id) {
    activeSession = null
  }
}
