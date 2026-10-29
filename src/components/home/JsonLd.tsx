// Dados estruturados (JSON-LD) para SEO.
// Ajuda o Google a entender que o CanvaLabel é um software de criação de
// rótulos ANVISA para alimentos e cosméticos, e alimenta os "rich results"
// (FAQ, avaliações, breadcrumbs) nas buscas.

const SITE_URL = "https://canvalabel.com";

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "CanvaLabel",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description:
        "Plataforma para criar rótulos de alimentos e cosméticos em conformidade com a ANVISA, com tabela nutricional automática e selos obrigatórios.",
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "CanvaLabel",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "pt-BR",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "CanvaLabel",
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      inLanguage: "pt-BR",
      description:
        "Crie rótulos de alimentos e cosméticos de acordo com a ANVISA. Gere a tabela nutricional automática (IN 75/2020), a lupa e os selos “ALTO EM” (RDC 429/2020), as advertências de alérgenos (RDC 26/2015) e exporte em PDF pronto para a gráfica. Mais de 1.000 alimentos na base nutricional.",
      offers: {
        "@type": "Offer",
        price: "9.90",
        priceCurrency: "BRL",
        description: "Planos mensais a partir de R$ 9,90, com IA, revisor ANVISA, tabela nutricional e PDF para gráfica.",
      },
      featureList: [
        "Rótulos com inteligência artificial",
        "Tabela nutricional automática (IN 75/2020)",
        "Selos obrigatórios e lupa “ALTO EM” (RDC 429/2020)",
        "Advertência de alérgenos e glúten (RDC 26/2015 e Lei 10.674)",
        "Mais de 1.000 alimentos na base nutricional",
        "Exportação em PDF de alta resolução para gráfica",
        "Rótulos de cosméticos em conformidade com a ANVISA",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "Como fazer um rótulo de alimento de acordo com a ANVISA?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No CanvaLabel você descreve o produto e a plataforma monta o rótulo já com a tabela nutricional no padrão da IN 75/2020, a lupa e os selos “ALTO EM” quando exigidos pela RDC 429/2020, e as advertências de alérgenos (RDC 26/2015). Ao final você exporta um PDF de alta resolução pronto para a gráfica.",
          },
        },
        {
          "@type": "Question",
          name: "O CanvaLabel gera a tabela nutricional automaticamente?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim. A tabela nutricional é calculada automaticamente a partir da receita ou dos valores informados, com mais de 1.000 alimentos cadastrados na base. Os valores seguem o padrão e o arredondamento da IN 75/2020 da ANVISA.",
          },
        },
        {
          "@type": "Question",
          name: "A plataforma cria os selos obrigatórios e a lupa?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim. O CanvaLabel gera automaticamente os selos frontais “ALTO EM” (a lupa preta) conforme a RDC 429/2020, além das advertências de alérgenos e de glúten exigidas pela RDC 26/2015 e pela Lei 10.674.",
          },
        },
        {
          "@type": "Question",
          name: "Posso criar rótulos de cosméticos também?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sim. Além de alimentos, o CanvaLabel cria rótulos de cosméticos (shampoos, cremes, sabonetes e mais) em conformidade com as normas da ANVISA, com editor visual e modelos prontos.",
          },
        },
        {
          "@type": "Question",
          name: "Quanto custa o CanvaLabel?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Os planos começam em R$ 9,90 por mês, sem fidelidade, e todos incluem geração por IA, revisor com as regras da ANVISA, tabela nutricional automática e exportação em PDF para a gráfica. O que muda entre os planos é a quantidade de rótulos e de créditos de IA por mês.",
          },
        },
      ],
    },
  ],
};

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
