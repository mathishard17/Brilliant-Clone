import { normalizeUsername } from './outfitKeys'

export const DEV_USERNAME = 'sophia'

export function isDevUser(username: string): boolean {
  return normalizeUsername(username) === DEV_USERNAME
}

export function showDevNav(username: string): boolean {
  return import.meta.env.DEV && isDevUser(username)
}
