// Montagem da lupa "ALTO EM" (rotulagem nutricional frontal — RDC 429/2020 e
// IN 75/2020, Anexos XVII e XVIII) a partir das artes oficiais da ANVISA.
//
// Os blocos (lupa + "ALTO EM", AÇÚCAR ADICIONADO, GORDURA SATURADA, SÓDIO) são
// vetores extraídos do anexo (lupaParts.ts). Aqui só montamos a grade, a borda
// externa (com os cantos arredondados do modelo) e escolhemos o tamanho conforme
// o percentual de ocupação do painel principal exigido pelo Anexo XVIII.
import type { LupaKind } from "../types";
import { ALTO_EM_INNER, BOX_PATH, NUTRIENT_TEXT } from "./lupaParts";

export type LupaLayout = "linha" | "coluna" | "bloco";

// Medidas (unidades do desenho oficial; proporções preservadas).
const BOX_W = 109.44; // caixa de nutriente
const BOX_H = 40.99;
const GAP_X = 4.38; // distância entre blocos (2Z)
const GAP_Y = 4.51;
const M = 6.77; // margem interna (2Z) + borda (1Z)
const M_END = 6.64;
const STROKE = 2.26; // borda externa (1Z)
const R_CONVEX = 8.89; // raio no eixo da borda → 10,02 fora / 7,76 dentro
const R_CONCAVE = 11.145; // canto côncavo das formas em "L" → 10,02 fora / 12,27 dentro
// Altura da letra "A" de "ALTO EM" no desenho (medida Y do Anexo XVIII).
const Y_UNITS = 13.66;

// Ordem dos blocos conforme os modelos do Anexo XVII (arte oficial).
const ORDER: LupaKind[] = ["acucar", "gordura", "sodio"];
export function lupaOrder(kinds: LupaKind[]): LupaKind[] {
  const set = new Set(kinds);
  const sorted = ORDER.filter((k) => set.has(k));
  // No modelo oficial para o par gordura + sódio, SÓDIO vem antes de GORDURA SATURADA.
  if (sorted.length === 2 && sorted[0] === "gordura" && sorted[1] === "sodio") return ["sodio", "gordura"];
  return sorted;
}

export function lupaAutoLayout(n: number): LupaLayout {
  return n >= 3 ? "bloco" : "linha";
}

type Cell = [number, number]; // [coluna, linha]

function cellsFor(n: number, layout: LupaLayout): Cell[] {
  const out: Cell[] = [];
  for (let i = 0; i < n; i++) {
    if (layout === "linha") out.push([i + 1, 0]);
    else if (layout === "coluna") out.push([0, i + 1]);
    else {
      // bloco compacto (2 colunas): ALTO EM + 1º nutriente em cima, demais embaixo
      if (i === 0) out.push([1, 0]);
      else if (i === 1) out.push([0, 1]);
      else out.push([1, 1]);
    }
  }
  return out;
}

function colX(c: number) {
  return M + c * (BOX_W + GAP_X);
}
function rowY(r: number) {
  return M + r * (BOX_H + GAP_Y);
}

function fmt(n: number) {
  return String(Math.round(n * 100) / 100);
}

// Polígono (sentido horário na tela) da união das células ocupadas, já recuado
// meia borda para dentro, e com cantos arredondados no eixo do traço.
function borderPath(cells: Cell[], cols: number, rows: number, W: number, H: number): string {
  const bx = (c: number) => (c === 0 ? 0 : colX(c) - GAP_X / 2);
  const by = (r: number) => (r === 0 ? 0 : rowY(r) - GAP_Y / 2);
  const X = (c: number) => (c >= cols ? W : bx(c));
  const Y = (r: number) => (r >= rows ? H : by(r));
  const key = (c: number, r: number) => `${c},${r}`;
  const occ = new Set(cells.map(([c, r]) => key(c, r)));

  type Pt = [number, number];
  const edges: [Pt, Pt][] = [];
  for (const [c, r] of cells) {
    const x0 = X(c), x1 = X(c + 1), y0 = Y(r), y1 = Y(r + 1);
    if (!occ.has(key(c, r - 1))) edges.push([[x0, y0], [x1, y0]]);
    if (!occ.has(key(c + 1, r))) edges.push([[x1, y0], [x1, y1]]);
    if (!occ.has(key(c, r + 1))) edges.push([[x1, y1], [x0, y1]]);
    if (!occ.has(key(c - 1, r))) edges.push([[x0, y1], [x0, y0]]);
  }
  // Encadeia as arestas num único laço.
  const same = (a: Pt, b: Pt) => Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01;
  const loop: Pt[] = [];
  let cur = edges.shift()!;
  loop.push(cur[0]);
  while (edges.length) {
    const i = edges.findIndex((e) => same(e[0], cur[1]));
    if (i < 0) break;
    cur = edges.splice(i, 1)[0];
    loop.push(cur[0]);
  }
  // Remove pontos colineares.
  const pts: Pt[] = [];
  for (let i = 0; i < loop.length; i++) {
    const p = loop[(i - 1 + loop.length) % loop.length], v = loop[i], n = loop[(i + 1) % loop.length];
    const collinear = (p[0] === v[0] && v[0] === n[0]) || (p[1] === v[1] && v[1] === n[1]);
    if (!collinear) pts.push(v);
  }
  // Recuo de meia borda e arredondamento.
  const s = STROKE / 2;
  let d = "";
  const N = pts.length;
  const inset: Pt[] = pts.map((v, i) => {
    const p = pts[(i - 1 + N) % N], n = pts[(i + 1) % N];
    const d1: Pt = [Math.sign(v[0] - p[0]), Math.sign(v[1] - p[1])];
    const d2: Pt = [Math.sign(n[0] - v[0]), Math.sign(n[1] - v[1])];
    // normal para dentro (laço horário em coordenadas de tela): (-dy, dx)
    const n1: Pt = [-d1[1], d1[0]], n2: Pt = [-d2[1], d2[0]];
    return [v[0] + s * (n1[0] + n2[0]), v[1] + s * (n1[1] + n2[1])];
  });
  for (let i = 0; i < N; i++) {
    const p = inset[(i - 1 + N) % N], v = inset[i], n = inset[(i + 1) % N];
    const d1: Pt = [Math.sign(v[0] - p[0]), Math.sign(v[1] - p[1])];
    const d2: Pt = [Math.sign(n[0] - v[0]), Math.sign(n[1] - v[1])];
    const cross = d1[0] * d2[1] - d1[1] * d2[0];
    const convex = cross > 0; // virada à direita = canto convexo (laço horário)
    const R = convex ? R_CONVEX : R_CONCAVE;
    const a: Pt = [v[0] - d1[0] * R, v[1] - d1[1] * R];
    const b: Pt = [v[0] + d2[0] * R, v[1] + d2[1] * R];
    d += (i === 0 ? "M" : "L") + fmt(a[0]) + "," + fmt(a[1]);
    d += `A${fmt(R)},${fmt(R)} 0 0 ${convex ? 1 : 0} ${fmt(b[0])},${fmt(b[1])}`;
  }
  return d + "Z";
}

export interface LupaArt {
  inner: string; // conteúdo do <svg> (sem a tag)
  w: number; // largura do viewBox
  h: number; // altura do viewBox
  blocks: number; // nº de blocos informativos (ALTO EM + nutrientes)
  layout: LupaLayout;
  kinds: LupaKind[];
}

export function lupaArt(kindsIn: LupaKind[], layoutIn?: LupaLayout | "auto" | null): LupaArt {
  const kinds = lupaOrder(kindsIn.length ? kindsIn : ["acucar"]);
  const layout: LupaLayout = !layoutIn || layoutIn === "auto" ? lupaAutoLayout(kinds.length) : layoutIn;
  const cells = cellsFor(kinds.length, layout);
  const all: Cell[] = [[0, 0], ...cells];
  const cols = Math.max(...all.map((c) => c[0])) + 1;
  const rows = Math.max(...all.map((c) => c[1])) + 1;
  const W = M + cols * BOX_W + (cols - 1) * GAP_X + M_END;
  const H = M + rows * BOX_H + (rows - 1) * GAP_Y + M;
  let inner = `<path d="${borderPath(all, cols, rows, W, H)}" fill="#fff" stroke="#000" stroke-width="${STROKE}"/>`;
  inner += `<g fill="#000">${ALTO_EM_INNER}</g>`;
  kinds.forEach((k, i) => {
    const [c, r] = cells[i];
    inner += `<g transform="translate(${fmt(colX(c))},${fmt(rowY(r))})"><path d="${BOX_PATH}" fill="#000"/><g fill="#fff">${NUTRIENT_TEXT[k]}</g></g>`;
  });
  return { inner, w: W, h: H, blocks: kinds.length + 1, layout, kinds };
}

// Proporção largura/altura da arte (para dimensionar o elemento no rótulo).
export function lupaAspect(kinds: LupaKind[], layout?: LupaLayout | "auto" | null): number {
  const a = lupaArt(kinds, layout);
  return a.w / a.h;
}

// SVG completo como string (landing, exportações). `widthMm` opcional define
// width/height em mm; sem ele o SVG escala pelo contêiner.
export function lupaSvgString(kinds: LupaKind[], layout?: LupaLayout | "auto" | null, widthMm?: number): string {
  const a = lupaArt(kinds, layout);
  const size = widthMm ? ` width="${fmt(widthMm)}mm" height="${fmt(widthMm / (a.w / a.h))}mm"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(a.w)} ${fmt(a.h)}"${size} role="img" aria-label="Alto em ${a.kinds
    .map((k) => ({ acucar: "açúcar adicionado", gordura: "gordura saturada", sodio: "sódio" })[k])
    .join(", ")}">${a.inner}</svg>`;
}

// Tamanho da lupa em mm conforme o Anexo XVIII da IN 75/2020:
//   painel principal de 35 a 100 cm²: 2 blocos 3,5% · 3 blocos 5,25% · 4 blocos 7%
//   painel acima de 100 cm²:          2 blocos 2%   · 3 blocos 3%    · 4 blocos 4%
// e fonte de "ALTO EM" limitada a 9 pt (≤100 cm²) ou entre 9 e 15 pt (>100 cm²).
export function lupaSizeMm(kinds: LupaKind[], layoutIn: LupaLayout | "auto" | null | undefined, panelWmm: number, panelHmm: number) {
  const calc = (layout: LupaLayout) => {
    const a = lupaArt(kinds, layout);
    const areaCm2 = (panelWmm * panelHmm) / 100;
    const big = areaCm2 > 100;
    const pct = (big ? [0.02, 0.03, 0.04] : [0.035, 0.0525, 0.07])[Math.min(3, a.blocks) - 2];
    const targetArea = areaCm2 * 100 * pct; // mm²
    const aspect = a.w / a.h;
    let w = Math.sqrt(targetArea * aspect);
    // Limites de corpo da fonte (altura da maiúscula ≈ 0,716 em; 1 pt = 0,3528 mm).
    const ptToW = (pt: number) => ((pt * 0.3528 * 0.716) / Y_UNITS) * a.w;
    const maxW = ptToW(15), minW = ptToW(9);
    if (big) w = Math.min(Math.max(w, minW), maxW);
    else w = Math.min(w, ptToW(9));
    // Nunca mais largo que 90% do painel.
    w = Math.min(w, panelWmm * 0.9);
    return { w, h: w / aspect, pct, aspect, layout };
  };
  if (layoutIn && layoutIn !== "auto") return calc(layoutIn);
  // Automático: em linha; se a linha tomar mais de 60% da largura do painel,
  // usa o bloco compacto (2 colunas), também previsto no Anexo XVII.
  const linha = calc(lupaAutoLayout(kinds.length));
  if (linha.layout === "linha" && kinds.length >= 2 && linha.w > panelWmm * 0.6) return calc("bloco");
  return linha;
}
