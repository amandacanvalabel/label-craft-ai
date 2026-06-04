// Revisor ANVISA — 18 regras da RDC 907/2024 (porte de anvisaRunChecks).
// Funções puras sobre o StudioState.

import type { El, StudioState } from "../types";

export type IssueLevel = "crit" | "warn" | "info";
export type IssueAction =
  | { label: string; kind: "wizard"; step: number }
  | { label: string; kind: "select"; id: string };

export interface Issue {
  level: IssueLevel;
  cat: string;
  title: string;
  desc: string;
  ref?: string;
  action?: IssueAction | null;
}

function allTextOf(s: StudioState): string {
  const texts: string[] = [];
  Object.values(s.editor.faces || {}).forEach((face: El[]) =>
    face.forEach((el) => {
      if ((el.type === "text" || el.type === "textCurve") && el.text) texts.push(el.text);
    }),
  );
  return texts.join(" \n ").toLowerCase();
}

function countSmallText(s: StudioState, minPt: number) {
  let count = 0;
  let smallest = Infinity;
  let smallestId: string | null = null;
  Object.values(s.editor.faces || {}).forEach((face: El[]) =>
    face.forEach((el) => {
      if ((el.type === "text" || el.type === "textCurve") && el.text && el.size && el.size < minPt) {
        count++;
        if (el.size < smallest) { smallest = el.size; smallestId = el.id; }
      }
    }),
  );
  return { count, smallest, smallestId };
}

export function runAnvisaChecks(s: StudioState): Issue[] {
  const sv = s.verso, sf = s.frente as typeof s.frente & { marca?: string }, ss = s.selos;
  const allText = allTextOf(s);
  const issues: Issue[] = [];

  if (!sf.nome || !sf.nome.trim())
    issues.push({ level: "crit", cat: "identificacao", title: "Nome do produto ausente", desc: "O rótulo deve conter o nome do produto que o identifique e distinga dos demais.", ref: 'RDC 907/2024, Art. 13, I, "a"', action: { label: "Preencher na etapa Frente", kind: "wizard", step: 6 } });

  if (!sf.marca || !sf.marca.trim())
    issues.push({ level: "crit", cat: "identificacao", title: "Marca não informada", desc: "Deve constar a marca registrada do produto.", ref: 'RDC 907/2024, Art. 13, I, "b"', action: { label: "Preencher na etapa Frente", kind: "wizard", step: 6 } });

  const hasReg = /\b(?:anvisa|m\.?s\.?)\s*[:nº\s-]*\d{3,}/i.test(allText) || /notifica[çc][ãa]o\s*[:nº\s-]*\d{3,}/i.test(allText) || /\bn[.°º]\s*\d{8,}/.test(allText);
  if (!hasReg)
    issues.push({ level: "crit", cat: "registro", title: "Número de registro ou notificação ANVISA ausente", desc: 'Produtos Grau 1 devem trazer o número de notificação; Grau 2 o número de registro. Formato comum: "ANVISA nº XXXXXXX" ou "MS nº XXXXXXX".', ref: 'RDC 907/2024, Art. 13, I, "c"', action: { label: "Adicionar no Verso", kind: "wizard", step: 4 } });

  const hasOrigin = /\b(ind[uú]stria|fabricado|made in|origem)\b/i.test(allText) || /\bbrasil(eira|eiro)?\b/i.test(allText);
  if (!hasOrigin)
    issues.push({ level: "crit", cat: "identificacao", title: "País de origem não declarado", desc: 'Deve constar a expressão "Indústria Brasileira" ou similar indicando o país de produção/industrialização.', ref: 'RDC 907/2024, Art. 13, I, "d"' });

  const hasRazaoSocial = /\b(ltda|s\.a\.?|s\/a|me|eireli|epp)\b/i.test(allText) || /raz[ãa]o\s+social/i.test(allText);
  if (!hasRazaoSocial)
    issues.push({ level: "crit", cat: "titular", title: "Razão social do titular não identificada", desc: "Deve constar a razão social completa da empresa titular da regularização.", ref: 'RDC 907/2024, Art. 13, I, "e"' });

  const hasCnpj = /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/.test(allText) || /\bcnpj\b/i.test(allText);
  if (!hasCnpj)
    issues.push({ level: "crit", cat: "titular", title: "CNPJ do titular não encontrado", desc: "O CNPJ é obrigatório. Formato: XX.XXX.XXX/XXXX-XX", ref: 'RDC 907/2024, Art. 13, I, "g"' });

  const hasValidade = /\bvalidade\b/i.test(allText) || /\bv[áa]l(ido|ida)/i.test(allText) || /\bfabrica[cç][ãa]o\b/i.test(allText) || /\bfab\.?\s*\/\s*val/i.test(allText) || /\bvenc(imento)?\b/i.test(allText);
  if (!hasValidade)
    issues.push({ level: "crit", cat: "rastreabilidade", title: "Prazo de validade não declarado", desc: 'É obrigatório indicar o prazo de validade. Pode ser "Fab.: __/__ Val.: __/__" ou "Validade: ver embalagem".', ref: 'RDC 907/2024, Art. 13, I, "h"' });

  const hasLote = /\blote\b/i.test(allText) || /\bpartida\b/i.test(allText);
  if (!hasLote)
    issues.push({ level: "crit", cat: "rastreabilidade", title: "Lote ou partida não declarado", desc: 'É obrigatório indicar o lote ou partida do produto. No rótulo basta indicar "Lote: ver embalagem".', ref: 'RDC 907/2024, Art. 13, I, "i"' });

  const hasConteudo = /\b\d+[,.]?\d*\s*(ml|mL|ML|l|L|g|G|kg|KG|mg|MG)\b/.test(allText);
  if (!hasConteudo)
    issues.push({ level: "crit", cat: "conteudo", title: "Conteúdo nominal não declarado", desc: 'O peso líquido ou volume nominal é obrigatório. Exemplo: "200ml", "50g", "1L".', ref: 'RDC 907/2024, Art. 13, I, "j"' });

  const hasSac = /\bsac\b/i.test(allText) || /atendimento\s+ao\s+consumidor/i.test(allText) || /\b0800[\s-]?\d{3}/i.test(allText) || /\bconsumidor\b/i.test(allText);
  if (!hasSac)
    issues.push({ level: "crit", cat: "sac", title: "Dados de atendimento ao consumidor ausentes", desc: 'O SAC (telefone e/ou e-mail) é obrigatório desde 2022. Pode ser "SAC: 0800-XXX-XXXX" ou e-mail de contato.', ref: 'RDC 907/2024, Art. 13, I, "o" (RDC 752/2022)', action: { label: "Preencher no Verso", kind: "wizard", step: 4 } });

  const hasMatSelo = !!ss.tipoMaterial;
  const hasMatText = /\b(pet|pead|hdpe|pvc|pebd|ldpe|\bpp\b|\bps\b|polipropileno|polietileno|vidro|alum[íi]nio|papel)\b/i.test(allText);
  if (!hasMatSelo && !hasMatText)
    issues.push({ level: "crit", cat: "embalagem", title: "Material da embalagem não identificado", desc: "A especificação do material da embalagem é obrigatória desde 2022. Pode ser pelo selo de reciclagem (Möbius 1-7) ou texto.", ref: 'RDC 907/2024, Art. 13, I, "p" (RDC 752/2022)', action: { label: "Selecionar em Selos", kind: "wizard", step: 5 } });

  const hasIngred = /\b(ingredientes|composi[çc][ãa]o|inci)\s*[:.]?\b/i.test(allText) || /\baqua\s*,\s*(?:glycerin|sodium|cetearyl|paraffin|propylene|alcohol|glycol|cetyl)/i.test(allText);
  if (!hasIngred)
    issues.push({ level: "crit", cat: "ingredientes", title: "Lista de ingredientes (INCI) ausente", desc: "Os ingredientes devem ser declarados em ordem decrescente de concentração (INCI). Desde 2024 (RDC 898/2024), também em português.", ref: 'RDC 907/2024, Art. 13, I, "n" + RDC 898/2024', action: { label: "Preencher no Verso", kind: "wizard", step: 4 } });

  const hasModo = /\b(modo\s+de\s+uso|aplica[çc][ãa]o|como\s+usar)/i.test(allText);
  if (!hasModo)
    issues.push({ level: "warn", cat: "uso", title: "Modo de uso não declarado", desc: "Exigido para produtos que precisam de aplicação específica (fixadores, modeladores, alisantes etc.).", ref: 'RDC 907/2024, Art. 13, III, "a"' });

  if (!ss.validadeAbertura)
    issues.push({ level: "warn", cat: "rastreabilidade", title: "PAO (validade após abertura) não declarada", desc: 'O símbolo do potinho com "XM" indica em quantos meses consumir após aberto. Boa prática para vida útil ≥ 30 meses.', ref: "ISO 22716 / Reg. UE 1223/2009", action: { label: "Selecionar em Selos", kind: "wizard", step: 5 } });

  const small = countSmallText(s, 5);
  if (small.count > 0)
    issues.push({ level: "warn", cat: "legibilidade", title: `${small.count} ${small.count === 1 ? "texto" : "textos"} com fonte muito pequena`, desc: `Encontramos ${small.count} ${small.count === 1 ? "texto" : "textos"} com menos de 5pt. Recomenda-se mínimo 6pt para secundários e 8pt para informações regulatórias.`, ref: "Boa prática gráfica (NBR / ABNT)", action: small.smallestId ? { label: "Ver o menor texto", kind: "select", id: small.smallestId } : null });

  const hasAdvert = /\b(atenc[ãa]o|advert[êe]ncia|evitar|n[ãa]o\s+ing(?:eri|estion|erir))/i.test(allText);
  if (!hasAdvert)
    issues.push({ level: "info", cat: "seguranca", title: "Sugestão: incluir advertências de uso", desc: 'Boa prática incluir "Em caso de irritação, suspender o uso" ou "Manter fora do alcance de crianças".', ref: 'RDC 907/2024, Art. 13, III, "b"' });

  const forbidden = [
    { pattern: /\b(cura|curativo|trata\s+(?:a\s+)?doen[çc]a|previne\s+doen[çc]a)\b/i, term: "cura/tratamento de doença" },
    { pattern: /\banti[\s-]?inflam[áa]/i, term: "anti-inflamatório" },
    { pattern: /\bcicatrizante\b/i, term: "cicatrizante" },
    { pattern: /\bantibac/i, term: "antibacteriano" },
    { pattern: /\bantif[uú]ng/i, term: "antifúngico" },
    { pattern: /\bel[íi]mina\s+(?:rugas|cicatrizes|estrias)\b/i, term: "eliminar rugas/cicatrizes/estrias" },
    { pattern: /\bregenera\s+(?:c[ée]lula|tecido)/i, term: "regenera células/tecidos" },
  ];
  forbidden.forEach((f) => {
    if (f.pattern.test(allText))
      issues.push({ level: "crit", cat: "claims", title: `Termo proibido detectado: "${f.term}"`, desc: 'Cosméticos não podem ter alegações terapêuticas/medicamentosas. Use "auxilia", "ajuda a melhorar a aparência de".', ref: "RDC 907/2024, Art. 11 (alegações proibidas)" });
  });

  if (!ss.materialReciclavel && !ss.jogueLixo)
    issues.push({ level: "info", cat: "sustentabilidade", title: "Sugestão: orientação de descarte", desc: 'Incluir o selo "Material Reciclável" (Möbius) ou "Jogue no Lixo" orienta o consumidor sobre o descarte da embalagem.', ref: "Lei 12.305/2010 (PNRS)", action: { label: "Adicionar em Selos", kind: "wizard", step: 5 } });

  void sv;
  return issues;
}
