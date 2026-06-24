import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Unsubscribe,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { createUserProfile, checkUsernameAvailable } from './userProgress'
import { normalizeUsername } from '../utils/outfitKeys'

const AUTH_EMAIL_DOMAIN = import.meta.env.VITE_AUTH_EMAIL_DOMAIN ?? 'brilliant-clone.local'

export function toAuthEmail(username: string): string {
  return `${normalizeUsername(username)}@${AUTH_EMAIL_DOMAIN}`
}

export async function signUp(
  username: string,
  password: string,
  princessName: string,
): Promise<UserCredential> {
  const normalized = normalizeUsername(username)

  const available = await checkUsernameAvailable(normalized)
  if (!available) {
    throw new Error('That username is already taken — try another!')
  }

  const credential = await createUserWithEmailAndPassword(
    auth,
    toAuthEmail(normalized),
    password,
  )

  try {
    await createUserProfile(credential.user.uid, normalized, princessName.trim())
  } catch (error) {
    await deleteUser(credential.user)
    throw error
  }

  return credential
}

export async function signIn(
  username: string,
  password: string,
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, toAuthEmail(username), password)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback)
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as Error & { code?: string }).code
    if (code === 'auth/email-already-in-use') {
      return 'That username is already taken — try another!'
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return "Hmm, that username or password doesn't match. Try again!"
    }
    if (code === 'auth/user-not-found') {
      return "Hmm, that username or password doesn't match. Try again!"
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters.'
    }
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
