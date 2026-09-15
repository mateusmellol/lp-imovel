/**
 * ===== CÓPIA FIEL DA PRODUÇÃO =====
 * Origem: Framer > Directcon Consórcios > WaveBarsLoadOverride.tsx (codeFile/RgBcbcR)
 * withWaveBarsLoadSequence aplicado em: / (6), /sobre-a-directcon (6), /tese-da-directcon (6).
 * Anda junto com withBarsContainerLoadSequence (BarsContainerLoadOverride.tsx).
 * Override não tem property controls: o arquivo é idêntico ao que está no ar.
 * =======================================
 */
// Create a new Framer runtime code override export in a new file for the existing canvas FrameNode named `bars-container` selected as `tmlDHWgtm`. This is a code override, not a new code component. Keep the existing canvas layers fully editable and do not restructure them.
import { ComponentType, forwardRef, useCallback, useEffect, useRef } from "react"

type StyleSnapshot = {
    transform: string
    transformOrigin: string
    willChange: string
    filter: string
}

function captureSnapshot(element: HTMLElement): StyleSnapshot {
    return {
        transform: element.style.transform,
        transformOrigin: element.style.transformOrigin,
        willChange: element.style.willChange,
        filter: element.style.filter,
    }
}

function restoreSnapshot(element: HTMLElement, snapshot: StyleSnapshot) {
    element.style.transform = snapshot.transform
    element.style.transformOrigin = snapshot.transformOrigin
    element.style.willChange = snapshot.willChange
    element.style.filter = snapshot.filter
}

function isBarCandidate(element: HTMLElement): boolean {
    const framerName = (element.getAttribute("data-framer-name") || "").toLowerCase()
    const className = (typeof element.className === "string" ? element.className : "").toLowerCase()

    if (framerName.includes("bar") && !framerName.includes("label")) return true
    if (className.includes("bar")) return true
    return false
}

function readBars(root: HTMLElement | null): HTMLElement[] {
    if (!root) return []
    const directChildren = Array.from(root.children).filter(
        (node): node is HTMLElement => node instanceof HTMLElement
    )

    const barsWithLabel = directChildren.filter(child => {
        const label = child.querySelector(`[data-framer-name="bar-label"]`)
        return label instanceof HTMLElement
    })

    if (barsWithLabel.length > 0) return barsWithLabel
    return directChildren.filter(isBarCandidate)
}

function isPhoneWidth(): boolean {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
    return window.matchMedia("(max-width: 809px)").matches
}

export function withWaveBarsLoadSequence(Component: ComponentType): ComponentType {
    return forwardRef(function WithWaveBarsLoadSequence(props: any, ref) {
        const rootRef = useRef<HTMLElement | null>(null)
        const activeAnimationsRef = useRef<Animation[]>([])
        const activeTimersRef = useRef<number[]>([])
        const barSnapshotsRef = useRef<Map<HTMLElement, StyleSnapshot>>(new Map())
        const hasPlayedRef = useRef(false)
        const entranceDelay = Math.max(0, Number(props?.["data-chart-delay"]) || 0)

        const clearRuntimeWork = useCallback(() => {
            activeTimersRef.current.forEach(timerId => {
                if (typeof window !== "undefined") window.clearTimeout(timerId)
            })
            activeTimersRef.current = []

            activeAnimationsRef.current.forEach(animation => animation.cancel())
            activeAnimationsRef.current = []
        }, [])

        const snapshotBarsIfNeeded = useCallback((bars: HTMLElement[]) => {
            bars.forEach(bar => {
                if (!barSnapshotsRef.current.has(bar)) {
                    barSnapshotsRef.current.set(bar, captureSnapshot(bar))
                }
            })
        }, [])

        const setCollapsedState = useCallback(() => {
            const bars = readBars(rootRef.current)
            if (bars.length === 0) return
            snapshotBarsIfNeeded(bars)

            bars.forEach(bar => {
                bar.style.transformOrigin = "50% 100%"
                bar.style.transform = "scaleY(0)"
                bar.style.filter = ""
                bar.style.willChange = "transform"
            })
        }, [snapshotBarsIfNeeded])

        const setFinalState = useCallback(() => {
            const bars = readBars(rootRef.current)
            if (bars.length === 0) return
            snapshotBarsIfNeeded(bars)

            bars.forEach(bar => {
                bar.style.transformOrigin = "50% 100%"
                bar.style.transform = "scaleY(1)"
                bar.style.filter = ""
                bar.style.willChange = ""
            })
        }, [snapshotBarsIfNeeded])

        const playWaveSequence = useCallback(() => {
            const bars = readBars(rootRef.current)
            if (bars.length === 0) return

            setCollapsedState()

            const phone = isPhoneWidth()
            // Mantém o crescimento de cada barra no ritmo das colunas, mas
            // sincroniza a última onda com a última coluna.
            const startWindow = phone ? 0.9088 : 0.8592
            const minDuration = phone ? 0.38 : 0.44
            const maxDuration = minDuration
            const denominator = Math.max(1, bars.length - 1)

            bars.forEach((bar, index) => {
                const progress = index / denominator
                const delay = startWindow * Math.pow(progress, 1.35)
                const duration = minDuration + (maxDuration - minDuration) * Math.pow(progress, 1.1)

                const growAnimation = bar.animate(
                    [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
                    {
                        duration: duration * 1000,
                        delay: delay * 1000,
                        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                        fill: "forwards",
                    }
                )
                activeAnimationsRef.current.push(growAnimation)

                const cleanupTimer = window.setTimeout(() => {
                    bar.style.willChange = ""
                }, (delay + duration + 0.03) * 1000)
                activeTimersRef.current.push(cleanupTimer)
            })
        }, [setCollapsedState])

        const restoreBars = useCallback(() => {
            const bars = readBars(rootRef.current)
            bars.forEach(bar => {
                const snapshot = barSnapshotsRef.current.get(bar)
                if (snapshot) restoreSnapshot(bar, snapshot)
            })
        }, [])

        useEffect(() => {
            if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return
            const root = rootRef.current
            if (!root) return

            const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
            let prefersReducedMotion = reducedMotionQuery.matches

            const onReducedMotionChange = (event: MediaQueryListEvent) => {
                prefersReducedMotion = event.matches
                clearRuntimeWork()
                if (prefersReducedMotion || hasPlayedRef.current) setFinalState()
                else setCollapsedState()
            }

            if (typeof reducedMotionQuery.addEventListener === "function") {
                reducedMotionQuery.addEventListener("change", onReducedMotionChange)
            } else if (typeof reducedMotionQuery.addListener === "function") {
                reducedMotionQuery.addListener(onReducedMotionChange)
            }

            const observer = new IntersectionObserver(
                entries => {
                    const entry = entries[0]
                    if (!entry) return

                    if (!entry.isIntersecting) return
                    if (hasPlayedRef.current) {
                        observer.unobserve(root)
                        return
                    }

                    // Entrada única: depois de tocar, as barras ficam no estado
                    // final e o observer é desligado (sem replay no re-scroll).
                    hasPlayedRef.current = true
                    observer.unobserve(root)

                    clearRuntimeWork()
                    if (prefersReducedMotion) setFinalState()
                    else {
                        setCollapsedState()
                        const entranceTimer = window.setTimeout(playWaveSequence, entranceDelay)
                        activeTimersRef.current.push(entranceTimer)
                    }
                },
                { threshold: 0.2 }
            )

            observer.observe(root)

            if (prefersReducedMotion || hasPlayedRef.current) setFinalState()
            else setCollapsedState()

            return () => {
                observer.disconnect()
                clearRuntimeWork()
                restoreBars()

                if (typeof reducedMotionQuery.removeEventListener === "function") {
                    reducedMotionQuery.removeEventListener("change", onReducedMotionChange)
                } else if (typeof reducedMotionQuery.removeListener === "function") {
                    reducedMotionQuery.removeListener(onReducedMotionChange)
                }
            }
        }, [
            clearRuntimeWork,
            entranceDelay,
            playWaveSequence,
            restoreBars,
            setCollapsedState,
            setFinalState,
        ])

        const setRefs = useCallback(
            (node: HTMLElement | null) => {
                rootRef.current = node
                if (typeof ref === "function") ref(node)
                else if (ref && typeof ref === "object") (ref as { current: HTMLElement | null }).current = node
            },
            [ref]
        )

        return <Component ref={setRefs} {...props} />
    }) as ComponentType
}
