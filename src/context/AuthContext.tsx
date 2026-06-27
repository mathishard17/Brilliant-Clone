import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import {
  getAuthErrorMessage,
  onAuthChange,
  signIn as authSignIn,
  signOut as authSignOut,
  signUp as authSignUp,
} from '../services/auth'
import { loadProfileForSession } from '../services/userProgress'
import type { UserProfile } from '../types/user'
import { AuthContext } from './auth-context'
import type { ThemePreference } from '../themes/themeTypes'

const PROFILE_LOAD_ERROR_MESSAGE =
  "We couldn't load your progress. Check your connection and try again."

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [authenticating, setAuthenticating] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)
  const hadUserRef = useRef(false)
  const manualAuthRef = useRef(false)

  const loading = initializing || profileLoading

  const loadProfile = useCallback(async (uid: string): Promise<UserProfile | null> => {
    setProfileError(null)
    setProfileLoading(true)
    try {
      const data = await loadProfileForSession(uid)
      if (!data) {
        setProfile(null)
        setProfileError(PROFILE_LOAD_ERROR_MESSAGE)
        return null
      }
      setProfile(data)
      return data
    } catch (err) {
      setProfile(null)
      setProfileError(getAuthErrorMessage(err))
      return null
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    await loadProfile(user.uid)
  }, [user, loadProfile])

  useEffect(() => {
    const unsubscribe = onAuthChange(async (nextUser) => {
      setError(null)

      if (!nextUser) {
        if (hadUserRef.current) {
          setSessionMessage('Your session ended — please log in again')
        }
        hadUserRef.current = false
        setUser(null)
        setProfile(null)
        setProfileError(null)
        setProfileLoading(false)
        setInitializing(false)
        return
      }

      hadUserRef.current = true
      setUser(nextUser)

      // signIn/signUp load the profile themselves; skip here to avoid a
      // duplicate fetch and a transient "missing profile" race during signup.
      if (manualAuthRef.current) {
        setInitializing(false)
        return
      }

      await loadProfile(nextUser.uid)
      setInitializing(false)
    })

    return unsubscribe
  }, [loadProfile])

  const signUp = useCallback(
    async (
      username: string,
      password: string,
      princessName: string,
      themePreference: ThemePreference = 'royal',
    ) => {
      setError(null)
      setSessionMessage(null)
      setAuthenticating(true)
      manualAuthRef.current = true
      try {
        const credential = await authSignUp(username, password, princessName, themePreference)
        setUser(credential.user)
        hadUserRef.current = true
        await loadProfile(credential.user.uid)
      } catch (err) {
        setError(getAuthErrorMessage(err))
        throw err
      } finally {
        manualAuthRef.current = false
        setAuthenticating(false)
      }
    },
    [loadProfile],
  )

  const signIn = useCallback(
    async (username: string, password: string) => {
      setError(null)
      setSessionMessage(null)
      setAuthenticating(true)
      manualAuthRef.current = true
      try {
        const credential = await authSignIn(username, password)
        setUser(credential.user)
        hadUserRef.current = true
        await loadProfile(credential.user.uid)
      } catch (err) {
        setError(getAuthErrorMessage(err))
        throw err
      } finally {
        manualAuthRef.current = false
        setAuthenticating(false)
      }
    },
    [loadProfile],
  )

  const signOut = useCallback(async () => {
    setError(null)
    setProfileError(null)
    setSessionMessage(null)
    await authSignOut()
    setProfile(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])
  const clearSessionMessage = useCallback(() => setSessionMessage(null), [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      authenticating,
      error,
      profileError,
      sessionMessage,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      setProfile,
      clearError,
      clearSessionMessage,
    }),
    [
      user,
      profile,
      loading,
      authenticating,
      error,
      profileError,
      sessionMessage,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      clearError,
      clearSessionMessage,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
