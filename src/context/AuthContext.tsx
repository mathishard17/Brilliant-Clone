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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [authenticating, setAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)
  const hadUserRef = useRef(false)

  const loading = initializing || (user !== null && profile === null)

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const data = await loadProfileForSession(user.uid)
    setProfile(data)
  }, [user])

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
        setInitializing(false)
        return
      }

      hadUserRef.current = true
      setUser(nextUser)

      try {
        const data = await loadProfileForSession(nextUser.uid)
        setProfile(data)
      } catch (err) {
        setError(getAuthErrorMessage(err))
        setProfile(null)
      } finally {
        setInitializing(false)
      }
    })

    return unsubscribe
  }, [])

  const signUp = useCallback(
    async (username: string, password: string, princessName: string) => {
      setError(null)
      setSessionMessage(null)
      setAuthenticating(true)
      try {
        const credential = await authSignUp(username, password, princessName)
        const data = await loadProfileForSession(credential.user.uid)
        setUser(credential.user)
        setProfile(data)
        hadUserRef.current = true
      } catch (err) {
        setError(getAuthErrorMessage(err))
        throw err
      } finally {
        setAuthenticating(false)
      }
    },
    [],
  )

  const signIn = useCallback(async (username: string, password: string) => {
    setError(null)
    setSessionMessage(null)
    setAuthenticating(true)
    try {
      const credential = await authSignIn(username, password)
      const data = await loadProfileForSession(credential.user.uid)
      setUser(credential.user)
      setProfile(data)
      hadUserRef.current = true
    } catch (err) {
      setError(getAuthErrorMessage(err))
      throw err
    } finally {
      setAuthenticating(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
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
