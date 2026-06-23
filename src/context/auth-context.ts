import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { UserProfile } from '../types/user'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  authenticating: boolean
  error: string | null
  sessionMessage: string | null
  signUp: (username: string, password: string, princessName: string) => Promise<void>
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  setProfile: (profile: UserProfile | null) => void
  clearError: () => void
  clearSessionMessage: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
