"use client";

import { useState } from "react";
import { useStudioStore, selIds } from "../store/useStudioStore";
import { LAYER_ICONS } from "../data/fonts";

// Porte de edRenderLayers + layer-tools.
export default function LayersPanel() {
  const editor = useStudioStore((s) => s.editor);
  const edSelect = useStudioStore((s) => s.edSelect);
  const edToggle = useStudioStore((s) => s.edToggle);
  const edUpdateEl = useStudioStore((s) => s.edUpdateEl);
  const edReorder = useStudioStore((s) => s.edReorder);
  const edDuplicate = useStudioStore((s) => s.edDuplicate);
  const edDelete = useStudioStore((s) => s.edDelete);

  const els = editor.faces[editor.face] || [];
  const selectedIds = new Set(selIds(editor));
  const sel = editor.sel;
  const i = els.findIndex((e) => e.id === sel);
  const has = i >= 0;

  const [renaming, setRenaming] = useState<string | null>(null);

  return (
    <div className="panel-body" id="panelLayers">
      <div className="layer-tools">
        <button id="lyrUp" title="Trazer para frente" disabled={!has || i >= els.length - 1} onClick={() => sel && edReorder(sel, "up")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></button>
        <button id="lyrDown" title="Enviar para trás" disabled={!has || i <= 0} onClick={() => sel && edReorder(sel, "down")}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg></button>
        <button id="lyrDup" title="Duplicar" disabled={!has} onClick={() => sel && edDuplicate(sel)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></button>
        <button id="lyrDel" title="Excluir" disabled={!has} onClick={() => sel && edDelete(sel)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg></button>
      </div>

      {els.length === 0 ? (
        <div className="ed-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L2 7l10 5 10-5z" /></svg>
          <div>Nenhuma camada nesta face.</div>
        </div>
      ) : (
        <div className="layers" id="layerList">
          {[...els].reverse().map((el) => (
            <div key={el.id} className={"layer" + (selectedIds.has(el.id) ? " sel" : "") + (el.visible ? "" : " hidden")} data-id={el.id}>
              <div className="ico" onClick={(e) => (e.shiftKey ? edToggle(el.id) : edSelect(el.id))}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: LAYER_ICONS[el.type] || "" }} />
              </div>
              <div className="name" onClick={(e) => (e.shiftKey ? edToggle(el.id) : edSelect(el.id))} onDoubleClick={() => setRenaming(el.id)}>
                {renaming === el.id ? (
                  <input autoFocus defaultValue={el.name} onBlur={(e) => { edUpdateEl(el.id, { name: e.target.value.trim() || el.name }); setRenaming(null); }} onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); if (e.key === "Escape") setRenaming(null); }} />
                ) : (
                  <span>{el.name}</span>
                )}
              </div>
              <button className="lbtn" data-act="lock" onClick={(e) => { e.stopPropagation(); edUpdateEl(el.id, { locked: !el.locked }); }}>
                {el.locked ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.5-2" /></svg>}
              </button>
              <button className="lbtn" data-act="vis" onClick={(e) => { e.stopPropagation(); edUpdateEl(el.id, { visible: !el.visible }); }}>
                {el.visible ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.9 5A9.5 9.5 0 0 1 12 5c6 0 10 7 10 7a16 16 0 0 1-3 3.5M6 6.5C3.3 8.3 2 12 2 12s4 7 10 7a9.5 9.5 0 0 0 5-1.4M3 3l18 18" /></svg>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
