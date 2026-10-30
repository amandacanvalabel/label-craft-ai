"use client";

// Geradores SVG dos elementos (porte de shapeSVG/seloSVG/barcodeSVG/qrSVG/textCurveSVG).
import qrcode from "qrcode-generator";
import type { El } from "../types";
import { MM_PER_PT } from "../generate/primitives";
import { SHAPE_LIB, MATERIAL_SVGS, ETHICAL_SVGS, RECYCLING_SVGS, getSeloSVG } from "../data/svgLibs";
import { lupaArt } from "../alimento/lupaArt";

export function ShapeSvg({ el, ppm }: { el: El; ppm: number }) {
  const w = el.w * ppm, h = el.h * ppm;
  const def = SHAPE_LIB[el.shapeKind || "heart"] || SHAPE_LIB.heart;
  const hasStroke = el.stroke && el.stroke !== "#00000000" && (el.sw || 0) > 0;
  let inner = `<path d="${def.path}" fill="${el.fill || "currentColor"}"`;
  if (hasStroke) inner += ` stroke="${el.stroke}" stroke-width="${el.sw}"`;
  inner += "/>";
  return (
    <svg viewBox="0 0 100 100" width={w} height={h} preserveAspectRatio="none" style={{ color: el.fill || "#1a1a1a" }} dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

export function SeloSvg({ el, ppm }: { el: El; ppm: number }) {
  const w = el.w * ppm, h = el.h * ppm;
  const kind = el.seloKind || "vegano";
  let viewBox = "0 0 100 100";
  if (kind.startsWith("pao_")) viewBox = "0 0 1000 1000";
  else if (MATERIAL_SVGS[kind]) viewBox = MATERIAL_SVGS[kind].vb;
  else if (kind === "vegano" && ETHICAL_SVGS.vegano) viewBox = ETHICAL_SVGS.vegano.vb;
  else if ((kind === "crueltyFree" || kind === "naoTestado") && ETHICAL_SVGS.crueltyFree) viewBox = ETHICAL_SVGS.crueltyFree.vb;
  else if (RECYCLING_SVGS[kind]) viewBox = RECYCLING_SVGS[kind].vb;
  return (
    <svg viewBox={viewBox} width={w} height={h} preserveAspectRatio="xMidYMid meet" style={{ color: el.color || "#1a1a1a" }} dangerouslySetInnerHTML={{ __html: getSeloSVG(kind, el.color) }} />
  );
}

export function BarcodeSvg({ el, ppm }: { el: El; ppm: number }) {
  const w = el.w * ppm, h = el.h * ppm;
  const s = (el.code || "0000000000000").replace(/\D/g, "").padEnd(13, "0");
  const bars: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const n = +s[i];
    bars.push(1 + (n % 3));
    bars.push(1 + ((n + 1) % 3));
  }
  const total = bars.reduce((a, b) => a + b, 0);
  const unit = w / total;
  const barH = h * 0.74;
  let x = 0;
  let rects = "";
  bars.forEach((bw, i) => {
    if (i % 2 === 0) rects += `<rect x="${x}" y="0" width="${bw * unit}" height="${barH}" fill="${el.fg}"/>`;
    x += bw * unit;
  });
  const inner = `<rect width="${w}" height="${h}" fill="#ffffff"/>${rects}<text x="${w / 2}" y="${h * 0.96}" font-family="Archivo,monospace" font-size="${h * 0.2}" font-weight="700" text-anchor="middle" fill="${el.fg}">${s.slice(0, 13)}</text>`;
  return <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} dangerouslySetInnerHTML={{ __html: inner }} />;
}

function qrMatrix(text?: string): number[][] {
  const content = (text || "canvalabel").trim() || "canvalabel";
  const qr = qrcode(0, "M");
  qr.addData(content);
  qr.make();
  const N = qr.getModuleCount();
  const m: number[][] = [];
  for (let r = 0; r < N; r++) {
    const row: number[] = [];
    for (let c = 0; c < N; c++) row.push(qr.isDark(r, c) ? 1 : 0);
    m.push(row);
  }
  return m;
}

export function QrSvg({ el, ppm }: { el: El; ppm: number }) {
  const w = el.w * ppm, h = el.h * ppm;
  const m = qrMatrix(el.seed);
  const N = m.length;
  const QUIET = 4;
  const totalModules = N + QUIET * 2;
  const cell = Math.min(w, h) / totalModules;
  const offset = QUIET * cell;
  let rects = "";
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (m[r][c]) rects += `<rect x="${offset + c * cell}" y="${offset + r * cell}" width="${cell + 0.5}" height="${cell + 0.5}" fill="${el.fg}"/>`;
    }
  }
  const inner = `<rect width="${w}" height="${h}" fill="#ffffff"/>${rects}`;
  return <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} shapeRendering="crispEdges" dangerouslySetInnerHTML={{ __html: inner }} />;
}

export function TextCurveSvg({ el, ppm }: { el: El; ppm: number }) {
  const w = el.w * ppm, h = el.h * ppm;
  const r = (el.radius || 50) / 100;
  const pathId = "tp_" + el.id;
  const curve = el.curve || "arcUp";
  let pathD = "";
  if (curve === "circle") {
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) * 0.4 * (0.5 + r);
    const fl = (el as El & { flip?: boolean }).flip ? 0 : 1;
    pathD = `M ${cx - radius} ${cy} a ${radius} ${radius} 0 1 ${fl} ${radius * 2} 0 a ${radius} ${radius} 0 1 ${fl} ${-radius * 2} 0`;
  } else if (curve === "arcUp") {
    const y = h * 0.85, dy = h * 0.7 * r;
    pathD = `M ${w * 0.05} ${y} Q ${w * 0.5} ${y - dy}, ${w * 0.95} ${y}`;
  } else if (curve === "arcDown") {
    const y = h * 0.15, dy = h * 0.7 * r;
    pathD = `M ${w * 0.05} ${y} Q ${w * 0.5} ${y + dy}, ${w * 0.95} ${y}`;
  } else if (curve === "wave") {
    const cy = h / 2, amp = h * 0.3 * r;
    pathD = `M ${w * 0.05} ${cy} Q ${w * 0.25} ${cy - amp}, ${w * 0.5} ${cy} T ${w * 0.95} ${cy}`;
  } else if (curve === "zigzag") {
    const cy = h / 2, amp = h * 0.3 * r;
    pathD = `M ${w * 0.05} ${cy + amp} L ${w * 0.3} ${cy - amp} L ${w * 0.55} ${cy + amp} L ${w * 0.8} ${cy - amp} L ${w * 0.95} ${cy + amp}`;
  } else {
    pathD = `M ${w * 0.05} ${h / 2} L ${w * 0.95} ${h / 2}`;
  }
  const fontSize = (el.size || 11) * MM_PER_PT * ppm;
  const text = (el.text || "Texto em curva").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));
  const inner = `<defs><path id="${pathId}" d="${pathD}" fill="none"/></defs><text font-family="${el.font || "Playfair Display"}, serif" font-size="${fontSize}" font-weight="${el.weight || 600}" font-style="${el.italic ? "italic" : "normal"}" fill="${el.color || "#1a1a1a"}" letter-spacing="${(el.ls || 0) * ppm * 0.353}"><textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${text}</textPath></text>`;
  return <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} overflow="visible" dangerouslySetInnerHTML={{ __html: inner }} />;
}

// ---------- ALIMENTOS ----------

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string));

// Tabela de informação nutricional — modelo vertical da IN 75/2020:
// fundo branco, letras pretas, título em caixa alta, 3 colunas (100 g/ml,
// porção e %VD), linhas separadas por filetes e rodapé com a nota do %VD.
export function NutriSvg({ el, ppm }: { el: El; ppm: number }) {
  const w = el.w * ppm, h = el.h * ppm;
  const d = el.nutri;
  const fg = el.fg || "#000000";
  if (!d) {
    return <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} dangerouslySetInnerHTML={{ __html: `<rect width="${w}" height="${h}" fill="#fff" stroke="${fg}" stroke-width="1"/><text x="${w / 2}" y="${h / 2}" text-anchor="middle" font-family="Arial" font-size="${Math.min(w, h) * 0.08}" fill="${fg}">Tabela nutricional</text>` }} />;
  }
  // Layout proporcional: 1 unidade = 1/100 da largura.
  const u = w / 100;
  const pad = 3 * u;
  const titleH = 9 * u;
  const metaH = 5.2 * u;
  const headH = 6 * u;
  const footH = 6.5 * u;
  const rowsN = d.rows.length;
  const availRows = h - (pad * 2 + titleH + metaH * 2 + headH + footH);
  const rowH = Math.max(4 * u, availRows / rowsN);
  const fs = Math.min(rowH * 0.62, 3.3 * u);
  const colLabel = 46 * u; // largura da coluna de nomes
  const colW = (w - pad * 2 - colLabel) / 3;
  const cx = (i: number) => pad + colLabel + colW * i + colW / 2;
  const un = d.unidade;

  let y = pad;
  let out = `<rect width="${w}" height="${h}" fill="#ffffff" stroke="${fg}" stroke-width="${Math.max(0.8, u * 0.5)}"/>`;
  out += `<text x="${w / 2}" y="${y + titleH * 0.7}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${titleH * 0.55}" fill="${fg}">INFORMAÇÃO NUTRICIONAL</text>`;
  y += titleH;
  out += `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="${fg}" stroke-width="${u * 0.6}"/>`;
  out += `<text x="${pad}" y="${y + metaH * 0.75}" font-family="Arial, Helvetica, sans-serif" font-size="${metaH * 0.6}" fill="${fg}">${esc(d.porcoesLabel)}</text>`;
  y += metaH;
  out += `<text x="${pad}" y="${y + metaH * 0.75}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${metaH * 0.6}" fill="${fg}">${esc(d.porcaoLabel)}</text>`;
  y += metaH;
  out += `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="${fg}" stroke-width="${u * 0.9}"/>`;
  // cabeçalho
  const heads = [`100 ${un}`, `${d.porcao > 0 ? d.porcao : "—"} ${un}`, "%VD*"];
  heads.forEach((t, i) => {
    out += `<text x="${cx(i)}" y="${y + headH * 0.68}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${headH * 0.5}" fill="${fg}">${esc(t)}</text>`;
  });
  y += headH;
  out += `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="${fg}" stroke-width="${u * 0.6}"/>`;
  d.rows.forEach((r, idx) => {
    const ty = y + rowH * 0.68;
    const x0 = pad + (r.indent ? 3 * u : 0);
    out += `<text x="${x0}" y="${ty}" font-family="Arial, Helvetica, sans-serif" font-weight="${r.indent ? 400 : 700}" font-size="${fs}" fill="${fg}">${esc(r.label)}</text>`;
    const cells = [r.v100, r.porcao, r.vd || "—"];
    cells.forEach((c, i) => {
      const parts = c.split("\n");
      if (parts.length > 1) {
        // duas linhas (valor energético): kcal em cima, kJ embaixo, menores
        const f = fs * 0.78;
        out += `<text x="${cx(i)}" y="${ty - f * 0.45}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${f}" fill="${fg}">${esc(parts[0])}</text>`;
        out += `<text x="${cx(i)}" y="${ty + f * 0.55}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${f * 0.85}" fill="${fg}">${esc(parts[1])}</text>`;
      } else {
        out += `<text x="${cx(i)}" y="${ty}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fs}" fill="${fg}">${esc(c)}</text>`;
      }
    });
    y += rowH;
    if (idx < d.rows.length - 1) out += `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="${fg}" stroke-width="${u * 0.25}"/>`;
  });
  out += `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="${fg}" stroke-width="${u * 0.9}"/>`;
  out += `<text x="${pad}" y="${y + footH * 0.55}" font-family="Arial, Helvetica, sans-serif" font-size="${footH * 0.36}" fill="${fg}">*Percentual de valores diários fornecidos pela porção.</text>`;
  return <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} dangerouslySetInnerHTML={{ __html: out }} />;
}

// Lupa "ALTO EM" (RDC 429/2020 · IN 75/2020 Anexo XVII): arte oficial da
// ANVISA montada em lupaArt.ts. A arte mantém a proporção dentro da caixa do
// elemento (preserveAspectRatio), então redimensionar nunca a deforma.
export function LupaSvg({ el, ppm }: { el: El; ppm: number }) {
  const w = el.w * ppm, h = el.h * ppm;
  const art = lupaArt(el.lupas && el.lupas.length ? el.lupas : ["acucar"], el.lupaLayout);
  return (
    <svg
      viewBox={`0 0 ${art.w} ${art.h}`}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      dangerouslySetInnerHTML={{ __html: art.inner }}
    />
  );
}
