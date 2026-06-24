import { lazy, Suspense } from 'react'
import type { User } from 'firebase/auth'
import { useAuth } from '../hooks/useAuth'
import { useUserProgress } from '../hooks/useUserProgress'
import { LessonProvider } from '../context/LessonContext'
import type { ScreenNumber, UserProfile } from '../types/user'
import { showDevNav } from '../utils/devMode'
import { LoadingSpinner } from './LoadingSpinner'
import { LessonProgressBar } from './LessonProgressBar'
import { PrincessRegistry } from '../screens/PrincessRegistry'

const HomeHub = lazy(() =>
  import('../screens/HomeHub').then((m) => ({ default: m.HomeHub })),
)
const DressingRoom = lazy(() =>
  import('../screens/DressingRoom').then((m) => ({ default: m.DressingRoom })),
)
const AnchorTrickLesson = lazy(() =>
  import('../screens/AnchorTrickLesson').then((m) => ({ default: m.AnchorTrickLesson })),
)
const ShoesChallenge = lazy(() =>
  import('../screens/ShoesChallenge').then((m) => ({ default: m.ShoesChallenge })),
)
const LessonSummary = lazy(() =>
  import('../screens/LessonSummary').then((m) => ({ default: m.LessonSummary })),
)

const SCREENS: ScreenNumber[] = [0, 1, 2, 3, 4]

interface AuthenticatedAppProps {
  user: User
  profile: UserProfile
}

function AuthenticatedApp({ user, profile }: AuthenticatedAppProps) {
  const { signOut, setProfile } = useAuth()

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

  function renderScreen() {
    switch (screen) {
      case 0:
        return <HomeHub princessName={princessName} />
      case 1:
        return <DressingRoom princessName={princessName} />
      case 2:
        return <AnchorTrickLesson princessName={princessName} />
      case 3:
        return <ShoesChallenge princessName={princessName} />
      case 4:
        return <LessonSummary princessName={princessName} />
      default:
        return <HomeHub princessName={princessName} />
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

      {screen >= 1 && screen <= 4 && (
        <LessonProgressBar step={screen} completed={localProfile.lesson.completed} />
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
            {SCREENS.map((s) => (
              <button
                key={s}
                type="button"
                className={screen === s ? 'active' : ''}
                onClick={() => void updateScreen(s)}
              >
                {s === 0 ? 'Hub' : `Screen ${s}`}
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

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="app-shell app-container">
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
