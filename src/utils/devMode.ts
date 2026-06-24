import { normalizeUsername } from './outfitKeys'

const DEV_USERNAME = normalizeUsername(import.meta.env.VITE_DEV_USERNAME ?? '')

export function isDevUser(username: string): boolean {
  if (!DEV_USERNAME) return false
  return normalizeUsername(username) === DEV_USERNAME
}

export function showDevNav(username: string): boolean {
  return import.meta.env.DEV && isDevUser(username)
}
