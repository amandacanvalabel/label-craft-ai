// Constantes das etapas do wizard (porte verbatim do editor original).
// Ícones são strings de <path>/SVG (injetadas com dangerouslySetInnerHTML).

export interface ProdutoCat {
  id: string;
  name: string;
  desc: string;
  ic: string;
  soon: boolean;
}

export const PRODUTO_CATS: ProdutoCat[] = [
  { id: "cosmetico", name: "Cosmético", desc: "Shampoo, condicionador, máscara, leave-in, cremes e mais.", ic: '<path d="M9 2h6v3H9zM7 8h10l-1 13H8z"/><path d="M7 8a3 3 0 0 1 3-3M17 8a3 3 0 0 0-3-3"/>', soon: false },
  { id: "bebidas", name: "Bebidas", desc: "Cervejas, sucos, kombuchas e bebidas artesanais.", ic: '<path d="M6 3h12l-1 7a5 5 0 0 1-10 0zM9 21h6M12 16v5"/>', soon: true },
  { id: "suplementos", name: "Suplementos", desc: "Cápsulas, pós e suplementos alimentares.", ic: '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>', soon: true },
  { id: "alimento", name: "Alimento", desc: "Conservas, molhos, doces e produtos artesanais.", ic: '<path d="M5 3v18M5 9h4M9 3v18M15 3c-2 0-3 2-3 5s1 5 3 5v8"/>', soon: true },
  { id: "limpeza", name: "Limpeza", desc: "Detergentes, desinfetantes e produtos de higiene.", ic: '<path d="M3 21h18M6 21V8l4-5h4l4 5v13M10 3v5h4V3"/>', soon: true },
];

export interface ConheceOpt {
  id: string;
  t: string;
  s: string;
  ic: string;
}

export const CONHECE_OPTS: ConheceOpt[] = [
  { id: "sei", t: "Já sei qual rótulo quero", s: "Vou escolher o tipo de rótulo e seguir direto para a criação.", ic: '<path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>' },
  { id: "naosei", t: "Não sei meu rótulo ainda", s: "Envie uma foto do frasco — vamos identificá-lo e sugerir os tipos compatíveis.", ic: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>' },
];

export interface RotuloTipo {
  id: string;
  name: string;
  desc: string;
  ic: string;
  configs: string[] | null;
}

export const ROTULO_TIPOS: RotuloTipo[] = [
  { id: "adesivo", name: "Adesivo", desc: "O mais comum. Etiqueta autoadesiva aplicada no frasco.", ic: '<path d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9z"/><path d="M15 3v6h6"/>', configs: ["Único para frente e verso", "Só frente", "Só verso", "Frente e verso (2 peças)"] },
  { id: "sleeve", name: "Sleeve", desc: "Manga termo-retrátil que envolve todo o frasco.", ic: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 8h12M6 16h12"/>', configs: null },
  { id: "serigrafia", name: "Serigrafia", desc: "Impressão direto no frasco, sem etiqueta de papel ou filme.", ic: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5"/>', configs: ["Só frente", "Só verso", "Frente e verso"] },
  { id: "inmold", name: "In Mold", desc: "Rótulo integrado ao frasco durante a moldagem.", ic: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 12l9-5M12 12v10M12 12L3 7"/>', configs: null },
];

export interface MaterialReciclagem {
  code: string;
  name: string;
  kind: string;
  desc: string;
}

export const MATERIAIS_RECICLAGEM: MaterialReciclagem[] = [
  { code: "1", name: "PET", kind: "pet", desc: "Plástico 1" },
  { code: "2", name: "PEAD", kind: "pead", desc: "Plástico 2" },
  { code: "3", name: "PVC", kind: "pvc", desc: "Plástico 3" },
  { code: "4", name: "PEBD", kind: "pebd", desc: "Plástico 4" },
  { code: "5", name: "PP", kind: "pp", desc: "Plástico 5" },
  { code: "6", name: "PS", kind: "ps", desc: "Plástico 6" },
  { code: "7", name: "Outros", kind: "outros", desc: "Plástico 7" },
  { code: "PAP", name: "Papel", kind: "pap", desc: "Papel/Papelão" },
  { code: "ALU", name: "Alumínio", kind: "alu", desc: "Alumínio" },
  { code: "GLS", name: "Vidro", kind: "gls", desc: "Vidro" },
];

export const VALIDADES = ["1M", "2M", "3M", "4M", "5M", "6M", "7M", "8M", "9M", "10M", "12M", "18M", "24M", "36M", "48M"];

export const OQUE_OPCOES = ["Shampoo", "Condicionador", "Máscara capilar", "Leave-in", "Creme", "Sérum", "Óleo", "Tônico", "Sabonete", "Hidratante", "Outro"];

export const PROMPT_EXAMPLES = [
  "Minimalista e elegante",
  "Vintage estilo farmácia antiga",
  "Tons terrosos e naturais",
  "Moderno e tipográfico",
  "Botânico com toque dourado",
  "Pastel e suave",
];
