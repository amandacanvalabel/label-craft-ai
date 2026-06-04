// Árvore de materiais de impressão + helpers (porte do editor original).

import type { MaterialState } from "../types";

export interface MatVariant {
  name: string;
  desc: string;
  subvariants?: Record<string, { name: string; desc: string }>;
}
export interface MatFamily {
  name: string;
  desc: string;
  icon: string;
  variants: Record<string, MatVariant>;
}

export const MATERIAIS_TREE: Record<string, MatFamily> = {
  bopp: {
    name: "BOPP", desc: "Polipropileno biorientado. Ideal para cosméticos. Resistente a água e óleo.", icon: "bopp",
    variants: {
      branco: { name: "Branco", desc: "Fundo opaco, cores fiéis ao design." },
      metalizado: { name: "Metalizado", desc: "Acabamento espelhado/brilhante na base. Visual premium.", subvariants: { metal: { name: "Metal", desc: "Brilho metálico padrão (prata)." }, holografico: { name: "Holográfico", desc: "Reflete cores conforme o ângulo." } } },
      transparente: { name: "Transparente", desc: "Adesivo invisível — mostra o frasco atrás." },
    },
  },
  vinil: {
    name: "Vinil", desc: "Mais espesso e flexível. Boa adesão em curvas e superfícies irregulares.", icon: "vinil",
    variants: {
      branco: { name: "Branco", desc: "Vinil branco com escolha de acabamento de superfície.", subvariants: { brilho: { name: "Brilho", desc: "Acabamento brilhante (gloss)." }, fosco: { name: "Fosco", desc: "Acabamento sem brilho (matte)." } } },
      holografico: { name: "Holográfico", desc: "Base com efeito arco-íris/holográfico." },
      transparente: { name: "Transparente", desc: "Vinil transparente com escolha de superfície.", subvariants: { liso: { name: "Liso", desc: "Superfície lisa e cristalina." }, jateado: { name: "Jateado", desc: "Efeito fosco translúcido (frosted)." } } },
    },
  },
  couche: {
    name: "Couché", desc: "Papel revestido. Mais econômico. Não recomendado para áreas úmidas.", icon: "couche",
    variants: {
      brilho: { name: "Brilho", desc: "Couché brilhante. Bom contraste de cores." },
      fosco: { name: "Fosco", desc: "Couché fosco. Visual sóbrio e elegante." },
    },
  },
  gofrado: {
    name: "Gofrado (Textura)", desc: "Papel especial com textura tátil. Visual artesanal e premium.", icon: "gofrado",
    variants: {
      andes: { name: "Andes", desc: "Textura linear suave." },
      vergeMartele: { name: "Vergê e Martelê", desc: "Textura granulada/martelada." },
    },
  },
};

export function getMaterialLabel(m: MaterialState): string {
  if (!m || !m.family) return "—";
  const fam = MATERIAIS_TREE[m.family];
  if (!fam) return "—";
  let label = fam.name;
  if (m.variant) {
    const v = fam.variants[m.variant];
    if (v) {
      label += " / " + v.name;
      if (m.subvariant && v.subvariants) {
        const sv = v.subvariants[m.subvariant];
        if (sv) label += " / " + sv.name;
      }
    }
  }
  return label;
}

export function isMaterialComplete(m: MaterialState): boolean {
  if (!m || !m.family) return false;
  const fam = MATERIAIS_TREE[m.family];
  if (!fam || !m.variant) return false;
  const v = fam.variants[m.variant];
  if (!v) return false;
  if (v.subvariants && !m.subvariant) return false;
  return true;
}

export function getAvailableFinishes(m: MaterialState) {
  const avail = { verniz: true, hotstamp: true, baixoRelevo: true };
  if (!m || !m.family) return avail;
  if (m.family === "gofrado") { avail.verniz = false; avail.baixoRelevo = false; }
  if (m.family === "bopp" && m.variant === "metalizado") avail.hotstamp = false;
  return avail;
}

// SVG inline (string) de preview de cada material (porte de getMatPreviewSVG).
export function getMatPreviewSVG(family: string, variant?: string, subvariant?: string): string {
  if (!variant) {
    if (family === "bopp") return '<rect width="100" height="100" fill="#f0eee9"/><rect x="15" y="20" width="70" height="60" rx="4" fill="#fff" stroke="#cbc4ba" stroke-width="1.5"/><text x="50" y="56" text-anchor="middle" font-size="13" font-weight="700" fill="#8b8478">BOPP</text>';
    if (family === "vinil") return '<rect width="100" height="100" fill="#f4f1ec"/><rect x="15" y="20" width="70" height="60" rx="6" fill="#fff" stroke="#b8aea0" stroke-width="2.2"/><text x="50" y="56" text-anchor="middle" font-size="13" font-weight="700" fill="#8b8478">VINIL</text>';
    if (family === "couche") return '<rect width="100" height="100" fill="#fcfaf6"/><rect x="15" y="20" width="70" height="60" fill="#fff" stroke="#d8d2c5" stroke-width="1"/><text x="50" y="56" text-anchor="middle" font-size="12" font-weight="700" fill="#8b8478">COUCHÉ</text>';
    if (family === "gofrado") return '<defs><pattern id="gof" patternUnits="userSpaceOnUse" width="6" height="6"><circle cx="3" cy="3" r="0.8" fill="#c8c0b0"/></pattern></defs><rect width="100" height="100" fill="#f4ede0"/><rect x="15" y="20" width="70" height="60" fill="url(#gof)" stroke="#b8aea0" stroke-width="1"/><text x="50" y="56" text-anchor="middle" font-size="11" font-weight="700" fill="#7a7060">GOFRADO</text>';
  }
  if (family === "bopp") {
    if (variant === "branco") return '<rect width="100" height="100" fill="#fafaf7"/><rect x="20" y="25" width="60" height="50" rx="3" fill="#fff" stroke="#dcd6cc" stroke-width="1.5"/>';
    if (variant === "metalizado" && !subvariant) return '<defs><linearGradient id="mtl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8e8eb"/><stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="#b8b8be"/></linearGradient></defs><rect width="100" height="100" fill="#ede9e1"/><rect x="20" y="25" width="60" height="50" rx="3" fill="url(#mtl)" stroke="#a0a0a8" stroke-width="1.5"/>';
    if (variant === "transparente") return '<defs><pattern id="trans" patternUnits="userSpaceOnUse" width="12" height="12"><rect width="6" height="6" fill="#ebebeb"/><rect x="6" y="6" width="6" height="6" fill="#ebebeb"/></pattern></defs><rect width="100" height="100" fill="#f5f3ee"/><rect x="20" y="25" width="60" height="50" rx="3" fill="url(#trans)" stroke="#cbc4ba" stroke-width="1.5"/>';
  }
  if (family === "vinil") {
    if (variant === "branco" && !subvariant) return '<rect width="100" height="100" fill="#fafaf7"/><rect x="20" y="25" width="60" height="50" rx="5" fill="#fff" stroke="#cbc4ba" stroke-width="2.2"/>';
    if (variant === "holografico") return '<defs><linearGradient id="holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb8d8"/><stop offset="0.33" stop-color="#bce6ff"/><stop offset="0.66" stop-color="#d4ffbf"/><stop offset="1" stop-color="#ffd9a8"/></linearGradient></defs><rect width="100" height="100" fill="#f0eee9"/><rect x="20" y="25" width="60" height="50" rx="5" fill="url(#holo)" stroke="#bfb6a6" stroke-width="2"/>';
    if (variant === "transparente" && !subvariant) return '<defs><pattern id="vtrans" patternUnits="userSpaceOnUse" width="12" height="12"><rect width="6" height="6" fill="#ebebeb"/><rect x="6" y="6" width="6" height="6" fill="#ebebeb"/></pattern></defs><rect width="100" height="100" fill="#f5f3ee"/><rect x="20" y="25" width="60" height="50" rx="5" fill="url(#vtrans)" stroke="#bfb6a6" stroke-width="2"/>';
  }
  if (family === "couche") {
    if (variant === "brilho") return '<defs><linearGradient id="cbr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="0.5" stop-color="#f5f4ef"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="100" height="100" fill="#fcfaf6"/><rect x="20" y="25" width="60" height="50" fill="url(#cbr)" stroke="#d4cdbf" stroke-width="1"/><rect x="22" y="27" width="56" height="2" fill="#fff" opacity="0.9"/>';
    if (variant === "fosco") return '<rect width="100" height="100" fill="#fcfaf6"/><rect x="20" y="25" width="60" height="50" fill="#f7f4ec" stroke="#cdc6b9" stroke-width="1"/>';
  }
  if (family === "gofrado") {
    if (variant === "andes") return '<defs><pattern id="andes" patternUnits="userSpaceOnUse" width="100" height="3"><line x1="0" y1="1" x2="100" y2="1" stroke="#cbc4ba" stroke-width="0.4"/></pattern></defs><rect width="100" height="100" fill="#f4ede0"/><rect x="20" y="25" width="60" height="50" fill="url(#andes)" stroke="#a89e8a" stroke-width="1.2"/>';
    if (variant === "vergeMartele") return '<defs><pattern id="verge" patternUnits="userSpaceOnUse" width="5" height="5"><circle cx="2.5" cy="2.5" r="1" fill="#bfb6a6"/></pattern></defs><rect width="100" height="100" fill="#f4ede0"/><rect x="20" y="25" width="60" height="50" fill="url(#verge)" stroke="#a89e8a" stroke-width="1.2"/>';
  }
  if (family === "bopp" && variant === "metalizado") {
    if (subvariant === "metal") return '<defs><linearGradient id="mtl2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dadce0"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="1" stop-color="#9298a1"/></linearGradient></defs><rect width="100" height="100" fill="#ede9e1"/><rect x="20" y="25" width="60" height="50" rx="3" fill="url(#mtl2)" stroke="#8e9099" stroke-width="1.5"/>';
    if (subvariant === "holografico") return '<defs><linearGradient id="holo2" x1="0" y1="0" x2="1" y2="0.6"><stop offset="0" stop-color="#ffb8d8"/><stop offset="0.25" stop-color="#bce6ff"/><stop offset="0.5" stop-color="#d4ffbf"/><stop offset="0.75" stop-color="#ffd9a8"/><stop offset="1" stop-color="#e8b8ff"/></linearGradient></defs><rect width="100" height="100" fill="#ede9e1"/><rect x="20" y="25" width="60" height="50" rx="3" fill="url(#holo2)" stroke="#a89bb8" stroke-width="1.5"/>';
  }
  if (family === "vinil" && variant === "branco") {
    if (subvariant === "brilho") return '<defs><linearGradient id="vbr" x1="0" y1="0" x2="1" y2="0.5"><stop offset="0" stop-color="#fff"/><stop offset="0.5" stop-color="#f0eee9"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="100" height="100" fill="#fafaf7"/><rect x="20" y="25" width="60" height="50" rx="5" fill="url(#vbr)" stroke="#cbc4ba" stroke-width="2.2"/><path d="M25 30 L35 30 L33 35 L23 35 Z" fill="#fff" opacity="0.6"/>';
    if (subvariant === "fosco") return '<rect width="100" height="100" fill="#fafaf7"/><rect x="20" y="25" width="60" height="50" rx="5" fill="#f6f4ef" stroke="#bfb6a6" stroke-width="2.2"/>';
  }
  if (family === "vinil" && variant === "transparente") {
    if (subvariant === "liso") return '<defs><pattern id="vtl" patternUnits="userSpaceOnUse" width="12" height="12"><rect width="6" height="6" fill="#ebebeb"/><rect x="6" y="6" width="6" height="6" fill="#ebebeb"/></pattern></defs><rect width="100" height="100" fill="#f5f3ee"/><rect x="20" y="25" width="60" height="50" rx="5" fill="url(#vtl)" stroke="#bfb6a6" stroke-width="2"/>';
    if (subvariant === "jateado") return '<defs><pattern id="vtj" patternUnits="userSpaceOnUse" width="6" height="6"><circle cx="3" cy="3" r="0.8" fill="#cdc6b9" opacity="0.6"/></pattern></defs><rect width="100" height="100" fill="#f5f3ee"/><rect x="20" y="25" width="60" height="50" rx="5" fill="#f9f7f2" stroke="#bfb6a6" stroke-width="2"/><rect x="20" y="25" width="60" height="50" rx="5" fill="url(#vtj)" opacity="0.7"/>';
  }
  return '<rect width="100" height="100" fill="#f0eee9"/>';
}
