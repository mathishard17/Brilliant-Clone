import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { loginBodyLogin, loginBodySignup, loginHeading } from '../copy/login'
import { normalizeUsername } from '../utils/outfitKeys'
import type { ThemePreference } from '../themes/themeTypes'

const USERNAME_PATTERN = /^[a-z0-9_]+$/
const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'royal', label: 'Royal / Princess' },
  { value: 'space', label: 'Space Academy' },
  { value: 'dinosaurs', label: 'Dinosaurs' },
  { value: 'animals', label: 'Animals' },
  { value: 'sports', label: 'Sports' },
  { value: 'surprise', label: 'Surprise me' },
]

export function PrincessRegistry() {
  const { signUp, signIn, error, clearError, authenticating, sessionMessage, clearSessionMessage } =
    useAuth()
  const [mode, setMode] = useState<'signup' | 'login'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [princessName, setPrincessName] = useState('')
  const [themePreference, setThemePreference] = useState<ThemePreference>('royal')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errors: Record<string, string> = {}
    const trimmedUsername = username.trim()

    if (!trimmedUsername) {
      errors.username = 'Username is required.'
    } else if (trimmedUsername.length < 3) {
      errors.username = 'Username must be at least 3 characters.'
    } else if (!USERNAME_PATTERN.test(normalizeUsername(trimmedUsername))) {
      errors.username = 'Use only letters, numbers, and underscores.'
    }

    if (!password) {
      errors.password = 'Password is required.'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }

    if (mode === 'signup') {
      const trimmedName = princessName.trim()
      if (!trimmedName) {
        errors.princessName = 'Display name is required.'
      } else if (trimmedName.length < 2) {
        errors.princessName = 'Display name must be at least 2 characters.'
      } else if (trimmedName.length > 40) {
        errors.princessName = 'Display name must be 40 characters or fewer.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    clearError()
    clearSessionMessage()
    if (!validate()) return

    setSubmitting(true)
    try {
      const normalized = normalizeUsername(username.trim())
      if (mode === 'signup') {
        await signUp(normalized, password, princessName.trim(), themePreference)
      } else {
        await signIn(normalized, password)
      }
    } catch {
      // Error surfaced via AuthContext
    } finally {
      setSubmitting(false)
    }
  }

  function handleUsernameChange(value: string) {
    setUsername(value.toLowerCase())
  }

  return (
    <section className="screen-placeholder registry card">
      <h1 className="heading-display">{loginHeading()}</h1>
      <p>{mode === 'login' ? loginBodyLogin() : loginBodySignup()}</p>

      <div className="registry__tabs">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => {
            setMode('login')
            clearError()
            clearSessionMessage()
            setFieldErrors({})
          }}
        >
          Log In
        </button>
        <button
          type="button"
          className={mode === 'signup' ? 'active' : ''}
          onClick={() => {
            setMode('signup')
            clearError()
            clearSessionMessage()
            setFieldErrors({})
          }}
        >
          Create Account
        </button>
      </div>

      <form className="registry__form" onSubmit={handleSubmit} noValidate>
        <label>
          Username
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
          />
          {fieldErrors.username && (
            <span className="field-error">{fieldErrors.username}</span>
          )}
        </label>

        <label>
          Password
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          {fieldErrors.password && (
            <span className="field-error">{fieldErrors.password}</span>
          )}
        </label>

        {mode === 'signup' && (
          <>
            <label>
              What display name would you like to use?
              <input
                type="text"
                className="form-input"
                value={princessName}
                onChange={(e) => setPrincessName(e.target.value)}
                placeholder="e.g. Sophia the Solver"
                maxLength={40}
              />
              {fieldErrors.princessName && (
                <span className="field-error">{fieldErrors.princessName}</span>
              )}
            </label>

            <label>
              What kind of adventure do you like?
              <select
                className="form-input"
                value={themePreference}
                onChange={(e) => setThemePreference(e.target.value as ThemePreference)}
              >
                {THEME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {sessionMessage && <p className="session-banner">{sessionMessage}</p>}
        {error && <p className="error-banner">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting || authenticating}>
          {authenticating
            ? 'One moment…'
            : mode === 'signup'
              ? 'Create Account & Enter 🔑'
              : 'Log In 🔑'}
        </button>
      </form>
    </section>
  )
}
