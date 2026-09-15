/**
 * ===== CÓPIA ALINHADA COM PRODUÇÃO =====
 * Origem: Framer > Directcon Consórcios > Adsdasdasasd.tsx (codeFile/ZyZqjgC)
 * Nome exportado: SimuladorLimpo. É este arquivo que está no ar, não o SimuladorLimpo.tsx
 * (codeFile/bdSl6jt), que existe no projeto mas não é usado em nenhuma página.
 * Usado em: / (3), /imovel (3), /veiculo (3), /sobre-consorcio (3), /consorcio-vs-financiamento (3)
 *           — Desktop, Tablet e Phone em cada página.
 *
 * Defaults reescritos para bater com o site:
 *   - consortiumLogo / bankLogo: sem default -> as duas logos usadas em todas as páginas
 *   - consortiumFill "#FFF1D0"    -> var(--token-f2e27a1e-a16a-4601-996b-9c341e3c3b66)
 *   - bankFill       "transparent"-> var(--token-f2e27a1e-a16a-4601-996b-9c341e3c3b66)
 *   - textColor      "#020E1E"    -> var(--token-c03c769f-1cc4-4623-8ff9-3ea53633fdc4)
 *   - mutedColor     "#676E78"    -> var(--token-cdbce535-1d5f-48cf-92ad-0950e010f6de)
 *   - cellPadding    16 -> 14
 *   - contentGap     28 -> 33
 *   - valueFontSize  40 -> 32
 *   - sliderHeight   12 -> 4
 *
 * DIVERGE por página (não dá para fixar num arquivo só):
 *   - fixedMode ("bem"), showModeToggle, rowSuffixFontSize
 * Props exatas por instância: ver props.md da pasta de cada página.
 * =======================================
 */
import {
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
} from "react"


interface MyComponentProps {
    fixedMode: "imovel" | "carro"
    showModeToggle: boolean
    consortiumLogo?: { src?: string; srcSet?: string; alt?: string }
    bankLogo?: { src?: string; srcSet?: string; alt?: string }
    logoHeight: number
    tableRadius: number
    consortiumFill: string
    bankFill: string
    textColor: string
    mutedColor: string
    sliderFillColor: string
    sliderFillSoftColor: string
    cellPadding: number
    contentGap: number
    valueFontSize: number
    rowFontSize: number
    rowSuffixFontSize: number
    sliderHeight: number
    sliderWidth: number
    tableMaxWidth: number
}

const STYLE_ID = "dc-simulador-limpo-styles"

/* Fixos: não mudam entre instâncias, então não ocupam espaço no painel. */
const TRACK_COLOR = "#EAEAEA"
const BORDER_COLOR = "#E3E3E3"
const CONSORTIUM_RATE = "1,20% ao ano"
const LOGO_ALT = {
    cons: "Directcon Consórcios",
    bank: "Financiamento Bancário",
}
const SUFIXO = {
    custo: "de taxa",
    entrada: "de entrada",
    parcela: "por mês",
    total: "no total",
    economia: "de economia",
}

const MODES = {
    imovel: {
        label: "Imóvel",
        slider: { min: 1e5, max: 2e6, step: 1e5, def: 2e5 },
        financ: { meses: 420, rate: 0.01, entradaPct: 0.2 },
        cons: { meses: 200, mult: 1.2 },
    },
    carro: {
        label: "Carro",
        slider: { min: 4e4, max: 4e5, step: 4e4, def: 12e4 },
        financ: { meses: 60, rate: 0.02, entradaPct: 0.2 },
        cons: { meses: 100, mult: 1.15 },
    },
}

const CSS = `
.dc-cmp { width: 100%; }
.dc-cmp *, .dc-cmp *::before, .dc-cmp *::after { box-sizing: border-box; }

.dc-cmp-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    outline: none;
    cursor: pointer;
    touch-action: pan-y;
    /* block tira o espaço de linha de baixo, que desalinhava o trilho */
    display: block;
}
.dc-cmp-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: var(--dc-thumb-h, 28px);
    background: #F5F5F5;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.15s ease-out;
}
@media (hover: hover) and (pointer: fine) {
    .dc-cmp-slider::-webkit-slider-thumb:hover { transform: scale(1.1); }
}
.dc-cmp-slider::-webkit-slider-thumb:active { transform: scale(0.95); }
.dc-cmp-slider::-moz-range-thumb {
    width: 12px;
    height: var(--dc-thumb-h, 28px);
    background: #F5F5F5;
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}
.dc-cmp-slider:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
    border-radius: 6px;
}

.dc-cmp-grid { display: grid; grid-template-columns: 1fr 1fr; }
.dc-cmp-cell { display: flex; flex-direction: column; justify-content: center; }
/* nas linhas de dado o valor e o sufixo dividem a mesma linha */
.dc-cmp-body .dc-cmp-cell { display: block; container-type: inline-size; }
/*
 * Valor e sufixo nunca quebram em duas linhas. O tamanho escolhido no painel é
 * o teto: se a coluna apertar (mobile), a linha encolhe o suficiente pra caber
 * em vez de jogar o sufixo pra baixo. --dc-row-fit vem calculado do componente.
 */
.dc-cmp-line {
    display: block;
    white-space: nowrap;
    font-size: var(--dc-row-fs, 16px);
    font-size: min(var(--dc-row-fs, 16px), var(--dc-row-fit, 9.3cqi));
}
.dc-cmp-cons { align-items: flex-start; text-align: left; }
.dc-cmp-bank { align-items: flex-end; text-align: right; }
/* em em pra encolher junto com a linha */
.dc-cmp-suffix {
    margin-left: 0;
    font-size: 1em;
    font-weight: inherit;
    color: inherit;
}

.dc-cmp-tabs {
    display: flex;
    gap: 2px;
    padding: 3px;
    border-radius: 8px;
    background: #EDEDED;
    border: 1px solid #E3E3E3;
    width: 100%;
    max-width: 260px;
    margin: 0 auto;
}
.dc-cmp-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s ease-out, color 0.15s ease-out,
        box-shadow 0.15s ease-out, transform 0.15s ease-out;
}
.dc-cmp-tab[aria-selected="true"] {
    background: #F5F5F5;
    box-shadow: 0 1px 3px rgba(2, 14, 30, 0.12);
}
.dc-cmp-tab:active { transform: scale(0.97); }
@media (prefers-reduced-motion: reduce) {
    .dc-cmp-slider::-webkit-slider-thumb, .dc-cmp-slider::-moz-range-thumb, .dc-cmp-tab { transition-duration: 0.01ms !important; }
}

`

function numBR(v: number): string {
    return v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
}

function pctBR(v: number): string {
    return v.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

function pricePMT(pv: number, r: number, n: number): number {
    if (r < 1e-9) return pv / n
    const f = Math.pow(1 + r, n)
    return (pv * r * f) / (f - 1)
}

/** Taxa mensal composta virando taxa anual efetiva: 1% a.m. -> 12,68% ao ano. */
function annualFromMonthly(monthly: number): string {
    return pctBR((Math.pow(1 + monthly, 12) - 1) * 100) + "% ao ano"
}

type RGBA = { r: number; g: number; b: number; a: number }

/** Aceita hex (#RGB/#RRGGBB/#RRGGBBAA) e rgb()/rgba() — o Framer devolve os dois. */
function parseColor(input: string): RGBA {
    const fallback = { r: 2, g: 14, b: 30, a: 1 }
    if (!input) return fallback
    const s = input.trim()
    if (s.startsWith("#")) {
        let h = s.slice(1)
        if (h.length === 3 || h.length === 4)
            h = h
                .split("")
                .map((c) => c + c)
                .join("")
        if (h.length !== 6 && h.length !== 8) return fallback
        const at = (i: number) => parseInt(h.slice(i, i + 2), 16)
        const [r, g, b] = [at(0), at(2), at(4)]
        if ([r, g, b].some(Number.isNaN)) return fallback
        return { r, g, b, a: h.length === 8 ? at(6) / 255 : 1 }
    }
    const m = s.match(/^rgba?\(([^)]+)\)$/i)
    if (m) {
        const p = m[1].split(",").map((x) => parseFloat(x))
        if (p.length >= 3 && p.slice(0, 3).every((x) => !Number.isNaN(x)))
            return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
    }
    return fallback
}

function mixColors(from: string, to: string, t: number): string {
    const a = parseColor(from)
    const b = parseColor(to)
    const k = Math.min(1, Math.max(0, t))
    const ch = (x: number, y: number) => Math.round(x + (y - x) * k)
    const alpha = Number((a.a + (b.a - a.a) * k).toFixed(3))
    return `rgba(${ch(a.r, b.r)}, ${ch(a.g, b.g)}, ${ch(a.b, b.b)}, ${alpha})`
}

/** Slider é sempre magnético, então o número troca seco a cada parada. */
function brl(value: number) {
    return `R$ ${numBR(value)}`
}

/**
 * Ícones do toggle, traçados da Lucide (house e car) inline — sem dependência
 * externa. aria-hidden porque o texto do botão já diz o que é.
 */
function TabIcon({ tipo }: { tipo: "imovel" | "carro" }) {
    return (
        <svg
            aria-hidden="true"
            focusable="false"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
        >
            {tipo === "imovel" ? (
                <>
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </>
            ) : (
                <>
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                    <circle cx="7" cy="17" r="2" />
                    <path d="M9 17h6" />
                    <circle cx="17" cy="17" r="2" />
                </>
            )}
        </svg>
    )
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function SimuladorLimpo(props: MyComponentProps) {
    const {
        fixedMode = "imovel",
        showModeToggle = false,
        consortiumLogo,
        bankLogo,
        logoHeight = 28,
        tableRadius = 16,
        consortiumFill = "var(--token-f2e27a1e-a16a-4601-996b-9c341e3c3b66)",
        bankFill = "var(--token-f2e27a1e-a16a-4601-996b-9c341e3c3b66)",
        textColor = "var(--token-c03c769f-1cc4-4623-8ff9-3ea53633fdc4)",
        mutedColor = "var(--token-cdbce535-1d5f-48cf-92ad-0950e010f6de)",
        sliderFillColor = "#FFB715",
        sliderFillSoftColor = "#FFE2A1",
        cellPadding = 14,
        contentGap = 33,
        valueFontSize = 32,
        rowFontSize = 16,
        rowSuffixFontSize = 12,
        sliderHeight = 4,
        sliderWidth = 65,
        tableMaxWidth = 560,
    } = props

    useEffect(() => {
        if (typeof document === "undefined") return
        if (document.getElementById(STYLE_ID)) return
        const style = document.createElement("style")
        style.id = STYLE_ID
        style.textContent = CSS
        document.head.appendChild(style)
    }, [])

    const [tipo, setTipo] = useState<"imovel" | "carro">(fixedMode)
    const [valores, setValores] = useState({
        imovel: MODES.imovel.slider.def,
        carro: MODES.carro.slider.def,
    })
    const activeTipo = showModeToggle ? tipo : fixedMode
    const mode = MODES[activeTipo]
    const rawValor = valores[activeTipo]
    // Passo por modalidade porque as faixas são muito diferentes: 100k no
    // imóvel (que vai a 2M) e 40k no carro. A grade nasce do min, igual à do
    // input nativo — se as duas divergirem, o thumb para num lugar e o número
    // mostra outro.
    const gridStep = mode.slider.step
    const valor = Math.min(
        mode.slider.max,
        Math.max(
            mode.slider.min,
            mode.slider.min +
                Math.round((rawValor - mode.slider.min) / gridStep) * gridStep
        )
    )

    const computeResult = useCallback((m: typeof MODES.imovel, v: number) => {
        // O banco não financia 100%: a entrada sai do bolso e só o restante
        // vai pra tabela Price. O total do banco inclui a entrada.
        const entrada = v * (m.financ.entradaPct ?? 0)
        const pf = pricePMT(v - entrada, m.financ.rate, m.financ.meses)
        const tf = entrada + pf * m.financ.meses
        const pc = (v * m.cons.mult) / m.cons.meses
        const tc = pc * m.cons.meses
        const eco = Math.round(tf) - Math.round(tc)
        return { entrada, pf, tf, pc, tc, eco }
    }, [])

    const getPct = useCallback((m: typeof MODES.imovel, raw: number) => {
        const range = m.slider.max - m.slider.min
        if (range <= 0) return 0
        return Math.min(100, Math.max(0, ((raw - m.slider.min) / range) * 100))
    }, [])

    const result = useMemo(
        () => computeResult(mode, valor),
        [computeResult, mode, valor]
    )

    const [smoothPct, setSmoothPct] = useState(() =>
        getPct(MODES.imovel, MODES.imovel.slider.def)
    )
    // enquanto a barra viaja de um bem pro outro, o thumb tem que sair do
    // valor bruto e seguir a mesma animação do preenchimento
    const [isTraveling, setIsTraveling] = useState(false)
    const switchRafRef = useRef<number | null>(null)
    const isAnimatingRef = useRef(false)

    const handleSwitch = useCallback(
        (next: "imovel" | "carro") => {
            if (next === tipo || typeof window === "undefined") return
            startTransition(() => setTipo(next))
            const from = smoothPct
            const to = getPct(MODES[next], valores[next])
            const duration = 320
            const start = performance.now()
            isAnimatingRef.current = true
            setIsTraveling(true)
            if (switchRafRef.current) cancelAnimationFrame(switchRafRef.current)
            const tick = (now: number) => {
                const p = Math.min((now - start) / duration, 1)
                const ease = 1 - Math.pow(1 - p, 3)
                startTransition(() => setSmoothPct(from + (to - from) * ease))
                if (p < 1) {
                    switchRafRef.current = requestAnimationFrame(tick)
                } else {
                    isAnimatingRef.current = false
                    setIsTraveling(false)
                }
            }
            switchRafRef.current = requestAnimationFrame(tick)
        },
        [tipo, valores, smoothPct, getPct]
    )

    useEffect(() => {
        return () => {
            if (switchRafRef.current) cancelAnimationFrame(switchRafRef.current)
        }
    }, [])

    const rawPct = getPct(mode, rawValor)
    useEffect(() => {
        if (!isAnimatingRef.current) startTransition(() => setSmoothPct(rawPct))
    }, [rawPct])

    const fillPct = Math.min(100, Math.max(0, smoothPct))
    const sliderRadius = Math.round((sliderHeight * 2) / 3)

    /*
     * A barra "carrega": a rampa vai da cor suave até a cheia, e a cor exata no
     * ponto do thumb depende de onde ele está. Perto do início o preenchimento
     * inteiro fica pálido; chegando ao fim, alcança a cor cheia. Sem glow e sem
     * escala — a personalidade vem só da cor ganhando corpo.
     */
    const sliderBackground = useMemo(() => {
        // Sem cor definida, o início nasce do próprio tom do slider clareado
        // contra o trilho. Assim a rampa fica sempre no mesmo matiz — misturar
        // dois matizes diferentes suja o meio do caminho.
        const soft = sliderFillSoftColor?.trim()
            ? sliderFillSoftColor
            : mixColors(sliderFillColor, TRACK_COLOR, 0.62)
        const atThumb = mixColors(soft, sliderFillColor, fillPct / 100)
        return `linear-gradient(90deg, ${soft} 0%, ${atThumb} ${fillPct}%, ${TRACK_COLOR} ${fillPct}%, ${TRACK_COLOR} 100%)`
    }, [fillPct, sliderFillSoftColor, sliderFillColor, TRACK_COLOR])

    // Durante a viagem o thumb segue o mesmo pct animado do preenchimento;
    // parado ou arrastando, volta a espelhar o valor real.
    const thumbValue = isTraveling
        ? Math.round(
              mode.slider.min +
                  (fillPct / 100) * (mode.slider.max - mode.slider.min)
          )
        : rawValor

    const rows: Array<{
        key: string
        cons: number | string
        bank: number | string
        consSuffix?: string
        bankSuffix?: string
    }> = [
        {
            // texto corrido: o "meses" faz parte do valor, sem sufixo apagado
            key: "duracao",
            cons: `${mode.cons.meses} ${"meses"}`,
            bank: `${mode.financ.meses} ${"meses"}`,
        },
        {
            key: "custo",
            cons: CONSORTIUM_RATE,
            consSuffix: SUFIXO.custo,
            bank: annualFromMonthly(mode.financ.rate),
            bankSuffix: SUFIXO.custo,
        },
        {
            key: "entrada",
            cons: "Sem entrada",
            bank: result.entrada,
            bankSuffix: SUFIXO.entrada,
        },
        {
            key: "parcela",
            cons: result.pc,
            consSuffix: SUFIXO.parcela,
            bank: result.pf,
            bankSuffix: SUFIXO.parcela,
        },
        {
            key: "total",
            cons: result.tc,
            consSuffix: SUFIXO.total,
            bank: result.tf,
            bankSuffix: SUFIXO.total,
        },
        {
            key: "economia",
            cons: result.eco,
            consSuffix: SUFIXO.economia,
            bank: "Sem economia",
        },
    ]

    const separator = "1px solid rgba(2, 14, 30, 0.08)"

    const valueCell = (isCons: boolean): CSSProperties => ({
        padding: cellPadding,
        fontWeight: isCons ? 600 : 500,
        color: textColor,
        background: isCons ? consortiumFill : bankFill,
        fontVariantNumeric: "tabular-nums",
    })

    /*
     * Teto de encolhimento da linha, em cqi (1cqi = 1% da largura útil da
     * célula). As constantes são a largura medida do pior caso da tabela por
     * 1px de fonte — valor "R$ 4.824.500" e sufixo "de economia" na mesma
     * tipografia da linha principal — na Neue Haas Grotesk Display Pro.
     * O 0.97 é a folga.
     */
    const rowFitCqi = useMemo(() => {
        const widestLine = 6.03 + 0.32 + 5.43
        return ((100 / widestLine) * 0.97).toFixed(2)
    }, [rowFontSize])

    return (
        <div
            className="dc-cmp"
            role="region"
            aria-label="Comparativo consórcio e financiamento"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: contentGap,
                fontFamily:
                    "Direct, 'Neue Haas Grotesk Display Pro', Helvetica, Arial, sans-serif",
                color: textColor,
                ["--dc-row-fs" as string]: `${rowFontSize}px`,
                ["--dc-row-fit" as string]: `${rowFitCqi}cqi`,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    width: "100%",
                    maxWidth: tableMaxWidth,
                    margin: "0 auto",
                }}
            >
                {showModeToggle ? (
                    <div
                        className="dc-cmp-tabs"
                        role="tablist"
                        aria-label="Tipo de bem"
                    >
                        {(["imovel", "carro"] as const).map((t) => (
                            <button
                                key={t}
                                role="tab"
                                className="dc-cmp-tab"
                                aria-selected={tipo === t}
                                onClick={() => handleSwitch(t)}
                                style={{
                                    color: tipo === t ? textColor : mutedColor,
                                    fontWeight: tipo === t ? 600 : 500,
                                }}
                            >
                                <TabIcon tipo={t} />
                                {MODES[t].label}
                            </button>
                        ))}
                    </div>
                ) : null}

                <div
                    className="dc-cmp-hero"
                    style={{
                        textAlign: "center",
                        fontSize: valueFontSize,
                        fontWeight: 500,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                    }}
                >
                    {brl(valor)}
                </div>

                <input
                    className="dc-cmp-slider"
                    type="range"
                    aria-label="Valor do crédito"
                    min={mode.slider.min}
                    max={mode.slider.max}
                    // travado: o thumb só para nos degraus da grade.
                    // solto: desliza fino, mas o valor continua pousando neles.
                    step={gridStep}
                    value={thumbValue}
                    onChange={(e) => {
                        const next = Number(e.target.value)
                        // arrastar no meio da viagem cancela a viagem: o
                        // dedo do usuário manda mais que a animação
                        if (isAnimatingRef.current) {
                            if (switchRafRef.current)
                                cancelAnimationFrame(switchRafRef.current)
                            isAnimatingRef.current = false
                            setIsTraveling(false)
                        }
                        startTransition(() =>
                            setValores((prev) => ({
                                ...prev,
                                [activeTipo]: next,
                            }))
                        )
                    }}
                    style={
                        {
                            color: sliderFillColor,
                            // o slider não acompanha a largura da tabela
                            width: `${sliderWidth}%`,
                            alignSelf: "center",
                            height: sliderHeight,
                            // mantém a proporção 12/8 do trilho original
                            borderRadius: sliderRadius,
                            // o thumb nunca pode ficar menor que o trilho
                            "--dc-thumb-h": `${Math.max(28, sliderHeight + 16)}px`,
                            background: sliderBackground,
                        } as CSSProperties
                    }
                />
            </div>

            {/* Rótulos e cabeçalho ficam fora do card: só texto, sem borda e sem
                fill. A moldura da tabela é desenhada pelas próprias células
                das duas colunas de valor, o que mantém tudo na mesma grade. */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    width: "100%",
                    maxWidth: tableMaxWidth,
                    margin: "0 auto",
                }}
            >
                {/* Cabeçalho é só a logo de cada coluna. Sem imagem carregada a
                    área fica vazia, mas guarda a altura pra tabela não pular. */}
                <div className="dc-cmp-grid">
                    <div
                        className="dc-cmp-cell dc-cmp-cons"
                        style={{
                            padding: `0 ${cellPadding}px`,
                            minHeight: logoHeight,
                        }}
                    >
                        {consortiumLogo?.src ? (
                            <img
                                {...consortiumLogo}
                                alt={consortiumLogo.alt || LOGO_ALT.cons}
                                style={{
                                    height: logoHeight,
                                    width: "auto",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                    objectPosition: "left center",
                                }}
                            />
                        ) : null}
                    </div>
                    <div
                        className="dc-cmp-cell dc-cmp-bank"
                        style={{
                            padding: `0 ${cellPadding}px`,
                            minHeight: logoHeight,
                        }}
                    >
                        {bankLogo?.src ? (
                            <img
                                {...bankLogo}
                                alt={bankLogo.alt || LOGO_ALT.bank}
                                style={{
                                    height: logoHeight,
                                    width: "auto",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                    objectPosition: "right center",
                                }}
                            />
                        ) : null}
                    </div>
                </div>

                <div className="dc-cmp-grid dc-cmp-body" aria-live="polite" aria-atomic="true">
                    {rows.map((row, i) => {
                        const first = i === 0
                        const last = i === rows.length - 1
                        const edge = `1px solid ${BORDER_COLOR}`
                        const moldura: CSSProperties = {
                            borderTop: first ? edge : separator,
                            borderBottom: last ? edge : "none",
                        }
                        return (
                            <div key={row.key} style={{ display: "contents" }}>
                                <div
                                    className="dc-cmp-cell dc-cmp-cons"
                                    style={{
                                        ...valueCell(true),
                                        ...moldura,
                                        borderLeft: edge,
                                        // divisória central entre as duas colunas
                                        borderRight: edge,
                                        borderTopLeftRadius: first
                                            ? tableRadius
                                            : 0,
                                        borderBottomLeftRadius: last
                                            ? tableRadius
                                            : 0,
                                    }}
                                >
                                    <span className="dc-cmp-line">
                                        {row.consSuffix ? (
                                            <>
                                                {typeof row.cons === "number"
                                                    ? brl(row.cons)
                                                    : row.cons}
                                                {" "}
                                                <span className="dc-cmp-suffix">
                                                    {row.consSuffix}
                                                </span>
                                            </>
                                        ) : typeof row.cons === "number" ? (
                                            brl(row.cons)
                                        ) : (
                                            row.cons
                                        )}
                                    </span>
                                </div>
                                <div
                                    className="dc-cmp-cell dc-cmp-bank"
                                    style={{
                                        ...valueCell(false),
                                        ...moldura,
                                        borderRight: edge,
                                        borderTopRightRadius: first
                                            ? tableRadius
                                            : 0,
                                        borderBottomRightRadius: last
                                            ? tableRadius
                                            : 0,
                                    }}
                                >
                                    <span className="dc-cmp-line">
                                        {row.bankSuffix ? (
                                            <>
                                                {typeof row.bank === "number"
                                                    ? brl(row.bank)
                                                    : row.bank}
                                                {" "}
                                                <span className="dc-cmp-suffix">
                                                    {row.bankSuffix}
                                                </span>
                                            </>
                                        ) : typeof row.bank === "number" ? (
                                            brl(row.bank)
                                        ) : (
                                            row.bank
                                        )}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
