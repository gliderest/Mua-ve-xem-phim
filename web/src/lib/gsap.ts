import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/** Tôn trọng prefers-reduced-motion */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scroll-reveal cho các element có [data-reveal].
 * Chỉ chạy 1 lần, dùng ScrollTrigger, không lắng nghe scroll thủ công.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) {
      el?.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-revealed'))
      return
    }
    const targets = el.querySelectorAll('[data-reveal]')
    if (targets.length === 0) return

    const ctx = gsap.context(() => {
      targets.forEach((target, i) => {
        gsap.to(target, {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay: Math.min(i * 0.06, 0.6),
          ease: 'power3.out',
          scrollTrigger: {
            trigger: target as HTMLElement,
            start: 'top 88%',
          },
        })
      })
    }, el)
    // Refresh sau khi DOM hoàn chỉnh (phim vừa load)
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 160)

    return () => {
      window.clearTimeout(t)
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps])
}

/** Page transition nhẹ: fade + translate */
export function usePageEnter(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      )
    }, el)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}