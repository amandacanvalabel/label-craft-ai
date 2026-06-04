// Análise visual das referências (porte do editor original).

import type { AnalysisResult } from "../types";
import type { Palette } from "./primitives";
import { adjustAxis, makeVector, type StyleVec } from "./style";

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  let h = 0;
  let s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

export function isWarmHue(h: number): boolean {
  return h <= 70 || h >= 320;
}

export async function analyzeReferences(srcs: string[]): Promise<AnalysisResult> {
  if (!srcs || !srcs.length) return { palette: [], warmth: 0.5, contrast: 0.5, saturation: 0.5, density: 0.5 };

  const buckets = new Map<number, number>();
  let pxCount = 0;
  let sumSat = 0;
  let sumLum = 0;
  let sumLum2 = 0;
  let warmPx = 0;
  let coolPx = 0;
  let edgeSum = 0;
  let edgeCount = 0;

  const reads = srcs.slice(0, 5).map(
    (src) =>
      new Promise<void>((res) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const SZ = 80;
          const c = document.createElement("canvas");
          c.width = SZ;
          c.height = SZ;
          try {
            const ctx = c.getContext("2d")!;
            ctx.drawImage(img, 0, 0, SZ, SZ);
            const data = ctx.getImageData(0, 0, SZ, SZ).data;
            const lums = new Float32Array(SZ * SZ);
            for (let y = 0; y < SZ; y++) {
              for (let x = 0; x < SZ; x++) {
                const i = (y * SZ + x) * 4;
                if (data[i + 3] < 200) {
                  lums[y * SZ + x] = -1;
                  continue;
                }
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const rb = r & 0xf8, gb = g & 0xf8, bb = b & 0xf8;
                const key = (rb << 16) | (gb << 8) | bb;
                buckets.set(key, (buckets.get(key) || 0) + 1);
                const [h, s, l] = rgbToHsl(r, g, b);
                if (s > 0.1) {
                  sumSat += s;
                  if (isWarmHue(h)) warmPx++;
                  else coolPx++;
                }
                sumLum += l;
                sumLum2 += l * l;
                lums[y * SZ + x] = l;
                pxCount++;
              }
            }
            for (let y = 1; y < SZ - 1; y++) {
              for (let x = 1; x < SZ - 1; x++) {
                const ix = y * SZ + x;
                const c0 = lums[ix];
                if (c0 < 0) continue;
                const right = lums[ix + 1];
                const below = lums[ix + SZ];
                if (right < 0 || below < 0) continue;
                edgeSum += Math.abs(right - c0) + Math.abs(below - c0);
                edgeCount++;
              }
            }
          } catch {
            /* tainted */
          }
          res();
        };
        img.onerror = () => res();
        img.src = src;
      }),
  );
  await Promise.all(reads);

  if (pxCount === 0) return { palette: [], warmth: 0.5, contrast: 0.5, saturation: 0.5, density: 0.5 };

  const sortedBuckets = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  const palette: string[] = [];
  const used: number[][] = [];
  for (const [key] of sortedBuckets) {
    const r = (key >> 16) & 0xff, g = (key >> 8) & 0xff, b = key & 0xff;
    const tooClose = used.some((u) => {
      const dr = u[0] - r, dg = u[1] - g, db = u[2] - b;
      return Math.sqrt(dr * dr + dg * dg + db * db) < 55;
    });
    if (tooClose) continue;
    const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
    palette.push(hex);
    used.push([r, g, b]);
    if (palette.length >= 6) break;
  }

  const meanLum = sumLum / pxCount;
  const variance = sumLum2 / pxCount - meanLum * meanLum;
  const contrast = Math.min(1, Math.sqrt(Math.max(0, variance)) * 3);
  const saturation = Math.min(1, (sumSat / pxCount) * 2);
  const warmth = warmPx + coolPx > 0 ? warmPx / (warmPx + coolPx) : 0.5;
  const density = edgeCount > 0 ? Math.min(1, (edgeSum / edgeCount) * 4) : 0.5;

  return { palette, warmth, contrast, saturation, density };
}

export function visualAnalysisToVector(analysis: AnalysisResult | null): StyleVec {
  const vec = makeVector();
  if (!analysis) return vec;
  adjustAxis(vec, "quente", ((analysis.warmth ?? 0.5) - 0.5) * 0.6);
  adjustAxis(vec, "vibrante", ((analysis.saturation ?? 0.5) - 0.5) * 0.8);
  adjustAxis(vec, "formal", ((analysis.contrast ?? 0.5) - 0.5) * 0.4);
  adjustAxis(vec, "denso", ((analysis.density ?? 0.5) - 0.5) * 0.7);
  adjustAxis(vec, "ornamental", ((analysis.density ?? 0.5) - 0.5) * 0.5);
  return vec;
}

export function paletteToRoles(palette: string[]): Palette | null {
  if (!palette || !palette.length) return null;
  const lum = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  const sorted = [...palette].sort((a, b) => lum(b) - lum(a));
  const bg = sorted[0] || "#f4ede4";
  const primary = sorted[sorted.length - 1] || "#1a1a1a";
  const accent = sorted[Math.floor(sorted.length / 2)] || "#b0883f";
  const secondary = sorted[Math.max(1, Math.floor(sorted.length * 0.7))] || accent;
  const text = lum(primary) > 0.4 ? "#1a1a1a" : primary;
  return { bg, primary, accent, secondary, text };
}

export function applyColorsToPalette(roles: Palette, colors: string[]): Palette {
  if (!colors || !colors.length || !roles) return roles;
  const out = { ...roles };
  out.accent = colors[0];
  if (colors[1]) out.secondary = colors[1];
  return out;
}
