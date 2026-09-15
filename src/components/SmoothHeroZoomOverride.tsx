/**
 * ===== CÓPIA FIEL DA PRODUÇÃO =====
 * Origem: Framer > Directcon Consórcios > SmoothHeroZoomOverride.tsx (codeFile/jcMRTBu)
 * withSmoothHeroZoom aplicado em: / (3), /imovel (3), /veiculo (3).
 * Override não tem property controls: o arquivo é idêntico ao que está no ar.
 * =======================================
 */
// Create a Framer code override named withSmoothHeroZoom for a full-bleed hero background layer. Preserve all canvas-defined fill, layout, sizing, clipping, and passed props; only add transform-related runtime behavior. Use IntersectionObserver with threshold 0.5: when >=50% visible, animate scale from 1 to 1.05 over 10s with a very smooth linear/ease-in-out transition; when <50% visible, animate back to scale 1 over 5s. Do not loop, do not restart while still visible, do not affect hero text/children. Set transform-origin center center. Respect prefers-reduced-motion by keeping scale(1). Keep as a code override export.
import {
    ComponentType,
    forwardRef,
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"

export function withSmoothHeroZoom(Component: ComponentType): ComponentType {
    const displayName = Component.displayName || Component.name || "Component"

    const Wrapped = forwardRef(function WithSmoothHeroZoom(props: any, ref) {
        const localRef = useRef<HTMLElement | null>(null)
        const [isInView, setIsInView] = useState(false)
        const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

        useEffect(() => {
            if (
                typeof window === "undefined" ||
                typeof window.matchMedia !== "function"
            )
                return

            const mediaQuery = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            )
            startTransition(() => {
                setPrefersReducedMotion(mediaQuery.matches)
            })

            const onChange = (event: MediaQueryListEvent) => {
                startTransition(() => {
                    setPrefersReducedMotion(event.matches)
                })
            }

            if (typeof mediaQuery.addEventListener === "function") {
                mediaQuery.addEventListener("change", onChange)
            } else if (typeof mediaQuery.addListener === "function") {
                mediaQuery.addListener(onChange)
            }

            return () => {
                if (typeof mediaQuery.removeEventListener === "function") {
                    mediaQuery.removeEventListener("change", onChange)
                } else if (typeof mediaQuery.removeListener === "function") {
                    mediaQuery.removeListener(onChange)
                }
            }
        }, [])

        useEffect(() => {
            if (typeof window === "undefined") return
            const node = localRef.current
            if (!node || typeof IntersectionObserver === "undefined") return

            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0]
                    if (!entry) return
                    const nextInView = entry.intersectionRatio >= 0.5
                    startTransition(() => {
                        setIsInView((prev) =>
                            prev === nextInView ? prev : nextInView
                        )
                    })
                },
                { threshold: 0.5 }
            )

            observer.observe(node)
            return () => observer.disconnect()
        }, [])

        const transitionValue = useMemo(() => {
            if (prefersReducedMotion) return "transform 0s linear"
            return isInView
                ? "transform 10s cubic-bezier(0.42, 0, 0.58, 1)"
                : "transform 5s cubic-bezier(0.42, 0, 0.58, 1)"
        }, [isInView, prefersReducedMotion])

        const transformValue = useMemo(() => {
            if (prefersReducedMotion) return "scale(1)"
            return isInView ? "scale(1.05)" : "scale(1)"
        }, [isInView, prefersReducedMotion])

        const mergedTransform = useMemo(() => {
            const baseTransform =
                props?.style &&
                typeof props.style === "object" &&
                typeof props.style.transform === "string"
                    ? props.style.transform
                    : ""

            if (!baseTransform) return transformValue
            return `${baseTransform} ${transformValue}`
        }, [props?.style, transformValue])

        const setRefs = useCallback(
            (node: HTMLElement | null) => {
                localRef.current = node
                if (typeof ref === "function") ref(node)
                else if (ref && typeof ref === "object")
                    (ref as { current: HTMLElement | null }).current = node
            },
            [ref]
        )

        const mergedTransition = useMemo(() => {
            const baseTransition =
                props?.style &&
                typeof props.style === "object" &&
                typeof props.style.transition === "string"
                    ? props.style.transition
                    : ""

            if (!baseTransition) return transitionValue
            if (/\b(transform|all)\b/i.test(baseTransition)) {
                return transitionValue
            }
            return `${baseTransition}, ${transitionValue}`
        }, [props?.style, transitionValue])

        const mergedWillChange = useMemo(() => {
            const baseWillChange =
                props?.style &&
                typeof props.style === "object" &&
                typeof props.style.willChange === "string"
                    ? props.style.willChange
                    : ""

            if (!baseWillChange) return "transform"
            if (baseWillChange.includes("transform")) return baseWillChange
            return `${baseWillChange}, transform`
        }, [props?.style])

        return (
            <Component
                ref={setRefs}
                {...props}
                style={{
                    ...props.style,
                    transformOrigin: "center center",
                    transform: mergedTransform,
                    transition: mergedTransition,
                    willChange: mergedWillChange,
                }}
            />
        )
    })

    Wrapped.displayName = `withSmoothHeroZoom(${displayName})`
    return Wrapped as ComponentType
}
