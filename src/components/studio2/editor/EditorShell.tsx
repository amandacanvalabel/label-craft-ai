"use client";

import { useEffect, useState } from "react";
import { useStudioStore, selIds } from "../store/useStudioStore";
import { stepIdx } from "../data/steps";
import { TEMPLATES } from "../data/templates";
import ThemeToggle from "../ui/ThemeToggle";
import BrandMark from "../ui/BrandMark";
import Canvas, { BASE_PX_PER_MM } from "./Canvas";
import Toolbar from "./Toolbar";
import PropsPanel from "./PropsPanel";
import LayersPanel from "./LayersPanel";
import FontPickerModal from "./FontPickerModal";
import ShapeGalleryModal from "./ShapeGalleryModal";
import { toast } from "../ui/Toast";
import type { El } from "../types";
import { ensureFontLoaded } from "../data/fonts";
import { SHAPE_LIB } from "../data/svgLibs";
import AnvisaPanel from "../anvisa/AnvisaPanel";
import { runAnvisaChecks } from "../anvisa/checks";
import PreviewModal from "./PreviewModal";
import { saveProject } from "../store/persistence";

// Porte de #editor + buildEditor/edEnter. Canvas + toolbar + topbar interativa.
export default function EditorShell() {
  const go = useStudioStore((s) => s.go);
  const editor = useStudioStore((s) => s.editor);
  const undoIndex = useStudioStore((s) => s.undoIndex);
  const undoLen = useStudioStore((s) => s.undoStack.length);
  const editorEnter = useStudioStore((s) => s.editorEnter);
  const undo = useStudioStore((s) => s.undo);
  const redo = useStudioStore((s) => s.redo);
  const edSetZoom = useStudioStore((s) => s.edSetZoom);
  const edSetFace = useStudioStore((s) => s.edSetFace);
  const setEditor = useStudioStore((s) => s.setEditor);
  const edUpdateEl = useStudioStore((s) => s.edUpdateEl);
  const edAdd = useStudioStore((s) => s.edAdd);

  const { faceConfig, face, zoom, label, docname, templateId } = editor;
  const ids = selIds(editor);

  const [tab, setTab] = useState<"props" | "layers">("props");
  const [fontPickerEl, setFontPickerEl] = useState<El | null>(null);
  const [shapeGallery, setShapeGallery] = useState<null | { mode: "add" } | { mode: "change"; el: El }>(null);
  const [anvisaOpen, setAnvisaOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const dirty = useStudioStore((s) => s.dirty);
  const projectId = useStudioStore((s) => s.projectId);
  const lastSaved = useStudioStore((s) => s.lastSaved);

  const doSave = async () => {
    setSaving(true);
    const r = await saveProject();
    setSaving(false);
    toast(r.ok ? `Projeto "${r.name}" salvo` : "Não foi possível salvar: " + (r.error || ""));
  };

  // Autosave a cada 30s quando já existe projeto e há mudanças.
  useEffect(() => {
    const t = setInterval(() => {
      const st = useStudioStore.getState();
      if (st.projectId && st.dirty) saveProject({ silent: true });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const saveLabel = saving ? "Salvando…" : dirty ? "Alterações não salvas" : lastSaved ? "Salvo" : projectId ? "Salvo" : "Projeto novo";

  // Badge ANVISA: recomputado a cada render (editor é assinado, então muda ao editar).
  const anvisaIssues = runAnvisaChecks(useStudioStore.getState());
  const anvisaCrit = anvisaIssues.filter((i) => i.level === "crit").length;
  const anvisaWarn = anvisaIssues.filter((i) => i.level === "warn").length;
  const anvisaBadge = anvisaCrit > 0 ? anvisaCrit : anvisaWarn > 0 ? anvisaWarn : 0;

  const fit = () => {
    const ws = document.getElementById("workspace");
    if (!ws) return;
    const r = ws.getBoundingClientRect();
    const z = Math.min((r.width - 220) / (label.w * BASE_PX_PER_MM), (r.height - 220) / (label.h * BASE_PX_PER_MM));
    if (z > 0 && isFinite(z)) edSetZoom(z);
  };

  // Entrada no editor: histórico inicial + fit.
  useEffect(() => {
    editorEnter();
    const t = setTimeout(fit, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atalhos de teclado (porte de edKey).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const editing = !!(ae && ["INPUT", "TEXTAREA", "SELECT"].includes(ae.tagName)) || !!document.querySelector(".el-text.editing");
      const k = e.key.toLowerCase();
      const st = useStudioStore.getState();
      if ((e.ctrlKey || e.metaKey) && k === "s") { e.preventDefault(); doSave(); return; }
      if (editing) return;
      if ((e.ctrlKey || e.metaKey) && k === "a") { e.preventDefault(); st.edSelectAll(); return; }
      if ((e.ctrlKey || e.metaKey) && k === "z") { e.preventDefault(); st.undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (k === "y" || (e.shiftKey && k === "z"))) { e.preventDefault(); st.redo(); return; }
      const sel = selIds(st.editor);
      const f = st.editor.face;
      const els = st.editor.faces[f] || [];
      if ((e.ctrlKey || e.metaKey) && k === "d" && sel.length) {
        e.preventDefault();
        if (sel.length === 1) st.edDuplicate(sel[0]);
        else {
          const idset = new Set(sel);
          const uid = st.editor.uid;
          const copies = els.filter((el) => idset.has(el.id)).map((el, i) => ({ ...JSON.parse(JSON.stringify(el)), id: "e" + (uid + i), x: el.x + 4, y: el.y + 4, name: el.name + " (cópia)" }));
          st.setEditor({ faces: { ...st.editor.faces, [f]: [...els, ...copies] }, uid: uid + copies.length });
          st.edSetSelection(copies.map((c) => c.id));
          st.pushHistory();
        }
        return;
      }
      if (!sel.length) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (sel.length === 1) st.edDelete(sel[0]);
        else {
          const idset = new Set(sel);
          st.edSetFaceEls(f, els.filter((el) => !idset.has(el.id)));
          st.edSelect(null);
          st.pushHistory();
          toast(`${idset.size} itens excluídos`);
        }
        return;
      }
      if (e.key === "Escape") { st.edSelect(null); return; }
      const step = e.shiftKey ? 5 : 0.5;
      const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      const d = delta[e.key];
      if (d) {
        e.preventDefault();
        const idset = new Set(sel);
        st.edSetFaceEls(f, els.map((el) => (idset.has(el.id) ? { ...el, x: el.x + d[0], y: el.y + d[1] } : el)));
        st.pushHistory();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const faces = faceConfig?.faces || [];
  const tpl = TEMPLATES.find((t) => t.id === templateId);
  const selLabel = ids.length === 0 ? "Nenhum elemento selecionado" : ids.length === 1 ? "Selecionado: " + ((editor.faces[face] || []).find((e) => e.id === ids[0])?.name || "—") : `${ids.length} itens selecionados`;

  return (
    <div id="editor">
      <div className="ed-top">
        <BrandMark id="brandHomeEditor" />
        <div className="ed-faces" id="edFaces">
          {faces.length <= 1 ? (
            <div style={{ padding: "7px 14px", fontWeight: 700, fontSize: 12, color: "var(--accent)", background: "var(--accent-soft)", borderRadius: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }} title={faces[0]?.label}>
              {faces[0]?.label || "Rótulo"}
            </div>
          ) : (
            faces.map((f) => (
              <button key={f.id} data-face={f.id} className={face === f.id ? "on" : ""} onClick={() => edSetFace(f.id)}>
                {f.label}
              </button>
            ))
          )}
        </div>
        <input className="docname" id="docname" value={docname} onChange={(e) => setEditor({ docname: e.target.value })} />
        <span className="save-ind" id="saveIndicator">{saveLabel}</span>
        <ThemeToggle id="themeToggleEd" small />
        <button className="tbtn" id="btnSave" title="Salvar projeto (Ctrl+S)" disabled={saving} onClick={doSave}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          <span className="tbtn-lbl">Salvar</span>
        </button>
        <div className="sep" />
        <button className="tbtn" id="btnRegen" title="Refazer o layout com a IA" onClick={() => toast("Refazer com IA na Fase 5")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2L12 8l6.5.5-5 4 1.5 6.5L9.5 15 4 19l1.5-6.5-5-4L7 8z" /></svg>
          <span className="tbtn-lbl">Refazer com IA</span>
        </button>
        <div className="sep" />
        <button className="tbtn" id="btnUndo" title="Desfazer (Ctrl+Z)" disabled={undoIndex <= 0} onClick={undo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5" /><path d="M4 9h11a6 6 0 0 1 0 12H9" /></svg>
        </button>
        <button className="tbtn" id="btnRedo" title="Refazer (Ctrl+Y)" disabled={undoIndex >= undoLen - 1} onClick={redo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5" /><path d="M20 9H9a6 6 0 0 0 0 12h6" /></svg>
        </button>
        <div className="ed-spacer" />
        <div className="zoomwrap">
          <button id="zoomOut" onClick={() => edSetZoom(zoom / 1.25)}>−</button>
          <div className="zval" id="zoomVal">{Math.round(zoom * 100)}%</div>
          <button id="zoomIn" onClick={() => edSetZoom(zoom * 1.25)}>+</button>
        </div>
        <button className="tbtn" id="btnFit" title="Ajustar" onClick={fit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
        </button>
        <div className="sep" />
        <button className={"tbtn anvisa-btn" + (anvisaOpen ? " panel-open" : "") + (anvisaCrit > 0 ? " has-issues" : anvisaBadge === 0 ? " all-ok" : "")} id="btnAnvisa" title="Revisar conformidade (ANVISA)" onClick={() => setAnvisaOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 5v6c0 5 4 9 9 11 5-2 9-6 9-11V5l-9-3z" /><path d="M9 12l2 2 4-4" /></svg>
          <span className="tbtn-lbl">ANVISA</span>
          {anvisaBadge > 0 && <span className="anvisa-badge" id="anvisaBadge">{anvisaBadge}</span>}
        </button>
        <button className="tbtn preview-btn" id="btnPreview" title="Preview profissional" onClick={() => setPreviewOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          <span className="tbtn-lbl">Preview</span>
        </button>
        <div className="sep" />
        <button className="tbtn" id="edBack" title="Voltar à revisão" onClick={() => go(stepIdx("resumo"))}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          <span className="tbtn-lbl">Voltar</span>
        </button>
        <button className="tbtn primary" id="edNext" title="Avançar para material" onClick={() => go(stepIdx("material"))}>
          <span className="tbtn-lbl">Avançar</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="ed-main">
        <Toolbar onOpenShapes={() => setShapeGallery({ mode: "add" })} />
        <Canvas />
        <div className="ed-right">
          <div className="tabs">
            <button className={"tab" + (tab === "props" ? " active" : "")} onClick={() => setTab("props")}>Propriedades</button>
            <button className={"tab" + (tab === "layers" ? " active" : "")} onClick={() => setTab("layers")}>Camadas <span className="ct" id="layerCount">{(editor.faces[face] || []).length}</span></button>
          </div>
          <div style={{ display: tab === "props" ? "block" : "none", flex: 1, overflow: "auto" }}>
            <PropsPanel onOpenFontPicker={(el) => setFontPickerEl(el)} onChangeShape={(el) => setShapeGallery({ mode: "change", el })} />
          </div>
          <div style={{ display: tab === "layers" ? "block" : "none", flex: 1, overflow: "auto" }}>
            <LayersPanel />
          </div>
          {anvisaOpen && <AnvisaPanel onClose={() => setAnvisaOpen(false)} />}
        </div>
      </div>

      {fontPickerEl && (
        <FontPickerModal
          current={fontPickerEl.font || "Inter"}
          onClose={() => setFontPickerEl(null)}
          onPick={(font) => { ensureFontLoaded(font); edUpdateEl(fontPickerEl.id, { font }); }}
        />
      )}
      {previewOpen && <PreviewModal onClose={() => setPreviewOpen(false)} />}
      {shapeGallery && (
        <ShapeGalleryModal
          onClose={() => setShapeGallery(null)}
          onPick={(shapeKind) => {
            if (shapeGallery.mode === "add") edAdd("shape", { shapeKind });
            else edUpdateEl(shapeGallery.el.id, { shapeKind, name: SHAPE_LIB[shapeKind]?.name || shapeGallery.el.name });
          }}
        />
      )}

      <div className="ed-status">
        <span><span className="dot" /> Editor</span>
        <span>Rótulo <b id="stSize">{label.w} × {label.h} mm</b></span>
        <span id="stFace">{faces.find((f) => f.id === face)?.label || "—"}</span>
        <span>Design <b id="stTpl">{tpl ? tpl.name : "—"}</b></span>
        <span id="stSel">{selLabel}</span>
      </div>
    </div>
  );
}
