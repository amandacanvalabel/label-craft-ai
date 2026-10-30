// Layout de ALIMENTO para o motor de geração: verso (ingredientes,
// alérgenos, glúten, tabela nutricional, conservação, fabricante, lote,
// validade, SAC, EAN) e lupa frontal. Compartilhado por todos os templates —
// o template só dá cores e fontes.

import type { Ctx } from "../generate/primitives";
import { MM_PER_PT, fs } from "../generate/primitives";
import { buildNutriTable, calcLupas, defaultAlimento, fraseAlergenos, fraseGluten, ingredientesDaReceita } from "./calc";
import { lupaSizeMm } from "./lupaArt";

export function buildBackAlimento(ctx: Ctx) {
  const { region: r, palette: p, fonts: f, state, add } = ctx;
  const a = state.alimento || defaultAlimento();
  const v = state.verso;
  const nome = (state.frente.nome || a.designacao || "Nome do Produto").toUpperCase();
  const padX = r.w * 0.06;
  const colW = r.w - padX * 2;
  // largura da coluna de texto (muda quando a tabela vai para a direita)
  const colWRef = { v: colW };
  let y = r.y + r.h * 0.045;
  const baseSize = fs(2.9, 60, Math.min(r.w, r.h) * 1.3);
  const lh = 1.35;

  const para = (name: string, text: string, size: number, weight = 500, color = p.text) => {
    if (!text || !text.trim()) return;
    const cw = colWRef.v;
    const charPerLine = Math.max(16, cw / (size * MM_PER_PT * 0.5));
    const lines = Math.max(1, Math.ceil(text.length / charPerLine));
    const h = Math.max(size * MM_PER_PT * 1.6, lines * size * MM_PER_PT * lh);
    add("text", { name, x: r.x + padX, y, w: cw, h, text, font: f.body, size, weight, italic: false, color, align: "left", lh, ls: 0 });
    y += h + r.h * 0.01;
  };

  // Título
  add("text", { name: "Título do verso", x: r.x + padX, y, w: colW, h: baseSize * MM_PER_PT * 1.4, text: nome, font: f.display, size: baseSize * 1.5, weight: 700, italic: false, color: p.primary, align: "left", lh: 1.1, ls: 0.5 });
  y += baseSize * MM_PER_PT * 2.1;
  if (a.designacao && a.designacao.toUpperCase() !== nome) {
    para("Denominação de venda", a.designacao.toUpperCase(), baseSize * 0.9, 600, p.secondary);
  }
  add("line", { name: "Divisória do verso", x: r.x + padX, y, w: colW * 0.18, h: 0.1, stroke: p.accent, sw: 0.4 });
  y += r.h * 0.016;

  // Ingredientes (ordem decrescente) + alérgenos + glúten + lactose
  const ing = (a.modo === "receita" && a.receita.length ? ingredientesDaReceita(a.receita) : a.ingredientesTexto) || "(a preencher)";
  para("Ingredientes", "INGREDIENTES: " + ing.replace(/\.$/, "") + ".", baseSize * 0.94, 500);
  const al = fraseAlergenos(a);
  if (al) para("Advertência de alérgenos", al, baseSize * 0.94, 800);
  const gl = fraseGluten(a);
  const lac = a.lactose ? "CONTÉM LACTOSE." : "";
  if (gl || lac) para("Glúten e lactose", [gl ? gl + "." : "", lac].filter(Boolean).join(" "), baseSize * 0.94, 800);
  if (a.declaracoes.length) para("Declarações obrigatórias", a.declaracoes.join(". ") + ".", baseSize * 0.86, 600);

  // Tabela nutricional. Em rótulos largos (≥ 70 mm) ela vai numa coluna à
  // direita e os textos seguem à esquerda; em rótulos estreitos fica em linha,
  // com altura limitada para sobrar espaço para o resto.
  const tbl = buildNutriTable(a);
  const duasColunas = r.w >= 70;
  const bw = r.w * 0.3;
  const bh = Math.min(r.h * 0.09, 15);
  if (duasColunas) {
    const tblW = r.w * 0.42;
    const tblH = Math.min(tblW * 1.25, r.h * 0.6);
    const tx = r.x + r.w - padX - tblW;
    add("nutri", { name: "Tabela nutricional", x: tx, y, w: tblW, h: tblH, nutri: tbl, fg: "#000000" });
    // EAN embaixo da tabela, na mesma coluna
    add("barcode", { name: "Código de barras EAN-13", x: tx + tblW - bw, y: y + tblH + r.h * 0.02, w: bw, h: bh, code: v.codBarras || "7890000000000", fg: p.text });
    // textos seguem na coluna esquerda
    colWRef.v = r.w - padX * 2 - tblW - r.w * 0.04;
  } else {
    const tblH = Math.min(colW * 1.22, r.h * 0.46);
    const tblW = Math.min(colW, tblH / 1.22);
    add("nutri", { name: "Tabela nutricional", x: r.x + padX, y, w: tblW, h: tblH, nutri: tbl, fg: "#000000" });
    y += tblH + r.h * 0.015;
    add("barcode", { name: "Código de barras EAN-13", x: r.x + r.w - padX - bw, y: r.y + r.h - bh - r.h * 0.04, w: bw, h: bh, code: v.codBarras || "7890000000000", fg: p.text });
  }

  // Conservação / preparo
  if (a.conservacao) para("Conservação", "CONSERVAÇÃO: " + a.conservacao, baseSize * 0.88, 500);
  if (a.conservacaoAberto) para("Conservação após aberto", "APÓS ABERTO: " + a.conservacaoAberto, baseSize * 0.88, 500);
  if (a.preparo) para("Modo de preparo", "MODO DE PREPARO: " + a.preparo, baseSize * 0.88, 500);

  // Fabricante
  let p3 = "FABRICADO POR: " + (v.fabNome || "[razão social]");
  if (v.fabCnpj) p3 += " — CNPJ " + v.fabCnpj;
  if (v.fabEnd) p3 += " — " + v.fabEnd;
  p3 += " — " + (a.pais || "INDÚSTRIA BRASILEIRA") + ".";
  if (a.registroMs) p3 += " " + a.registroMs + ".";
  para("Fabricante", p3, baseSize * 0.84, 500);
  para("SAC", "SAC: " + (v.sac || "0800 000 0000"), baseSize * 0.9, 700);
  para("Lote e validade", [a.lote || "Lote: vide embalagem", a.validade || "Validade: vide embalagem"].join(" · "), baseSize * 0.9, 700);

  // Peso líquido no rodapé esquerdo
  if (a.pesoLiquido > 0) {
    add("text", { name: "Conteúdo líquido", x: r.x + padX, y: r.y + r.h - bh - r.h * 0.04, w: Math.max(20, colWRef.v - 2), h: bh, text: `${a.categoria === "liquido" ? "CONTEÚDO" : "PESO LÍQUIDO"}: ${a.pesoLiquido} ${a.categoria === "liquido" ? "ml" : "g"}`, font: f.label, size: baseSize * 1.3, weight: 700, italic: false, color: p.primary, align: "left", lh: 1, ls: 0.5 });
  }
}

// Lupa frontal: metade superior da face principal, canto direito, tamanho
// proporcional à área do painel (Anexo XVIII — aproximação).
export function buildLupaFront(ctx: Ctx) {
  const { region: r, state, add } = ctx;
  const a = state.alimento;
  if (!a) return;
  const lupas = calcLupas(a);
  if (!lupas.length) return;
  // Tamanho pelo percentual de ocupação do painel principal (IN 75/2020,
  // Anexo XVIII) e disposição escolhida no passo 4 (padrão automática).
  const { w: lw, h: lh, layout } = lupaSizeMm(lupas, a.lupaLayout || "auto", r.w, r.h);
  // Metade superior da face principal, encostada à direita.
  add("lupa", { name: "Lupa ALTO EM", x: r.x + r.w - lw - r.w * 0.05, y: r.y + r.h * 0.05, w: lw, h: lh, lupas, lupaLayout: layout });
}
