// Revisor ANVISA para ALIMENTOS — porte das regras do validador do editor de
// alimentos (AnvisaAlimentos.validar) para o estúdio unificado.
// RDC 727/2022 (rotulagem geral) · IN 75/2020 (tabela) · RDC 429/2020 (lupa)
// · RDC 26/2015 (alérgenos) · Lei 10.674/2003 (glúten) · RDC 135/2017 (lactose).

import type { El, StudioState } from "../types";
import type { Issue } from "../anvisa/checks";
import { calcLupas, defaultAlimento, v100Atual } from "./calc";

// Passos (índice usado pelo AnvisaPanel → STEP_MAP): 3/4 = dados do alimento, 5 = nutricional, 6 = frente
const ALIM = 4, NUTRI = 5, FRENTE = 6;

function allTextOf(s: StudioState): string {
  const texts: string[] = [];
  Object.values(s.editor.faces || {}).forEach((face: El[]) =>
    face.forEach((el) => {
      if ((el.type === "text" || el.type === "textCurve") && el.text) texts.push(el.text);
    }),
  );
  return texts.join(" \n ").toLowerCase();
}

function hasEl(s: StudioState, type: El["type"]): El | undefined {
  for (const face of Object.values(s.editor.faces || {})) {
    const f = face.find((e) => e.type === type && e.visible !== false);
    if (f) return f;
  }
  return undefined;
}

function smallTexts(s: StudioState, minPt: number) {
  let count = 0, smallest = Infinity, smallestId: string | null = null;
  Object.values(s.editor.faces || {}).forEach((face: El[]) =>
    face.forEach((el) => {
      if ((el.type === "text" || el.type === "textCurve") && el.text && el.size && el.size < minPt) {
        count++;
        if (el.size < smallest) { smallest = el.size; smallestId = el.id; }
      }
    }),
  );
  return { count, smallestId };
}

export function runAlimentoChecks(s: StudioState): Issue[] {
  const a = s.alimento || defaultAlimento();
  const v = s.verso;
  const txt = allTextOf(s);
  const issues: Issue[] = [];
  const crit = (cat: string, title: string, desc: string, ref: string, step?: number) =>
    issues.push({ level: "crit", cat, title, desc, ref, action: step ? { label: "Corrigir no assistente", kind: "wizard", step } : null });
  const warn = (cat: string, title: string, desc: string, ref: string, step?: number) =>
    issues.push({ level: "warn", cat, title, desc, ref, action: step ? { label: "Ajustar no assistente", kind: "wizard", step } : null });
  const info = (cat: string, title: string, desc: string, ref: string) => issues.push({ level: "info", cat, title, desc, ref });

  // --- Identificação ---
  if (!s.frente.nome.trim()) crit("identificacao", "Nome do produto ausente", "O rótulo precisa do nome/marca do produto na face principal.", "RDC 727/2022", FRENTE);
  if (!a.designacao.trim()) crit("identificacao", "Denominação de venda não informada", "Além da marca, o rótulo deve dizer o que o alimento é (ex.: “Molho de tomate”).", "RDC 727/2022, art. 7º", ALIM);
  if (!(a.pesoLiquido > 0)) crit("quantidade", "Peso ou volume líquido ausente", "Indique o conteúdo líquido com unidade (g, kg, ml, L) na face principal.", "Portaria INMETRO 157/2002", ALIM);

  // --- Origem ---
  if (!v.fabNome.trim()) crit("origem", "Razão social do fabricante não identificada", "Informe a razão social da empresa responsável.", "RDC 727/2022, art. 7º", ALIM);
  if (!v.fabCnpj.trim()) crit("origem", "CNPJ do fabricante não encontrado", "O CNPJ (ou CPF do produtor rural) é obrigatório.", "RDC 727/2022", ALIM);
  if (!v.fabEnd.trim()) crit("origem", "Endereço do fabricante ausente", "Endereço completo da unidade produtora (rua, nº, cidade/UF).", "RDC 727/2022", ALIM);
  if (!a.pais.trim()) crit("origem", "País de origem não declarado", "“Indústria Brasileira” ou o país de fabricação.", "RDC 727/2022", ALIM);
  if (!v.sac.trim() && !/\bsac\b|0800|@/.test(txt)) warn("sac", "Canal de atendimento (SAC) não declarado", "Telefone, e-mail ou site onde o consumidor fala com a empresa.", "CDC · RDC 727/2022", ALIM);

  // --- Lote / validade / conservação ---
  if (!a.lote.trim()) crit("rastreabilidade", "Lote não declarado", "Identificação do lote visível e indelével (pode ser “Lote: vide embalagem”).", "RDC 727/2022", ALIM);
  if (!a.validade.trim()) crit("rastreabilidade", "Prazo de validade ausente", "Indique o prazo de validade ou onde ele está impresso.", "RDC 727/2022", ALIM);
  if (!a.conservacao.trim()) warn("conservacao", "Instruções de conservação não informadas", "Ex.: “Conservar em local seco e arejado” ou “Manter refrigerado”.", "RDC 727/2022", ALIM);

  // --- Composição ---
  const temIng = a.modo === "receita" ? a.receita.length > 0 : a.ingredientesTexto.trim().length > 0;
  if (!temIng) crit("composicao", "Lista de ingredientes ausente", "Ingredientes em ordem decrescente de quantidade, precedidos de “INGREDIENTES:”.", "RDC 727/2022, art. 17", ALIM);
  if (!a.gluten) crit("composicao", "Declaração de glúten ausente", "Obrigatório em todo alimento embalado: “CONTÉM GLÚTEN” ou “NÃO CONTÉM GLÚTEN”.", "Lei 10.674/2003", ALIM);
  if (a.alergenos.length === 0 && a.podeConter.length === 0)
    info("composicao", "Nenhum alérgeno declarado", "Se a formulação tiver leite, ovos, trigo, soja, amendoim, castanhas, peixes ou crustáceos, a advertência “ALÉRGICOS: CONTÉM…” é obrigatória.", "RDC 26/2015");
  const temLeite = a.alergenos.includes("leite");
  if (temLeite && !a.lactose) warn("composicao", "Produto com leite sem declaração de lactose", "Se houver mais de 100 mg de lactose por 100 g/ml, declare “CONTÉM LACTOSE”.", "RDC 135/2017", ALIM);

  // --- Nutricional ---
  if (!(a.porcao > 0)) crit("nutricional", "Tamanho da porção não informado", "A tabela exige porção em g/ml com medida caseira.", "IN 75/2020", ALIM);
  if (a.porcao > 0 && !a.medidaCaseira.trim()) warn("nutricional", "Medida caseira da porção ausente", "Ex.: “Porção de 30 g (1 colher de sopa)”.", "IN 75/2020", ALIM);
  if (a.pesoLiquido > 0 && a.porcao > 0 && a.pesoLiquido / a.porcao < 1)
    warn("nutricional", "Porção maior que o conteúdo da embalagem", "Porções por embalagem ficou abaixo de 1. Revise porção ou peso líquido.", "IN 75/2020", ALIM);
  const v100 = v100Atual(a);
  const vazio = Object.values(v100).every((x) => !x);
  if (vazio) crit("nutricional", "Valores nutricionais zerados", "Adicione a receita ou informe os valores por 100 g/ml para a tabela sair preenchida.", "IN 75/2020", ALIM);
  if (!hasEl(s, "nutri")) crit("nutricional", "Tabela de informação nutricional ausente no rótulo", "O elemento da tabela foi removido do design. Adicione-o de novo (Inserir → Tabela nutricional).", "IN 75/2020", NUTRI);

  // --- Lupa ---
  const lupas = calcLupas(a);
  const lupaEl = hasEl(s, "lupa");
  if (lupas.length && !lupaEl) crit("frontal", "Lupa “ALTO EM” obrigatória ausente", `Seu produto atinge o limite de ${lupas.length} nutriente(s). A lupa precisa estar na metade superior da face principal.`, "RDC 429/2020", NUTRI);
  if (!lupas.length && lupaEl) warn("frontal", "Lupa presente sem exigência", "Pelos valores informados nenhum nutriente atinge o limite. Remova a lupa ou revise os valores.", "RDC 429/2020", NUTRI);
  if (lupaEl && lupas.length) {
    const L = s.editor.label;
    if (lupaEl.y + lupaEl.h / 2 > L.h / 2) warn("frontal", "Lupa fora da metade superior", "A RDC 429/2020 exige a lupa na metade superior da face principal.", "RDC 429/2020", undefined);
    const areaCm2 = (L.w * L.h) / 100;
    const minW = areaCm2 < 60 ? 23 : areaCm2 < 100 ? 29 : areaCm2 < 200 ? 35 : areaCm2 < 300 ? 42 : 50;
    if (lupaEl.w < minW * 0.95) warn("frontal", "Lupa menor que o mínimo", `Para um painel de ~${Math.round(areaCm2)} cm² a lupa deve ter ao menos ${minW} mm de largura.`, "IN 75/2020, Anexo XVIII", undefined);
  }
  const areaCm2 = (s.editor.label.w * s.editor.label.h) / 100;
  if (areaCm2 < 40) info("frontal", "Face principal menor que 40 cm²", "Embalagens muito pequenas têm regras próprias para a rotulagem frontal e podem usar tabela em formato linear.", "RDC 429/2020 · IN 75/2020");

  // --- Legibilidade ---
  const small = smallTexts(s, 3.2);
  if (small.count) issues.push({ level: "warn", cat: "legibilidade", title: `${small.count} texto(s) abaixo de 1 mm de altura`, desc: "Os textos obrigatórios precisam ter altura mínima de 1 mm (≈ 3 pt) e contraste suficiente.", ref: "RDC 727/2022", action: small.smallestId ? { label: "Ver o menor texto", kind: "select", id: small.smallestId } : null });

  // --- Alegações ---
  const proibidas = [
    { re: /\b(cura|previne|trata)\s+(doen[çc]a|c[âa]ncer|diabetes)/i, t: "propriedade medicinal" },
    { re: /\bemagrece|queima\s+gordura\b/i, t: "emagrecimento" },
    { re: /\bsem\s+(a[çc][úu]car|gl[úu]ten|lactose)\b/i, t: "alegação “sem …” (exige comprovação e regras da RDC 727)" },
  ];
  proibidas.forEach((p) => { if (p.re.test(txt)) warn("claims", `Alegação a verificar: ${p.t}`, "Alimentos não podem atribuir propriedades medicinais nem induzir a erro. Alegações nutricionais seguem regras específicas.", "RDC 727/2022 · RDC 54/2012"); });

  return issues;
}
