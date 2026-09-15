/**
 * ===== CÓPIA FIEL DA PRODUÇÃO =====
 * Origem: Framer > Directcon Consórcios > BarsContainerLoadOverride.tsx (codeFile/ocenfMj)
 * withBarsContainerLoadSequence aplicado no container das barras em:
 * / (3), /sobre-a-directcon (3), /tese-da-directcon (3).
 * Anda junto com withWaveBarsLoadSequence (WaveBarsLoadOverride.tsx).
 * Override não tem property controls: o arquivo é idêntico ao que está no ar.
 * =======================================
 */
// Create a Framer code override export for an existing canvas FrameNode named `bars-container` that animates its four direct child bar columns in a progressive bottom-anchored chart-loading sequence, fades in each descendant `bar-label` right after its own bar completes, toca uma única vez na primeira entrada em viewport (sem replay), shortens rhythm on phone widths, respects prefers-reduced-motion, preserves canvas structure/layout/styling, and remains attachable as a runtime override.
import {
    ComponentType,
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react"

type InlineSnapshot = {
    transform: string
    transformOrigin: string
    willChange: string
    opacity: string
    transition: string
}

function snapshotStyles(element: HTMLElement): InlineSnapshot {
    return {
        transform: element.style.transform,
        transformOrigin: element.style.transformOrigin,
        willChange: element.style.willChange,
        opacity: element.style.opacity,
        transition: element.style.transition,
    }
}

function restoreStyles(element: HTMLElement, snapshot: InlineSnapshot) {
    element.style.transform = snapshot.transform
    element.style.transformOrigin = snapshot.transformOrigin
    element.style.willChange = snapshot.willChange
    element.style.opacity = snapshot.opacity
    element.style.transition = snapshot.transition
}

function isBarCandidate(element: HTMLElement): boolean {
    const framerName = (element.getAttribute("data-framer-name") || "").toLowerCase()
    const className = (typeof element.className === "string" ? element.className : "").toLowerCase()

    if (framerName.includes("bar") && !framerName.includes("label")) return true
    if (className.includes("bar")) return true
    return false
}

export function withBarsContainerLoadSequence(Component: ComponentType): ComponentType {
    return forwardRef(function WithBarsContainerLoadSequence(props: any, ref) {
        const localRef = useRef<HTMLElement | null>(null)
        const cleanupTimersRef = useRef<number[]>([])
        const activeAnimationsRef = useRef<Animation[]>([])
        const barSnapshotsRef = useRef<Map<HTMLElement, InlineSnapshot>>(new Map())
        const labelSnapshotsRef = useRef<Map<HTMLElement, InlineSnapshot>>(new Map())
        const hasPlayedRef = useRef(false)
        const entranceDelay = Math.max(0, Number(props?.["data-chart-delay"]) || 0)

        const timingPreset = useMemo(() => {
            if (typeof window !== "undefined" && window.matchMedia("(max-width: 809px)").matches) {
                return {
                // Sincroniza a última coluna com a última onda em 1.289s.
                    barDuration: 0.528,
                    stagger: 0.2536,
                    labelDuration: 0.11,
                    ease: "cubic-bezier(0.23, 1, 0.32, 1)",
                }
            }

            return {
                // Sincroniza a última coluna com a última onda em 1.299s.
                barDuration: 0.4992,
                stagger: 0.266666666,
                labelDuration: 0.14,
                ease: "cubic-bezier(0.23, 1, 0.32, 1)",
            }
        }, [props?.style?.width])

        const clearActiveWork = useCallback(() => {
            cleanupTimersRef.current.forEach(timerId => {
                if (typeof window !== "undefined") window.clearTimeout(timerId)
            })
            cleanupTimersRef.current = []

            activeAnimationsRef.current.forEach(animation => animation.cancel())
            activeAnimationsRef.current = []
        }, [])

        const getBarsAndLabels = useCallback(() => {
            const root = localRef.current
            if (!root) return { bars: [] as HTMLElement[], labelsByBar: new Map<HTMLElement, HTMLElement | null>() }

            const directChildren = Array.from(root.children).filter(
                (child): child is HTMLElement => child instanceof HTMLElement
            )

            const barsWithLabel = directChildren.filter(child => {
                const label = child.querySelector(`[data-framer-name="bar-label"]`)
                return label instanceof HTMLElement
            })
            const bars = barsWithLabel.length > 0 ? barsWithLabel : directChildren.filter(isBarCandidate)

            const labelsByBar = new Map<HTMLElement, HTMLElement | null>()
            bars.forEach(bar => {
                const label = bar.querySelector(`[data-framer-name="bar-label"]`)
                labelsByBar.set(bar, label instanceof HTMLElement ? label : null)
            })

            return { bars, labelsByBar }
        }, [])

        const ensureSnapshots = useCallback((bars: HTMLElement[], labelsByBar: Map<HTMLElement, HTMLElement | null>) => {
            bars.forEach(bar => {
                if (!barSnapshotsRef.current.has(bar)) {
                    barSnapshotsRef.current.set(bar, snapshotStyles(bar))
                }
                const label = labelsByBar.get(bar)
                if (label && !labelSnapshotsRef.current.has(label)) {
                    labelSnapshotsRef.current.set(label, snapshotStyles(label))
                }
            })
        }, [])

        const setInitialHiddenState = useCallback(() => {
            const { bars, labelsByBar } = getBarsAndLabels()
            if (bars.length === 0) return
            ensureSnapshots(bars, labelsByBar)

            bars.forEach(bar => {
                bar.style.transformOrigin = "50% 100%"
                bar.style.transform = "scaleY(0)"
                bar.style.willChange = "transform"
            })

            labelsByBar.forEach(label => {
                if (!label) return
                label.style.opacity = "0"
                label.style.willChange = "opacity"
            })
        }, [ensureSnapshots, getBarsAndLabels])

        const showFinalStateImmediately = useCallback(() => {
            const { bars, labelsByBar } = getBarsAndLabels()
            if (bars.length === 0) return
            ensureSnapshots(bars, labelsByBar)

            bars.forEach(bar => {
                bar.style.transformOrigin = "50% 100%"
                bar.style.transform = "scaleY(1)"
                bar.style.willChange = ""
            })

            labelsByBar.forEach(label => {
                if (!label) return
                label.style.opacity = "1"
                label.style.willChange = ""
            })
        }, [ensureSnapshots, getBarsAndLabels])

        const playSequence = useCallback(() => {
            const { bars, labelsByBar } = getBarsAndLabels()
            if (bars.length === 0) return
            setInitialHiddenState()

            bars.forEach((bar, index) => {
                const delay = index * timingPreset.stagger
                const barAnimation = bar.animate(
                    [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }],
                    {
                        duration: timingPreset.barDuration * 1000,
                        delay: delay * 1000,
                        easing: timingPreset.ease,
                        fill: "forwards",
                    }
                )
                activeAnimationsRef.current.push(barAnimation)

                const label = labelsByBar.get(bar)
                if (!label) return

                const labelTimer = window.setTimeout(() => {
                    const labelAnimation = label.animate(
                        [{ opacity: 0 }, { opacity: 1 }],
                        {
                            duration: timingPreset.labelDuration * 1000,
                            easing: "ease-out",
                            fill: "forwards",
                        }
                    )
                    activeAnimationsRef.current.push(labelAnimation)
                }, (delay + timingPreset.barDuration) * 1000)

                cleanupTimersRef.current.push(labelTimer)
            })
        }, [getBarsAndLabels, setInitialHiddenState, timingPreset])

        const restoreSnapshots = useCallback(() => {
            const { bars, labelsByBar } = getBarsAndLabels()

            bars.forEach(bar => {
                const snapshot = barSnapshotsRef.current.get(bar)
                if (snapshot) restoreStyles(bar, snapshot)
            })

            labelsByBar.forEach(label => {
                if (!label) return
                const snapshot = labelSnapshotsRef.current.get(label)
                if (snapshot) restoreStyles(label, snapshot)
            })
        }, [getBarsAndLabels])

        useEffect(() => {
            if (typeof window === "undefined") return
            const root = localRef.current
            if (!root) return

            const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
            let prefersReducedMotion = reducedMotionQuery.matches

            const onReducedMotionChange = (event: MediaQueryListEvent) => {
                prefersReducedMotion = event.matches
                clearActiveWork()
                if (prefersReducedMotion || hasPlayedRef.current) showFinalStateImmediately()
                else setInitialHiddenState()
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

                    // Entrada única: depois de tocar, as colunas e os labels
                    // ficam no estado final e o observer é desligado.
                    hasPlayedRef.current = true
                    observer.unobserve(root)

                    clearActiveWork()
                    if (prefersReducedMotion) {
                        showFinalStateImmediately()
                    } else {
                        setInitialHiddenState()
                        const entranceTimer = window.setTimeout(playSequence, entranceDelay)
                        cleanupTimersRef.current.push(entranceTimer)
                    }
                },
                { threshold: 0.2 }
            )

            observer.observe(root)

            if (prefersReducedMotion || hasPlayedRef.current) showFinalStateImmediately()
            else setInitialHiddenState()

            return () => {
                observer.disconnect()
                clearActiveWork()
                restoreSnapshots()

                if (typeof reducedMotionQuery.removeEventListener === "function") {
                    reducedMotionQuery.removeEventListener("change", onReducedMotionChange)
                } else if (typeof reducedMotionQuery.removeListener === "function") {
                    reducedMotionQuery.removeListener(onReducedMotionChange)
                }
            }
        }, [
            clearActiveWork,
            entranceDelay,
            playSequence,
            restoreSnapshots,
            setInitialHiddenState,
            showFinalStateImmediately,
        ])

        const setRefs = useCallback(
            (node: HTMLElement | null) => {
                localRef.current = node
                if (typeof ref === "function") ref(node)
                else if (ref && typeof ref === "object") (ref as { current: HTMLElement | null }).current = node
            },
            [ref]
        )

        return <Component ref={setRefs} {...props} />
    }) as ComponentType
}
