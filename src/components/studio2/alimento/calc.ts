// Motor nutricional de ALIMENTOS — porte do CalcNutricional do editor de
// alimentos (canvalabel-alimentos.html) para o estúdio unificado.
//   - cálculo por receita (base TACO/USDA) ou valores diretos por 100 g/ml
//   - arredondamento oficial (IN 75/2020, Anexo X)
//   - %VD (IN 75/2020)
//   - lupa "ALTO EM" (RDC 429/2020)
//   - montagem da tabela no modelo vertical

import type { AlimentoState, IngredienteReceita, LupaKind, NutriTableData, NutriV100 } from "../types";
import { INGREDIENTES, type IngredienteDB } from "./ingredientesDB";

// Valores Diários de Referência (IN 75/2020)
export const VDR = {
  energia: 2000,
  carbo: 300,
  acucarA: 50,
  proteina: 50,
  gordura: 65,
  gordSat: 20,
  fibra: 25,
  sodio: 2000,
} as const;

// Limites da rotulagem frontal (RDC 429/2020), por 100 g ou 100 ml
export const LUPA_LIMITES = {
  solido: { acucar: 15, gordura: 6, sodio: 600 },
  liquido: { acucar: 7.5, gordura: 3, sodio: 300 },
} as const;

export const LUPA_LABEL: Record<LupaKind, string> = {
  acucar: "AÇÚCAR ADICIONADO",
  gordura: "GORDURA SATURADA",
  sodio: "SÓDIO",
};

// Alérgenos da RDC 26/2015 (id → texto na advertência)
export const ALERGENOS: { id: string; label: string }[] = [
  { id: "trigo", label: "TRIGO" },
  { id: "centeio", label: "CENTEIO" },
  { id: "cevada", label: "CEVADA" },
  { id: "aveia", label: "AVEIA" },
  { id: "crustaceo", label: "CRUSTÁCEOS" },
  { id: "ovo", label: "OVO" },
  { id: "peixe", label: "PEIXE" },
  { id: "amendoim", label: "AMENDOIM" },
  { id: "soja", label: "SOJA" },
  { id: "leite", label: "LEITE" },
  { id: "amendoa", label: "AMÊNDOA" },
  { id: "avela", label: "AVELÃ" },
  { id: "castanha-caju", label: "CASTANHA-DE-CAJU" },
  { id: "castanha-para", label: "CASTANHA-DO-BRASIL" },
  { id: "macadamia", label: "MACADÂMIA" },
  { id: "noz", label: "NOZES" },
  { id: "pecan", label: "PECÃ" },
  { id: "pistache", label: "PISTACHE" },
  { id: "pinhao", label: "PINOLI" },
  { id: "gergelim", label: "GERGELIM" },
  { id: "latex", label: "LÁTEX NATURAL" },
];

export const DECLARACOES_OPCOES = [
  "COLORIDO ARTIFICIALMENTE",
  "AROMATIZADO ARTIFICIALMENTE",
  "CONTÉM AROMATIZANTE SINTÉTICO IDÊNTICO AO NATURAL",
  "CONTÉM AROMA NATURAL",
  "CONTÉM CORANTE NATURAL",
  "CONTÉM EDULCORANTE",
];

export const V100_ZERO: NutriV100 = {
  energia: 0, carbo: 0, acucarT: 0, acucarA: 0, proteina: 0,
  gordura: 0, gordSat: 0, gordTrans: 0, fibra: 0, sodio: 0,
};

export function defaultAlimento(): AlimentoState {
  return {
    categoria: "solido",
    designacao: "",
    pesoLiquido: 0,
    porcao: 0,
    medidaCaseira: "",
    modo: "receita",
    receita: [],
    rendimento: 0,
    ingredientesTexto: "",
    v100Manual: { ...V100_ZERO },
    alergenos: [],
    podeConter: [],
    gluten: null,
    lactose: false,
    declaracoes: [],
    conservacao: "",
    conservacaoAberto: "",
    preparo: "",
    lote: "Lote: vide embalagem",
    validade: "Validade: vide embalagem",
    registroMs: "",
    pais: "INDÚSTRIA BRASILEIRA",
  };
}

// ---------- arredondamento oficial (IN 75/2020, Anexo X) ----------
export function arredEnergia(v: number) {
  if (v < 5) return 0;
  if (v < 100) return Math.round(v);
  return Math.round(v / 10) * 10;
}
export function arredGramas(v: number) {
  if (v < 0.5) return 0;
  if (v < 10) return Math.round(v * 10) / 10;
  return Math.round(v);
}
export function arredSodio(v: number) {
  if (v < 5) return 0;
  if (v < 140) return Math.round(v / 5) * 5;
  return Math.round(v / 10) * 10;
}
export function arredVD(p: number) {
  if (p < 0.5) return 0;
  if (p < 10) return Math.round(p * 10) / 10;
  return Math.round(p);
}

// Formata número no padrão brasileiro ("1,5", "12", "0")
export function fmt(v: number, casas = 1): string {
  if (!v || Number.isNaN(v)) return "0";
  return v.toFixed(casas).replace(".", ",").replace(/,0$/, "").replace(/,(\d)0$/, ",$1");
}

// ---------- base de ingredientes ----------
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export function getIngrediente(id: string): IngredienteDB | null {
  return INGREDIENTES.find((i) => i.id === id) || null;
}

export function buscarIngredientes(query: string, limite = 30): IngredienteDB[] {
  const q = norm(query || "");
  if (!q) return [];
  const starts: IngredienteDB[] = [];
  const contains: IngredienteDB[] = [];
  for (const i of INGREDIENTES) {
    const n = norm(i.nome);
    if (n.startsWith(q)) starts.push(i);
    else if (n.includes(q)) contains.push(i);
    if (starts.length >= limite) break;
  }
  return [...starts, ...contains].slice(0, limite);
}

// ---------- receita → valores por 100 g/ml ----------
export function calcReceita(receita: IngredienteReceita[], rendimento: number): { v100: NutriV100; alergenos: string[] } | null {
  if (!receita.length) return null;
  const total = { ...V100_ZERO };
  const al = new Set<string>();
  let somaQt = 0;
  for (const item of receita) {
    const ing = getIngrediente(item.id);
    if (!ing) continue;
    const f = (item.qt || 0) / 100;
    somaQt += item.qt || 0;
    total.energia += ing.kcal * f;
    total.carbo += ing.carbo * f;
    total.acucarT += ing.acuT * f;
    total.acucarA += ing.acuA * f;
    total.proteina += ing.prot * f;
    total.gordura += ing.gord * f;
    total.gordSat += ing.gordSat * f;
    total.gordTrans += ing.gordTrans * f;
    total.fibra += ing.fibra * f;
    total.sodio += ing.sodio * f;
    ing.alergenos.forEach((a) => al.add(a));
  }
  // Sem rendimento informado, assume que o produto final pesa a soma dos ingredientes.
  const rend = rendimento > 0 ? rendimento : somaQt;
  if (!(rend > 0)) return null;
  const fator = 100 / rend;
  const v100 = Object.fromEntries(Object.entries(total).map(([k, v]) => [k, v * fator])) as unknown as NutriV100;
  // "gluten" é marcador genérico na base; a advertência oficial é por cereal.
  const alergenos = [...al].filter((a) => a !== "gluten" && a !== "sulfitos");
  return { v100, alergenos };
}

export function somaReceita(receita: IngredienteReceita[]) {
  return receita.reduce((acc, i) => acc + (i.qt || 0), 0);
}

// Valores por 100 efetivos do produto (receita ou direto)
export function v100Atual(a: AlimentoState): NutriV100 {
  if (a.modo === "receita") {
    const r = calcReceita(a.receita, a.rendimento);
    return r ? r.v100 : { ...V100_ZERO };
  }
  return { ...V100_ZERO, ...a.v100Manual };
}

// Receita contém glúten pela base (trigo, centeio, cevada, aveia ou marcador "gluten")
export function receitaTemGluten(receita: IngredienteReceita[]): boolean {
  return receita.some((item) => {
    const ing = getIngrediente(item.id);
    return !!ing && ing.alergenos.some((a) => ["gluten", "trigo", "centeio", "cevada", "aveia"].includes(a));
  });
}

// Lista de ingredientes em ordem decrescente de quantidade (RDC 727/2022)
export function ingredientesDaReceita(receita: IngredienteReceita[]): string {
  return [...receita]
    .filter((i) => i.nome)
    .sort((a, b) => (b.qt || 0) - (a.qt || 0))
    .map((i) => i.nome.toLowerCase())
    .join(", ");
}

// ---------- lupa ----------
export function calcLupas(a: AlimentoState): LupaKind[] {
  const v = v100Atual(a);
  const lim = LUPA_LIMITES[a.categoria];
  const out: LupaKind[] = [];
  if (v.acucarA >= lim.acucar) out.push("acucar");
  if (v.gordSat >= lim.gordura) out.push("gordura");
  if (v.sodio >= lim.sodio) out.push("sodio");
  return out;
}

// ---------- tabela ----------
export function buildNutriTable(a: AlimentoState): NutriTableData {
  const v = v100Atual(a);
  const un: "g" | "ml" = a.categoria === "liquido" ? "ml" : "g";
  const porcao = a.porcao > 0 ? a.porcao : 0;
  const fp = porcao / 100;
  const porcoes = a.pesoLiquido > 0 && porcao > 0 ? a.pesoLiquido / porcao : 0;
  const porcoesLabel =
    porcoes > 0
      ? `Porções por embalagem: ${Number.isInteger(porcoes) ? porcoes : "cerca de " + Math.round(porcoes)}`
      : "Porções por embalagem: —";
  const porcaoLabel = porcao > 0 ? `Porção: ${fmt(porcao, 0)} ${un}${a.medidaCaseira ? ` (${a.medidaCaseira})` : ""}` : "Porção: —";

  const g = (x: number) => fmt(arredGramas(x));
  const vd = (valorPorcao: number, ref: number) => fmt(arredVD((valorPorcao / ref) * 100), 0);

  const kcal100 = arredEnergia(v.energia);
  const kcalP = arredEnergia(v.energia * fp);
  const kj = (kcal: number) => Math.round(kcal * 4.184);

  const rows = [
    { label: "Valor energético (kcal)", v100: `${kcal100} kcal\n(${kj(kcal100)} kJ)`, porcao: `${kcalP} kcal\n(${kj(kcalP)} kJ)`, vd: vd(v.energia * fp, VDR.energia) },
    { label: "Carboidratos (g)", v100: g(v.carbo), porcao: g(v.carbo * fp), vd: vd(v.carbo * fp, VDR.carbo) },
    { label: "Açúcares totais (g)", indent: true, v100: g(v.acucarT), porcao: g(v.acucarT * fp), vd: "" },
    { label: "Açúcares adicionados (g)", indent: true, v100: g(v.acucarA), porcao: g(v.acucarA * fp), vd: vd(v.acucarA * fp, VDR.acucarA) },
    { label: "Proteínas (g)", v100: g(v.proteina), porcao: g(v.proteina * fp), vd: vd(v.proteina * fp, VDR.proteina) },
    { label: "Gorduras totais (g)", v100: g(v.gordura), porcao: g(v.gordura * fp), vd: vd(v.gordura * fp, VDR.gordura) },
    { label: "Gorduras saturadas (g)", indent: true, v100: g(v.gordSat), porcao: g(v.gordSat * fp), vd: vd(v.gordSat * fp, VDR.gordSat) },
    { label: "Gorduras trans (g)", indent: true, v100: g(v.gordTrans), porcao: g(v.gordTrans * fp), vd: "" },
    { label: "Fibras alimentares (g)", v100: g(v.fibra), porcao: g(v.fibra * fp), vd: vd(v.fibra * fp, VDR.fibra) },
    { label: "Sódio (mg)", v100: fmt(arredSodio(v.sodio), 0), porcao: fmt(arredSodio(v.sodio * fp), 0), vd: vd(v.sodio * fp, VDR.sodio) },
  ];
  return { porcaoLabel, porcoesLabel, unidade: un, porcao, rows };
}

// Frase de alérgenos (RDC 26/2015)
export function fraseAlergenos(a: AlimentoState): string {
  const lab = (id: string) => ALERGENOS.find((x) => x.id === id)?.label || id.toUpperCase();
  const contem = a.alergenos.map(lab);
  const pode = a.podeConter.filter((p) => !a.alergenos.includes(p)).map(lab);
  const partes: string[] = [];
  if (contem.length) partes.push(`ALÉRGICOS: CONTÉM ${listaPt(contem)}.`);
  if (pode.length) partes.push(`ALÉRGICOS: PODE CONTER ${listaPt(pode)}.`);
  return partes.join(" ");
}

function listaPt(itens: string[]) {
  if (itens.length <= 1) return itens.join("");
  return itens.slice(0, -1).join(", ") + " E " + itens[itens.length - 1];
}

export function fraseGluten(a: AlimentoState): string {
  if (a.gluten === "contem") return "CONTÉM GLÚTEN";
  if (a.gluten === "nao") return "NÃO CONTÉM GLÚTEN";
  return "";
}
