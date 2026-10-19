"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ContentEffects() {
  const pathname = usePathname()
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)")
    const article =
      /^\/blog\/[^/]+/.test(pathname) || pathname.startsWith("/preview/")
    const scope = document.querySelector(".site-shell")
    if (!scope || reduced.matches) return
    const surfaces = [
      ...scope.querySelectorAll<HTMLElement>(".blog-surface"),
    ].filter(
      (node) =>
        !node.matches(".reading-surface,.table-of-contents,.blog-toolbar"),
    )
    const tokens = getComputedStyle(document.documentElement)
    const duration =
      Number.parseFloat(tokens.getPropertyValue("--blog-duration-long")) * 1000
    const easing = tokens.getPropertyValue("--blog-ease").trim()
    const tilt = Number(tokens.getPropertyValue("--blog-tilt-range"))
    let observer: IntersectionObserver | undefined
    if (!article && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) {
              entry.target.animate(
                [
                  {
                    opacity: 0.35,
                    transform: "translateY(var(--blog-reveal-distance))",
                  },
                  { opacity: 1, transform: "translateY(0)" },
                ],
                { duration, easing },
              )
              observer?.unobserve(entry.target)
            }
        },
        { threshold: 0.08 },
      )
      for (const surface of surfaces) observer.observe(surface)
    }
    let frame = 0
    let target: HTMLElement | null = null
    const reset = () => {
      cancelAnimationFrame(frame)
      target?.style.removeProperty("--card-rotate-x")
      target?.style.removeProperty("--card-rotate-y")
      target = null
    }
    const move = (event: PointerEvent) => {
      if (!fine.matches || reduced.matches || article) return
      const card = (event.target as HTMLElement).closest<HTMLElement>(
        ".blog-surface",
      )
      if (!card || !surfaces.includes(card)) return reset()
      if (target !== card) reset()
      target = card
      const { clientX, clientY } = event
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = card.getBoundingClientRect()
        card.style.setProperty(
          "--card-rotate-x",
          `${(0.5 - (clientY - box.top) / box.height) * tilt}deg`,
        )
        card.style.setProperty(
          "--card-rotate-y",
          `${((clientX - box.left) / box.width - 0.5) * tilt}deg`,
        )
      })
    }
    scope.addEventListener("pointermove", move as EventListener)
    scope.addEventListener("pointerleave", reset)
    scope.addEventListener("focusout", reset)
    return () => {
      observer?.disconnect()
      reset()
      scope.removeEventListener("pointermove", move as EventListener)
      scope.removeEventListener("pointerleave", reset)
      scope.removeEventListener("focusout", reset)
    }
  }, [pathname])
  return null
}
