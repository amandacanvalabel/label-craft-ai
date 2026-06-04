"use client";

import type { StudioState } from "../types";
import { captureFace } from "./capture";
import { getMaterialLabel } from "../data/materials";
import { HOT_STAMPING_COLORS } from "../data/hotStamping";

const DPI = 300;
const PX_PER_MM = DPI / 25.4; // ≈ 11.81

function safeName(s: string) {
  return (s || "rotulo").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "rotulo";
}

function finishesSummary(state: StudioState): string[] {
  const lines: string[] = [];
  Object.entries(state.finishes || {}).forEach(([id, fin]) => {
    const el = Object.values(state.editor.faces).flat().find((e) => e.id === id);
    const name = el?.name || id;
    if (fin.hotstamp) lines.push(`Hot stamping ${HOT_STAMPING_COLORS[fin.hotstamp]?.name || fin.hotstamp} — ${name}`);
    if (fin.verniz) lines.push(`Verniz localizado — ${name}`);
    if (fin.baixoRelevo) lines.push(`Baixo relevo — ${name}`);
  });
  return lines;
}

// Gera o PDF técnico: capa/spec + uma página por face (300 DPI, com sangria e
// marcas de corte) + página de faca (contorno cotado).
export async function exportPDF(state: StudioState): Promise<string> {
  const { jsPDF } = await import("jspdf");
  const L = state.editor.label;
  const faces = Object.entries(state.editor.faces || {});
  const bleed = L.bleed || 3;
  const accent = "#2563eb";

  // ---- Capa A4 (retrato) com especificações ----
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pw = pdf.internal.pageSize.getWidth();
  let y = 22;
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(accent);
  pdf.setFontSize(9);
  pdf.text("CANVALABEL · FICHA TÉCNICA", 18, y);
  y += 10;
  pdf.setTextColor("#111111");
  pdf.setFontSize(22);
  pdf.text(state.editor.docname || "Rótulo", 18, y);
  y += 12;
  pdf.setDrawColor(accent);
  pdf.setLineWidth(0.6);
  pdf.line(18, y, pw - 18, y);
  y += 10;

  const row = (k: string, v: string) => {
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor("#666666");
    pdf.text(k.toUpperCase(), 18, y);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(11); pdf.setTextColor("#111111");
    pdf.text(v, 70, y);
    y += 8;
  };
  row("Produto", state.frente.nome || state.verso.nome || "—");
  row("Dimensões", `${L.w} × ${L.h} mm (sangria ${bleed} mm)`);
  row("Tipo de rótulo", state.rotulo.tipo || "—");
  row("Faces", faces.map(([id]) => id).join(", ") || "—");
  row("Material", getMaterialLabel(state.material));
  row("Resolução", `${DPI} DPI`);

  const fins = finishesSummary(state);
  y += 4;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor("#666666");
  pdf.text("ACABAMENTOS ESPECIAIS", 18, y); y += 7;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor("#111111");
  if (fins.length === 0) { pdf.text("Nenhum.", 18, y); y += 6; }
  else fins.forEach((f) => { pdf.text("• " + f, 18, y); y += 6; });

  y += 6;
  pdf.setDrawColor("#dddddd"); pdf.setLineWidth(0.2); pdf.line(18, y, pw - 18, y); y += 6;
  pdf.setFontSize(8); pdf.setTextColor("#999999");
  pdf.text("Gerado em " + new Date().toLocaleString("pt-BR") + " · canvalabel.com", 18, y);
  pdf.setTextColor("#b91c1c");
  y += 5;
  pdf.text("Confira sempre com uma prova física antes da tiragem final.", 18, y);

  // ---- Uma página por face (tamanho real + sangria + marcas de corte) ----
  for (const [faceId] of faces) {
    const canvas = await captureFace(state, faceId, PX_PER_MM, { finishes: false });
    const pageW = L.w + bleed * 2;
    const pageH = L.h + bleed * 2;
    pdf.addPage([pageW, pageH], pageW > pageH ? "landscape" : "portrait");
    // arte preenche a área incl. sangria
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageW, pageH, undefined, "FAST");
    // marcas de corte (linha do corte = retângulo interno)
    pdf.setDrawColor("#ff0000"); pdf.setLineWidth(0.1);
    const m = 4;
    // cantos
    pdf.line(bleed, m, bleed, bleed); pdf.line(m, bleed, bleed, bleed); // TL
    pdf.line(pageW - bleed, m, pageW - bleed, bleed); pdf.line(pageW - m, bleed, pageW - bleed, bleed); // TR
    pdf.line(bleed, pageH - m, bleed, pageH - bleed); pdf.line(m, pageH - bleed, bleed, pageH - bleed); // BL
    pdf.line(pageW - bleed, pageH - m, pageW - bleed, pageH - bleed); pdf.line(pageW - m, pageH - bleed, pageW - bleed, pageH - bleed); // BR
  }

  // ---- Página da faca (contorno cotado) ----
  {
    const pageW = L.w + 40;
    const pageH = L.h + 40;
    pdf.addPage([pageW, pageH], pageW > pageH ? "landscape" : "portrait");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(accent);
    pdf.text("FACA / RECORTE", 20, 14);
    const ox = 20, oy = 20;
    pdf.setDrawColor("#111111"); pdf.setLineWidth(0.3);
    pdf.rect(ox, oy, L.w, L.h);
    pdf.setFontSize(9); pdf.setTextColor("#111111");
    pdf.text(`${L.w} mm`, ox + L.w / 2 - 6, oy + L.h + 8);
    pdf.text(`${L.h} mm`, ox + L.w + 4, oy + L.h / 2);
  }

  const filename = `canvalabel_${safeName(state.editor.docname)}.pdf`;
  pdf.save(filename);
  return filename;
}
