"use client";

// Geradores SVG dos elementos (porte de shapeSVG/seloSVG/barcodeSVG/qrSVG/textCurveSVG).
import qrcode from "qrcode-generator";
import type { El } from "../types";
import { MM_PER_PT } from "../generate/primitives";
import { SHAPE_LIB, MATERIAL_SVGS, ETHICAL_SVGS, RECYCLING_SVGS, getSeloSVG } from "../data/svgLibs";

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
