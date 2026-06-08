"use client";

import type { StudioState } from "../types";
import { captureFace } from "./capture";
import { getMaterialLabel } from "../data/materials";
import { HOT_STAMPING_COLORS } from "../data/hotStamping";

const DPI = 300;
const PX_PER_MM = DPI / 25.4; // ≈ 11.81

// Branding nosso (azul) — substitui o laranja do protótipo da cliente.
const ACCENT = "#2563eb";
const DARK = "#111827";
const RED = "#ef4444";

function hex(c: string): [number, number, number] {
  const h = c.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function safeName(s: string) {
  return (s || "rotulo").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "rotulo";
}

// Decide o formato da folha (sulfite). A página nunca fica menor que o rótulo:
// A4 retrato por padrão; A4 paisagem se for largo; A3 se for grande nos dois lados.
function pickPageFormat(w: number, h: number): { format: string; orientation: "p" | "l"; w: number; h: number } {
  const MAX = 180; // largura útil em A4 retrato (210 - 30 de margem)
  if (w > MAX && h > MAX) return { format: "a3", orientation: "p", w: 297, h: 420 };
  if (w > MAX) return { format: "a4", orientation: "l", w: 297, h: 210 };
  return { format: "a4", orientation: "p", w: 210, h: 297 };
}

interface FinishGroup { name: string; base: string; }
function collectFinishGroups(state: StudioState): FinishGroup[] {
  const seen = new Map<string, FinishGroup>();
  Object.values(state.finishes || {}).forEach((f) => {
    if (f.hotstamp) {
      const c = HOT_STAMPING_COLORS[f.hotstamp];
      if (c) seen.set("hs_" + f.hotstamp, { name: "Hot Stamping " + c.name, base: c.base });
    }
    if (f.verniz) seen.set("verniz", { name: "Verniz Localizado", base: "#cbd5e1" });
    if (f.baixoRelevo) seen.set("bxr", { name: "Baixo Relevo", base: "#3a3a3a" });
  });
  return [...seen.values()];
}

let _logo: string | null = null;
async function loadLogo(): Promise<string | null> {
  if (_logo !== null) return _logo || null;
  try {
    const res = await fetch("/favicon.png");
    const blob = await res.blob();
    _logo = await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.readAsDataURL(blob);
    });
    return _logo;
  } catch {
    _logo = "";
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PDF = any;

function drawHeader(pdf: PDF, pw: number, logo: string | null, subtitle: string, docname: string) {
  const H = 22;
  pdf.setFillColor(...hex(DARK)); pdf.rect(0, 0, pw, H, "F");
  if (logo) pdf.addImage(logo, "PNG", 10, (H - 9) / 2, 9, 9, undefined, "FAST");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(13);
  pdf.text("CanvaLabel", 22, 9.6);
  pdf.setTextColor(156, 163, 175); pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.5);
  pdf.text(subtitle.toUpperCase(), 22, 14.2);
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(9);
  pdf.text(docname, pw - 10, 9.6, { align: "right" });
  pdf.setTextColor(156, 163, 175); pdf.setFont("helvetica", "normal"); pdf.setFontSize(7);
  pdf.text(new Date().toLocaleDateString("pt-BR"), pw - 10, 14.2, { align: "right" });
}

function drawFooter(pdf: PDF, pw: number, ph: number, logo: string | null, subtitle: string, pageNum: number, total: number) {
  const F = 18, top = ph - F;
  pdf.setTextColor(...hex(RED)); pdf.setFont("helvetica", "bold"); pdf.setFontSize(6.3);
  pdf.text("CONFERIR MEDIDA DO RÓTULO CONFORME EMBALAGEM (RECOMENDAMOS UMA PROVA DE FACA PARA TESTAR MARGENS).", 10, top - 4);
  pdf.setFillColor(...hex(ACCENT)); pdf.rect(0, top, pw, F, "F");
  // caixa branca p/ o logo ficar visível sobre o azul
  pdf.setFillColor(255, 255, 255); pdf.roundedRect(10, top + (F - 8) / 2, 8, 8, 1.4, 1.4, "F");
  if (logo) pdf.addImage(logo, "PNG", 10.6, top + (F - 8) / 2 + 0.6, 6.8, 6.8, undefined, "FAST");
  pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(9.5);
  pdf.text("canvalabel.com", 21, top + 8);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.3);
  pdf.text("Criação de rótulos com IA", 21, top + 12.4);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(7);
  pdf.text(subtitle, pw - 10, top + 8, { align: "right" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(6.3);
  pdf.text(`Página ${pageNum} de ${total}`, pw - 10, top + 12.4, { align: "right" });
}

// Desenha um swatch de legenda (círculo) em (x,y) com diâmetro d.
function drawSwatch(pdf: PDF, kind: string, base: string, x: number, y: number, d: number) {
  const r = d / 2, cx = x + r, cy = y + r;
  if (kind === "cmyk") {
    const cols = ["#06b6d4", "#ec4899", "#fbbf24", "#111111"];
    cols.forEach((c, i) => { pdf.setFillColor(...hex(c)); pdf.rect(x + (i * d) / 4, y, d / 4, d, "F"); });
  } else {
    pdf.setFillColor(...hex(base)); pdf.circle(cx, cy, r, "F");
  }
  pdf.setDrawColor(180, 180, 188); pdf.setLineWidth(0.15);
  if (kind === "cmyk") pdf.rect(x, y, d, d); else pdf.circle(cx, cy, r);
}

// Coloca a arte da face (imagem) centralizada numa área, devolvendo a caixa usada.
function placeArt(pdf: PDF, img: { data: string; w: number; h: number }, areaX: number, areaY: number, areaW: number, areaH: number, maxScale = 3) {
  const scale = Math.min(areaW / img.w, areaH / img.h, maxScale);
  const w = img.w * scale, h = img.h * scale;
  const x = areaX + (areaW - w) / 2, y = areaY + (areaH - h) / 2;
  pdf.addImage(img.data, "PNG", x, y, w, h, undefined, "FAST");
  return { x, y, w, h };
}

// Gera o PDF técnico: folha sulfite (A4/A3) com cabeçalho/rodapé + logo,
// página de especificação, uma página por face e a página da faca cotada.
export async function exportPDF(state: StudioState): Promise<string> {
  const { jsPDF } = await import("jspdf");
  const L = state.editor.label;
  const bleed = L.bleed || 3;
  const faceIds = Object.keys(state.editor.faces || {});
  const logo = await loadLogo();
  const groups = collectFinishGroups(state);

  // Captura todas as faces uma vez (alta resolução).
  const arts: Record<string, { data: string; w: number; h: number }> = {};
  for (const id of faceIds) {
    const cv = await captureFace(state, id, PX_PER_MM, { finishes: false });
    arts[id] = { data: cv.toDataURL("image/png"), w: L.w, h: L.h };
  }

  const pi = pickPageFormat(L.w, L.h);
  const pdf = new jsPDF({ orientation: pi.orientation, unit: "mm", format: pi.format, compress: true });
  const pw = pi.w, ph = pi.h;
  const totalPages = 1 + faceIds.length + 1;
  let pageNum = 1;

  // ===== Página 1 — Especificação técnica =====
  drawHeader(pdf, pw, logo, "PDF técnico · especificação", state.editor.docname || "Rótulo");

  let y = 32;
  pdf.setTextColor(...hex(DARK)); pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
  pdf.text("ESPECIFICAÇÃO DE MATERIAL DE EMBALAGEM", 10, y);
  y += 9;

  const colY = y;
  // coluna esquerda — dados
  const row = (k: string, v: string) => {
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5); pdf.setTextColor(...hex(DARK));
    pdf.text(k, 10, y);
    pdf.setFont("helvetica", "normal"); pdf.setTextColor(55, 65, 81);
    const lines = pdf.splitTextToSize(v, pw / 2 - 38) as string[];
    pdf.text(lines, 38, y);
    y += Math.max(6, lines.length * 5);
  };
  row("Material:", getMaterialLabel(state.material));
  if (groups.length) row("Acabamento:", groups.map((g) => g.name).join(" + "));
  row("Impressão:", "CMYK (4 cores)");
  row("Produto:", state.frente?.nome || state.verso?.nome || state.editor.docname || "—");
  row("Dimensão:", `${L.w} × ${L.h} mm`);
  row("Sangria:", `${bleed} mm`);
  row("Revisão:", "001");

  // coluna direita — legenda
  let ly = colY;
  const lx = pw / 2 + 4;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...hex(DARK));
  pdf.text("LEGENDA DE CORES", lx, ly); ly += 7;
  const legend: { kind: string; base: string; label: string; hl?: boolean }[] = [
    { kind: "cmyk", base: "", label: "CMYK (impressão 4 cores)", hl: true },
    ...groups.map((g) => ({ kind: "fin", base: g.base, label: g.name })),
  ];
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
  legend.forEach((l) => {
    drawSwatch(pdf, l.kind, l.base, lx, ly - 3, 4);
    if (l.hl) pdf.setTextColor(...hex(ACCENT)); else pdf.setTextColor(55, 65, 81);
    pdf.text(l.label, lx + 6, ly); ly += 6.5;
  });
  pdf.setDrawColor(...hex(RED)); pdf.setLineWidth(0.4); pdf.circle(lx + 2, ly - 1, 2);
  pdf.setTextColor(120, 120, 130); pdf.setFont("helvetica", "italic"); pdf.setFontSize(7);
  pdf.text("Linha vermelha: faca de corte (não imprimir)", lx + 6, ly); ly += 6;

  // preview do rótulo (1ª face)
  const previewTop = Math.max(y, ly) + 6;
  const previewBottom = ph - 18 - 14;
  if (faceIds[0]) {
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8.5); pdf.setTextColor(...hex(DARK));
    pdf.text("PREVIEW", 10, previewTop);
    const box = placeArt(pdf, arts[faceIds[0]], 10, previewTop + 3, pw - 20, previewBottom - previewTop - 6, 1.8);
    pdf.setDrawColor(203, 213, 225); pdf.setLineWidth(0.2); pdf.rect(box.x, box.y, box.w, box.h);
  }
  drawFooter(pdf, pw, ph, logo, "Especificação técnica", pageNum++, totalPages);

  // ===== Páginas 2+ — uma por face =====
  for (const id of faceIds) {
    pdf.addPage();
    const faceLabel = id.charAt(0).toUpperCase() + id.slice(1);
    drawHeader(pdf, pw, logo, `Rótulo · ${faceLabel}`, state.editor.docname || "Rótulo");
    const top = 26, bottom = ph - 18 - 6;
    const box = placeArt(pdf, arts[id], 12, top, pw - 24, bottom - top, 2.5);
    // contorno fino da faca (referência de corte)
    pdf.setDrawColor(...hex(RED)); pdf.setLineWidth(0.3); pdf.rect(box.x, box.y, box.w, box.h);
    drawFooter(pdf, pw, ph, logo, `Rótulo · ${faceLabel}`, pageNum++, totalPages);
  }

  // ===== Última página — Faca cotada =====
  {
    pdf.addPage();
    drawHeader(pdf, pw, logo, "Faca · corte", state.editor.docname || "Rótulo");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(...hex(DARK));
    pdf.text("FACA / RECORTE", 10, 32);
    const top = 42, bottom = ph - 18 - 10;
    const availW = pw - 60, availH = bottom - top - 20;
    const scale = Math.min(availW / L.w, availH / L.h, 2.5);
    const w = L.w * scale, h = L.h * scale;
    const x = (pw - w) / 2, oy = top + (bottom - top - h) / 2;
    // retângulo da faca
    pdf.setDrawColor(...hex(RED)); pdf.setLineWidth(0.6);
    pdf.rect(x, oy, w, h);
    // cotas
    pdf.setLineWidth(0.3);
    pdf.line(x, oy - 6, x + w, oy - 6); // largura
    pdf.line(x + w + 6, oy, x + w + 6, oy + h); // altura
    pdf.setTextColor(...hex(RED)); pdf.setFont("helvetica", "italic"); pdf.setFontSize(9);
    pdf.text(`${L.w} mm`, x + w / 2, oy - 8, { align: "center" });
    pdf.text(`${L.h} mm`, x + w + 9, oy + h / 2, { align: "center", angle: 90 });
    drawFooter(pdf, pw, ph, logo, "Faca · corte", pageNum++, totalPages);
  }

  const filename = `canvalabel_${safeName(state.editor.docname)}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
  return filename;
}
