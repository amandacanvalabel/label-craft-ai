// Orquestrador do motor de geração (porte de generateLabel / generateVariations
// / buildVariation / applyVariation / renderMiniLabel). Funções puras: recebem
// o StudioState e devolvem dados (sem mutar global). O store aplica o resultado.

import type { EditorState, El, ElementType, StudioState, Variation } from "../types";
import { TEMPLATES } from "../data/templates";
import {
  type Ctx,
  type Palette,
  type Region,
  type UidRef,
  fs,
  getFaceConfig,
  mkEl,
} from "./primitives";
import { makeVector, mergeVectors, parsePrompt, vectorDistance, type StyleVec } from "./style";
import { applyColorsToPalette, paletteToRoles, visualAnalysisToVector } from "./analyze";

export interface GenerateOptions {
  templateId?: string;
  paletteOverride?: Palette | null;
}

// Constrói o editor (label + faces) a partir do state + opções. Retorna o
// patch a ser aplicado em state.editor.
export function generateLabel(state: StudioState, opts: GenerateOptions = {}): Partial<EditorState> {
  const W = Math.max(30, state.rotulo.w || 70);
  const H = Math.max(30, state.rotulo.h || 90);
  const faceCfg = getFaceConfig(state.rotulo);

  const bleed = W < 60 || H < 60 ? 3 : 5;
  const safe = W < 60 || H < 60 ? 4 : 5;

  const tplId = opts.templateId || state.editor.templateId || TEMPLATES[0].id;
  const baseTpl = TEMPLATES.find((t) => t.id === tplId) || TEMPLATES[0];
  const paletteOverride = opts.paletteOverride || null;
  const palette = paletteOverride || baseTpl.palette;
  const tpl = { ...baseTpl, palette };

  const faces: Record<string, El[]> = {};
  faceCfg.faces.forEach((f) => (faces[f.id] = []));

  const uid: UidRef = { v: 1 };

  const buildFace = (
    faceId: string,
    region: Region,
    options: { front?: boolean; back?: boolean; foldAt?: number | null },
  ) => {
    const arr = faces[faceId];
    const ctx: Ctx = {
      W,
      H,
      region,
      palette: tpl.palette,
      fonts: tpl.fonts,
      state,
      options,
      add: (type: ElementType, props: Partial<El>) => arr.push(mkEl(uid, type, props)),
    };
    if (options.front) tpl.layoutFront(ctx);
    if (options.back) tpl.layoutBack(ctx);
    if (options.foldAt != null) {
      arr.push(
        mkEl(uid, "line", {
          name: "Linha de dobra (frente/verso)",
          x: options.foldAt,
          y: 0,
          w: 0.1,
          h: H,
          stroke: "#cccccc",
          sw: 0.2,
          opacity: 50,
          locked: true,
        }),
      );
    }
  };

  if (faceCfg.kind === "unified") {
    const half = W / 2;
    buildFace("unico", { x: 0, y: 0, w: half, h: H }, { front: true, foldAt: half });
    buildFace("unico", { x: half, y: 0, w: half, h: H }, { back: true });
  } else if (faceCfg.kind === "front") {
    buildFace("frente", { x: 0, y: 0, w: W, h: H }, { front: true });
  } else if (faceCfg.kind === "back") {
    buildFace("verso", { x: 0, y: 0, w: W, h: H }, { back: true });
  } else if (faceCfg.kind === "dual") {
    buildFace("frente", { x: 0, y: 0, w: W, h: H }, { front: true });
    buildFace("verso", { x: 0, y: 0, w: W, h: H }, { back: true });
  }

  return {
    label: { w: W, h: H, bleed, safe, bg: tpl.palette.bg },
    faces,
    faceConfig: faceCfg,
    face: faceCfg.faces[0].id,
    sel: null,
    selSet: null,
    uid: uid.v,
    docname: state.frente.nome || state.verso.nome || "Rótulo",
    templateId: baseTpl.id,
    paletteOverride,
  };
}

function buildBriefingVector(state: StudioState): { vec: StyleVec; promptColors: string[] } {
  let vec = makeVector();
  const parsed = parsePrompt(state.ai.prompt);
  vec = mergeVectors(vec, parsed.vec, 1, 2);
  if (state.ai.analysis) {
    vec = mergeVectors(vec, visualAnalysisToVector(state.ai.analysis), 2, 1);
  }
  return { vec, promptColors: parsed.colors };
}

function buildVariation(tpl: (typeof TEMPLATES)[number], paletteEntry: { name: string; roles: Palette }): Variation {
  return {
    id: "v" + Math.random().toString(36).slice(2, 6),
    templateId: tpl.id,
    templateName: tpl.name,
    palette: paletteEntry.roles,
    paletteSource: paletteEntry.name,
  };
}

// Gera 4 variações combinando rank de templates (por distância do vetor) com paletas.
export function generateVariations(state: StudioState): { variations: Variation[]; briefingVector: StyleVec } {
  const { vec: brief, promptColors } = buildBriefingVector(state);

  const ranked = TEMPLATES.map((t) => ({ tpl: t, distance: vectorDistance(brief, t.style || makeVector()) })).sort(
    (a, b) => a.distance - b.distance,
  );

  const palettes: { name: string; roles: Palette }[] = [];
  const extractedRoles = state.ai.analysis ? paletteToRoles(state.ai.analysis.palette) : null;
  if (extractedRoles && promptColors.length) {
    palettes.push({ name: "Suas referências + cores do prompt", roles: applyColorsToPalette(extractedRoles, promptColors) });
  }
  if (extractedRoles) palettes.push({ name: "Das referências", roles: extractedRoles });
  if (promptColors.length) {
    const topTpl = ranked[0].tpl;
    palettes.push({ name: "Cores do seu prompt", roles: applyColorsToPalette({ ...topTpl.palette }, promptColors) });
  }
  TEMPLATES.forEach((t) => palettes.push({ name: t.name, roles: t.palette }));

  const variations: Variation[] = [];
  variations.push(buildVariation(ranked[0].tpl, palettes[0]));
  variations.push(buildVariation(ranked[0].tpl, { name: ranked[0].tpl.name, roles: ranked[0].tpl.palette }));
  const t2 = ranked[1] ? ranked[1].tpl : ranked[0].tpl;
  variations.push(buildVariation(t2, palettes[Math.min(1, palettes.length - 1)]));
  const t3 = ranked[2] ? ranked[2].tpl : ranked[1] ? ranked[1].tpl : ranked[0].tpl;
  variations.push(buildVariation(t3, palettes[Math.min(2, palettes.length - 1)]));

  return { variations, briefingVector: brief };
}

// Miniatura SVG simples de uma variação (string de markup para preview).
export function renderMiniLabel(state: StudioState, v: Variation): string {
  const p = v.palette;
  const tplId = v.templateId;
  const nome = (state.frente.nome || state.verso.nome || "PRODUTO").toUpperCase();
  const oque = (state.frente.oque || "").toUpperCase();
  const vol = state.frente.volume || "";
  const ativos = state.frente.ativos || "";

  if (tplId === "minimal") {
    return `<svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMid meet">
      <rect width="280" height="200" fill="${p.bg}"/>
      <rect x="0" y="0" width="14" height="200" fill="${p.accent}"/>
      <text x="32" y="24" font-family="Hanken Grotesk" font-size="9" font-weight="700" fill="${p.primary}" letter-spacing="2">Nº 001 / FÓRMULA</text>
      <line x1="32" y1="32" x2="248" y2="32" stroke="${p.primary}" stroke-width="0.8"/>
      <text x="32" y="85" font-family="Bricolage Grotesque" font-size="34" font-weight="800" fill="${p.primary}" letter-spacing="-1">${nome.slice(0, 14)}</text>
      ${oque ? `<rect x="32" y="100" width="100" height="16" fill="${p.primary}"/><text x="82" y="111" font-family="Hanken Grotesk" font-size="8" font-weight="700" fill="${p.bg}" text-anchor="middle" letter-spacing="2">${oque.slice(0, 18)}</text>` : ""}
      <text x="32" y="148" font-family="Hanken Grotesk" font-size="8" font-weight="700" fill="${p.secondary}" letter-spacing="2">ATIVOS</text>
      <text x="32" y="162" font-family="Hanken Grotesk" font-size="11" font-weight="600" fill="${p.primary}">${(ativos || "—").slice(0, 30)}</text>
      ${vol ? `<text x="248" y="180" font-family="Bricolage Grotesque" font-size="22" font-weight="700" fill="${p.accent}" text-anchor="end">${vol}</text>` : ""}
      <line x1="32" y1="190" x2="248" y2="190" stroke="${p.primary}" stroke-width="0.8"/>
    </svg>`;
  }
  if (tplId === "apothecary") {
    return `<svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMid meet">
      <rect width="280" height="200" fill="${p.bg}"/>
      <rect x="10" y="10" width="260" height="180" fill="none" stroke="${p.primary}" stroke-width="1"/>
      <rect x="14" y="14" width="252" height="172" fill="none" stroke="${p.primary}" stroke-width="0.4"/>
      <text x="140" y="34" font-family="Fraunces" font-size="11" font-weight="500" fill="${p.accent}" text-anchor="middle" letter-spacing="3">⊰  ✦  ⊱</text>
      <text x="140" y="56" font-family="Cormorant Garamond" font-size="14" font-style="italic" font-weight="700" fill="${p.primary}" text-anchor="middle" letter-spacing="1">SUA MARCA</text>
      <text x="140" y="72" font-family="Oswald" font-size="8" font-weight="400" fill="${p.secondary}" text-anchor="middle" letter-spacing="3">— Nº 001 —</text>
      <text x="140" y="108" font-family="Fraunces" font-size="26" font-weight="600" fill="${p.primary}" text-anchor="middle" letter-spacing="-0.5">${nome.slice(0, 14)}</text>
      <text x="140" y="128" font-family="Fraunces" font-size="13" fill="${p.accent}" text-anchor="middle">❦</text>
      ${oque ? `<text x="140" y="146" font-family="Oswald" font-size="9" font-weight="500" fill="${p.secondary}" text-anchor="middle" letter-spacing="4">${oque.slice(0, 20)}</text>` : ""}
      ${vol ? `<rect x="100" y="160" width="80" height="22" fill="none" stroke="${p.primary}" stroke-width="0.6"/><text x="140" y="175" font-family="Oswald" font-size="11" font-weight="700" fill="${p.primary}" text-anchor="middle" letter-spacing="2">${vol}</text>` : ""}
    </svg>`;
  }
  if (tplId === "bold") {
    return `<svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMid meet">
      <rect width="280" height="200" fill="${p.bg}"/>
      <rect x="0" y="0" width="280" height="80" fill="${p.accent}"/>
      <text x="140" y="20" font-family="Archivo" font-size="8" font-weight="800" fill="${p.bg}" text-anchor="middle" letter-spacing="3">SUA MARCA</text>
      <text x="140" y="60" font-family="Archivo Black" font-size="36" font-weight="900" fill="${p.bg}" text-anchor="middle" letter-spacing="-2">${nome.slice(0, 12)}</text>
      ${oque ? `<text x="140" y="105" font-family="Archivo" font-size="10" font-weight="700" fill="${p.primary}" text-anchor="middle" letter-spacing="3">${oque.slice(0, 16)}</text><line x1="120" y1="115" x2="160" y2="115" stroke="${p.accent}" stroke-width="1.5"/>` : ""}
      <text x="140" y="138" font-family="Hanken Grotesk" font-size="9" font-weight="600" fill="${p.primary}" text-anchor="middle">${ativos.slice(0, 32)}</text>
      ${vol ? `<circle cx="140" cy="170" r="22" fill="${p.accent}"/><text x="140" y="176" font-family="Archivo Black" font-size="11" font-weight="900" fill="${p.bg}" text-anchor="middle">${vol}</text>` : ""}
    </svg>`;
  }
  if (tplId === "feminine") {
    return `<svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMid meet">
      <rect width="280" height="200" fill="${p.bg}"/>
      <circle cx="140" cy="40" r="100" fill="none" stroke="${p.accent}" stroke-width="0.4" opacity="0.6"/>
      <text x="140" y="38" font-family="Caveat" font-size="14" font-weight="700" fill="${p.accent}" text-anchor="middle">sua marca</text>
      <text x="140" y="62" font-family="Cormorant Garamond" font-size="9" font-weight="400" fill="${p.accent}" text-anchor="middle" letter-spacing="2">· · ✿ · ·</text>
      <text x="140" y="105" font-family="Cormorant Garamond" font-size="26" font-style="italic" font-weight="500" fill="${p.primary}" text-anchor="middle" letter-spacing="-0.3">${nome.slice(0, 14)}</text>
      ${oque ? `<text x="140" y="132" font-family="Caveat" font-size="13" font-weight="500" fill="${p.secondary}" text-anchor="middle">${oque.toLowerCase().slice(0, 20)}</text>` : ""}
      <text x="140" y="155" font-family="Hanken Grotesk" font-size="7" font-style="italic" fill="${p.text}" text-anchor="middle">com ${(ativos || "ativos").slice(0, 32)}</text>
      ${vol ? `<text x="140" y="180" font-family="Hanken Grotesk" font-size="8" font-weight="600" fill="${p.secondary}" text-anchor="middle" letter-spacing="2">${vol}</text>` : ""}
    </svg>`;
  }
  // botanical (default)
  return `<svg viewBox="0 0 280 200" preserveAspectRatio="xMidYMid meet">
    <rect width="280" height="200" fill="${p.bg}"/>
    <rect x="10" y="10" width="260" height="180" fill="none" stroke="${p.primary}" stroke-width="0.8"/>
    <rect x="13" y="13" width="254" height="174" fill="none" stroke="${p.primary}" stroke-width="0.3"/>
    <text x="140" y="30" font-family="Oswald" font-size="8" font-weight="500" fill="${p.accent}" text-anchor="middle" letter-spacing="3">— EST. 2024 —</text>
    <text x="140" y="55" font-family="Bricolage Grotesque" font-size="14" font-weight="700" fill="${p.primary}" text-anchor="middle" letter-spacing="2">SUA MARCA</text>
    <line x1="50" y1="74" x2="115" y2="74" stroke="${p.accent}" stroke-width="0.6"/>
    <text x="140" y="80" font-family="Playfair Display" font-size="11" fill="${p.accent}" text-anchor="middle">✦</text>
    <line x1="165" y1="74" x2="230" y2="74" stroke="${p.accent}" stroke-width="0.6"/>
    <text x="140" y="115" font-family="Playfair Display" font-size="28" font-weight="700" fill="${p.primary}" text-anchor="middle" letter-spacing="-0.5">${nome.slice(0, 14)}</text>
    ${oque ? `<text x="140" y="138" font-family="Oswald" font-size="8" font-weight="500" fill="${p.secondary}" text-anchor="middle" letter-spacing="5">${oque.slice(0, 20)}</text>` : ""}
    <text x="140" y="158" font-family="Hanken Grotesk" font-size="8" font-style="italic" fill="${p.text}" text-anchor="middle">com ${(ativos || "ativos").slice(0, 30)}</text>
    ${vol ? `<text x="140" y="180" font-family="Oswald" font-size="11" font-weight="700" fill="${p.primary}" text-anchor="middle" letter-spacing="2">${vol}</text>` : ""}
  </svg>`;
}
