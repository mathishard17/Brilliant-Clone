import { lazy, Suspense, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { useAuth } from '../hooks/useAuth'
import { useUserProgress } from '../hooks/useUserProgress'
import { LessonProvider } from '../context/LessonContext'
import type { ScreenNumber, UserProfile } from '../types/user'
import { getLessonDefinition } from '../lessons/registry'
import { showDevNav } from '../utils/devMode'
import { LoadingSpinner } from './LoadingSpinner'
import { LessonProgressBar } from './LessonProgressBar'
import { PrincessRegistry } from '../screens/PrincessRegistry'
import { lesson1ThemeStyle, resolveLesson1Theme } from '../themes/themeResolver'
import { getThemedLessonDisplay } from '../screens/homeHubDisplay'
import { updateUserProfile } from '../services/userProgress'
import { playButtonTapSound } from '../utils/uiSound'

const HomeHub = lazy(() =>
  import('../screens/HomeHub').then((m) => ({ default: m.HomeHub })),
)

interface AuthenticatedAppProps {
  user: User
  profile: UserProfile
}

function AuthenticatedApp({ user, profile }: AuthenticatedAppProps) {
  const { signOut, setProfile } = useAuth()
  const [voiceSaving, setVoiceSaving] = useState(false)

  const {
    profile: localProfile,
    updateScreen,
    updateLesson,
    recordOutfitPair,
    recordOutfitTriple,
    saving,
    saveError,
    dismissSaveError,
  } = useUserProgress({
    uid: user.uid,
    profile,
    onProfileChange: setProfile,
  })

  const screen = localProfile.lesson.currentScreen as ScreenNumber
  const princessName = localProfile.princessName
  const lessonDefinition = getLessonDefinition(localProfile.activeLessonId)
  const activeTheme = resolveLesson1Theme(localProfile.themePreference, localProfile.themePacks)
  const lessonDisplay = getThemedLessonDisplay(
    lessonDefinition,
    activeTheme,
    localProfile.themePreference,
  )
  const lessonScreens: ScreenNumber[] = Array.from(
    { length: lessonDefinition.progressSteps.length },
    (_, i) => i + 1,
  )
  const devScreens: ScreenNumber[] = [0, ...lessonScreens]

  function renderScreen() {
    if (screen === 0) {
      return <HomeHub princessName={princessName} />
    }
    const LessonScreen = lessonDefinition.screens[screen]
    return LessonScreen ? <LessonScreen princessName={princessName} /> : <HomeHub princessName={princessName} />
  }

  async function handleVoiceToggle() {
    if (voiceSaving) return
    const previous = localProfile
    const nextProfile = { ...localProfile, voiceEnabled: !localProfile.voiceEnabled }
    setVoiceSaving(true)
    setProfile(nextProfile)
    try {
      await updateUserProfile(user.uid, { voiceEnabled: nextProfile.voiceEnabled })
    } catch {
      setProfile(previous)
    } finally {
      setVoiceSaving(false)
    }
  }

  return (
    <LessonProvider
      value={{
        profile: localProfile,
        updateScreen,
        updateLesson,
        recordOutfitPair,
        recordOutfitTriple,
        saving,
        saveError,
        dismissSaveError,
      }}
    >
      <header className="app-header">
        <span className="app-header__name">{princessName}</span>
        {saving && <span className="app-header__saving">Saving…</span>}
        <div className="app-header__actions">
          {screen !== 0 && (
            <button type="button" className="app-header__home-btn" onClick={() => void updateScreen(0)}>
              Home
            </button>
          )}
          <button
            type="button"
            className={`app-header__voice-btn${localProfile.voiceEnabled ? ' app-header__voice-btn--on' : ''}`}
            onClick={() => void handleVoiceToggle()}
            aria-pressed={localProfile.voiceEnabled}
            disabled={voiceSaving}
          >
            {voiceSaving ? 'Saving voice...' : localProfile.voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
          <button type="button" onClick={() => signOut()}>
            Sign Out
          </button>
        </div>
      </header>

      {saveError && (
        <div className="error-banner error-banner--dismissible">
          <span>{saveError}</span>
          <button type="button" onClick={dismissSaveError} aria-label="Dismiss save error">
            ✕
          </button>
        </div>
      )}

      {lessonScreens.includes(screen) && (
        <div className="lesson-chrome">
          <p className="lesson-chrome__title">
            <span aria-hidden="true">{lessonDisplay.emoji}</span> {lessonDisplay.title}
          </p>
          <LessonProgressBar
            step={screen}
            completed={localProfile.lesson.completed}
            steps={lessonDefinition.progressSteps}
          />
        </div>
      )}

      <main>
        <Suspense fallback={<LoadingSpinner label="Opening lesson…" />}>
          {renderScreen()}
        </Suspense>
      </main>

      {showDevNav(localProfile.username) && (
        <footer className="dev-nav">
          <p>Dev: jump to screen</p>
          <div className="dev-nav__buttons">
            {devScreens.map((s) => (
              <button
                key={s}
                type="button"
                className={screen === s ? 'active' : ''}
                onClick={() => void updateScreen(s)}
              >
                {s === 0 ? 'Hub' : `Section ${s}`}
              </button>
            ))}
          </div>
        </footer>
      )}
    </LessonProvider>
  )
}

interface ProfileLoadErrorProps {
  message: string | null
  onRetry: () => void
  onSignOut: () => void
}

function ProfileLoadError({ message, onRetry, onSignOut }: ProfileLoadErrorProps) {
  return (
    <section className="screen-placeholder card" role="alert">
      <h1 className="heading-display">Oops!</h1>
      <p>{message ?? "We couldn't load your progress. Please try again."}</p>
      <div className="app-header__actions">
        <button type="button" className="btn-primary" onClick={onRetry}>
          Try Again
        </button>
        <button type="button" onClick={onSignOut}>
          Sign Out
        </button>
      </div>
    </section>
  )
}

export function AppShell() {
  const { user, profile, loading, sessionMessage, profileError, refreshProfile, signOut } =
    useAuth()

  useEffect(() => {
    function handleButtonClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      const button = target.closest('button')
      if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return
      playButtonTapSound()
    }

    document.addEventListener('click', handleButtonClick, { capture: true })
    return () => document.removeEventListener('click', handleButtonClick, { capture: true })
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  const activeTheme = profile ? resolveLesson1Theme(profile.themePreference, profile.themePacks) : null

  return (
    <div
      className={`app-shell app-container${activeTheme ? ' app-shell--themed' : ''}`}
      style={activeTheme ? lesson1ThemeStyle(activeTheme) : undefined}
    >
      {sessionMessage && !user && (
        <p className="session-banner" role="status">
          {sessionMessage}
        </p>
      )}
      {user && profile ? (
        <AuthenticatedApp key={user.uid} user={user} profile={profile} />
      ) : user ? (
        <ProfileLoadError
          message={profileError}
          onRetry={() => void refreshProfile()}
          onSignOut={() => void signOut()}
        />
      ) : (
        <PrincessRegistry />
      )}
    </div>
  )
}
