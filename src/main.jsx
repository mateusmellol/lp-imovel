import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  House,
  Users,
  HandCoins,
  KeyRound,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  Info,
  Menu,
  X,
  Check,
  ChevronDown,
  Layers,
  PhoneCall,
} from "lucide-react";
import Comparador from "./components/Comparador";
import Simulador from "./components/Simulador";
import { withSmoothHeroZoom } from "./components/SmoothHeroZoomOverride";
import { withBarsContainerLoadSequence } from "./components/BarsContainerLoadOverride";
import { withWaveBarsLoadSequence } from "./components/WaveBarsLoadOverride";
import LogoCarousel from "./components/LogoCarousel";
import { testimonials } from "./components/testimonials-data";
import "./styles.css";
const asset = (n) => `./assets/${n}`;
const Frame = forwardRef((props, ref) => <div ref={ref} {...props} />);
const HeroPhoto = withSmoothHeroZoom(Frame),
  Bars = withBarsContainerLoadSequence(Frame),
  WaveBars = withWaveBarsLoadSequence(Frame);
const EASE_OUT = [0.23, 1, 0.32, 1];
function Cta({
  children = "Falar com consultor",
  href = "#fale-com-consultor",
  secondary = false,
}) {
  return (
    <a className={`button ${secondary ? "secondary" : ""}`} href={href}>
      {children}
    </a>
  );
}

function ContactFormSection() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.hsforms.net/forms/embed/51329285.js";
    script.defer = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <section className="contact-form-section" id="fale-com-consultor">
      <div className="contact-form-wrap">
        <header className="contact-form-heading">
          <h2>Seu próximo passo começa aqui!</h2>
          <p>
            A parcela cabe no seu bolso, a estratégia é sua e o ritmo também.
            <br />A Directcon acompanha todas as etapas do seu projeto.
          </p>
        </header>
        <div
          className="hs-form-frame"
          data-region="na1"
          data-form-id="8e2a8f5e-34e3-484f-bf4a-708df64b21fd"
          data-portal-id="51329285"
        />
        <div className="contact-form-benefits" aria-label="Benefícios do atendimento">
          <div>
            <Layers aria-hidden="true" />
            <span><strong>Parcela acessível</strong><small>Patrimônio no seu tempo, sem juros</small></span>
          </div>
          <div>
            <PhoneCall aria-hidden="true" />
            <span><strong>Suporte da equipe</strong><small>Com você até a contemplação</small></span>
          </div>
        </div>
      </div>
    </section>
  );
}

function RevealArticle({
  children,
  className,
  index = 0,
  distance = 12,
  duration = 0.64,
  stagger = 0.14,
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  // `once` é o que impede o conteúdo de voltar a opacity: 0 quando a seção sai
  // da viewport. Sem isso, subir a página apaga e reanima o que já foi lido.
  const isInView = useInView(ref, { amount: 0.2, once: true });
  const initial = reduceMotion
    ? { opacity: 0, transform: "none" }
    : { opacity: 0, transform: `translateY(${distance}px)` };
  const settled = reduceMotion
    ? { opacity: 1, transform: "none" }
    : { opacity: 1, transform: "translateY(0)" };

  return (
    <motion.article
      ref={ref}
      className={className}
      initial={initial}
      animate={isInView ? settled : initial}
      transition={{
        duration: reduceMotion ? 0.2 : duration,
        delay: reduceMotion || !isInView ? 0 : index * stagger,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.article>
  );
}

function RevealBlock({
  children,
  className,
  index = 0,
  distance = 12,
  duration = 0.56,
  stagger = 0.08,
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2, once: true });
  const initial = reduceMotion
    ? { opacity: 0, transform: "none" }
    : { opacity: 0, transform: `translateY(${distance}px)` };
  const settled = reduceMotion
    ? { opacity: 1, transform: "none" }
    : { opacity: 1, transform: "translateY(0)" };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={isInView ? settled : initial}
      transition={{
        duration: reduceMotion ? 0.2 : duration,
        delay: reduceMotion || !isInView ? 0 : index * stagger,
        ease: EASE_OUT,
      }}
    >
      {children}
    </motion.div>
  );
}

// Renderizado duas vezes: na coluna de texto no desktop e dentro do painel do
// formulário no mobile, onde precisa ficar abaixo do slider para o usuário ver
// o número mudar enquanto arrasta. Só uma das duas está visível por vez, então
// só uma está na árvore de acessibilidade — `display: none` tira a outra.
function EstimateResult({ value, variant }) {
  return (
    <div className={`estimate-result estimate-result-${variant}`}>
      <span>Referência ilustrativa em 200 meses</span>
      {/* a região viva é só o número, não o bloco inteiro: anunciar o
          parágrafo de premissas a cada degrau do slider vira ruído */}
      <strong aria-live="polite">
        {((value * 1.2) / 200).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        })}
        <small> / mês</small>
      </strong>
      <p>
        Mesma premissa do comparador: custo total de 20% sobre a carta.
        Condições finais, reajustes e demais custos dependem do grupo.
      </p>
    </div>
  );
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const answerId = useId();
  const transition = {
    duration: reduceMotion ? 0.01 : 0.34,
    ease: EASE_OUT,
  };

  return (
    <div className="faq-item">
      <button
        className="faq-summary"
        type="button"
        aria-controls={answerId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {question}
        <motion.span
          className="faq-chevron"
          aria-hidden="true"
          animate={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          transition={transition}
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-answer"
            id={answerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
          >
            <p>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
const waveBars = [
  [70.05, "#FFEAA3"],
  [70.05, "#FFEAA3"],
  [70.05, "#FFEAA3"],
  [70.05, "#FFEAA3"],
  [70.05, "#FFEAA3"],
  [70.05, "#FFEAA3"],
  [80.4, "#FFEAA3"],
  [78.01, "#FFEAA3"],
  [75.62, "#FFEAA3"],
  [73.23, "#FFEAA3"],
  [70.05, "#FFEAA3"],
  [68.46, "#FFEAA3"],
  [66.07, "#FFEAA3"],
  [63.68, "#FFEAA3"],
  [61.29, "#FFEAA3"],
  [59.7, "#FFEAA3"],
  [57.31, "#FFE79A"],
  [57.31, "#FFE494"],
  [57.31, "#FFE28D"],
  [58.91, "#FFE087"],
  [61.29, "#FFDE82"],
  [63.68, "#FFDC7C"],
  [65.27, "#FFDA77"],
  [69.25, "#FFD871"],
  [74.03, "#FFD66C"],
  [79.6, "#FFD567"],
  [85.97, "#FFD362"],
  [93.13, "#FFD15D"],
  [99.5, "#FFCF58"],
  [106.67, "#FFCE54"],
  [113.03, "#FFCC4F"],
  [117.81, "#FFCA4A"],
  [122.59, "#FFC846"],
  [125.77, "#FFC741"],
  [127.36, "#FFC53C"],
];
const columnBars = [
  [52.41, "#FFE0A3"],
  [75.62, "#FFD575"],
  [99.3, "#FFC34A"],
  [121.37, "#FFB715"],
];
const steps = [
  ["O grupo se forma", "Pessoas com o mesmo objetivo formam um grupo.", Users],
  [
    "Arrecadação do fundo",
    "As parcelas dos participantes compõem um fundo comum.",
    HandCoins,
  ],
  [
    "Sorteio e lance",
    "Nas assembleias, a administradora realiza as contemplações conforme as regras e os recursos do grupo.",
    ShieldCheck,
  ],
  [
    "Você realiza seu objetivo",
    "Com o crédito liberado, você compra seu imóvel à vista.",
    House,
  ],
];
const journey = [
  [
    "planejamento.webp",
    "Planejamento",
    "Desenhamos o plano para o seu objetivo e você decide entendendo cada detalhe.",
    House,
  ],
  [
    "acompanhamento.webp",
    "Acompanhamento",
    "Acompanhamos cada assembleia e ajustamos a estratégia de lance às regras do grupo.",
    Users,
  ],
  [
    "realizacao.webp",
    "Realização",
    "Orientamos a documentação e acompanhamos a liberação do crédito para a compra do seu imóvel.",
    KeyRound,
  ],
];
const faqs = [
  [
    "Quando vou ser contemplado?",
    "A contemplação acontece por sorteio ou lance nas assembleias, conforme as regras e os recursos do grupo. O consultor acompanha essas regras e prepara com você a estratégia de participação.",
  ],
  [
    "E se o meu nome estiver com restrição?",
    "A administradora avalia a capacidade de pagamento na adesão e na contemplação, conforme os critérios do grupo. O consultor ajuda você a entender os requisitos e a documentação antes da contratação.",
  ],
  [
    "Serve para imóvel novo ou usado?",
    "Casa ou apartamento, novo ou usado, em qualquer região do Brasil. A carta dá essa flexibilidade.",
  ],
  [
    "Qual o valor máximo da carta?",
    "Depende do grupo e da administradora. Existem cartas em diferentes faixas de valor, e a gente encontra a que se encaixa no seu objetivo.",
  ],
  [
    "Se eu precisar desistir, como funciona a devolução?",
    "A devolução segue as regras do seu grupo, geralmente por sorteio ou no encerramento, com os descontos previstos em contrato, como a taxa de administração. A Directcon acompanha o seu pedido do início ao fim, para você saber em que pé ele está a cada etapa.",
  ],
  [
    "Como funciona a documentação na contemplação?",
    "Após a contemplação, a administradora analisa a documentação e as garantias previstas para liberar o crédito. A Directcon orienta você sobre os documentos pessoais e do imóvel e acompanha essa etapa.",
  ],
];
function App() {
  const [menu, setMenu] = useState(false),
    [value, setValue] = useState(350000);
  return (
    <MotionConfig reducedMotion="user">
      <svg className="svg-filters" aria-hidden="true">
        <filter id="directcon-dark-logo" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 -1.078 0 1.086  0 0 -.720 0 .775  0 0 .0384 0 .0792  0 0 0 1 0"
          />
        </filter>
      </svg>
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header>
        <div className="nav wrap">
          <a href="#inicio" aria-label="Directcon Consórcios, início">
            <img
              className="logo"
              src={asset("logo.png")}
              width="184"
              height="41"
              alt="Directcon Consórcios"
            />
          </a>
          <nav aria-label="Navegação principal" className={menu ? "open" : ""}>
            <a href="#como-funciona" onClick={() => setMenu(false)}>
              Como funciona
            </a>
            <a href="#comparativo" onClick={() => setMenu(false)}>
              Compare
            </a>
            <a href="#duvidas" onClick={() => setMenu(false)}>
              Dúvidas
            </a>
          </nav>
          <div className="nav-cta">
            <Cta />
          </div>
          <button
            className="menu"
            aria-label={menu ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="conteudo">
        <section className="hero" id="inicio">
          <HeroPhoto className="hero-photo" />
            <div className="wrap hero-content">
            <h1>Sua casa própria começa com a decisão certa.</h1>
            <p>
              Entenda como o consórcio funciona antes de conquistar seu imóvel.
            </p>
            <div className="actions">
              <Cta />
              <Cta href="#estimativa" secondary>
                Ver estimativa de parcela
              </Cta>
              </div>
            </div>
            <div className="hero-partners">
              <LogoCarousel />
            </div>
          </section>
        <section className="proof-section">
          <div className="proof">
            <RevealBlock className="proof-copy">
              <div className="section-intro">
                <h2>Realizações que começaram com uma decisão certa</h2>
                <p>
                  Nossos números mostram o resultado de quem decidiu com
                  estratégia e teve acompanhamento até a realização
                </p>
              </div>
              <div className="customer-review">
                <span>Avaliação de clientes</span>
                <div className="review-row">
                  <div className="avatars" aria-hidden="true">
                    <img src={asset("cliente-1.jpg")} alt="" />
                    <img src={asset("cliente-2.jpg")} alt="" />
                    <img src={asset("cliente-3.jpg")} alt="" />
                  </div>
                  <div
                    className="rating"
                    aria-label="Avaliação 5 de 5, baseada em 697 avaliações"
                  >
                    <span className="stars">★★★★★</span>
                    <strong>5.0</strong>
                    <span>(697)</span>
                  </div>
                </div>
              </div>
            </RevealBlock>
            <div className="proof-grid">
              <RevealArticle className="stat" index={0} duration={0.52}>
                <div className="stat-heading">
                  <span className="stat-label">
                    <span className="trend" aria-hidden="true">
                      ↗
                    </span>{" "}
                    Escala
                  </span>
                  <strong>+ R$ 3 Bilhões</strong>
                  <p>Comercializados</p>
                </div>
                <WaveBars
                  className="wave-chart"
                  data-chart-delay="160"
                  aria-hidden="true"
                >
                  {waveBars.map(([height, color], i) => (
                    <i
                      className="wave-bar"
                      key={i}
                      style={{ height, backgroundColor: color }}
                    />
                  ))}
                </WaveBars>
              </RevealArticle>
              <RevealArticle className="stat" index={0} duration={0.52}>
                <div className="stat-heading">
                  <span className="stat-label">
                    <span className="trend" aria-hidden="true">
                      ↗
                    </span>{" "}
                    Contemplações
                  </span>
                  <strong>+ R$ 500 Milhões</strong>
                  <p>Contemplados em 2026</p>
                </div>
                <Bars
                  className="column-chart"
                  data-chart-delay="160"
                  aria-hidden="true"
                >
                  {columnBars.map(([height, color], i) => (
                    <i
                      className="column-bar"
                      key={i}
                      style={{ height, backgroundColor: color }}
                    />
                  ))}
                </Bars>
              </RevealArticle>
            </div>
          </div>
        </section>
        <section className="section mechanism" id="como-funciona">
          <div className="wrap">
            <RevealBlock className="section-intro center">
              <span className="eyebrow">COMO FUNCIONA</span>
              <h2>Uma compra planejada, sem os juros de um financiamento</h2>
            </RevealBlock>
            <div className="steps">
              {steps.map(([t, p, Icon], index) => (
                <RevealArticle key={t} index={index}>
                  <span className="icon">
                    <Icon strokeWidth={1.5} />
                  </span>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </RevealArticle>
              ))}
            </div>
          </div>
        </section>
        <section className="section wrap compare" id="comparativo">
          <RevealBlock className="compare-intro">
          <h2>Coloque os números lado a lado</h2>
            <p>
              No consórcio, você paga taxa de administração, sem os juros de um
              financiamento. Compare a parcela, o prazo e o custo total para
              planejar a compra do seu imóvel.
            </p>
          </RevealBlock>
          <div className="compare-panel">
            <Comparador
              consortiumLogo={{ src: asset("logo.png") }}
              bankLogo={{ src: asset("bank.png") }}
              consortiumFill="#FFFFFF"
              bankFill="#FFFFFF"
              textColor="#0F0F0F"
            mutedColor="#4C4C4C"
            sliderFillSoftColor="#FFB715"
            sliderWidth={100}
            rowFontSize={16}
            rowSuffixFontSize={14}
          />
          <div className="compare-cta">
            <Cta />
          </div>
          <div className="compare-note">
            <div>
              <strong>Essa comparação é um exemplo</strong>
              <p>
                Usamos condições típicas de cada opção, sem contar os reajustes
                do caminho. O seu número real depende do grupo e o consultor
                monta ele com você.
              </p>
            </div>
            <Info strokeWidth={1.5} aria-hidden="true" />
          </div>
          </div>
        </section>
        <section className="section modalities">
          <div className="wrap">
            <RevealBlock className="section-intro">
              <span className="eyebrow">UM CRÉDITO, O SEU LUGAR.</span>
              <h2>Como usar a sua carta de crédito</h2>
            </RevealBlock>
            <div className="two-grid">
              {[
                [
                  "casa.webp",
                  "Casa",
                  "Casa nova ou usada, sem entrada obrigatória, com a parcela dimensionada para caber no seu orçamento.",
                  House,
                ],
                [
                  "apartamento.png",
                  "Apartamento",
                  "Apartamento em qualquer região do Brasil. Depois da contemplação, a Directcon acompanha a documentação e as etapas de liberação do crédito para a compra.",
                  Building2,
                ],
              ].map(([img, t, p, Icon], index) => (
                <RevealArticle
                  className="photo-card photo-card-cta"
                  key={t}
                  index={index}
                >
                  <figure className="photo-card-media">
                    <img
                      loading="lazy"
                      src={asset(img)}
                      alt={
                        t === "Casa"
                          ? "Família reunida no sofá de casa."
                          : "Família reunida na sala de um apartamento."
                      }
                    />
                    {/* mesmo hover dos cards de solução de /sobre-consorcio:
                        overlay preto a 30% com o label e a seta, opacity 0 -> 1 */}
                    <span className="photo-card-overlay" aria-hidden="true">
                      <span>Estimar minha parcela</span>
                      <ArrowUpRight strokeWidth={2} />
                    </span>
                  </figure>
                  <div>
                    <span className="icon small">
                      <Icon strokeWidth={1.5} />
                    </span>
                    <h3>{t}</h3>
                    <p>{p}</p>
                  </div>
                  <a
                    className="photo-card-link"
                    href="#estimativa"
                    aria-label={`Estimar minha parcela para ${t.toLowerCase()}`}
                  />
                </RevealArticle>
              ))}
            </div>
          </div>
        </section>
        <section className="fgts">
          <picture>
            <source
              media="(max-width:809px)"
              srcSet={asset("fgts-mobile.webp")}
            />
            <img
              loading="lazy"
              src={asset("fgts.webp")}
              alt="Homem consultando o celular em casa."
            />
          </picture>
          <div className="fgts-shade" />
          <div className="wrap fgts-content">
            <RevealBlock>
              <span className="eyebrow light">FGTS E LANCE</span>
              <h2>O seu FGTS pode fazer parte da estratégia de lance</h2>
              <p>
                No consórcio de imóvel residencial, o FGTS pode entrar como
                lance, dentro das regras do fundo. O consultor avalia com você o
                saldo disponível, os critérios de uso e quanto ele representa
                dentro do grupo para montar a estratégia de lance.
              </p>
              <Cta />
            </RevealBlock>
          </div>
        </section>
        <section className="section wrap">
          <RevealBlock className="section-intro center">
            <span className="eyebrow">ACOMPANHAMENTO EM CADA ETAPA</span>
            <h2>Da decisão até a chave na mão</h2>
            <p>
              Você tem a Directcon do seu lado em cada etapa, da estratégia
              inicial à realização.
            </p>
          </RevealBlock>
          <div className="three-grid">
            {journey.map(([img, t, p, Icon], index) => (
              <RevealArticle className="photo-card journey" key={t} index={index}>
                <img
                  loading="lazy"
                  src={asset(img)}
                  style={
                    t === "Acompanhamento"
                      ? { objectPosition: "50% 65%" }
                      : undefined
                  }
                  alt={
                    t === "Planejamento"
                      ? "Pessoa consultando o celular em casa."
                      : t === "Acompanhamento"
                        ? "Consultora em atendimento."
                        : "Família reunida em casa."
                  }
                />
                <div>
                  <span className="icon small">
                    <Icon strokeWidth={1.5} />
                  </span>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              </RevealArticle>
            ))}
          </div>
        </section>
        <section className="section trust">
          <div className="wrap trust-layout">
            <RevealBlock className="trust-heading">
              <span className="icon">
                <ShieldCheck strokeWidth={1.5} />
              </span>
              <h2>Antes de decidir, você confere por conta própria</h2>
            </RevealBlock>
            <div className="trust-content">
              <RevealBlock className="trust-point" index={0}>
                <span className="trust-number">01</span>
                <p>
                  As administradoras de consórcio são autorizadas e fiscalizadas
                  pelo Banco Central.
                </p>
              </RevealBlock>
              <RevealBlock className="trust-point" index={1}>
                <span className="trust-number">02</span>
                <p>
                  Antes da contratação, você pode consultar o CNPJ, a autorização
                  de funcionamento e o histórico da administradora responsável
                  pelo grupo. A Directcon orienta essa verificação com você.
                </p>
              </RevealBlock>
              <RevealBlock className="trust-point" index={2}>
                <span className="trust-number">03</span>
                <p>
                  Pagamentos e negociação de cota acontecem só pelos canais
                  oficiais da Directcon e da administradora. Desconfie de qualquer
                  cobrança fora disso.
                </p>
              </RevealBlock>
              <RevealBlock className="trust-action" index={3}>
                <a
                  className="text-link"
                  href="https://www.bcb.gov.br/meubc/encontreinstituicao"
                >
                  Consultar instituições no Banco Central{" "}
                  <ArrowUpRight size={18} />
                </a>
              </RevealBlock>
            </div>
          </div>
        </section>
        <section className="section wrap cases">
          <RevealBlock className="section-intro">
            <span className="eyebrow">HISTÓRIAS REAIS</span>
            <h2>Quem já está dentro de casa</h2>
          </RevealBlock>
          <div className="three-grid">
            {testimonials.map(
              ({ quote, name, role, photo, alt, objectPosition }, index) => (
                <RevealArticle
                  className="photo-card journey testimonial"
                  key={name}
                  index={index}
                >
                  <img
                    loading="lazy"
                    src={asset(photo)}
                    style={objectPosition ? { objectPosition } : undefined}
                    alt={alt}
                  />
                  <div>
                    <p>{`“${quote}”`}</p>
                    <div className="testimonial-credit">
                      <p className="testimonial-name">{name}</p>
                      <span className="testimonial-tag">
                        <House strokeWidth={1.5} aria-hidden="true" />
                        {role}
                      </span>
                    </div>
                  </div>
                </RevealArticle>
              ),
            )}
          </div>
        </section>
        <section className="section estimate" id="estimativa">
          <div className="wrap two-grid">
            <RevealBlock className="estimate-copy">
              <h2>Veja uma parcela para o seu imóvel</h2>
              <p>
                Informe o valor do imóvel e receba uma estimativa de parcela.
                O consultor ajusta com você.
              </p>
            </RevealBlock>
            <RevealBlock className="form-panel" index={1}>
              <Simulador
                valorLabel="Valor do imóvel"
                sliderMin={100000}
                sliderMax={2000000}
                sliderStep={50000}
                sliderDefaultValue={350000}
                prazo={{
                  label: "Prazo desejado",
                  placeholder: "Selecione",
                  options: ["180 meses", "200 meses", "220 meses", "240 meses"],
                }}
                estrategia={{
                  label: "Estratégia de lance",
                  placeholder: "Selecione",
                  options: ["Conservadora", "Moderada", "Agressiva"],
                }}
                escolha={{
                  show: true,
                  label: "Usar FGTS como lance?",
                  simLabel: "Sim",
                  naoLabel: "Não",
                  padrao: "nao",
                }}
                accentColor="#FFB715"
                textColor="#F5F8FC"
                valueColor="#E2EAF4"
                borderColor="#D5E0EC"
                fieldGap={24}
                fontFamily="inherit"
                showCta={false}
                onValueChange={setValue}
              />
              <EstimateResult value={value} variant="mobile" />
              <Cta>Falar com um consultor sobre o meu imóvel</Cta>
              <p className="fine">
                As preferências orientam sua conversa. Esta referência não
                calcula efeitos de prazo, lance ou FGTS.
              </p>
            </RevealBlock>
          </div>
        </section>
        <section className="section wrap faq" id="duvidas">
          <RevealBlock>
            <span className="eyebrow">PARA DECIDIR COM CLAREZA</span>
            <h2>Perguntas frequentes</h2>
          </RevealBlock>
          <div>
            {faqs.map(([q, a]) => (
              <FaqItem key={q} question={q} answer={a} />
            ))}
          </div>
        </section>
        <section className="closing">
          <picture>
            <source
              media="(max-width:809px)"
              srcSet={asset("cta-final-mobile.webp")}
            />
            <img
              loading="lazy"
              src={asset("cta-final-desktop.webp")}
              alt="Casal olhando o celular em casa."
            />
          </picture>
          <div className="wrap closing-content">
            <RevealBlock className="closing-copy">
              <h2>Começa com uma conversa</h2>
              <p>
                Você fala com um consultor, não com um atendente. A primeira
                conversa é para entender o seu objetivo e montar a estratégia
                certa. A contratação vem depois, se fizer sentido para você.
              </p>
              <Cta>Continuar com um consultor</Cta>
            </RevealBlock>
          </div>
        </section>
        <ContactFormSection />
      </main>
      <footer className="site-footer" id="rodape">
        <div className="wrap footer-wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <img
                className="logo"
                src={asset("logo.png")}
                width="184"
                height="41"
                alt="Directcon Consórcios"
              />
              <p>
                Consórcio para imóvel, veículo, reforma e pesados.
                Acompanhamento do início à contemplação.
              </p>
              <div className="footer-actions">
                <Cta />
                <Cta href="#estimativa" secondary>
                  Simular parcela
                </Cta>
              </div>
            </div>
            <nav className="footer-navigation" aria-label="Navegação do rodapé">
              {/* cinco dos seis destinos são âncoras desta mesma página, então
                  o rótulo não pode prometer navegação para outras páginas */}
              <span>Navegação</span>
              <div className="footer-links">
                <a href="#inicio">Imóvel</a>
                <a href="#como-funciona">Como funciona</a>
                <a href="#comparativo">Consórcio vs. financiamento</a>
                <a href="#estimativa">Simular parcela</a>
                <a href="#duvidas">Dúvidas frequentes</a>
                <a href="#fale-com-consultor">
                  Falar com consultor
                </a>
              </div>
            </nav>
          </div>
          <div className="regulatory">
            <p>
              A Directcon Consórcios (DIRECTCON CONSORCIOS LTDA, CNPJ
              68.445.433/0001-94) atua como representante de administradoras de
              consórcio autorizadas e fiscalizadas pelo Banco Central do Brasil.
              A Directcon não é administradora de consórcio. O contrato de
              participação em grupo é celebrado entre o consorciado e a
              administradora escolhida, nos termos da Lei 11.795/2008.
            </p>
            <p>
              Consórcio não é financiamento. A contemplação ocorre por sorteio
              ou por lance em assembleia, e não há garantia de data ou de prazo
              para ser contemplado. Além das parcelas do crédito, incidem taxa de
              administração, fundo de reserva e, quando previsto, seguro.
            </p>
            <p>
              Os valores apresentados neste site são simulações baseadas nos
              dados informados e nas condições vigentes na data da consulta. Não
              constituem proposta, reserva de cota nem crédito aprovado. Leia o
              contrato de adesão e o regulamento do grupo antes de assinar.
            </p>
          </div>
          <div className="footer-certifications" aria-label="Autorizações e regulação">
            <div className="certification">
              <img
                className="cert-mark"
                src={asset("footer-bacen.png")}
                width="56"
                height="56"
                alt=""
                aria-hidden="true"
              />
              {/* O sujeito é a administradora, nunca a Directcon: ela é
                  representante, não administradora autorizada pelo Bacen.
                  Dizer o contrário aqui contradiz o parágrafo logo acima. */}
              <div>
                <strong>Administradoras reguladas pelo Banco Central</strong>
                <small>Autorizadas e fiscalizadas para operar consórcio</small>
              </div>
            </div>
            <div className="certification">
              <img
                className="cert-mark cert-mark-susep"
                src={asset("footer-susep.png")}
                width="46"
                height="56"
                alt=""
                aria-hidden="true"
              />
              {/* Idem: a SUSEP regula seguro, não consórcio. O que ela cobre
                  aqui é o seguro citado no parágrafo acima, contratado com
                  seguradora — não a Directcon. */}
              <div>
                <strong>Seguros regulados pela SUSEP</strong>
                <small>Quando previstos no contrato do grupo</small>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <a href="https://directconconsorcios.com/politica-de-privacidade">
              Política de Privacidade / LGPD
            </a>
            <a href="https://directconconsorcios.com/termos-de-uso">
              Termos de Uso
            </a>
            <span>© 2026 Directcon Consórcios. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>
    </MotionConfig>
  );
}
createRoot(document.getElementById("root")).render(<App />);
