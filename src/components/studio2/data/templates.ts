// TEMPLATES de design (porte verbatim do editor original). Cada template define
// vetor de estilo, paleta, fontes e funções layoutFront/layoutBack.

import type { Ctx, Fonts, Palette } from "../generate/primitives";
import { fs, buildBackParagraphs, buildSelosBack } from "../generate/primitives";

export interface Template {
  id: string;
  name: string;
  style: Record<string, number>;
  palette: Palette;
  fonts: Fonts;
  layoutFront: (ctx: Ctx) => void;
  layoutBack: (ctx: Ctx) => void;
}

export const TEMPLATES: Template[] = [
  // TEMPLATE 1 — BOTANICAL EDITORIAL
  {
    id: "botanical",
    name: "Botanical Editorial",
    style: { formal: 0.7, denso: 0.5, quente: 0.7, retro: 0.4, ornamental: 0.7, feminino: 0.5, luxo: 0.7, vibrante: 0.3, natural: 0.9, sofisticado: 0.8 },
    palette: { bg: "#f2ebd9", primary: "#1a3a2e", accent: "#b8923c", secondary: "#7a6a4d", text: "#2a2418" },
    fonts: { display: "Playfair Display", body: "Hanken Grotesk", accent: "Caveat", label: "Oswald" },
    layoutFront(ctx) {
      const { region: r, palette: p, fonts: f, state, add } = ctx;
      const f_ = state.frente, v = state.verso;
      const nome = (f_.nome || v.nome || "Nome do Produto").toUpperCase();
      const oque = (f_.oque || "").toUpperCase();
      add("rect", { name: "Fundo da frente", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      const m = Math.min(r.w, r.h) * 0.045;
      add("rect", { name: "Moldura decorativa", x: r.x + m, y: r.y + m, w: r.w - m * 2, h: r.h - m * 2, fill: "#00000000", stroke: p.primary, sw: 0.4, radius: 1 });
      add("rect", { name: "Moldura decorativa interna", x: r.x + m + 1, y: r.y + m + 1, w: r.w - m * 2 - 2, h: r.h - m * 2 - 2, fill: "#00000000", stroke: p.primary, sw: 0.15, radius: 1 });
      const padX = r.w * 0.1;
      const ctr = r.x + r.w / 2;
      add("text", { name: "Etiqueta superior", x: r.x + padX, y: r.y + r.h * 0.1, w: r.w - padX * 2, h: r.h * 0.04, text: "— EST. " + new Date().getFullYear() + " —", font: f.label, size: fs(6.5, 60, Math.min(r.w, r.h) * 1.2), weight: 500, italic: false, color: p.accent, align: "center", lh: 1, ls: 4 });
      if (f_.logo) {
        const lw = Math.min(r.w * 0.28, r.h * 0.18);
        add("image", { name: "Logo da marca", x: ctr - lw / 2, y: r.y + r.h * 0.15, w: lw, h: lw * 0.55, src: f_.logo });
      } else {
        add("text", { name: "Logo da marca (texto)", x: r.x + padX, y: r.y + r.h * 0.16, w: r.w - padX * 2, h: r.h * 0.06, text: "SUA MARCA", font: f.display, size: fs(11, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.primary, align: "center", lh: 1, ls: 2 });
      }
      const ornY = r.y + r.h * 0.32;
      add("line", { name: "Ornamento esquerdo", x: r.x + padX, y: ornY, w: (r.w - padX * 2) * 0.35, h: 0.1, stroke: p.accent, sw: 0.35 });
      add("text", { name: "Ornamento central", x: ctr - r.w * 0.06, y: ornY - r.h * 0.018, w: r.w * 0.12, h: r.h * 0.035, text: "✦", font: f.display, size: fs(7, 60, Math.min(r.w, r.h) * 1.2), weight: 400, italic: false, color: p.accent, align: "center", lh: 1, ls: 0 });
      add("line", { name: "Ornamento direito", x: r.x + r.w - padX - (r.w - padX * 2) * 0.35, y: ornY, w: (r.w - padX * 2) * 0.35, h: 0.1, stroke: p.accent, sw: 0.35 });
      add("text", { name: "Nome do produto", x: r.x + padX * 0.6, y: r.y + r.h * 0.36, w: r.w - padX * 1.2, h: r.h * 0.28, text: nome, font: f.display, size: fs(22, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.primary, align: "center", lh: 1.02, ls: -0.5 });
      if (oque) add("text", { name: "Categoria do produto", x: r.x + padX, y: r.y + r.h * 0.66, w: r.w - padX * 2, h: r.h * 0.04, text: oque, font: f.label, size: fs(6.5, 60, Math.min(r.w, r.h) * 1.2), weight: 500, italic: false, color: p.secondary, align: "center", lh: 1, ls: 5 });
      if (f_.ativos) add("text", { name: "Ativos em destaque", x: r.x + padX, y: r.y + r.h * 0.74, w: r.w - padX * 2, h: r.h * 0.06, text: "com " + f_.ativos, font: f.body, size: fs(5, 60, Math.min(r.w, r.h) * 1.2), weight: 400, italic: true, color: p.text, align: "center", lh: 1.3, ls: 0 });
      if (f_.volume) add("text", { name: "Volumagem", x: r.x + padX, y: r.y + r.h * 0.91, w: r.w - padX * 2, h: r.h * 0.04, text: f_.volume, font: f.label, size: fs(7, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.primary, align: "center", lh: 1, ls: 2 });
    },
    layoutBack(ctx) {
      const { region: r, palette: p, add } = ctx;
      add("rect", { name: "Fundo do verso", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      buildBackParagraphs(ctx);
      buildSelosBack(ctx);
    },
  },

  // TEMPLATE 2 — STUDIO MINIMAL
  {
    id: "minimal",
    name: "Studio Minimal",
    style: { formal: 0.6, denso: 0.2, quente: 0.4, retro: 0.1, ornamental: 0.1, feminino: 0.4, luxo: 0.6, vibrante: 0.4, natural: 0.3, sofisticado: 0.8 },
    palette: { bg: "#faf6f0", primary: "#0e0e10", accent: "#e0512a", secondary: "#787876", text: "#1a1a1c" },
    fonts: { display: "Bricolage Grotesque", body: "Hanken Grotesk", accent: "Hanken Grotesk", label: "Hanken Grotesk" },
    layoutFront(ctx) {
      const { region: r, palette: p, fonts: f, state, add } = ctx;
      const f_ = state.frente, v = state.verso;
      const nome = f_.nome || v.nome || "Nome do Produto";
      const oque = f_.oque || "";
      add("rect", { name: "Fundo da frente", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      const bandW = r.w * 0.06;
      add("rect", { name: "Faixa lateral accent", x: r.x, y: r.y, w: bandW, h: r.h, fill: p.accent, stroke: "#00000000", sw: 0, radius: 0 });
      const padL = bandW + r.w * 0.08;
      const padR = r.w * 0.08;
      const colW = r.w - padL - padR;
      add("text", { name: "Index numérico", x: r.x + padL, y: r.y + r.h * 0.08, w: colW * 0.4, h: r.h * 0.025, text: "Nº 001 / FÓRMULA", font: f.body, size: fs(5, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.primary, align: "left", lh: 1, ls: 2 });
      add("line", { name: "Divisória superior", x: r.x + padL, y: r.y + r.h * 0.13, w: colW, h: 0.1, stroke: p.primary, sw: 0.3 });
      let nomeStartY = r.y + r.h * 0.18;
      if (f_.logo) {
        const lw = colW * 0.35;
        add("image", { name: "Logo da marca", x: r.x + padL, y: r.y + r.h * 0.16, w: lw, h: lw * 0.45, src: f_.logo });
        nomeStartY = r.y + r.h * (0.16 + 0.45 * (lw / r.h)) + r.h * 0.04;
      }
      add("text", { name: "Nome do produto", x: r.x + padL, y: nomeStartY, w: colW, h: r.h * 0.36, text: nome, font: f.display, size: fs(26, 60, Math.min(r.w, r.h) * 1.2), weight: 800, italic: false, color: p.primary, align: "left", lh: 0.92, ls: -1 });
      if (oque) {
        add("rect", { name: "Badge categoria", x: r.x + padL, y: r.y + r.h * 0.66, w: colW * 0.5, h: r.h * 0.05, fill: p.primary, stroke: "#00000000", sw: 0, radius: 0.5 });
        add("text", { name: "Categoria do produto", x: r.x + padL, y: r.y + r.h * 0.675, w: colW * 0.5, h: r.h * 0.03, text: oque.toUpperCase(), font: f.label, size: fs(5, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.bg, align: "center", lh: 1, ls: 2.5 });
      }
      if (f_.ativos) {
        add("text", { name: "Rótulo ativos", x: r.x + padL, y: r.y + r.h * 0.76, w: colW * 0.4, h: r.h * 0.025, text: "ATIVOS", font: f.label, size: fs(4.5, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.secondary, align: "left", lh: 1, ls: 2 });
        add("text", { name: "Ativos em destaque", x: r.x + padL, y: r.y + r.h * 0.79, w: colW, h: r.h * 0.07, text: f_.ativos, font: f.body, size: fs(6, 60, Math.min(r.w, r.h) * 1.2), weight: 600, italic: false, color: p.primary, align: "left", lh: 1.25, ls: 0 });
      }
      if (f_.volume) add("text", { name: "Volumagem", x: r.x + r.w - padR - colW * 0.45, y: r.y + r.h * 0.9, w: colW * 0.45, h: r.h * 0.06, text: f_.volume, font: f.display, size: fs(13, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.accent, align: "right", lh: 1, ls: -0.5 });
      add("line", { name: "Divisória inferior", x: r.x + padL, y: r.y + r.h * 0.97, w: colW, h: 0.1, stroke: p.primary, sw: 0.3 });
    },
    layoutBack(ctx) {
      const { region: r, palette: p, add } = ctx;
      add("rect", { name: "Fundo do verso", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      add("rect", { name: "Faixa superior do verso", x: r.x, y: r.y, w: r.w, h: r.h * 0.025, fill: p.accent, stroke: "#00000000", sw: 0, radius: 0 });
      buildBackParagraphs(ctx);
      buildSelosBack(ctx);
    },
  },

  // TEMPLATE 3 — APOTHECARY VINTAGE
  {
    id: "apothecary",
    name: "Apothecary Vintage",
    style: { formal: 0.8, denso: 0.6, quente: 0.8, retro: 0.95, ornamental: 0.85, feminino: 0.4, luxo: 0.7, vibrante: 0.3, natural: 0.7, sofisticado: 0.8 },
    palette: { bg: "#f4ead4", primary: "#3a2818", accent: "#b25c34", secondary: "#7a5a3a", text: "#3a2818" },
    fonts: { display: "Fraunces", body: "Libre Baskerville", accent: "Cormorant Garamond", label: "Oswald" },
    layoutFront(ctx) {
      const { region: r, palette: p, fonts: f, state, add } = ctx;
      const f_ = state.frente, v = state.verso;
      const nome = (f_.nome || v.nome || "Nome do Produto").toUpperCase();
      const oque = f_.oque || "";
      const ctr = r.x + r.w / 2;
      add("rect", { name: "Fundo da frente", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      const m1 = Math.min(r.w, r.h) * 0.035;
      const m2 = m1 + Math.min(r.w, r.h) * 0.012;
      add("rect", { name: "Moldura externa", x: r.x + m1, y: r.y + m1, w: r.w - m1 * 2, h: r.h - m1 * 2, fill: "#00000000", stroke: p.primary, sw: 0.5, radius: 0 });
      add("rect", { name: "Moldura interna", x: r.x + m2, y: r.y + m2, w: r.w - m2 * 2, h: r.h - m2 * 2, fill: "#00000000", stroke: p.primary, sw: 0.2, radius: 0 });
      const padX = r.w * 0.12;
      add("text", { name: "Ornamento superior", x: r.x + padX, y: r.y + r.h * 0.09, w: r.w - padX * 2, h: r.h * 0.04, text: "⊰  ✦  ⊱", font: f.display, size: fs(8, 60, Math.min(r.w, r.h) * 1.2), weight: 400, italic: false, color: p.accent, align: "center", lh: 1, ls: 4 });
      if (f_.logo) {
        const lw = Math.min(r.w * 0.32, r.h * 0.16);
        add("image", { name: "Logo da marca", x: ctr - lw / 2, y: r.y + r.h * 0.15, w: lw, h: lw * 0.5, src: f_.logo });
      } else {
        add("text", { name: "Logo da marca (texto)", x: r.x + padX, y: r.y + r.h * 0.16, w: r.w - padX * 2, h: r.h * 0.05, text: "SUA MARCA", font: f.accent, size: fs(10, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: true, color: p.primary, align: "center", lh: 1, ls: 1 });
      }
      add("text", { name: "Numeração", x: r.x + padX, y: r.y + r.h * 0.28, w: r.w - padX * 2, h: r.h * 0.03, text: "— Nº 001 —", font: f.label, size: fs(5, 60, Math.min(r.w, r.h) * 1.2), weight: 400, italic: false, color: p.secondary, align: "center", lh: 1, ls: 3 });
      add("text", { name: "Nome do produto", x: r.x + padX * 0.5, y: r.y + r.h * 0.34, w: r.w - padX, h: r.h * 0.28, text: nome, font: f.display, size: fs(20, 60, Math.min(r.w, r.h) * 1.2), weight: 600, italic: false, color: p.primary, align: "center", lh: 1.05, ls: -0.3 });
      add("text", { name: "Ornamento central", x: r.x + padX, y: r.y + r.h * 0.63, w: r.w - padX * 2, h: r.h * 0.03, text: "❦", font: f.display, size: fs(8, 60, Math.min(r.w, r.h) * 1.2), weight: 400, italic: false, color: p.accent, align: "center", lh: 1, ls: 0 });
      if (oque) add("text", { name: "Categoria do produto", x: r.x + padX, y: r.y + r.h * 0.69, w: r.w - padX * 2, h: r.h * 0.04, text: oque.toUpperCase(), font: f.label, size: fs(6, 60, Math.min(r.w, r.h) * 1.2), weight: 500, italic: false, color: p.secondary, align: "center", lh: 1, ls: 5 });
      if (f_.ativos) add("text", { name: "Ativos em destaque", x: r.x + padX, y: r.y + r.h * 0.75, w: r.w - padX * 2, h: r.h * 0.06, text: "— com " + f_.ativos + " —", font: f.accent, size: fs(5.5, 60, Math.min(r.w, r.h) * 1.2), weight: 500, italic: true, color: p.text, align: "center", lh: 1.3, ls: 0 });
      if (f_.volume) {
        const vbW = r.w * 0.32, vbH = r.h * 0.06;
        add("rect", { name: "Moldura volumagem", x: ctr - vbW / 2, y: r.y + r.h * 0.86, w: vbW, h: vbH, fill: "#00000000", stroke: p.primary, sw: 0.3, radius: 0 });
        add("text", { name: "Volumagem", x: ctr - vbW / 2, y: r.y + r.h * 0.873, w: vbW, h: vbH * 0.7, text: f_.volume, font: f.label, size: fs(7, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.primary, align: "center", lh: 1, ls: 2 });
      }
    },
    layoutBack(ctx) {
      const { region: r, palette: p, add } = ctx;
      add("rect", { name: "Fundo do verso", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      const m1 = Math.min(r.w, r.h) * 0.035;
      add("rect", { name: "Moldura do verso", x: r.x + m1, y: r.y + m1, w: r.w - m1 * 2, h: r.h - m1 * 2, fill: "#00000000", stroke: p.primary, sw: 0.3, radius: 0 });
      buildBackParagraphs(ctx);
      buildSelosBack(ctx);
    },
  },

  // TEMPLATE 4 — BOLD MODERN
  {
    id: "bold",
    name: "Bold Modern",
    style: { formal: 0.3, denso: 0.4, quente: 0.6, retro: 0.2, ornamental: 0.1, feminino: 0.3, luxo: 0.3, vibrante: 0.9, natural: 0.3, sofisticado: 0.5 },
    palette: { bg: "#fff5e8", primary: "#1a1a1a", accent: "#ff5722", secondary: "#0d2438", text: "#1a1a1a" },
    fonts: { display: "Archivo Black", body: "Hanken Grotesk", accent: "Bricolage Grotesque", label: "Archivo" },
    layoutFront(ctx) {
      const { region: r, palette: p, fonts: f, state, add } = ctx;
      const f_ = state.frente, v = state.verso;
      const nome = (f_.nome || v.nome || "Nome do Produto").toUpperCase();
      const oque = (f_.oque || "").toUpperCase();
      const ctr = r.x + r.w / 2;
      add("rect", { name: "Fundo da frente", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      add("rect", { name: "Bloco de cor superior", x: r.x, y: r.y, w: r.w, h: r.h * 0.4, fill: p.accent, stroke: "#00000000", sw: 0, radius: 0 });
      if (f_.logo) {
        const lw = Math.min(r.w * 0.32, r.h * 0.12);
        add("image", { name: "Logo da marca", x: ctr - lw / 2, y: r.y + r.h * 0.05, w: lw, h: lw * 0.4, src: f_.logo });
      } else {
        add("text", { name: "Logo da marca (texto)", x: r.x + r.w * 0.08, y: r.y + r.h * 0.06, w: r.w * 0.84, h: r.h * 0.05, text: "SUA MARCA", font: f.label, size: fs(8, 60, Math.min(r.w, r.h) * 1.2), weight: 800, italic: false, color: p.bg, align: "center", lh: 1, ls: 3 });
      }
      add("text", { name: "Nome do produto", x: r.x + r.w * 0.06, y: r.y + r.h * 0.15, w: r.w * 0.88, h: r.h * 0.25, text: nome, font: f.display, size: fs(36, 60, Math.min(r.w, r.h) * 1.2), weight: 900, italic: false, color: p.bg, align: "center", lh: 0.88, ls: -2 });
      if (oque) {
        add("text", { name: "Categoria do produto", x: r.x + r.w * 0.06, y: r.y + r.h * 0.45, w: r.w * 0.88, h: r.h * 0.05, text: oque, font: f.label, size: fs(9, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.primary, align: "center", lh: 1, ls: 3 });
        add("line", { name: "Sublinhado da categoria", x: ctr - r.w * 0.06, y: r.y + r.h * 0.51, w: r.w * 0.12, h: 0.1, stroke: p.accent, sw: 0.8 });
      }
      if (f_.ativos) add("text", { name: "Ativos em destaque", x: r.x + r.w * 0.1, y: r.y + r.h * 0.56, w: r.w * 0.8, h: r.h * 0.1, text: f_.ativos, font: f.body, size: fs(7, 60, Math.min(r.w, r.h) * 1.2), weight: 600, italic: false, color: p.primary, align: "center", lh: 1.3, ls: 0 });
      if (f_.volume) {
        const cs = r.w * 0.25;
        add("ellipse", { name: "Círculo da volumagem", x: ctr - cs / 2, y: r.y + r.h * 0.72, w: cs, h: cs, fill: p.accent, stroke: "#00000000", sw: 0 });
        add("text", { name: "Volumagem", x: ctr - cs / 2, y: r.y + r.h * 0.72 + cs * 0.36, w: cs, h: cs * 0.3, text: f_.volume, font: f.display, size: fs(11, 60, Math.min(r.w, r.h) * 1.2), weight: 900, italic: false, color: p.bg, align: "center", lh: 1, ls: 0 });
      }
    },
    layoutBack(ctx) {
      const { region: r, palette: p, add } = ctx;
      add("rect", { name: "Fundo do verso", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      add("rect", { name: "Faixa accent superior", x: r.x, y: r.y, w: r.w, h: r.h * 0.04, fill: p.accent, stroke: "#00000000", sw: 0, radius: 0 });
      buildBackParagraphs(ctx);
      buildSelosBack(ctx);
    },
  },

  // TEMPLATE 5 — FEMININE DELICATE
  {
    id: "feminine",
    name: "Feminine Delicate",
    style: { formal: 0.5, denso: 0.3, quente: 0.6, retro: 0.4, ornamental: 0.6, feminino: 0.95, luxo: 0.7, vibrante: 0.3, natural: 0.6, sofisticado: 0.8 },
    palette: { bg: "#fdf2ee", primary: "#5a3142", accent: "#d68aa4", secondary: "#a87889", text: "#3a2230" },
    fonts: { display: "Cormorant Garamond", body: "Hanken Grotesk", accent: "Caveat", label: "Hanken Grotesk" },
    layoutFront(ctx) {
      const { region: r, palette: p, fonts: f, state, add } = ctx;
      const f_ = state.frente, v = state.verso;
      const nome = f_.nome || v.nome || "Nome do Produto";
      const oque = f_.oque || "";
      const ctr = r.x + r.w / 2;
      add("rect", { name: "Fundo da frente", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      const decoR = Math.min(r.w, r.h) * 0.65;
      add("ellipse", { name: "Círculo decorativo", x: ctr - decoR / 2, y: r.y - decoR * 0.2, w: decoR, h: decoR, fill: "#00000000", stroke: p.accent, sw: 0.3, opacity: 60 });
      if (f_.logo) {
        const lw = Math.min(r.w * 0.3, r.h * 0.16);
        add("image", { name: "Logo da marca", x: ctr - lw / 2, y: r.y + r.h * 0.12, w: lw, h: lw * 0.5, src: f_.logo });
      } else {
        add("text", { name: "Logo da marca (texto)", x: r.x + r.w * 0.1, y: r.y + r.h * 0.13, w: r.w * 0.8, h: r.h * 0.05, text: "sua marca", font: f.accent, size: fs(12, 60, Math.min(r.w, r.h) * 1.2), weight: 700, italic: false, color: p.accent, align: "center", lh: 1, ls: 0 });
      }
      add("text", { name: "Ornamento superior", x: r.x + r.w * 0.3, y: r.y + r.h * 0.27, w: r.w * 0.4, h: r.h * 0.04, text: "· · ✿ · ·", font: f.display, size: fs(7, 60, Math.min(r.w, r.h) * 1.2), weight: 400, italic: false, color: p.accent, align: "center", lh: 1, ls: 2 });
      add("text", { name: "Nome do produto", x: r.x + r.w * 0.05, y: r.y + r.h * 0.34, w: r.w * 0.9, h: r.h * 0.3, text: nome, font: f.display, size: fs(22, 60, Math.min(r.w, r.h) * 1.2), weight: 500, italic: true, color: p.primary, align: "center", lh: 1.05, ls: -0.3 });
      if (oque) add("text", { name: "Categoria do produto", x: r.x + r.w * 0.1, y: r.y + r.h * 0.65, w: r.w * 0.8, h: r.h * 0.06, text: oque.toLowerCase(), font: f.accent, size: fs(11, 60, Math.min(r.w, r.h) * 1.2), weight: 500, italic: false, color: p.secondary, align: "center", lh: 1, ls: 0 });
      if (f_.ativos) add("text", { name: "Ativos em destaque", x: r.x + r.w * 0.1, y: r.y + r.h * 0.74, w: r.w * 0.8, h: r.h * 0.08, text: "com " + f_.ativos, font: f.body, size: fs(5.5, 60, Math.min(r.w, r.h) * 1.2), weight: 400, italic: true, color: p.text, align: "center", lh: 1.3, ls: 0 });
      if (f_.volume) add("text", { name: "Volumagem", x: r.x + r.w * 0.3, y: r.y + r.h * 0.88, w: r.w * 0.4, h: r.h * 0.04, text: f_.volume, font: f.label, size: fs(6, 60, Math.min(r.w, r.h) * 1.2), weight: 600, italic: false, color: p.secondary, align: "center", lh: 1, ls: 2 });
    },
    layoutBack(ctx) {
      const { region: r, palette: p, add } = ctx;
      add("rect", { name: "Fundo do verso", x: r.x, y: r.y, w: r.w, h: r.h, fill: p.bg, stroke: "#00000000", sw: 0, radius: 0 });
      buildBackParagraphs(ctx);
      buildSelosBack(ctx);
    },
  },
];
