import { lazy, Suspense } from 'react'
import type { User } from 'firebase/auth'
import { useAuth } from '../hooks/useAuth'
import { useUserProgress } from '../hooks/useUserProgress'
import { LessonProvider } from '../context/LessonContext'
import type { ScreenNumber, UserProfile } from '../types/user'
import { showDevNav } from '../utils/devMode'
import { LoadingSpinner } from './LoadingSpinner'
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
        <div className="app-header__actions">
          {screen !== 0 && (
            <button type="button" className="app-header__home-btn" onClick={() => void updateScreen(0)}>
              Home
            </button>
          )}
          {saving && <span className="app-header__saving">Saving…</span>}
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

      <main>
        <Suspense fallback={<LoadingSpinner label="Opening lesson…" />}>
          {renderScreen()}
        </Suspense>
      </main>

      {showDevNav(localProfile.username) && (
        <footer className="dev-nav">
          <p>Dev: jump to screen (sophia only)</p>
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

export function AppShell() {
  const { user, profile, loading, sessionMessage } = useAuth()

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
      ) : (
        <PrincessRegistry />
      )}
    </div>
  )
}
