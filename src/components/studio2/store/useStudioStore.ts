"use client";

import { create } from "zustand";
import type { AnalysisResult, EditorState, El, ElementType, StudioState } from "../types";
import { STEPS, type StepId, stepIdx } from "../data/steps";
import { generateLabel, generateVariations, type GenerateOptions } from "../generate/engine";
import { SHAPE_LIB } from "../data/svgLibs";

// ---- Estado inicial (porte de `const state` + STATE_DEFAULTS) ----
export function createInitialState(): StudioState {
  return {
    produto: null,
    conhece: null,
    frascoFoto: null,
    rotulo: {
      tipo: null,
      config: null,
      w: 70,
      h: 90,
      faca: null,
      facaNome: null,
      facaKind: null,
      facaSize: null,
    },
    verso: {
      nome: "",
      introducao: "",
      modoUso: "",
      dicas: "",
      precaucoes: "",
      ingEn: "",
      ingPt: "",
      qrLink: "",
      fabNome: "",
      fabCnpj: "",
      fabIe: "",
      fabEnd: "",
      fabCrq: "",
      fabAnvisa: "",
      fornNome: "",
      fornCnpj: "",
      fornEnd: "",
      fornIe: "",
      sac: "",
      codBarras: "",
      validadeLote: "Validade e lote: vide embalagem",
    },
    selos: {
      vegano: false,
      materialReciclavel: false,
      jogueLixo: false,
      euReciclo: false,
      tipoMaterial: null,
      validadeAbertura: null,
      crueltyFree: false,
      naoTestado: false,
      outros: [],
    },
    frente: { logo: null, logoNome: null, nome: "", oque: "", ativos: "", volume: "" },
    refs: [],
    ai: {
      prompt: "",
      extractedPalette: [],
      analysis: null,
      briefingVector: null,
      variations: [],
      chosenVariation: 0,
      brief: null,
    },
    editor: {
      label: { w: 70, h: 90, bleed: 3, safe: 4, bg: "#ffffff" },
      faces: {},
      faceConfig: null,
      face: "frente",
      sel: null,
      selSet: null,
      zoom: 1.6,
      uid: 1,
      docname: "Rótulo",
      templateId: null,
      paletteOverride: null,
    },
    plan: "free",
    material: { family: null, variant: null, subvariant: null },
    finishes: {},
    preview: { background: "white", view: "flat", showFinishes: true },
  };
}

export interface StudioStore extends StudioState {
  // --- meta / navegação ---
  cur: number;
  dirty: boolean;
  projectId: string | null;
  projectName: string;
  lastSaved: number | null;
  edReady: boolean;
  brandColors: string[]; // paleta da marca do assinante (config), aplicável no editor

  // --- ações ---
  setBrandColors: (colors: string[]) => void;
  go: (i: number) => void;
  goId: (id: StepId) => void;
  set: (partial: Partial<StudioState>) => void;
  patch: <K extends keyof StudioState>(key: K, partial: Partial<StudioState[K]>) => void;
  setEditor: (partial: Partial<EditorState>) => void;
  markDirty: () => void;
  markSaved: (id: string, name: string) => void;
  loadState: (s: StudioState, meta?: { projectId?: string | null; projectName?: string }) => void;
  resetToInitial: () => void;

  // --- motor de geração ---
  setAnalysis: (analysis: AnalysisResult | null) => void;
  generateVariationsNow: () => void;
  applyVariation: (idx: number) => void;
  generateNow: (opts?: GenerateOptions) => void;

  // --- editor: histórico (undo/redo) ---
  undoStack: string[];
  undoIndex: number;
  editorEnter: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // --- editor: seleção ---
  edSelect: (id: string | null) => void;
  edToggle: (id: string) => void;
  edSelectAll: () => void;
  edSetSelection: (ids: string[]) => void;

  // --- editor: faces / zoom ---
  edSetFace: (f: string) => void;
  edSetZoom: (z: number) => void;

  // --- editor: elementos ---
  edAdd: (type: ElementType, extra?: Partial<El>) => void;
  edDuplicate: (id: string) => void;
  edDelete: (id: string) => void;
  edSetFaceEls: (faceId: string, els: El[]) => void; // mutação transitória (sem histórico)

  // --- editor: painéis (propriedades / camadas) ---
  edUpdateEl: (id: string, patch: Partial<El>, commit?: boolean) => void;
  edUpdateLabel: (patch: Partial<EditorState["label"]>, commit?: boolean) => void;
  edReorder: (id: string, dir: "up" | "down") => void;
  edAlignMulti: (ids: string[], kind: string) => void;

  // --- produção: material e acabamentos ---
  setMaterial: (patch: Partial<StudioState["material"]>) => void;
  setFinish: (elId: string, key: "verniz" | "hotstamp" | "baixoRelevo", value: boolean | string | null) => void;
  setPreview: (patch: Partial<StudioState["preview"]>) => void;
}

function editorSnap(e: EditorState): string {
  return JSON.stringify({ label: e.label, faces: e.faces, face: e.face, uid: e.uid });
}

function elDefaultName(type: ElementType, els: El[]): string {
  const map: Record<string, string> = {
    text: "Texto", textCurve: "Texto em curva", rect: "Retângulo", ellipse: "Elipse",
    line: "Linha", image: "Imagem", shape: "Forma", selo: "Selo",
    barcode: "Código de barras", qr: "QR Code",
  };
  let n = 1;
  while (els.some((e) => e.name === (map[type] || "Elemento") + " " + n)) n++;
  return (map[type] || "Elemento") + " " + n;
}

function editorHasElements(s: StudioState): boolean {
  return Object.values(s.editor.faces || {}).some((face) => face.length > 0);
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  ...createInitialState(),
  cur: 0,
  dirty: false,
  projectId: null,
  projectName: "Rótulo",
  lastSaved: null,
  edReady: false,
  brandColors: [],
  setBrandColors: (colors) => set({ brandColors: colors }),
  undoStack: [],
  undoIndex: -1,

  go: (i) => {
    if (i < 0 || i >= STEPS.length) return;
    const st = get();
    const targetId = STEPS[i].id;
    // Se o editor já foi aberto e tem elementos, pular gerando/variacoes (não regenerar).
    // edReady só vira true ao ENTRAR no editor — durante gerando→variacoes ainda é false.
    if (st.edReady && editorHasElements(st) && (targetId === "gerando" || targetId === "variacoes")) {
      set({ cur: stepIdx("editor") });
      return;
    }
    const patch: Partial<StudioStore> = { cur: i };
    if (targetId === "editor") patch.edReady = true;
    set(patch);
  },

  goId: (id) => get().go(stepIdx(id)),

  set: (partial) => set({ ...partial, dirty: true }),

  patch: (key, partial) =>
    set((s) => ({
      [key]: { ...(s[key] as object), ...(partial as object) },
      dirty: true,
    } as Partial<StudioStore>)),

  setEditor: (partial) =>
    set((s) => ({ editor: { ...s.editor, ...partial }, dirty: true })),

  markDirty: () => set({ dirty: true }),

  markSaved: (id, name) => set({ projectId: id, projectName: name, lastSaved: Date.now(), dirty: false }),

  loadState: (s, meta) =>
    set({
      ...s,
      cur: 0,
      dirty: false,
      edReady: editorHasElements(s),
      projectId: meta?.projectId ?? null,
      projectName: meta?.projectName ?? s.editor?.docname ?? "Rótulo",
      lastSaved: null,
    }),

  resetToInitial: () =>
    set({
      ...createInitialState(),
      cur: 0,
      dirty: false,
      projectId: null,
      projectName: "Rótulo",
      lastSaved: null,
      edReady: false,
    }),

  setAnalysis: (analysis) =>
    set((s) => ({
      ai: { ...s.ai, analysis, extractedPalette: analysis ? analysis.palette : [] },
    })),

  generateVariationsNow: () => {
    const { variations, briefingVector } = generateVariations(get());
    set((s) => ({ ai: { ...s.ai, variations, briefingVector, chosenVariation: 0 } }));
  },

  applyVariation: (idx) => {
    const st = get();
    const v = st.ai.variations[idx];
    if (!v) return;
    const editorPatch = generateLabel(st, { templateId: v.templateId, paletteOverride: v.palette });
    set((s) => ({
      ai: { ...s.ai, chosenVariation: idx },
      editor: { ...s.editor, ...editorPatch },
      dirty: true,
    }));
  },

  generateNow: (opts) => {
    const editorPatch = generateLabel(get(), opts);
    set((s) => ({ editor: { ...s.editor, ...editorPatch }, dirty: true }));
  },

  // ---- histórico ----
  editorEnter: () => {
    const snap = editorSnap(get().editor);
    set({ undoStack: [snap], undoIndex: 0 });
  },

  pushHistory: () => {
    set((s) => {
      const snap = editorSnap(s.editor);
      let stack = s.undoStack.slice(0, s.undoIndex + 1);
      stack.push(snap);
      if (stack.length > 50) stack = stack.slice(stack.length - 50);
      return { undoStack: stack, undoIndex: stack.length - 1, dirty: true };
    });
  },

  undo: () => {
    const s = get();
    if (s.undoIndex <= 0) return;
    const i = s.undoIndex - 1;
    const d = JSON.parse(s.undoStack[i]) as Pick<EditorState, "label" | "faces" | "face" | "uid">;
    const selOk = (d.faces[d.face] || []).some((e) => e.id === s.editor.sel);
    set((st) => ({ editor: { ...st.editor, ...d, sel: selOk ? st.editor.sel : null, selSet: null }, undoIndex: i, dirty: true }));
  },

  redo: () => {
    const s = get();
    if (s.undoIndex >= s.undoStack.length - 1) return;
    const i = s.undoIndex + 1;
    const d = JSON.parse(s.undoStack[i]) as Pick<EditorState, "label" | "faces" | "face" | "uid">;
    const selOk = (d.faces[d.face] || []).some((e) => e.id === s.editor.sel);
    set((st) => ({ editor: { ...st.editor, ...d, sel: selOk ? st.editor.sel : null, selSet: null }, undoIndex: i, dirty: true }));
  },

  // ---- seleção ----
  edSelect: (id) => set((s) => ({ editor: { ...s.editor, sel: id, selSet: null } })),

  edToggle: (id) =>
    set((s) => {
      const e = s.editor;
      const selSet = new Set(e.selSet ?? (e.sel ? [e.sel] : []));
      let sel = e.sel;
      if (selSet.has(id)) {
        selSet.delete(id);
        const rem = [...selSet];
        sel = rem.length ? rem[rem.length - 1] : null;
      } else {
        selSet.add(id);
        sel = id;
      }
      let arr: string[] | null = [...selSet];
      if (selSet.size <= 1) {
        sel = selSet.size === 1 ? [...selSet][0] : null;
        arr = null;
      }
      return { editor: { ...e, sel, selSet: arr } };
    }),

  edSelectAll: () =>
    set((s) => {
      const all = (s.editor.faces[s.editor.face] || []).filter((el) => el.visible !== false);
      if (!all.length) return {};
      let arr: string[] | null = all.map((el) => el.id);
      let sel = all[all.length - 1].id;
      if (arr.length === 1) {
        sel = arr[0];
        arr = null;
      }
      return { editor: { ...s.editor, sel, selSet: arr } };
    }),

  edSetSelection: (ids) =>
    set((s) => {
      if (ids.length === 0) return { editor: { ...s.editor, sel: null, selSet: null } };
      if (ids.length === 1) return { editor: { ...s.editor, sel: ids[0], selSet: null } };
      return { editor: { ...s.editor, selSet: ids, sel: ids[ids.length - 1] } };
    }),

  // ---- faces / zoom ----
  edSetFace: (f) => {
    if (get().editor.face === f) return;
    set((s) => ({ editor: { ...s.editor, face: f, sel: null, selSet: null } }));
    get().pushHistory();
  },

  edSetZoom: (z) =>
    set((s) => ({ editor: { ...s.editor, zoom: Math.max(0.25, Math.min(4, Math.round(z * 100) / 100)) } })),

  // ---- elementos ----
  edAdd: (type, extra) => {
    const s = get();
    const L = s.editor.label;
    const cx = L.w / 2;
    const cy = L.h / 2;
    const uid = s.editor.uid;
    const els = s.editor.faces[s.editor.face] || [];
    const base: El = { id: "e" + uid, type, name: elDefaultName(type, els), rot: 0, opacity: 100, visible: true, locked: false, x: 0, y: 0, w: 0, h: 0 };
    const defaults: Record<string, Partial<El>> = {
      text: { x: cx - 26, y: cy - 6, w: 52, h: 12, text: "Texto do rótulo", font: "Playfair Display", size: 14, weight: 600, italic: false, color: "#1a1a1a", align: "center", lh: 1.2, ls: 0 },
      textCurve: { x: cx - 30, y: cy - 15, w: 60, h: 30, text: "TEXTO EM CURVA", font: "Playfair Display", size: 11, weight: 700, italic: false, color: "#1a1a1a", curve: "arcUp", radius: 60, ls: 1 },
      rect: { x: cx - 20, y: cy - 12, w: 40, h: 24, fill: "#2d4a3e", stroke: "#00000000", sw: 0, radius: 2 },
      ellipse: { x: cx - 16, y: cy - 16, w: 32, h: 32, fill: "#b0883f", stroke: "#00000000", sw: 0 },
      line: { x: cx - 22, y: cy, w: 44, h: 0.1, stroke: "#1a1a1a", sw: 1.2 },
      image: { x: cx - 18, y: cy - 18, w: 36, h: 36, src: undefined },
      shape: { x: cx - 15, y: cy - 15, w: 30, h: 30, shapeKind: (extra && extra.shapeKind) || "heart", fill: "#1a1a1a", stroke: "#00000000", sw: 0 },
      barcode: { x: cx - 18, y: cy - 8, w: 36, h: 16, code: "7890000000000", fg: "#000000" },
      qr: { x: cx - 10, y: cy - 10, w: 20, h: 20, seed: "canvalabel", fg: "#000000" },
    };
    const el: El = { ...base, ...(defaults[type] || {}), ...(extra || {}) };
    if (type === "shape" && el.shapeKind && SHAPE_LIB[el.shapeKind]) el.name = SHAPE_LIB[el.shapeKind].name;
    set((st) => ({
      editor: { ...st.editor, faces: { ...st.editor.faces, [st.editor.face]: [...els, el] }, uid: uid + 1, sel: el.id, selSet: null },
    }));
    get().pushHistory();
  },

  edDuplicate: (id) => {
    const s = get();
    const els = s.editor.faces[s.editor.face] || [];
    const el = els.find((e) => e.id === id);
    if (!el) return;
    const uid = s.editor.uid;
    const c: El = { ...JSON.parse(JSON.stringify(el)), id: "e" + uid, name: el.name + " (cópia)", x: el.x + 4, y: el.y + 4 };
    const next = [...els];
    next.splice(els.indexOf(el) + 1, 0, c);
    set((st) => ({ editor: { ...st.editor, faces: { ...st.editor.faces, [st.editor.face]: next }, uid: uid + 1, sel: c.id, selSet: null } }));
    get().pushHistory();
  },

  edDelete: (id) => {
    const s = get();
    const els = s.editor.faces[s.editor.face] || [];
    const next = els.filter((e) => e.id !== id);
    const finishes = { ...s.finishes };
    delete finishes[id];
    set((st) => ({
      editor: { ...st.editor, faces: { ...st.editor.faces, [st.editor.face]: next }, sel: st.editor.sel === id ? null : st.editor.sel },
      finishes,
    }));
    get().pushHistory();
  },

  edSetFaceEls: (faceId, els) =>
    set((s) => ({ editor: { ...s.editor, faces: { ...s.editor.faces, [faceId]: els } } })),

  edUpdateEl: (id, patch, commit = true) => {
    set((s) => {
      const f = s.editor.face;
      const els = (s.editor.faces[f] || []).map((e) => (e.id === id ? { ...e, ...patch } : e));
      return { editor: { ...s.editor, faces: { ...s.editor.faces, [f]: els } } };
    });
    if (commit) get().pushHistory();
  },

  edUpdateLabel: (patch, commit = true) => {
    set((s) => ({ editor: { ...s.editor, label: { ...s.editor.label, ...patch } } }));
    if (commit) get().pushHistory();
  },

  edReorder: (id, dir) => {
    const s = get();
    const f = s.editor.face;
    const arr = [...(s.editor.faces[f] || [])];
    const i = arr.findIndex((e) => e.id === id);
    if (i < 0) return;
    const j = dir === "up" ? i + 1 : i - 1;
    if (j < 0 || j >= arr.length) return;
    arr.splice(i, 1);
    arr.splice(j, 0, s.editor.faces[f][i]);
    set((st) => ({ editor: { ...st.editor, faces: { ...st.editor.faces, [f]: arr } } }));
    get().pushHistory();
  },

  edAlignMulti: (ids, kind) => {
    const s = get();
    const f = s.editor.face;
    const all = s.editor.faces[f] || [];
    const sels = all.filter((e) => ids.includes(e.id));
    if (sels.length < 2) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    sels.forEach((el) => {
      minX = Math.min(minX, el.x); minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.w); maxY = Math.max(maxY, el.y + el.h);
    });
    const bb = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    const patched = new Map<string, Partial<El>>();
    if (kind === "left") sels.forEach((el) => patched.set(el.id, { x: bb.x }));
    else if (kind === "right") sels.forEach((el) => patched.set(el.id, { x: bb.x + bb.w - el.w }));
    else if (kind === "hcenter") sels.forEach((el) => patched.set(el.id, { x: bb.x + bb.w / 2 - el.w / 2 }));
    else if (kind === "top") sels.forEach((el) => patched.set(el.id, { y: bb.y }));
    else if (kind === "bottom") sels.forEach((el) => patched.set(el.id, { y: bb.y + bb.h - el.h }));
    else if (kind === "vcenter") sels.forEach((el) => patched.set(el.id, { y: bb.y + bb.h / 2 - el.h / 2 }));
    else if (kind === "distH") {
      const sorted = [...sels].sort((a, b) => a.x + a.w / 2 - (b.x + b.w / 2));
      const minC = sorted[0].x + sorted[0].w / 2;
      const maxC = sorted[sorted.length - 1].x + sorted[sorted.length - 1].w / 2;
      const step = (maxC - minC) / (sorted.length - 1);
      sorted.forEach((el, i) => patched.set(el.id, { x: minC + i * step - el.w / 2 }));
    } else if (kind === "distV") {
      const sorted = [...sels].sort((a, b) => a.y + a.h / 2 - (b.y + b.h / 2));
      const minC = sorted[0].y + sorted[0].h / 2;
      const maxC = sorted[sorted.length - 1].y + sorted[sorted.length - 1].h / 2;
      const step = (maxC - minC) / (sorted.length - 1);
      sorted.forEach((el, i) => patched.set(el.id, { y: minC + i * step - el.h / 2 }));
    }
    const next = all.map((e) => (patched.has(e.id) ? { ...e, ...patched.get(e.id) } : e));
    set((st) => ({ editor: { ...st.editor, faces: { ...st.editor.faces, [f]: next } } }));
    get().pushHistory();
  },

  setMaterial: (patch) => set((s) => ({ material: { ...s.material, ...patch }, dirty: true })),

  setFinish: (elId, key, value) =>
    set((s) => {
      const finishes = { ...s.finishes };
      const cur = { ...(finishes[elId] || {}) };
      if (value === null || value === false || value === undefined) {
        delete cur[key];
      } else {
        (cur as Record<string, unknown>)[key] = value;
      }
      if (Object.keys(cur).length === 0) delete finishes[elId];
      else finishes[elId] = cur;
      return { finishes, dirty: true };
    }),

  setPreview: (patch) => set((s) => ({ preview: { ...s.preview, ...patch }, dirty: true })),
}));

// ---- Helpers de seleção (puros, sobre o editor) ----
export function selIds(e: EditorState): string[] {
  const set = new Set<string>();
  if (e.selSet) e.selSet.forEach((id) => set.add(id));
  else if (e.sel) set.add(e.sel);
  const els = e.faces[e.face] || [];
  return [...set].filter((id) => els.some((el) => el.id === id));
}

// ---- Validação por etapa (porte de validate()) ----
export function validateStep(id: StepId, s: StudioState): { ok: boolean; msg?: string } {
  if (id === "produto") {
    if (!s.produto) return { ok: false, msg: "Selecione o tipo de produto" };
    if (s.produto === "cosmetico" && !s.conhece)
      return { ok: false, msg: "Indique se você já sabe seu rótulo" };
    if (s.conhece === "naosei" && !s.frascoFoto)
      return { ok: false, msg: "Envie a foto do frasco para identificação" };
    return { ok: true };
  }
  if (id === "rotulo") {
    if (!s.rotulo.tipo) return { ok: false, msg: "Escolha o tipo de rótulo" };
    if (!s.rotulo.config && (s.rotulo.tipo === "adesivo" || s.rotulo.tipo === "serigrafia"))
      return { ok: false, msg: "Escolha a configuração do rótulo" };
    if (s.rotulo.tipo !== "inmold") {
      if (!s.rotulo.w || !s.rotulo.h) return { ok: false, msg: "Informe largura e altura do rótulo" };
    } else {
      if (!s.rotulo.faca) return { ok: false, msg: "Anexe a faca/molde da área de impressão (In Mold)" };
    }
    return { ok: true };
  }
  if (id === "frente") {
    if (!s.frente.nome.trim()) return { ok: false, msg: "Informe o nome do produto" };
    return { ok: true };
  }
  return { ok: true };
}

// Serializa o state (apenas os campos de dados) para canvasData.
export function serializeStudioState(s: StudioState): StudioState {
  return {
    produto: s.produto,
    conhece: s.conhece,
    frascoFoto: s.frascoFoto,
    rotulo: s.rotulo,
    verso: s.verso,
    selos: s.selos,
    frente: s.frente,
    refs: s.refs,
    ai: s.ai,
    editor: { ...s.editor, selSet: s.editor.selSet },
    plan: s.plan,
    material: s.material,
    finishes: s.finishes,
    preview: s.preview,
  };
}
