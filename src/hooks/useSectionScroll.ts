import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/** Router state handed to the home route so it can finish an off-route jump. */
export interface SectionScrollState {
  scrollTo?: string
}

/** In-page navigation is scrollIntoView, never `<a href="#…">` (#104/#147). */
export const scrollToSectionId = (id: string) => {
  const target = document.getElementById(id)
  if (!target) return

  // Section controls behave like navigation, so move keyboard/screen-reader
  // focus to the newly visible content. Preserve any author-provided tabindex.
  if (!target.hasAttribute('tabindex')) target.tabIndex = -1
  target.scrollIntoView({ behavior: 'smooth' })
  target.focus({ preventScroll: true })
}

/**
 * Section-link handler for the header and the global footer. The section ids
 * only exist on the home route, so off-route the control navigates home and
 * hands the target id to HomePage, which scrolls once it has mounted. Without
 * that, every section control is silently dead on `/designs/:slug`.
 */
export function useSectionScroll() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return useCallback(
    (id: string) => {
      if (pathname === '/') {
        scrollToSectionId(id)
        return
      }
      const state: SectionScrollState = { scrollTo: id }
      navigate('/', { state })
    },
    [navigate, pathname],
  )
}
