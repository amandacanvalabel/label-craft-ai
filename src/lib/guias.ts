// Guias públicos de rotulagem (/guias). Cada guia responde UMA pergunta real
// de quem produz alimento ou cosmético, com a resposta logo no início, a norma
// vigente e o link oficial. É o conteúdo que buscadores e assistentes de IA
// leem e citam. Revisar as datas e as normas sempre que a ANVISA publicar algo.
//
// Fatos conferidos em 05/11/2026 nos textos consolidados da ANVISA. Não
// publicar aqui o que não foi confirmado na fonte (ex.: alturas mínimas do
// conteúdo líquido, regras de ordem do INCI).

export type Categoria = "alimentos" | "cosmeticos";

export interface Secao {
  h2: string;
  p?: string[];
  ul?: string[];
  tabela?: { cab: string[]; linhas: string[][] };
  nota?: string;
}

export interface Guia {
  slug: string;
  categoria: Categoria;
  titulo: string;
  metaTitulo: string;
  descricao: string;
  resposta: string;
  secoes: Secao[];
  faq: { q: string; a: string }[];
  normas: { nome: string; url: string }[];
  relacionados: string[];
  publicado: string;
  atualizado: string;
}

export const CATEGORIAS: Record<Categoria, { nome: string; cta: string; ctaHref: string }> = {
  alimentos: { nome: "Alimentos", cta: "Montar o rótulo do meu alimento", ctaHref: "/criar" },
  cosmeticos: { nome: "Cosméticos", cta: "Montar o rótulo do meu cosmético", ctaHref: "/criar" },
};

const U = {
  rdc727: "https://antigo.anvisa.gov.br/documents/10181/6503668/(1)RDC_727_2022_COMP.pdf/8167fbac-395a-4189-ab43-024e4d3aa667",
  lei10674: "https://www2.camara.leg.br/legin/fed/lei/2003/lei-10674-16-maio-2003-496699-normaatualizada-pl.html",
  rdc429: "https://www.legisweb.com.br/legislacao/?id=479492",
  in75: "https://antigo.anvisa.gov.br/documents/10181/3882585/%283%29IN_75_2020_COMP.pdf/e5a331f2-86db-4bc8-9f39-afb6c1d7e19f",
  faqNutri: "https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/alimentos/perguntas-e-respostas-arquivos/rotulagem-nutricional_2a-edicao.pdf/@@download/file",
  rdc907: "https://antigo.anvisa.gov.br/documents/10181/6856654/RDC_907_2024_.pdf/2016b944-8f47-4273-b152-b58dd76b67dc",
  rdc949: "https://legismap.com.br/phocadownload/anexos/16122024_anvisa.pdf",
  rdc898: "https://antigo.anvisa.gov.br/documents/10181/6856654/RDC_898_2024_.pdf/05529364-3316-4e12-afcc-370ab79863eb",
  faqCosm: "https://www.gov.br/anvisa/pt-br/acessoainformacao/perguntasfrequentes/cosmeticos/rdc-no-646-2022",
  inmetro249: "https://abre.org.br/wp-content/uploads/2024/11/inmetro.pdf",
};

const HOJE = "2026-11-05";

export const GUIAS: Guia[] = [
  {
    slug: "rotulo-de-alimentos-o-que-e-obrigatorio",
    categoria: "alimentos",
    titulo: "O que é obrigatório no rótulo de alimentos embalados",
    metaTitulo: "O que é obrigatório no rótulo de alimentos (RDC 727/2022)",
    descricao:
      "Lista completa dos itens obrigatórios no rótulo de alimento embalado segundo a RDC 727/2022 da ANVISA: ingredientes, alérgenos, lactose, glúten, tabela nutricional, lote, validade e mais.",
    resposta:
      "Pela RDC 727/2022 da ANVISA, em vigor desde 1º de setembro de 2022, o rótulo de um alimento embalado precisa trazer: denominação de venda, lista de ingredientes, advertências de alérgenos e de lactose (quando houver), rotulagem nutricional, conteúdo líquido, identificação da origem, lote, prazo de validade e instruções de conservação, preparo e uso quando necessárias. A Lei 10.674/2003 exige ainda a frase “CONTÉM GLÚTEN” ou “NÃO CONTÉM GLÚTEN”.",
    secoes: [
      {
        h2: "Os itens obrigatórios, um por um (art. 7º da RDC 727/2022)",
        ul: [
          "**Denominação de venda**: o nome que diz o que o alimento é (ex.: “Biscoito de polvilho”).",
          "**Lista de ingredientes**: dispensada só para alimento de ingrediente único.",
          "**Advertências sobre alérgenos**: “ALÉRGICOS: CONTÉM …” ou “ALÉRGICOS: PODE CONTER …”.",
          "**Advertência sobre lactose**: “CONTÉM LACTOSE” acima de 100 mg por 100 g ou 100 mL.",
          "**Declaração de nova fórmula**, quando a composição mudar (RDC 421/2020).",
          "**Advertências sobre aditivos** exigidas por normas específicas.",
          "**Rotulagem nutricional**: tabela de informação nutricional e, quando aplicável, a lupa “ALTO EM” (RDC 429/2020 e IN 75/2020).",
          "**Conteúdo líquido**, conforme as regras do Inmetro.",
          "**Identificação da origem**: nome ou razão social e endereço de quem fabrica ou é responsável, e o país de origem.",
          "**Identificação do lote**.",
          "**Prazo de validade** (alguns produtos do Anexo I da norma são dispensados).",
          "**Instruções de conservação, preparo e uso**, quando necessárias.",
          "**Outros itens exigidos por normas específicas** do tipo de alimento.",
        ],
        nota: "Além disso, a Lei 10.674/2003 obriga todo alimento industrializado a informar “CONTÉM GLÚTEN” ou “NÃO CONTÉM GLÚTEN”, com destaque e fácil leitura.",
      },
      {
        h2: "Quais normas a RDC 727/2022 substituiu",
        p: [
          "A RDC 727/2022 reuniu em um só texto regras que antes estavam espalhadas. Ela revogou, entre outras, a RDC 259/2002 (rotulagem geral), a RDC 26/2015 (alérgenos), a RDC 136/2017 (lactose), a RDC 340/2002, a RDC 123/2004, a RDC 35/2009, a RDC 459/2020 e a IN 67/2020.",
          "Se o seu rótulo, sua gráfica ou um modelo antigo ainda citam a RDC 259/2002 ou a RDC 26/2015, a referência está desatualizada. As exigências de conteúdo continuaram parecidas, mas a norma que vale hoje é a RDC 727/2022.",
        ],
      },
      {
        h2: "Tamanho mínimo das letras",
        tabela: {
          cab: ["Informação", "Altura mínima", "Base legal"],
          linhas: [
            ["Informações obrigatórias em geral", "1 mm", "RDC 727/2022, art. 8º, III"],
            ["Advertências de alérgenos e de lactose", "2 mm (1 mm se o painel principal tiver até 100 cm²) e nunca menor que a letra da lista de ingredientes", "RDC 727/2022, arts. 15 e 19"],
            ["Declaração de nova fórmula", "2 mm", "RDC 727/2022, art. 23, IV"],
          ],
        },
      },
      {
        h2: "Embalagens muito pequenas",
        p: [
          "Quando o painel principal tem menos de 10 cm², a embalagem individual fica dispensada da lista de ingredientes, da identificação da origem, do lote, da validade e das instruções de conservação, exceto para especiarias e ervas (art. 7º, § 4º). A embalagem externa, que vai ao consumidor, precisa trazer todas as informações.",
        ],
      },
      {
        h2: "Conteúdo líquido",
        p: [
          "A indicação de quantidade segue a Portaria Inmetro 249/2021: unidades do Sistema Internacional (g, kg, mL, L), cor contrastante com o fundo e expressões como “PESO LÍQUIDO” ou “CONTEÚDO LÍQUIDO” (massa) e “CONTEÚDO” ou “VOLUME LÍQUIDO” (volume). Produtos com duas fases, como conservas, declaram “PESO LÍQUIDO” e “PESO DRENADO”. A altura mínima dos números depende do tamanho do conteúdo: confira as tabelas da própria portaria.",
        ],
      },
      {
        h2: "Há mudanças a caminho?",
        p: [
          "Sim. A ANVISA abriu a Consulta Pública 1.357/2025 para revisar a rotulagem geral (incluindo alérgenos) e a Consulta Pública 1.400/2026 sobre declaração quantitativa de ingredientes, informação por meio digital (QR code) e alimentos irradiados. Até a publicação de uma nova resolução, as regras da RDC 727/2022 continuam valendo.",
        ],
      },
    ],
    faq: [
      {
        q: "Qual norma da ANVISA regula o rótulo de alimentos hoje?",
        a: "A RDC 727/2022, em vigor desde 1º de setembro de 2022, para a rotulagem geral de alimentos embalados. A rotulagem nutricional (tabela e lupa) segue a RDC 429/2020 e a IN 75/2020.",
      },
      {
        q: "A RDC 259/2002 ainda vale?",
        a: "Não. Ela foi revogada pela RDC 727/2022, assim como a RDC 26/2015 (alérgenos) e a RDC 136/2017 (lactose).",
      },
      {
        q: "Pequeno produtor precisa seguir as mesmas regras?",
        a: "Sim. Agricultura familiar, MEI e produção artesanal tiveram prazos maiores para se adequar à rotulagem nutricional, mas esses prazos já terminaram e não há dispensa geral para pequenos produtores.",
      },
      {
        q: "Onde coloco a advertência de alérgenos?",
        a: "Imediatamente após ou abaixo da lista de ingredientes, em caixa alta, negrito e cor contrastante, nunca em área que se rasga na abertura ou fica encoberta (RDC 727/2022, art. 15).",
      },
    ],
    normas: [
      { nome: "RDC 727/2022 (texto consolidado)", url: U.rdc727 },
      { nome: "Lei 10.674/2003 (glúten)", url: U.lei10674 },
      { nome: "RDC 429/2020 (rotulagem nutricional)", url: U.rdc429 },
      { nome: "Portaria Inmetro 249/2021 (conteúdo líquido)", url: U.inmetro249 },
    ],
    relacionados: ["tabela-nutricional-como-fazer", "alergenicos-gluten-e-lactose-no-rotulo", "lupa-alto-em-quando-usar"],
    publicado: HOJE,
    atualizado: HOJE,
  },
  {
    slug: "tabela-nutricional-como-fazer",
    categoria: "alimentos",
    titulo: "Como fazer a tabela nutricional do seu alimento",
    metaTitulo: "Tabela nutricional: como fazer pela RDC 429/2020 e IN 75/2020",
    descricao:
      "Quais nutrientes são obrigatórios, quais colunas a tabela precisa ter, o formato exigido e quem é dispensado da tabela nutricional segundo a RDC 429/2020 e a IN 75/2020.",
    resposta:
      "A tabela de informação nutricional segue a RDC 429/2020 e a IN 75/2020, em vigor desde 9 de outubro de 2022. Ela deve declarar valor energético, carboidratos, açúcares totais, açúcares adicionados, proteínas, gorduras totais, gorduras saturadas, gorduras trans, fibra alimentar e sódio, em três colunas: por 100 g (ou 100 mL), por porção (com a medida caseira) e %VD.",
    secoes: [
      {
        h2: "Nutrientes obrigatórios (art. 5º da RDC 429/2020)",
        ul: [
          "Valor energético",
          "Carboidratos, açúcares totais e açúcares adicionados",
          "Proteínas",
          "Gorduras totais, gorduras saturadas e gorduras trans",
          "Fibra alimentar",
          "Sódio",
        ],
        nota: "Também entram na tabela os nutrientes sobre os quais o rótulo faz alguma alegação (ex.: “rico em fibras”), os nutrientes adicionados ao produto e as substâncias bioativas adicionadas.",
      },
      {
        h2: "As colunas e o formato",
        p: [
          "A tabela traz os valores por 100 g ou 100 mL, por porção (em g ou mL e na medida caseira, como “1 xícara” ou “2 unidades”) e o percentual de valores diários (%VD). O modelo padrão está no Anexo IX da IN 75/2020.",
          "O formato é padronizado: fundo branco e letras pretas, fontes Arial, Helvetica, Arial Narrow ou Helvetica Condensed, título em 10 pt, demais textos em 8 pt e rodapé em 6 pt. Os valores seguem as regras de arredondamento da própria IN 75/2020.",
        ],
      },
      {
        h2: "Prazos de adequação: todos já terminaram",
        tabela: {
          cab: ["Situação", "Prazo final"],
          linhas: [
            ["Entrada em vigor da RDC 429/2020", "9/10/2022"],
            ["Produtos que já estavam no mercado", "9/10/2023"],
            ["Agricultura familiar, MEI, agroindústria de pequeno porte, artesanais e similares", "9/10/2024"],
            ["Bebidas não alcoólicas em embalagens retornáveis", "9/10/2025"],
          ],
        },
        nota: "Datas calculadas a partir dos prazos em meses do art. 50 da RDC 429/2020.",
      },
      {
        h2: "Quem é dispensado da tabela",
        p: [
          "A tabela é obrigatória para alimentos embalados na ausência do consumidor. Ela passa a ser voluntária para os alimentos listados no Anexo I da IN 75/2020, desde que não tenham nutrientes adicionados nem alegações nutricionais. Exemplos citados pela ANVISA: embalagens com área visível para rotulagem de até 100 cm², bebidas alcoólicas e frutas, hortaliças, carnes e pescados in natura, refrigerados ou congelados, sem outros ingredientes.",
          "Ser pequeno produtor não dispensa da tabela: os pequenos só tiveram mais tempo para se adequar.",
        ],
      },
      {
        h2: "Como o CanvaLabel monta a tabela",
        p: [
          "Você informa a receita (ingredientes e quantidades) ou os valores por porção. O CanvaLabel calcula os nutrientes com uma base de mais de 1.000 alimentos, aplica o arredondamento e o %VD da IN 75/2020, monta a tabela no formato do Anexo IX e indica se o produto precisa da lupa “ALTO EM”. A responsabilidade pelos valores declarados continua sendo do fabricante.",
        ],
      },
    ],
    faq: [
      {
        q: "Açúcar adicionado precisa aparecer separado?",
        a: "Sim. Desde a RDC 429/2020, a tabela declara açúcares totais e açúcares adicionados em linhas separadas.",
      },
      {
        q: "A tabela pode ser colorida?",
        a: "Não. O modelo da IN 75/2020 exige letras pretas sobre fundo branco, com as fontes e tamanhos definidos na norma.",
      },
      {
        q: "Microempreendedor individual precisa de tabela nutricional?",
        a: "Sim, se vende alimento embalado. O MEI teve prazo até 9/10/2024 para se adequar, mas não ficou dispensado.",
      },
    ],
    normas: [
      { nome: "RDC 429/2020", url: U.rdc429 },
      { nome: "IN 75/2020 (texto consolidado)", url: U.in75 },
      { nome: "Perguntas e respostas da ANVISA sobre rotulagem nutricional", url: U.faqNutri },
    ],
    relacionados: ["lupa-alto-em-quando-usar", "rotulo-de-alimentos-o-que-e-obrigatorio", "alergenicos-gluten-e-lactose-no-rotulo"],
    publicado: HOJE,
    atualizado: HOJE,
  },
  {
    slug: "lupa-alto-em-quando-usar",
    categoria: "alimentos",
    titulo: "Lupa “ALTO EM”: quando o seu alimento precisa e como aplicar",
    metaTitulo: "Lupa ALTO EM: limites, tamanho e posição (RDC 429/2020)",
    descricao:
      "Limites de açúcar adicionado, gordura saturada e sódio que obrigam a lupa “ALTO EM”, onde ela vai na embalagem e quem está dispensado. Com calculadora grátis.",
    resposta:
      "O alimento precisa da lupa “ALTO EM” quando, por 100 g, tem 15 g ou mais de açúcares adicionados, 6 g ou mais de gorduras saturadas ou 600 mg ou mais de sódio. Para líquidos, por 100 mL, os limites são 7,5 g, 3 g e 300 mg. A lupa vai na metade superior do painel principal, com a arte oficial da ANVISA e tamanho proporcional à área do painel (RDC 429/2020 e IN 75/2020).",
    secoes: [
      {
        h2: "Os limites que obrigam a lupa",
        tabela: {
          cab: ["Nutriente", "Sólidos e semissólidos (por 100 g)", "Líquidos (por 100 mL)"],
          linhas: [
            ["Açúcares adicionados", "15 g ou mais", "7,5 g ou mais"],
            ["Gorduras saturadas", "6 g ou mais", "3 g ou mais"],
            ["Sódio", "600 mg ou mais", "300 mg ou mais"],
          ],
        },
        nota: "Limites do Anexo XV da IN 75/2020. Os valores são do alimento como exposto à venda.",
      },
      {
        h2: "Onde e como a lupa entra na embalagem",
        ul: [
          "Na **metade superior do painel principal**, em uma única superfície contínua (RDC 429/2020, art. 21).",
          "Com a **arte oficial** do Anexo XVII da IN 75/2020: lupa e “ALTO EM” em preto sobre branco, sem mudar cores ou proporções.",
          "Quando há mais de um nutriente acima do limite, eles aparecem **juntos em um único selo**.",
          "O **tamanho** é proporcional à área do painel principal, conforme o Anexo XVIII da IN 75/2020.",
        ],
      },
      {
        h2: "Quando a lupa não é usada",
        ul: [
          "É **proibida** nos alimentos listados no Anexo XVI da IN 75/2020.",
          "É **opcional** quando o painel principal tem menos de 35 cm², quando o alimento é embalado no ponto de venda a pedido do consumidor e quando é preparado e embalado no próprio local.",
        ],
      },
    ],
    faq: [
      {
        q: "Meu produto tem pouco sódio mas muito açúcar. Preciso da lupa?",
        a: "Sim. Basta um dos três nutrientes atingir o limite para a lupa ser obrigatória, indicando só o nutriente que passou do limite.",
      },
      {
        q: "Posso colocar a lupa no verso da embalagem?",
        a: "Não. Ela vai na metade superior do painel principal, que é a face que o consumidor vê na prateleira.",
      },
      {
        q: "Posso mudar a cor da lupa para combinar com a embalagem?",
        a: "Não. A arte é a do Anexo XVII da IN 75/2020, em preto sobre fundo branco, sem alterar cores ou proporções.",
      },
    ],
    normas: [
      { nome: "RDC 429/2020", url: U.rdc429 },
      { nome: "IN 75/2020 (Anexos XV a XVIII)", url: U.in75 },
    ],
    relacionados: ["tabela-nutricional-como-fazer", "rotulo-de-alimentos-o-que-e-obrigatorio"],
    publicado: HOJE,
    atualizado: HOJE,
  },
  {
    slug: "alergenicos-gluten-e-lactose-no-rotulo",
    categoria: "alimentos",
    titulo: "Alérgenos, glúten e lactose no rótulo: frases e regras",
    metaTitulo: "Alérgenos, glúten e lactose no rótulo (RDC 727/2022)",
    descricao:
      "Como escrever “ALÉRGICOS: CONTÉM”, “PODE CONTER”, “CONTÉM LACTOSE” e “CONTÉM GLÚTEN” no rótulo, com tamanho, posição e formatação exigidos pela ANVISA.",
    resposta:
      "Pela RDC 727/2022, o alimento que contém alérgenos deve trazer “ALÉRGICOS: CONTÉM (nome do alimento)” e, quando há risco de contaminação cruzada, “ALÉRGICOS: PODE CONTER (nome)”. A frase vai logo após a lista de ingredientes, em caixa alta, negrito, cor contrastante e com pelo menos 2 mm de altura. Acima de 100 mg de lactose por 100 g ou 100 mL, é obrigatório “CONTÉM LACTOSE”. A Lei 10.674/2003 exige “CONTÉM GLÚTEN” ou “NÃO CONTÉM GLÚTEN”.",
    secoes: [
      {
        h2: "As frases de alérgenos",
        ul: [
          "Alérgeno presente: **“ALÉRGICOS: CONTÉM (nomes comuns)”**, “ALÉRGICOS: CONTÉM DERIVADOS DE (…)” ou “ALÉRGICOS: CONTÉM (…) E DERIVADOS” (art. 13).",
          "Para crustáceos, informe também o nome comum das espécies.",
          "Risco de contaminação cruzada: **“ALÉRGICOS: PODE CONTER (nomes comuns)”** (art. 14), usada só com base em um Programa de Controle de Alergênicos.",
          "Havendo várias advertências, elas formam uma frase única iniciada por “ALÉRGICOS:”.",
        ],
      },
      {
        h2: "Quais alimentos são alergênicos (Anexo III)",
        p: [
          "Cereais com glúten (trigo, centeio, cevada, aveia e híbridos), crustáceos, ovos, peixes, amendoim, soja, leite de todos os mamíferos, castanhas e nozes listadas na norma (amêndoa, avelã, castanha-de-caju, castanha-do-brasil, macadâmia, nozes, pecã, pistache, pinoli e castanhas) e látex natural.",
        ],
      },
      {
        h2: "Formatação obrigatória (art. 15)",
        ul: [
          "Caixa alta, negrito e cor contrastante com o fundo.",
          "Altura mínima de 2 mm, nunca menor que a letra da lista de ingredientes; 1 mm quando o painel principal tem até 100 cm².",
          "Imediatamente após ou abaixo da lista de ingredientes.",
          "Nunca em área encoberta, que se remove na abertura ou de selagem e torção.",
        ],
      },
      {
        h2: "Lactose e glúten",
        p: [
          "**Lactose:** “CONTÉM LACTOSE” é obrigatório quando o alimento, como exposto à venda, tem mais de 100 mg de lactose por 100 g ou 100 mL (art. 18), com a mesma formatação das advertências de alérgenos.",
          "**Glúten:** a frase vem da Lei 10.674/2003: todo alimento industrializado informa “CONTÉM GLÚTEN” ou “NÃO CONTÉM GLÚTEN”, em caracteres com destaque, nítidos e de fácil leitura.",
        ],
      },
      {
        h2: "Revisão em discussão",
        p: [
          "Em 2025 a ANVISA discutiu uma revisão da rotulagem de alérgenos, com propostas como trocar “ALÉRGICOS: CONTÉM” por “Contém”, destacar o alérgeno em negrito na lista de ingredientes, criar a advertência “Contém sulfito” e incluir gergelim, mostarda, aipo, tremoço e trigo-sarraceno na lista. São propostas: até uma nova resolução ser publicada, valem as regras da RDC 727/2022 descritas acima.",
        ],
      },
    ],
    faq: [
      {
        q: "A RDC 26/2015 de alérgenos ainda vale?",
        a: "Não. Ela foi revogada pela RDC 727/2022, que manteve a lógica das frases “ALÉRGICOS: CONTÉM” e “PODE CONTER”.",
      },
      {
        q: "Posso escrever “pode conter traços de leite” por precaução?",
        a: "Só com base em um Programa de Controle de Alergênicos que identifique o risco de contaminação cruzada. A frase correta é “ALÉRGICOS: PODE CONTER LEITE”.",
      },
      {
        q: "Todo alimento precisa falar de glúten?",
        a: "Sim. A Lei 10.674/2003 obriga todo alimento industrializado a informar “CONTÉM GLÚTEN” ou “NÃO CONTÉM GLÚTEN”.",
      },
    ],
    normas: [
      { nome: "RDC 727/2022 (arts. 13 a 19 e Anexo III)", url: U.rdc727 },
      { nome: "Lei 10.674/2003", url: U.lei10674 },
    ],
    relacionados: ["rotulo-de-alimentos-o-que-e-obrigatorio", "tabela-nutricional-como-fazer"],
    publicado: HOJE,
    atualizado: HOJE,
  },
  {
    slug: "rotulo-de-cosmeticos-o-que-e-obrigatorio",
    categoria: "cosmeticos",
    titulo: "O que é obrigatório no rótulo de cosméticos",
    metaTitulo: "O que é obrigatório no rótulo de cosméticos (RDC 907/2024)",
    descricao:
      "Itens obrigatórios no rótulo de cosméticos, produtos de higiene e perfumes segundo a RDC 907/2024 da ANVISA: embalagem primária, secundária, INCI, advertências e embalagens pequenas.",
    resposta:
      "Desde 23 de setembro de 2024, o rótulo de cosméticos, produtos de higiene pessoal e perfumes segue a RDC 907/2024 da ANVISA, que substituiu a RDC 752/2022. A embalagem que fica em contato com o produto deve ter nome, marca, grupo (se o nome não indicar), lote e advertências. A embalagem externa traz ainda conteúdo, ingredientes em INCI, prazo de validade, país de origem, razão social e CNPJ do titular, número da AFE, número de regularização na ANVISA e SAC.",
    secoes: [
      {
        h2: "Embalagem primária (art. 13, I)",
        p: ["É a que fica em contato direto com o produto: frasco, pote, bisnaga. Ela deve trazer:"],
        ul: [
          "Nome e marca do produto",
          "Grupo ou tipo do produto, quando o nome não deixar claro",
          "Número do lote",
          "Advertências e restrições de uso, quando houver",
        ],
      },
      {
        h2: "Embalagem secundária (art. 13, II)",
        p: ["É a embalagem externa, como o cartucho. Ela deve trazer:"],
        ul: [
          "Nome, marca e grupo do produto",
          "Conteúdo (quantidade)",
          "Ingredientes na nomenclatura INCI, com a tradução para o português exigida pela RDC 898/2024",
          "Prazo de validade",
          "País de origem",
          "Razão social e CNPJ do titular",
          "Número da Autorização de Funcionamento (AFE)",
          "Número do processo de regularização na ANVISA (notificação ou registro)",
          "Serviço de atendimento ao consumidor (SAC)",
          "Advertências e restrições de uso, quando houver",
        ],
        nota: "O modo de uso, quando aplicável, pode ir na primária ou na secundária; é obrigatório para fixadores e modeladores de cabelo e barba. Se o produto não tem embalagem secundária, tudo vai na primária (art. 14).",
      },
      {
        h2: "Idioma e embalagens pequenas",
        p: [
          "Tudo em português do Brasil, exceto a lista INCI, o nome e a marca (art. 20).",
          "Quando a embalagem é pequena demais, a norma permite levar parte das informações para um folheto ou para a face interna da embalagem, com a frase “Ver folheto/material anexo/parte interna da embalagem secundária”, ou indicar “Advertências e restrições de uso: ver embalagem externa” (arts. 15 a 18).",
        ],
      },
      {
        h2: "Advertências obrigatórias por categoria",
        p: [
          "O art. 24 da RDC 907/2024 traz frases obrigatórias para 16 categorias, entre elas aerossóis, tinturas e clareadores capilares, alisantes e onduladores, depilatórios, autobronzeadores, antitranspirantes, cremes dentais e enxaguantes com flúor, produtos para dentes sensíveis, hipoalergênicos, higiene íntima e tônicos capilares. Protetor solar segue também a RDC 629/2022, e substâncias de uso restrito têm advertências próprias na RDC 530/2021.",
        ],
      },
      {
        h2: "Normas antigas que não valem mais",
        p: [
          "A RDC 907/2024 revogou a RDC 752/2022, que por sua vez já tinha revogado a RDC 07/2015. Produtos regularizados até 3/10/2022 tiveram até 3/10/2025 para adequar o rótulo. Se o seu rótulo ainda cita a RDC 07/2015 ou a RDC 752/2022, revise.",
        ],
      },
    ],
    faq: [
      {
        q: "Qual é a norma de rotulagem de cosméticos em vigor?",
        a: "A RDC 907/2024 da ANVISA, publicada em 23/09/2024 e alterada pela RDC 949/2024. Ela substituiu a RDC 752/2022.",
      },
      {
        q: "O SAC é obrigatório no rótulo de cosmético?",
        a: "Sim. O serviço de atendimento ao consumidor está entre os itens obrigatórios da embalagem secundária (RDC 907/2024, art. 13, II).",
      },
      {
        q: "Preciso colocar o número da ANVISA no rótulo?",
        a: "Sim. O número do processo de regularização (notificação ou registro) e o número da AFE vão na embalagem secundária.",
      },
    ],
    normas: [
      { nome: "RDC 907/2024", url: U.rdc907 },
      { nome: "RDC 949/2024 (altera a RDC 907/2024)", url: U.rdc949 },
      { nome: "RDC 898/2024 (tradução dos ingredientes)", url: U.rdc898 },
    ],
    relacionados: ["cosmetico-grau-1-ou-grau-2", "ingredientes-inci-em-cosmeticos"],
    publicado: HOJE,
    atualizado: HOJE,
  },
  {
    slug: "cosmetico-grau-1-ou-grau-2",
    categoria: "cosmeticos",
    titulo: "Cosmético grau 1 ou grau 2: qual é o seu e o que muda",
    metaTitulo: "Cosmético grau 1 ou grau 2: notificação ou registro na ANVISA",
    descricao:
      "Diferença entre cosmético grau 1 e grau 2, o que faz um produto virar grau 2, quais precisam de registro e quais só de notificação, segundo a RDC 907/2024 e a RDC 949/2024.",
    resposta:
      "Cosméticos grau 1 têm propriedades básicas e não exigem comprovação de eficácia específica (ex.: sabonete, xampu e hidratante sem indicação especial). Grau 2 são os que têm indicação específica e exigem comprovação de segurança e eficácia (ex.: protetor solar, produtos infantis, antitranspirantes, tinturas, alisantes). A classificação está na RDC 907/2024, com a lista do Anexo I atualizada pela RDC 949/2024. Só alguns grau 2 precisam de registro; os demais produtos são apenas notificados à ANVISA.",
    secoes: [
      {
        h2: "O que faz um produto ser grau 2",
        p: ["Pela RDC 949/2024, um produto que seria grau 1 passa a grau 2 se declarar indicação para:"],
        ul: [
          "Gestantes ou crianças",
          "Pele acneica ou sensível, ou dentes sensíveis",
          "Ação anticárie ou clareadora dos dentes",
          "Higiene íntima",
          "Antitranspirante",
          "Clareamento da pele",
          "Ação antibacteriana ou antisséptica",
          "Proteção solar ou bronzeamento",
          "Anticaspa",
          "Tintura ou descoloração de cabelos e pelos",
        ],
        nota: "O Anexo I traz listas indicativas: 71 grupos de produtos grau 1 e 46 grupos de grau 2. Produtos já regularizados têm até 2/1/2030 para se adequar à nova classificação.",
      },
      {
        h2: "Registro ou notificação?",
        p: [
          "Precisam de **registro** (art. 34 da RDC 907/2024): bronzeador, gel antisséptico para as mãos, produtos para alisar, alisar e tingir ou ondular os cabelos, protetor solar (adulto e infantil) e repelente de insetos (adulto e infantil).",
          "Todos os outros produtos, de grau 1 ou grau 2, são isentos de registro e passam por **notificação**, uma comunicação prévia à ANVISA antes da venda (art. 35). O registro vale 10 anos; no produto notificado, a empresa declara a cada 10 anos que quer continuar vendendo.",
        ],
      },
      {
        h2: "O que isso muda no rótulo",
        p: [
          "O número do processo de regularização (notificação ou registro) vai na embalagem secundária. Produtos grau 2 costumam ter advertências obrigatórias específicas, listadas no art. 24 da RDC 907/2024, e o protetor solar segue também a RDC 629/2022 (FPS e categoria de proteção no rótulo).",
        ],
      },
    ],
    faq: [
      {
        q: "Sabonete líquido é grau 1 ou grau 2?",
        a: "Sabonete sem indicação específica é grau 1. Se o rótulo prometer ação antibacteriana, uso infantil ou higiene íntima, passa a ser grau 2.",
      },
      {
        q: "Todo cosmético grau 2 precisa de registro?",
        a: "Não. Só os listados no art. 34 da RDC 907/2024 (protetor solar, repelente, bronzeador, alisantes, tinturas e onduladores, gel antisséptico). Os demais grau 2 são notificados.",
      },
      {
        q: "Produto para criança é sempre grau 2?",
        a: "Sim. A indicação para crianças é um dos critérios que tornam o produto grau 2 pela RDC 949/2024.",
      },
    ],
    normas: [
      { nome: "RDC 907/2024 (arts. 3º, 34 e 35)", url: U.rdc907 },
      { nome: "RDC 949/2024 (novo Anexo I)", url: U.rdc949 },
    ],
    relacionados: ["rotulo-de-cosmeticos-o-que-e-obrigatorio", "ingredientes-inci-em-cosmeticos"],
    publicado: HOJE,
    atualizado: HOJE,
  },
  {
    slug: "ingredientes-inci-em-cosmeticos",
    categoria: "cosmeticos",
    titulo: "Lista de ingredientes de cosméticos: INCI e tradução para o português",
    metaTitulo: "Ingredientes de cosméticos: INCI e tradução (RDC 898/2024)",
    descricao:
      "Como declarar a composição de cosméticos: nomenclatura INCI obrigatória, tradução para o português exigida pela RDC 898/2024, formatos aceitos e corantes.",
    resposta:
      "A lista de ingredientes de cosméticos deve usar a nomenclatura INCI (RDC 907/2024) e, desde setembro de 2024, também trazer a tradução para o português, exigida pela RDC 898/2024. A tradução pode vir ao lado de cada nome (entre parênteses ou após barra) ou em uma segunda lista na mesma ordem, seguindo a lista oficial de traduções da ANVISA.",
    secoes: [
      {
        h2: "INCI continua obrigatório",
        p: [
          "INCI (International Nomenclature of Cosmetic Ingredients) é o nome padronizado internacionalmente para cada ingrediente, como “Aqua”, “Glycerin” ou “Sodium Laureth Sulfate”. A RDC 907/2024 exige a composição em INCI na embalagem secundária (ou na primária, quando não há secundária).",
        ],
      },
      {
        h2: "Tradução para o português (RDC 898/2024)",
        ul: [
          "Ao lado de cada ingrediente, entre parênteses ou após uma barra: “Aqua (água)” ou “Aqua / água”.",
          "Ou em uma segunda lista, na mesma ordem da lista INCI.",
          "Pode ir em etiqueta complementar não removível.",
          "Pode ir em meio digital, precedida de “Composição (português):”.",
          "A tradução deve seguir a lista oficial da ANVISA.",
        ],
        nota: "A RDC 898/2024 está em vigor desde a publicação, em 2/9/2024, e revogou as RDC 646/2022 e 773/2023.",
      },
      {
        h2: "Corantes",
        p: [
          "Para declarar corantes, as perguntas frequentes da ANVISA orientam usar “Pode conter os corantes:” ou “Contém os corantes:” antes da lista.",
        ],
      },
    ],
    faq: [
      {
        q: "Posso escrever os ingredientes só em português?",
        a: "Não. A lista INCI continua obrigatória; o português entra como tradução, ao lado ou em uma segunda lista.",
      },
      {
        q: "Onde encontro a tradução oficial de cada ingrediente?",
        a: "Na lista de traduções publicada pela ANVISA, citada no art. 3º da RDC 898/2024.",
      },
    ],
    normas: [
      { nome: "RDC 898/2024", url: U.rdc898 },
      { nome: "RDC 907/2024", url: U.rdc907 },
      { nome: "Perguntas frequentes da ANVISA sobre a composição em português", url: U.faqCosm },
    ],
    relacionados: ["rotulo-de-cosmeticos-o-que-e-obrigatorio", "cosmetico-grau-1-ou-grau-2"],
    publicado: HOJE,
    atualizado: HOJE,
  },
];

export const guiaPorSlug = (slug: string) => GUIAS.find((g) => g.slug === slug);

export const fmtData = (iso: string) => {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
};
