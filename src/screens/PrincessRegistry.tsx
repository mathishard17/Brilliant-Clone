import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import { loginCopy } from '../copy/login'
import { normalizeUsername } from '../utils/outfitKeys'
import type { ThemePreference } from '../themes/themeTypes'

type RegistryMode = keyof typeof loginCopy.body

const USERNAME_PATTERN = /^[a-z0-9_]+$/
const MODE_TABS: { value: RegistryMode; label: string }[] = [
  { value: 'login', label: 'Log In' },
  { value: 'signup', label: 'Create Account' },
]
const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'royal', label: 'Royal / Princess' },
  { value: 'space', label: 'Space' },
  { value: 'dinosaurs', label: 'Dinosaurs' },
  { value: 'animals', label: 'Animals' },
  { value: 'sports', label: 'Sports' },
  { value: 'surprise', label: 'Surprise me' },
]

export function PrincessRegistry() {
  const { signUp, signIn, error, clearError, authenticating, sessionMessage, clearSessionMessage } =
    useAuth()
  const [mode, setMode] = useState<RegistryMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [themePreference, setThemePreference] = useState<ThemePreference>('royal')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const isBusy = submitting || authenticating

  function resetMessages() {
    clearError()
    clearSessionMessage()
    setFieldErrors({})
  }

  function clearFieldError(field: string) {
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function handleModeChange(nextMode: RegistryMode) {
    setMode(nextMode)
    resetMessages()
  }

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
      const trimmedName = displayName.trim()
      if (!trimmedName) {
        errors.displayName = 'Display name is required.'
      } else if (trimmedName.length < 2) {
        errors.displayName = 'Display name must be at least 2 characters.'
      } else if (trimmedName.length > 40) {
        errors.displayName = 'Display name must be 40 characters or fewer.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    resetMessages()
    if (!validate()) return

    setSubmitting(true)
    try {
      const normalized = normalizeUsername(username.trim())
      if (mode === 'signup') {
        await signUp(normalized, password, displayName.trim(), themePreference)
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
    clearFieldError('username')
  }

  return (
    <section className="screen-placeholder registry card">
      <p className="registry__eyebrow">Schemas adventure</p>
      <h1 className="heading-display">{loginCopy.heading}</h1>
      <p>{loginCopy.body[mode]}</p>

      <div className="registry__schema-strip" aria-label="Learning schemas preview">
        <span className="registry__schema-node registry__schema-node--lit" />
        <span className="registry__schema-line" />
        <span className="registry__schema-node" />
        <span className="registry__schema-line" />
        <span className="registry__schema-node registry__schema-node--future" />
      </div>
      <p className="registry__schema-note">
        Sign in to light up math dots, unlock paths, and keep your progress glowing.
      </p>

      <div className="registry__tabs">
        {MODE_TABS.map((tab) => (
          <button
            type="button"
            key={tab.value}
            className={mode === tab.value ? 'active' : ''}
            onClick={() => handleModeChange(tab.value)}
            disabled={isBusy}
            aria-pressed={mode === tab.value}
          >
            {tab.label}
          </button>
        ))}
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
            disabled={isBusy}
            aria-invalid={fieldErrors.username ? true : undefined}
            aria-describedby={fieldErrors.username ? 'registry-username-error' : undefined}
          />
          {fieldErrors.username && (
            <span id="registry-username-error" className="field-error">
              {fieldErrors.username}
            </span>
          )}
        </label>

        <label>
          Password
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearFieldError('password')
            }}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            disabled={isBusy}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={fieldErrors.password ? 'registry-password-error' : undefined}
          />
          {fieldErrors.password && (
            <span id="registry-password-error" className="field-error">
              {fieldErrors.password}
            </span>
          )}
        </label>

        {mode === 'signup' && (
          <>
            <label>
              What display name would you like to use?
              <input
                type="text"
                className="form-input"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value)
                  clearFieldError('displayName')
                }}
                placeholder="e.g. Sophia the Solver"
                maxLength={40}
                autoComplete="name"
                disabled={isBusy}
                aria-invalid={fieldErrors.displayName ? true : undefined}
                aria-describedby={fieldErrors.displayName ? 'registry-display-name-error' : undefined}
              />
              {fieldErrors.displayName && (
                <span id="registry-display-name-error" className="field-error">
                  {fieldErrors.displayName}
                </span>
              )}
            </label>

            <label>
              What kind of adventure do you like?
              <select
                className="form-input"
                value={themePreference}
                onChange={(e) => setThemePreference(e.target.value as ThemePreference)}
                disabled={isBusy}
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

        {sessionMessage && (
          <p className="session-banner" role="status">
            {sessionMessage}
          </p>
        )}
        {error && (
          <p className="error-banner" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={isBusy}>
          {authenticating
            ? 'One moment…'
            : mode === 'signup'
              ? 'Create account'
              : 'Log in'}
        </button>
      </form>
    </section>
  )
}
