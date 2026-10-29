// Tipos do editor v2 (porte do canvalabel-parte3q-EDITOR.html).
// O `state` global do editor original serializa 100% para JSON puro e é o que
// guardamos em SubscriberModel.canvasData. Estes tipos espelham aquele formato.

export type ElementType =
  | "text"
  | "rect"
  | "ellipse"
  | "line"
  | "image"
  | "barcode"
  | "qr"
  | "selo"
  | "shape"
  | "textCurve"
  | "nutri" // tabela de informação nutricional (alimentos, IN 75/2020)
  | "lupa"; // rotulagem nutricional frontal "ALTO EM" (RDC 429/2020)

// Elemento do canvas. Campos comuns + props específicas por tipo (opcionais).
// Mantemos um shape único e permissivo para espelhar o objeto dinâmico do
// editor original e facilitar o porte fiel das funções imperativas.
export interface El {
  id: string;
  type: ElementType;
  x: number; // mm
  y: number; // mm
  w: number; // mm
  h: number; // mm
  rot: number; // graus
  opacity: number; // 0-100
  visible: boolean;
  locked: boolean;
  name?: string;

  // text / textCurve
  text?: string;
  html?: string;
  font?: string;
  size?: number; // pt
  weight?: number | string;
  italic?: boolean;
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  lh?: number; // line-height
  ls?: number; // letter-spacing

  // textCurve
  curve?: string;
  curvature?: number;

  // shapes (rect/ellipse/line/shape)
  fill?: string;
  stroke?: string;
  sw?: number; // stroke width (mm)
  radius?: number; // mm (rect)
  shapeKind?: string;

  // image
  src?: string;
  fit?: "cover" | "contain"; // como a imagem preenche a caixa (padrão: contain)

  // barcode
  code?: string;
  barcodeValue?: string;
  barcodeFormat?: string;

  // qr
  seed?: string;
  qrText?: string;

  // qr / barcode foreground
  fg?: string;

  // selo
  seloKind?: string;

  // nutri — snapshot da tabela (o motor recalcula a partir de state.alimento)
  nutri?: NutriTableData;

  // lupa — nutrientes em excesso ("ACUCAR" | "GORDURA" | "SODIO")
  lupas?: LupaKind[];
}

// ---------- Alimentos (IN 75/2020 · RDC 429/2020 · RDC 26/2015) ----------

export type LupaKind = "acucar" | "gordura" | "sodio";

export interface NutriV100 {
  energia: number; // kcal
  carbo: number;
  acucarT: number;
  acucarA: number;
  proteina: number;
  gordura: number;
  gordSat: number;
  gordTrans: number;
  fibra: number;
  sodio: number; // mg
}

export interface NutriRow {
  label: string;
  indent?: boolean;
  v100: string;
  porcao: string;
  vd: string; // "" quando não há VD (açúcares totais, trans)
}

export interface NutriTableData {
  porcaoLabel: string; // "Porção de 30 g (1 fatia)"
  porcoesLabel: string; // "Porções por embalagem: cerca de 10"
  unidade: "g" | "ml";
  porcao: number;
  rows: NutriRow[];
}

export interface IngredienteReceita {
  id: string; // id na base nutricional
  nome: string;
  qt: number; // g ou ml usados na receita
}

export interface AlimentoState {
  categoria: "solido" | "liquido";
  designacao: string; // denominação de venda ("Molho de tomate")
  pesoLiquido: number; // g ou ml
  porcao: number; // g ou ml
  medidaCaseira: string; // "1 colher de sopa"
  modo: "receita" | "direto";
  receita: IngredienteReceita[];
  rendimento: number; // g/ml que a receita rende (para normalizar por 100)
  ingredientesTexto: string; // lista final impressa (modo direto, ou editada)
  v100Manual: NutriV100; // valores por 100 g/ml quando modo = direto
  alergenos: string[]; // ids: leite, ovo, trigo, soja...
  podeConter: string[];
  gluten: "contem" | "nao" | null;
  lactose: boolean;
  declaracoes: string[]; // "Colorido artificialmente" etc.
  conservacao: string;
  conservacaoAberto: string;
  preparo: string;
  lote: string;
  validade: string;
  registroMs: string; // "Dispensado de registro (RDC 27/2010)" / nº
  pais: string;
}

export type FaceId = string;
export type Faces = Record<FaceId, El[]>;

export interface FaceConfigEntry {
  id: FaceId;
  label: string;
}
export interface FaceConfig {
  kind: "unified" | "front" | "back" | "dual";
  faces: FaceConfigEntry[];
}

export interface LabelMeta {
  w: number;
  h: number;
  bleed: number;
  safe: number;
  bg: string;
}

export interface EditorState {
  label: LabelMeta;
  faces: Faces;
  faceConfig: FaceConfig | null;
  face: FaceId;
  sel: string | null;
  selSet: string[] | null; // serializável (no editor original é Set)
  zoom: number;
  uid: number;
  docname: string;
  templateId: string | null;
  paletteOverride: { bg: string; primary: string; accent: string; secondary: string; text: string } | null;
}

export interface RotuloState {
  tipo: string | null; // adesivo | sleeve | serigrafia | inmold
  config: string | null;
  w: number;
  h: number;
  faca: string | null;
  facaNome: string | null;
  facaKind: string | null;
  facaSize: string | null;
}

export interface VersoState {
  nome: string;
  introducao: string;
  modoUso: string;
  dicas: string;
  precaucoes: string;
  ingEn: string;
  ingPt: string;
  qrLink: string;
  fabNome: string;
  fabCnpj: string;
  fabIe: string;
  fabEnd: string;
  fabCrq: string;
  fabAnvisa: string;
  fornNome: string;
  fornCnpj: string;
  fornEnd: string;
  fornIe: string;
  sac: string;
  codBarras: string;
  validadeLote: string;
}

export interface SelosState {
  vegano: boolean;
  materialReciclavel: boolean;
  jogueLixo: boolean;
  euReciclo: boolean;
  tipoMaterial: string | null;
  validadeAbertura: string | null;
  crueltyFree: boolean;
  naoTestado: boolean;
  outros: string[];
}

export interface FrenteState {
  logo: string | null;
  logoNome: string | null;
  nome: string;
  oque: string;
  ativos: string;
  volume: string;
}

export interface AnalysisResult {
  palette: string[];
  warmth?: number;
  contrast?: number;
  saturation?: number;
  density?: number;
  [k: string]: unknown;
}

export type Palette = { bg: string; primary: string; accent: string; secondary: string; text: string };

// Briefing de design produzido pela IA real (/api/ai/generate-design): estilo,
// template e paletas. Alimenta o motor de geração editável (não posiciona
// elementos — apenas direciona template + cores + cópia).
export interface AiBrief {
  templateId: string;
  style: Record<string, number>;
  palette: Palette;
  palettes: { name: string; roles: Palette }[];
  copy: { nome: string; oque: string; ativos: string; volume: string };
  // Descrição visual rica para gerar a imagem-base ("cara" do rótulo).
  artPrompt?: string;
  note: string;
}

export interface AiState {
  prompt: string;
  extractedPalette: string[];
  analysis: AnalysisResult | null;
  briefingVector: Record<string, number> | null;
  variations: Variation[];
  chosenVariation: number;
  brief: AiBrief | null;
  // Imagem-base gerada por IA (data URL) usada como fundo da frente. Fica no
  // state para o motor reinjetar a cada variação escolhida. null = sem fundo IA.
  aiBackground?: string | null;
}

export interface Variation {
  id: string;
  templateId: string;
  templateName: string;
  palette: { bg: string; primary: string; accent: string; secondary: string; text: string };
  paletteSource: string;
}

export interface MaterialState {
  family: string | null;
  variant: string | null;
  subvariant: string | null;
}

export interface ElFinish {
  verniz?: boolean;
  hotstamp?: string | null; // silver | gold | copper | holografico | null
  baixoRelevo?: boolean;
}

export interface PreviewState {
  background: "white" | "light" | "dark" | "black";
  view: "flat" | "curved" | "both";
  showFinishes: boolean;
}

export type PlanTier = "free" | "pro";

// O state completo do editor — espelha `const state` do arquivo original.
export interface StudioState {
  produto: string | null;
  conhece: string | null; // sei | naosei
  frascoFoto: string | null;
  rotulo: RotuloState;
  verso: VersoState;
  selos: SelosState;
  frente: FrenteState;
  // Dados específicos de ALIMENTO (usado quando produto === "alimento").
  // Opcional porque projetos antigos (cosméticos) não têm o campo.
  alimento?: AlimentoState;
  refs: string[];
  ai: AiState;
  editor: EditorState;
  plan: PlanTier;
  material: MaterialState;
  finishes: Record<string, ElFinish>;
  preview: PreviewState;
}
