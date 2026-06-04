// Primitivos do motor de geração (porte de mkEl, fs, getFaceConfig,
// getSelosList, buildBackParagraphs, buildSelosBack do editor original).

import type { El, ElementType, FaceConfig, RotuloState, StudioState } from "../types";
import { MATERIAIS_RECICLAGEM } from "../data/wizardData";

export const MM_PER_PT = 0.352777778;

export interface Palette {
  bg: string;
  primary: string;
  accent: string;
  secondary: string;
  text: string;
}

export interface Fonts {
  display: string;
  body: string;
  accent: string;
  label: string;
}

export interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Ctx {
  W: number;
  H: number;
  region: Region;
  palette: Palette;
  fonts: Fonts;
  state: StudioState;
  options: { front?: boolean; back?: boolean; foldAt?: number | null };
  add: (type: ElementType, props: Partial<El>) => void;
}

// Contador de uid mutável compartilhado durante uma geração.
export interface UidRef {
  v: number;
}

export function mkEl(uid: UidRef, type: ElementType, props: Partial<El>): El {
  return {
    id: "e" + uid.v++,
    type,
    rot: 0,
    opacity: 100,
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    ...props,
  } as El;
}

// Escala de fonte conforme o tamanho do rótulo (sublinear).
export function fs(basePt: number, refMm: number, sizeMm: number): number {
  return basePt * Math.pow(Math.max(sizeMm, 20) / refMm, 0.55);
}

export function getFaceConfig(rotulo: RotuloState): FaceConfig {
  const tipo = rotulo.tipo;
  const cfg = rotulo.config;
  if (tipo === "adesivo") {
    if (cfg === "Único para frente e verso")
      return { kind: "unified", faces: [{ id: "unico", label: "Peça única — Frente | Verso" }] };
    if (cfg === "Só frente") return { kind: "front", faces: [{ id: "frente", label: "Frente" }] };
    if (cfg === "Só verso") return { kind: "back", faces: [{ id: "verso", label: "Verso" }] };
    if (cfg === "Frente e verso (2 peças)")
      return { kind: "dual", faces: [{ id: "frente", label: "Frente" }, { id: "verso", label: "Verso" }] };
  }
  if (tipo === "sleeve") {
    return { kind: "unified", faces: [{ id: "unico", label: "Manga 360° — Frente | Verso" }] };
  }
  if (tipo === "serigrafia") {
    if (cfg === "Só frente") return { kind: "front", faces: [{ id: "frente", label: "Frente" }] };
    if (cfg === "Só verso") return { kind: "back", faces: [{ id: "verso", label: "Verso" }] };
    if (cfg === "Frente e verso")
      return { kind: "dual", faces: [{ id: "frente", label: "Frente" }, { id: "verso", label: "Verso" }] };
  }
  if (tipo === "inmold") {
    return { kind: "front", faces: [{ id: "frente", label: "Área de impressão" }] };
  }
  return { kind: "dual", faces: [{ id: "frente", label: "Frente" }, { id: "verso", label: "Verso" }] };
}

export interface SeloEntry {
  seloKind: string;
  name: string;
}

export function getSelosList(state: StudioState): SeloEntry[] {
  const list: SeloEntry[] = [];
  const s = state.selos;
  if (s.vegano) list.push({ seloKind: "vegano", name: "Selo Vegano" });
  if (s.materialReciclavel) list.push({ seloKind: "reciclavel", name: "Selo Material Reciclável" });
  if (s.jogueLixo) list.push({ seloKind: "jogueLixo", name: "Selo Jogue no Lixo" });
  if (s.euReciclo) list.push({ seloKind: "eureciclo", name: "Selo eureciclo" });
  if (s.crueltyFree) list.push({ seloKind: "crueltyFree", name: "Selo Cruelty Free" });
  if (s.naoTestado) list.push({ seloKind: "naoTestado", name: "Selo Não testado em animais" });
  if (s.tipoMaterial) {
    const mat = MATERIAIS_RECICLAGEM.find((m) => m.code === s.tipoMaterial);
    const kind = mat ? mat.kind : "pet";
    const name = mat ? mat.name : s.tipoMaterial;
    list.push({ seloKind: kind, name: `Selo Material ${name}` });
  }
  if (s.validadeAbertura) {
    list.push({ seloKind: "pao_" + s.validadeAbertura, name: `Selo PAO ${s.validadeAbertura}` });
  }
  return list;
}

// Desenha os selos no VERSO em grade no rodapé.
export function buildSelosBack(ctx: Ctx) {
  const { region: r, palette: p, state, add } = ctx;
  const selos = getSelosList(state);
  const outros = state.selos.outros || [];
  const total = selos.length + outros.length;
  if (total === 0) return;

  const seloSize = Math.min(r.w * 0.11, r.h * 0.075, 14);
  const gap = seloSize * 0.25;
  const cols = Math.max(1, Math.min(total, Math.floor((r.w * 0.85) / (seloSize + gap))));
  const rows = Math.ceil(total / cols);

  const padX = r.w * 0.06;
  const totalGridW = cols * seloSize + (cols - 1) * gap;
  const startX = r.x + r.w - padX - totalGridW;
  const codBarrasH = Math.min(r.h * 0.1, 16);
  const startY = r.y + r.h - r.h * 0.07 - codBarrasH - (rows * seloSize + (rows - 1) * gap) - r.h * 0.02;

  let idx = 0;
  selos.forEach((s) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    add("selo", {
      name: s.name,
      x: startX + col * (seloSize + gap),
      y: startY + row * (seloSize + gap),
      w: seloSize,
      h: seloSize,
      seloKind: s.seloKind,
      color: p.text || "#1a1a1a",
    });
    idx++;
  });
  outros.forEach((src, i) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    add("image", {
      name: `Selo próprio ${i + 1}`,
      x: startX + col * (seloSize + gap),
      y: startY + row * (seloSize + gap),
      w: seloSize,
      h: seloSize,
      src,
    });
    idx++;
  });
}

// Gera os parágrafos do verso (compartilhado pelos templates).
export function buildBackParagraphs(ctx: Ctx) {
  const { region: r, palette: p, fonts: f, state, add } = ctx;
  const v = state.verso;
  const nome = (state.frente.nome || v.nome || "Nome do Produto").toUpperCase();
  const padX = r.w * 0.06;
  const colW = r.w - padX * 2;
  let y = r.y + r.h * 0.05;
  const baseSize = fs(3.2, 60, Math.min(r.w, r.h) * 1.3);
  const lh = 1.38;

  const para = (name: string, text: string, size: number, weight?: number) => {
    if (!text || !text.trim()) return;
    const charPerLine = Math.max(20, colW / (size * MM_PER_PT * 0.5));
    const lines = Math.max(1, Math.ceil(text.length / charPerLine));
    const h = Math.max(size * MM_PER_PT * 1.6, lines * size * MM_PER_PT * lh);
    add("text", {
      name,
      x: r.x + padX,
      y,
      w: colW,
      h,
      text,
      font: f.body,
      size,
      weight: weight || 500,
      italic: false,
      color: p.text,
      align: "left",
      lh,
      ls: 0,
    });
    y += h + r.h * 0.012;
  };

  add("text", {
    name: "Título do verso",
    x: r.x + padX,
    y,
    w: colW,
    h: baseSize * MM_PER_PT * 1.4,
    text: nome,
    font: f.display,
    size: baseSize * 1.6,
    weight: 700,
    italic: false,
    color: p.primary,
    align: "left",
    lh: 1.1,
    ls: 0.5,
  });
  y += baseSize * MM_PER_PT * 2.2;
  add("line", { name: "Divisória do verso", x: r.x + padX, y, w: colW * 0.18, h: 0.1, stroke: p.accent, sw: 0.4 });
  y += r.h * 0.018;

  let p1 = "";
  if (v.introducao) p1 += v.introducao + " ";
  if (v.modoUso) p1 += "MODO DE USO: " + v.modoUso + " ";
  if (v.dicas) p1 += "DICAS: " + v.dicas + " ";
  if (v.precaucoes) p1 += "PRECAUÇÕES: " + v.precaucoes;
  if (!p1.trim()) p1 = "Descrição do produto, modo de uso, dicas e precauções aparecem aqui.";
  para("Parágrafo de apresentação", p1.trim(), baseSize, 500);

  if (v.qrLink) {
    const qrSize = Math.min(r.w * 0.2, r.h * 0.18);
    add("qr", { name: "QR Code de Ingredientes", x: r.x + padX, y, w: qrSize, h: qrSize, seed: v.qrLink, fg: p.text });
    add("text", {
      name: "Aviso do QR Code",
      x: r.x + padX + qrSize + r.w * 0.02,
      y: y + qrSize * 0.2,
      w: colW - qrSize - r.w * 0.02,
      h: qrSize * 0.6,
      text: "Aponte a câmera para ver a lista completa de ingredientes.",
      font: f.body,
      size: baseSize * 0.92,
      weight: 500,
      italic: false,
      color: p.text,
      align: "left",
      lh: 1.4,
      ls: 0,
    });
    y += qrSize + r.h * 0.018;
  } else {
    let p2 = "INGREDIENTES: ";
    if (v.ingEn) p2 += v.ingEn + ". ";
    if (v.ingPt) p2 += v.ingPt;
    if (!v.ingEn && !v.ingPt) p2 += "(a preencher)";
    para("Parágrafo de ingredientes", p2.trim(), baseSize * 0.94, 500);
  }

  let p3 = "FABRICADO POR: ";
  p3 += v.fabNome || "[nome da indústria]";
  if (v.fabCnpj) p3 += " — CNPJ " + v.fabCnpj;
  if (v.fabIe) p3 += " — I.E. " + v.fabIe;
  if (v.fabEnd) p3 += " — " + v.fabEnd;
  if (v.fabCrq) p3 += " — Quím. Resp. CRQ " + v.fabCrq;
  p3 += " — Processo ANVISA " + (v.fabAnvisa || "XXXXX");
  p3 += " — INDÚSTRIA BRASILEIRA.";
  if (v.fornNome) {
    p3 += " FORNECEDOR EXCLUSIVO: " + v.fornNome;
    if (v.fornCnpj) p3 += " — CNPJ " + v.fornCnpj;
    if (v.fornEnd) p3 += " — " + v.fornEnd;
    p3 += ".";
  }
  para("Parágrafo de fabricação", p3, baseSize * 0.86, 500);

  para("Parágrafo SAC", "SAC: " + (v.sac || "0800 000 0000"), baseSize * 0.92, 700);
  para("Parágrafo de validade", v.validadeLote || "Validade e lote: vide embalagem", baseSize * 0.92, 700);

  const bw = r.w * 0.32;
  const bh = Math.min(r.h * 0.1, 16);
  add("barcode", {
    name: "Código de barras EAN-13",
    x: r.x + r.w - padX - bw,
    y: r.y + r.h - bh - r.h * 0.05,
    w: bw,
    h: bh,
    code: v.codBarras || "7890000000000",
    fg: p.text,
  });
}
