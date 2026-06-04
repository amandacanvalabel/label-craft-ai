"use client";

import { useMemo, useState } from "react";
import { SHAPE_LIB, getShapesByCategory } from "../data/svgLibs";

// Porte de openShapeGallery / openShapeGalleryFor.
export default function ShapeGalleryModal({ onPick, onClose }: { onPick: (shapeKind: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const cats = useMemo(() => getShapesByCategory() as Record<string, { key: string; name: string }[]>, []);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(cats)
      .map(([name, items]) => ({ name, items: q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items }))
      .filter((s) => s.items.length);
  }, [query, cats]);

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: 780, maxWidth: "94vw", maxHeight: "84vh" }}>
        <div className="modal-head">
          <h3>Galeria de <span style={{ color: "var(--accent)" }}>formas</span></h3>
          <button className="x" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
        </div>
        <div style={{ padding: "14px 24px 0" }}>
          <input type="text" placeholder="Buscar forma..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: "100%", background: "var(--panel-2)", border: "1.5px solid var(--line)", borderRadius: 9, padding: "11px 14px", fontFamily: "inherit", fontSize: 13, color: "var(--ink)", outline: "none" }} />
        </div>
        <div className="modal-body" style={{ padding: "6px 8px 12px" }}>
          {sections.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>Nenhuma forma encontrada para &quot;<b>{query}</b>&quot;</div>
          ) : (
            sections.map((s) => (
              <div key={s.name} className="fp-section">
                <div className="fp-section-h">{s.name}</div>
                <div className="sg-grid">
                  {s.items.map((it) => (
                    <button key={it.key} className="sg-shape" title={it.name} onClick={() => { onPick(it.key); onClose(); }}>
                      <svg viewBox="0 0 100 100" width="48" height="48" preserveAspectRatio="xMidYMid meet" dangerouslySetInnerHTML={{ __html: `<path d="${SHAPE_LIB[it.key].path}" fill="currentColor"/>` }} />
                      <span>{it.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
