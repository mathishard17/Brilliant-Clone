import type { ReactNode } from 'react'
import type {
  ClickthroughMiniLesson as ClickthroughMiniLessonData,
  ClickthroughMiniLessonPage,
} from '../types/lesson'
import { LessonButton } from './LessonButton'

interface ClickthroughMiniLessonProps<Page extends ClickthroughMiniLessonPage> {
  miniLesson: Pick<ClickthroughMiniLessonData<Page>, 'pages'>
  currentPageIndex: number
  onPageChange: (nextPageIndex: number) => void | Promise<void>
  onComplete: () => void | Promise<void>
  renderPage: (page: Page, pageIndex: number) => ReactNode
  backLabel?: string
  completeLabel?: string
  contentClassName?: string
  getPageLabel?: (page: Page, pageIndex: number, totalPages: number) => ReactNode
  navClassName?: string
  nextLabel?: string
  showDots?: boolean
  showNext?: (page: Page, pageIndex: number) => boolean
}

export function ClickthroughMiniLesson<Page extends ClickthroughMiniLessonPage>({
  miniLesson,
  currentPageIndex,
  onPageChange,
  onComplete,
  renderPage,
  backLabel = 'Back',
  completeLabel = 'Done',
  contentClassName,
  getPageLabel,
  navClassName = 'clickthrough-mini-lesson__nav',
  nextLabel = 'Next',
  showDots = false,
  showNext = () => true,
}: ClickthroughMiniLessonProps<Page>) {
  const totalPages = miniLesson.pages.length
  if (totalPages === 0) return null

  const pageIndex = Math.min(Math.max(currentPageIndex, 0), totalPages - 1)
  const page = miniLesson.pages[pageIndex]
  const isLastPage = pageIndex === totalPages - 1
  const shouldShowNext = showNext(page, pageIndex)

  function handleBack() {
    if (pageIndex > 0) {
      void onPageChange(pageIndex - 1)
    }
  }

  function handleNext() {
    if (isLastPage) {
      void onComplete()
    } else {
      void onPageChange(pageIndex + 1)
    }
  }

  return (
    <>
      {getPageLabel && (
        <div className="clickthrough-mini-lesson__page-label">
          {getPageLabel(page, pageIndex, totalPages)}
        </div>
      )}

      <div className={contentClassName}>{renderPage(page, pageIndex)}</div>

      <div className={navClassName}>
        {pageIndex > 0 && (
          <LessonButton
            label={page.backLabel ?? backLabel}
            variant="secondary"
            onClick={handleBack}
          />
        )}
        {shouldShowNext && (
          <LessonButton
            label={page.nextLabel ?? (isLastPage ? completeLabel : nextLabel)}
            onClick={handleNext}
          />
        )}
      </div>

      {showDots && (
        <p
          className="clickthrough-mini-lesson__dots"
          aria-label={`Step ${pageIndex + 1} of ${totalPages}`}
        >
          {miniLesson.pages.map((dotPage, dotIndex) => (
            <span
              key={dotPage.id}
              className={`clickthrough-mini-lesson__dot${dotIndex <= pageIndex ? ' clickthrough-mini-lesson__dot--active' : ''}`}
            />
          ))}
        </p>
      )}
    </>
  )
}
