// Vetor de estilo + parsing de prompt (porte do editor original).

export type StyleVec = Record<string, number>;

export const STYLE_AXES = [
  "formal",
  "denso",
  "quente",
  "retro",
  "ornamental",
  "feminino",
  "luxo",
  "vibrante",
  "natural",
  "sofisticado",
];

export function makeVector(): StyleVec {
  const v: StyleVec = {};
  STYLE_AXES.forEach((a) => (v[a] = 0.5));
  return v;
}

export function adjustAxis(vec: StyleVec, axis: string, delta: number, weight = 1) {
  if (!(axis in vec)) return;
  vec[axis] = Math.max(0, Math.min(1, vec[axis] + delta * weight));
}

interface StyleRule {
  kws: string[];
  effects: [string, number][];
}

export const STYLE_KEYWORDS: StyleRule[] = [
  { kws: ["formal", "sério", "serio", "elegante", "clássico", "classico", "tradicional", "sóbrio", "sobrio"], effects: [["formal", +0.4], ["sofisticado", +0.2]] },
  { kws: ["casual", "descontraído", "descontraido", "divertido", "fun", "informal", "despojado", "cool"], effects: [["formal", -0.4], ["vibrante", +0.2]] },
  { kws: ["minimalista", "minimal", "clean", "limpo", "simples", "arejado", "espaçoso", "espacoso", "vazio"], effects: [["denso", -0.5], ["ornamental", -0.4]] },
  { kws: ["denso", "cheio", "rico em detalhes", "informativo", "complexo", "elaborado"], effects: [["denso", +0.4], ["ornamental", +0.3]] },
  { kws: ["quente", "aconchegante", "caloroso", "acolhedor", "terroso", "warm", "dourado", "âmbar", "ambar", "amarelado"], effects: [["quente", +0.5]] },
  { kws: ["frio", "fresco", "gelado", "metálico", "metalico", "cool", "azulado", "prateado", "cinza"], effects: [["quente", -0.5]] },
  { kws: ["vintage", "antigo", "retrô", "retro", "retro chic", "old school", "old-school", "clássico", "classico", "farmácia antiga", "farmacia antiga", "apothecary", "victorian", "art deco", "art nouveau", "anos 60", "anos 70", "anos 80", "anos 50", "retrofuturista"], effects: [["retro", +0.6], ["ornamental", +0.3]] },
  { kws: ["moderno", "contemporâneo", "contemporaneo", "atual", "futurista", "minimalist", "tech", "digital", "tipográfico", "tipografico", "editorial", "swiss", "bauhaus", "geométrico", "geometrico"], effects: [["retro", -0.5], ["sofisticado", +0.2]] },
  { kws: ["ornamental", "decorativo", "floral", "rebuscado", "barroco", "ricamente decorado", "filigrana"], effects: [["ornamental", +0.6]] },
  { kws: ["geometrico", "geométrico", "reto", "linhas retas", "grid", "estrutural"], effects: [["ornamental", -0.3], ["sofisticado", +0.2]] },
  { kws: ["feminino", "delicado", "suave", "romântico", "romantico", "floral", "pastel", "rosa", "rosê", "rose", "lilás", "lilas", "lavanda", "glamour"], effects: [["feminino", +0.5]] },
  { kws: ["masculino", "forte", "robusto", "industrial", "rústico", "rustico", "bold", "marcante"], effects: [["feminino", -0.4], ["formal", +0.1]] },
  { kws: ["luxo", "luxury", "premium", "sofisticado", "high-end", "requintado", "exclusivo", "exclusive", "caro", "top", "executivo", "prestige"], effects: [["luxo", +0.5], ["sofisticado", +0.4], ["formal", +0.2]] },
  { kws: ["popular", "acessível", "acessivel", "barato", "fast", "pop", "street", "jovem"], effects: [["luxo", -0.4], ["vibrante", +0.2]] },
  { kws: ["vibrante", "colorido", "alegre", "vivo", "energético", "energetico", "pop", "bold", "vibrant"], effects: [["vibrante", +0.5]] },
  { kws: ["suave", "sutil", "sóbrio", "sobrio", "discreto", "muted", "calmo", "tranquilo", "neutro"], effects: [["vibrante", -0.4]] },
  { kws: ["pastel", "desbotado", "soft"], effects: [["vibrante", -0.3], ["feminino", +0.1]] },
  { kws: ["natural", "orgânico", "organico", "botânico", "botanico", "sustentável", "sustentavel", "eco", "verde", "folha", "planta", "floresta", "herbal", "wellness", "spa", "zen", "rústico", "rustico", "artesanal", "handcrafted", "handmade"], effects: [["natural", +0.6], ["quente", +0.1]] },
  { kws: ["tech", "digital", "industrial", "futurista", "high-tech", "urbano", "cyber"], effects: [["natural", -0.4]] },
  { kws: ["sofisticado", "refinado", "requintado", "elegante", "chique", "chic", "aesop", "byredo"], effects: [["sofisticado", +0.5], ["formal", +0.2], ["luxo", +0.2]] },
];

export const INTENSIFIERS: Record<string, number> = {
  muito: 1.5, bem: 1.3, super: 1.5, extremamente: 1.7, bastante: 1.3, mais: 1.2, altamente: 1.4,
};
export const DIMINISHERS: Record<string, number> = {
  pouco: 0.5, levemente: 0.5, sutilmente: 0.5, meio: 0.6, "um pouco": 0.5, leve: 0.6, discreto: 0.6, menos: 0.7,
};
export const NEGATORS = ["não", "nao", "sem", "nada", "nem", "exceto"];

export const COLOR_NAMES: Record<string, string> = {
  verde: "#3e6b4a", "verde-musgo": "#4a5d3e", "verde-escuro": "#1f3a2a", "verde-água": "#7fb89c",
  azul: "#3b5a7a", "azul-marinho": "#1f3a5a", "azul-claro": "#88b3d1", navy: "#1f3a5a",
  rosa: "#d68aa4", rosê: "#d68aa4", rose: "#d68aa4", "rosa-claro": "#f2c4d4",
  vermelho: "#a8442e", bordô: "#6f2e2a", bordo: "#6f2e2a", vinho: "#5a2624",
  amarelo: "#d8b34c", mostarda: "#b08a2e", dourado: "#b0883f", ouro: "#b0883f",
  marrom: "#5e3f2a", caramelo: "#a8723d", café: "#3a261a", cafe: "#3a261a", chocolate: "#3a261a",
  preto: "#1a1a1a", branco: "#fafafa", "off-white": "#f0ebe0", cinza: "#7a7a7a", grafite: "#3a3a3a",
  bege: "#e8d8b8", creme: "#f0e8d4", marfim: "#f4ead4", terracota: "#b25c34",
  lilás: "#a78bbf", lilas: "#a78bbf", roxo: "#5a3a7a", violeta: "#7a4f9e",
  turquesa: "#3aa0a0", menta: "#a8d0b8", salmão: "#e6a48a", salmao: "#e6a48a",
  azeitona: "#6b7338", oliva: "#6b7338",
};

export interface ParsedPrompt {
  vec: StyleVec;
  colors: string[];
  matches: { kw: string; axis: string; delta: number }[];
}

export function parsePrompt(text: string): ParsedPrompt {
  const vec = makeVector();
  const colors: string[] = [];
  const matches: ParsedPrompt["matches"] = [];
  if (!text || !text.trim()) return { vec, colors, matches };

  const t = " " + text.toLowerCase().replace(/[.,!?;:]/g, " ").replace(/\s+/g, " ") + " ";

  STYLE_KEYWORDS.forEach((rule) => {
    rule.kws.forEach((kw) => {
      let idx = -1;
      const search = " " + kw + " ";
      while ((idx = t.indexOf(search, idx + 1)) !== -1) {
        const before = t.slice(0, idx).trim().split(" ");
        const prev = before[before.length - 1] || "";
        const prev2 = before[before.length - 2] || "";
        let weight = 1;
        let sign = 1;
        if (INTENSIFIERS[prev]) weight = INTENSIFIERS[prev];
        else if (DIMINISHERS[prev]) weight = DIMINISHERS[prev];
        else if (INTENSIFIERS[prev2 + " " + prev]) weight = INTENSIFIERS[prev2 + " " + prev];
        if (NEGATORS.includes(prev) || NEGATORS.includes(prev2)) sign = -1;
        rule.effects.forEach(([axis, delta]) => {
          const actual = delta * sign * weight;
          adjustAxis(vec, axis, actual, 1);
          matches.push({ kw, axis, delta: actual });
        });
      }
    });
  });

  Object.entries(COLOR_NAMES).forEach(([name, hex]) => {
    if (t.includes(" " + name + " ") && !colors.includes(hex)) colors.push(hex);
  });

  return { vec, colors, matches };
}

export function mergeVectors(va: StyleVec | null, vb: StyleVec | null, weightA = 1, weightB = 1): StyleVec {
  const out: StyleVec = {};
  STYLE_AXES.forEach((ax) => {
    const a = va && ax in va ? va[ax] : 0.5;
    const b = vb && ax in vb ? vb[ax] : 0.5;
    out[ax] = (a * weightA + b * weightB) / (weightA + weightB);
  });
  return out;
}

export function vectorDistance(va: StyleVec, vb: StyleVec): number {
  let sum = 0;
  STYLE_AXES.forEach((ax) => {
    const d = (va[ax] ?? 0.5) - (vb[ax] ?? 0.5);
    sum += d * d;
  });
  return Math.sqrt(sum);
}
