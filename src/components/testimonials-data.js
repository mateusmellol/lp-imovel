// Depoimentos reais de clientes, um card por pessoa.
//
// `objectPosition` existe porque as fotos são retratos e o card corta em 1.6,
// como os demais `.photo-card` da página: sem ajuste o crop pega a altura do
// queixo. Mesmo recurso usado no card "Acompanhamento" da jornada.
//
// Outras falas gravadas, caso a operação prefira trocar a escolhida:
//
// Henrique
//   "A equipe desde o início sempre tranquilizou a gente. Toda a experiência
//    foi muito positiva."
//   "A equipe desde o início tava muito solícita, muito prestativa. Ajudou a
//    gente em vários momentos."
//
// Guilherme
//   "É uma solução bem inovadora no mercado."
//   "Fiquei bastante surpreso e curioso pro desenrolar, e foi muito bom."
export const testimonials = [
  {
    quote:
      "A gente conseguiu contemplar essa carta em conjunto com a equipe, o que agilizou muito nosso processo.",
    name: "Henrique",
    role: "Consórcio de imóvel",
    photo: "henrique.webp",
    alt: "Henrique, cliente da Directcon.",
    objectPosition: "50% 25%",
  },
  {
    quote:
      "Desde a análise, desde a estratégia, eu acho que tudo colaborou. E eu indicaria tranquilo.",
    name: "Guilherme",
    role: "Consórcio de imóvel",
    photo: "guilherme.webp",
    alt: "Guilherme, cliente da Directcon.",
    objectPosition: "50% 17%",
  },
  {
    quote:
      "O empresário que fizer a conta na ponta do lápis não vai mais buscar o financiamento tradicional.",
    name: "André",
    role: "Consórcio de imóvel",
    photo: "andre.webp",
    alt: "André, cliente da Directcon.",
    objectPosition: "50% 33%",
  },
];
