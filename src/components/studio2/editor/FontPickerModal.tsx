"use client";

import { useEffect, useMemo, useState } from "react";
import { FONT_CATALOG, FONTS, FONTS_FEATURED, ensureFontLoaded } from "../data/fonts";

// Porte de openFontPicker.
export default function FontPickerModal({ current, onPick, onClose }: { current: string; onPick: (font: string) => void; onClose: () => void }) {
  const [selected, setSelected] = useState(current);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Todas");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (cat === "Todas") {
      if (!q) {
        return [
          { section: "⭐ Em destaque", fonts: FONTS_FEATURED },
          ...Object.entries(FONT_CATALOG).map(([c, fonts]) => ({ section: c, fonts: fonts.filter((f) => !FONTS_FEATURED.includes(f)) })),
        ];
      }
      return [{ section: `${FONTS.filter((f) => f.toLowerCase().includes(q)).length} resultados`, fonts: FONTS.filter((f) => f.toLowerCase().includes(q)) }];
    }
    const fonts = FONT_CATALOG[cat] || [];
    return [{ section: cat, fonts: q ? fonts.filter((f) => f.toLowerCase().includes(q)) : fonts }];
  }, [query, cat]);

  useEffect(() => {
    groups.forEach((g) => g.fonts.forEach((f) => ensureFontLoaded(f)));
  }, [groups]);

  const empty = groups.every((g) => g.fonts.length === 0);

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: 680, maxWidth: "94vw", maxHeight: "84vh" }}>
        <div className="modal-head">
          <h3>Escolher <span style={{ color: "var(--accent)" }}>fonte</span></h3>
          <button className="x" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
        </div>
        <div style={{ padding: "14px 24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="text" placeholder="Buscar fonte por nome..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: "100%", background: "var(--panel-2)", border: "1.5px solid var(--line)", borderRadius: 9, padding: "11px 14px", fontFamily: "inherit", fontSize: 13, color: "var(--ink)", outline: "none" }} />
          <div className="fp-cats" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Todas", ...Object.keys(FONT_CATALOG)].map((c) => (
              <button key={c} className={"fp-cat " + (cat === c ? "on" : "")} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="modal-body" id="fpList" style={{ padding: "6px 8px 12px" }}>
          {empty ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-faint)", fontSize: 13 }}>Nenhuma fonte encontrada para &quot;<b>{query}</b>&quot;</div>
          ) : (
            groups.map((g) => g.fonts.length === 0 ? null : (
              <div key={g.section} className="fp-section">
                <div className="fp-section-h">{g.section}</div>
                <div className="fp-fonts">
                  {g.fonts.map((f) => (
                    <button key={f} className={"fp-font " + (selected === f ? "sel" : "")} onClick={() => setSelected(f)} onDoubleClick={() => { onPick(f); onClose(); }}>
                      <div className="fp-font-name">{f}</div>
                      <div className="fp-font-prev" style={{ fontFamily: `'${f}',sans-serif` }}>Aa · Rótulo do Produto · 0123</div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { onPick(selected); onClose(); }}>Aplicar fonte</button>
        </div>
      </div>
    </div>
  );
}
