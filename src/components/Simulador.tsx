/**
 * ===== CÓPIA FIEL DA PRODUÇÃO =====
 * Origem: Framer > Directcon Consórcios > SImuladorCartaCredito.tsx (codeFile/PTzoeHV)
 * Nome exportado: SimuladorUnified.
 * Usado em: /imovel (9), /veiculo (3), /reforma-e-construcao (3), /pesados (3).
 * Em /sobre-consorcio e /consorcio-vs-financiamento existem instâncias soltas no canvas,
 * fora dos frames de breakpoint: não estão no ar e por isso não contam aqui.
 *
 * Nenhum default foi reescrito: todo control que difere do default varia de página
 * para página, então fixar um valor só deixaria o arquivo errado em algum lugar.
 * DIVERGE por página: valorLabel, valorPlaceholder, prazoOverride, esconderFGTS,
 *                     sliderMáx, sliderPasso, cTATexto
 * Props exatas por instância: ver props.md da pasta de cada página.
 * =======================================
 */
import {
    useEffect,
    useId,
    useMemo,
    useState,
    type ChangeEvent,
    type CSSProperties,
} from "react"


interface SelectField {
    label: string
    placeholder: string
    options: string[]
}

interface EscolhaField {
    show: boolean
    label: string
    simLabel: string
    naoLabel: string
    padrao: "sim" | "nao"
}

interface SimuladorProps {
    valorLabel: string
    valorPlaceholder: string
    prazo: SelectField
    prazoOptionsOverride: string
    estrategia: SelectField
    escolha: EscolhaField
    escondeFgts: boolean
    sliderMin: number
    sliderMax: number
    sliderStep: number
    sliderDefaultValue: number
    accentColor: string
    surfaceColor: string
    textColor: string
    valueColor: string
    borderColor: string
    padding: number
    fieldGap: number
    fontFamily: string
    showCta: boolean
    ctaLabel: string
    ctaLink: string
    onValueChange?: (value: number) => void
    onCtaTap?: () => void
}

const STYLE_ID = "simulador-carta-styles"

const CSS = `
.sim-carta input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    border-radius: 8px;
    outline: none;
    cursor: pointer;
    /* deixa o scroll vertical passar; o arrasto horizontal é do slider */
    touch-action: pan-y;
}
.sim-carta input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 28px;
    background: #FFFFFF;
    border-radius: 4px;
    border: 1px solid #020E1E;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.15s ease-out;
}
/* só onde existe cursor de verdade: no toque, hover fica grudado depois do tap */
@media (hover: hover) and (pointer: fine) {
    .sim-carta input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.1);
    }
}
.sim-carta input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(0.95);
}
@media (prefers-reduced-motion: reduce) {
    .sim-carta input[type="range"]::-webkit-slider-thumb,
    .sim-carta input[type="range"]::-moz-range-thumb { transition-duration: 0.01ms !important; }
}
.sim-carta input[type="range"]::-moz-range-thumb {
    width: 12px;
    height: 28px;
    background: #FFFFFF;
    border-radius: 4px;
    border: 1px solid #020E1E;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}
.sim-carta input[type="range"]:focus-visible {
    outline: 2px solid var(--sim-accent);
    outline-offset: 4px;
    border-radius: 6px;
}
.sim-carta input[type="radio"] {
    accent-color: var(--sim-accent);
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
}
.sim-carta input::placeholder {
    color: currentColor;
    opacity: 0.55;
}
`

function normalizeKey(value: unknown): string {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
}

function normalizeFontFamily(value: unknown): string {
    if (typeof value !== "string") return ""
    const trimmed = value.trim()
    if (!trimmed) return ""
    const key = normalizeKey(trimmed)
    if (key === "inherit" || key === "padraodoprojeto") return ""
    return trimmed
}

function toFontFamilyStack(value: string): string | undefined {
    if (!value) return undefined
    const fallback =
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    const key = normalizeKey(value)
    if (key === "neuehaasgroteskdisplaypro") {
        return `"Neue Haas Grotesk Display Pro", ${fallback}`
    }
    return value.includes(" ")
        ? `"${value}", ${fallback}`
        : `${value}, ${fallback}`
}

function formatNumberBR(value: number): string {
    return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
}

function onlyDigits(value: string): number | null {
    const digits = value.replace(/\D/g, "")
    if (!digits) return null
    const parsed = Number(digits)
    return Number.isFinite(parsed) ? parsed : null
}

/** Preto ou branco, o que tiver mais contraste com a cor de fundo. */
function readableTextOn(background: string): string {
    const hex = String(background ?? "").trim()
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex)
    if (!match) return "#111111"
    let value = match[1]
    if (value.length === 3)
        value = value
            .split("")
            .map((c) => c + c)
            .join("")
    const r = parseInt(value.slice(0, 2), 16) / 255
    const g = parseInt(value.slice(2, 4), 16) / 255
    const b = parseInt(value.slice(4, 6), 16) / 255
    const lin = (c: number) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    return luminance > 0.45 ? "#111111" : "#F5F5F5"
}

function cleanOptions(options: unknown): string[] {
    if (!Array.isArray(options)) return []
    return options
        .map((option) => String(option ?? "").trim())
        .filter((option) => option.length > 0)
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SimuladorUnified(props: SimuladorProps) {
    const {
        valorLabel = "Valor da carta",
        valorPlaceholder = "350.000",
        prazo,
        prazoOptionsOverride = "",
        estrategia,
        escolha,
        escondeFgts = false,
        sliderMin = 50000,
        sliderMax = 5000000,
        sliderStep = 1000,
        sliderDefaultValue = 350000,
        accentColor = "#F2B324",
        surfaceColor = "transparent",
        textColor = "#F5F5F5",
        valueColor = "#CCCCCC",
        borderColor = "#EEEEEE",
        padding = 0,
        fieldGap = 24,
        fontFamily = "inherit",
        showCta = true,
        ctaLabel = "Falar com Especialista",
        ctaLink = "",
        onCtaTap,
    } = props

    const uid = useId()
    const fontStack = useMemo(
        () => toFontFamilyStack(normalizeFontFamily(fontFamily)),
        [fontFamily]
    )

    // `prazo` e `escolha` são ControlType.Object aninhados: o agente de
    // edição do projeto não consegue escrever neles (nem valor completo, nem
    // path, nem null). `prazoOptionsOverride` e `escondeFgts` são controles
    // simples (string/boolean) que o agente sabe setar por instância, usados
    // só quando uma página precisa de opções diferentes das do painel Prazo.
    const overrideOptions = cleanOptions(
        prazoOptionsOverride
            ? prazoOptionsOverride.split(",").map((option) => option.trim())
            : []
    )
    const prazoField: SelectField = {
        label: prazo?.label ?? "Prazo",
        placeholder: prazo?.placeholder ?? "Selecione",
        options:
            overrideOptions.length > 0
                ? overrideOptions
                : cleanOptions(prazo?.options),
    }
    const estrategiaField: SelectField = {
        label: estrategia?.label ?? "Estratégia de lance",
        placeholder: estrategia?.placeholder ?? "Selecione",
        options: cleanOptions(estrategia?.options),
    }
    const escolhaField: EscolhaField = {
        show: escondeFgts ? false : escolha?.show ?? true,
        label: escolha?.label ?? "Usar FGTS como lance?",
        simLabel: escolha?.simLabel ?? "Sim",
        naoLabel: escolha?.naoLabel ?? "Não",
        padrao: escolha?.padrao === "nao" ? "nao" : "sim",
    }

    useEffect(() => {
        if (typeof document === "undefined") return
        if (document.getElementById(STYLE_ID)) return
        const style = document.createElement("style")
        style.id = STYLE_ID
        style.textContent = CSS
        document.head.appendChild(style)
    }, [])

    const clampedDefault = useMemo(() => {
        const max = Math.max(sliderMin, sliderMax)
        return Math.min(max, Math.max(sliderMin, sliderDefaultValue))
    }, [sliderMin, sliderMax, sliderDefaultValue])

    const [valorCarta, setValorCarta] = useState(clampedDefault)
    // Enquanto o campo está em edição, o texto digitado manda; fora dele,
    // quem manda é o número. Evita travar a digitação no mínimo do slider.
    useEffect(() => { props.onValueChange?.(valorCarta) }, [valorCarta, props.onValueChange])
    const [draft, setDraft] = useState<string | null>(null)
    const [prazoValue, setPrazoValue] = useState("")
    const [estrategiaValue, setEstrategiaValue] = useState("")
    const [usarSim, setUsarSim] = useState(escolhaField.padrao === "sim")

    useEffect(() => setValorCarta(clampedDefault), [clampedDefault])
    useEffect(
        () => setUsarSim(escolhaField.padrao === "sim"),
        [escolhaField.padrao]
    )

    const fillPercentage = useMemo(() => {
        const range = sliderMax - sliderMin
        if (range <= 0) return 0
        const pct = ((valorCarta - sliderMin) / range) * 100
        return Math.min(100, Math.max(0, pct))
    }, [sliderMin, sliderMax, valorCarta])

    const labelStyle: CSSProperties = {
        fontSize: 16,
        fontWeight: 500,
        color: textColor,
    }
    const fieldStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    }
    const boxStyle: CSSProperties = {
        width: "100%",
        height: 48,
        boxSizing: "border-box",
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: "0 16px",
        color: valueColor,
        background: "transparent",
        font: "inherit",
        fontSize: 16,
    }
    const optionStyle: CSSProperties = {
        color: "#111111",
        background: "#F5F5F5",
    }

    const renderSelect = (
        id: string,
        field: SelectField,
        value: string,
        onChange: (next: string) => void
    ) => (
        <div style={fieldStyle}>
            <label htmlFor={id} style={labelStyle}>
                {field.label}
            </label>
            {/* A setinha nativa do select é desenhada colada na borda direita e
                ignora o padding — por isso ela é desligada e redesenhada aqui. */}
            <div style={{ position: "relative", display: "flex" }}>
                <select
                    id={id}
                    value={value}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                        onChange(event.target.value)
                    }
                    style={{
                        ...boxStyle,
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        paddingRight: 44,
                        cursor: "pointer",
                    }}
                >
                    <option value="" disabled style={optionStyle}>
                        {field.placeholder}
                    </option>
                    {field.options.map((option, index) => (
                        <option
                            key={`${option}-${index}`}
                            value={option}
                            style={optionStyle}
                        >
                            {option}
                        </option>
                    ))}
                </select>
                <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        right: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                    }}
                >
                    <path
                        d="M1 1.5 L6 6.5 L11 1.5"
                        stroke={valueColor}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    )

    return (
        <section
            className="sim-carta"
            style={
                {
                    "--sim-accent": accentColor,
                    position: "relative",
                    width: "100%",
                    boxSizing: "border-box",
                    background: surfaceColor,
                    borderRadius: 16,
                    padding,
                    display: "flex",
                    flexDirection: "column",
                    gap: fieldGap,
                    fontFamily: fontStack,
                } as CSSProperties
            }
        >
            <div style={fieldStyle}>
                <label htmlFor={`${uid}-valor`} style={labelStyle}>
                    {valorLabel}
                </label>
                <div
                    style={{
                        ...boxStyle,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span>R$</span>
                    <input
                        id={`${uid}-valor`}
                        inputMode="numeric"
                        value={draft ?? formatNumberBR(valorCarta)}
                        placeholder={valorPlaceholder}
                        onFocus={() => setDraft(formatNumberBR(valorCarta))}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            const parsed = onlyDigits(event.target.value)
                            setDraft(
                                parsed === null ? "" : formatNumberBR(parsed)
                            )
                        }}
                        onBlur={() => {
                            const parsed = onlyDigits(draft ?? "")
                            const max = Math.max(sliderMin, sliderMax)
                            setValorCarta(
                                parsed === null
                                    ? clampedDefault
                                    : Math.min(max, Math.max(sliderMin, parsed))
                            )
                            setDraft(null)
                        }}
                        style={{
                            width: "100%",
                            minWidth: 0,
                            border: "none",
                            padding: 0,
                            background: "transparent",
                            color: "inherit",
                            outline: "none",
                            font: "inherit",
                        }}
                    />
                </div>
                <input
                    type="range"
                    aria-label={valorLabel}
                    min={sliderMin}
                    max={sliderMax}
                    step={sliderStep}
                    value={valorCarta}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setValorCarta(Number(event.target.value))
                        setDraft(null)
                    }}
                    style={{
                        background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${fillPercentage}%, ${borderColor} ${fillPercentage}%, ${borderColor} 100%)`,
                    }}
                />
            </div>

            {renderSelect(
                `${uid}-prazo`,
                prazoField,
                prazoValue,
                setPrazoValue
            )}

            {renderSelect(
                `${uid}-estrategia`,
                estrategiaField,
                estrategiaValue,
                setEstrategiaValue
            )}

            {escolhaField.show ? (
                // <fieldset>/<legend> não serve aqui: a legend é o caption do
                // fieldset, fica fora do fluxo e o gap do flex não vale pra ela.
                <div style={fieldStyle}>
                    <span style={labelStyle}>{escolhaField.label}</span>
                    <div
                        role="radiogroup"
                        aria-label={escolhaField.label}
                        style={{ display: "flex", gap: 24 }}
                    >
                        {[
                            { key: "sim", label: escolhaField.simLabel },
                            { key: "nao", label: escolhaField.naoLabel },
                        ].map((option) => (
                            <label
                                key={option.key}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 16,
                                    color: valueColor,
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="radio"
                                    name={`${uid}-escolha`}
                                    checked={
                                        option.key === "sim"
                                            ? usarSim
                                            : !usarSim
                                    }
                                    onChange={() =>
                                        setUsarSim(option.key === "sim")
                                    }
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>
                </div>
            ) : null}

            {showCta ? (
                <CtaButton
                    label={ctaLabel}
                    link={ctaLink}
                    onTap={onCtaTap}
                    background={accentColor}
                    fontFamily={fontStack}
                />
            ) : null}
        </section>
    )
}

function CtaButton(props: {
    label: string
    link: string
    onTap?: () => void
    background: string
    fontFamily?: string
}) {
    const { label, link, onTap, background, fontFamily } = props
    const style: CSSProperties = {
        display: "inline-flex",
        width: "100%",
        height: 48,
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        borderRadius: 999,
        background,
        color: readableTextOn(background),
        fontSize: 16,
        fontWeight: 500,
        fontFamily: fontFamily || "inherit",
        textDecoration: "none",
        cursor: "pointer",
    }

    if (link) {
        return (
            <>
                <a href={link} style={style} onClick={() => onTap?.()}>
                    {label}
                </a>
            </>
        )
    }

    return (
        <button type="button" onClick={() => onTap?.()} style={style}>
            {label}
        </button>
    )
}
