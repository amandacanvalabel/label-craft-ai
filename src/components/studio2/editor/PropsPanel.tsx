"use client";

import type { ReactNode } from "react";
import { useStudioStore, selIds } from "../store/useStudioStore";
import type { El } from "../types";
import { PALETTE, SHAPE_LIB } from "../data/svgLibs";
import { pickFile } from "../hooks/useFilePicker";
import { renderCurvePreview } from "./curvePreview";
import FinishesSection from "./FinishesSection";

const WEIGHTS = [300, 400, 500, 600, 700, 800];
const CURVES = [
  { id: "arcUp", name: "Arco superior" },
  { id: "arcDown", name: "Arco inferior" },
  { id: "circle", name: "Círculo" },
  { id: "wave", name: "Onda" },
  { id: "zigzag", name: "Zigue-zague" },
];

// Porte de edRenderProps / edRenderMultiProps.
export default function PropsPanel({ onOpenFontPicker, onChangeShape }: { onOpenFontPicker: (el: El) => void; onChangeShape: (el: El) => void }) {
  const editor = useStudioStore((s) => s.editor);
  const edUpdateEl = useStudioStore((s) => s.edUpdateEl);
  const edUpdateLabel = useStudioStore((s) => s.edUpdateLabel);
  const edDuplicate = useStudioStore((s) => s.edDuplicate);
  const edDelete = useStudioStore((s) => s.edDelete);
  const edAlignMulti = useStudioStore((s) => s.edAlignMulti);

  const ids = selIds(editor);
  const els = editor.faces[editor.face] || [];

  // ---- helpers de UI (funções, não componentes — preservam foco) ----
  const num = (label: string, value: number, onCommit: (v: number) => void, unit = "", step = 1): ReactNode => (
    <div className="pfield" key={label}>
      <label>{label}</label>
      <div className="inp-unit">
        <input className="pinp" type="number" defaultValue={value} step={step} onBlur={(e) => onCommit(parseFloat(e.target.value) || 0)} onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }} />
        <span className="u">{unit}</span>
      </div>
    </div>
  );

  const color = (label: string, value: string | undefined, onPick: (hex: string) => void): ReactNode => {
    const hex = (value || "#000000").slice(0, 7);
    return (
      <div className="pfield" key={label}>
        <label>{label}</label>
        <div className="color-field">
          <input type="color" value={hex} onChange={(e) => onPick(e.target.value)} />
          <input type="text" defaultValue={hex.toUpperCase()} onBlur={(e) => { let v = e.target.value.trim(); if (!v.startsWith("#")) v = "#" + v; if (/^#[0-9a-fA-F]{6}$/.test(v)) onPick(v); }} />
        </div>
      </div>
    );
  };

  const swatches = (onPick: (c: string) => void): ReactNode => (
    <div className="swatches">
      {PALETTE.map((c) => <div key={c} className="swatch" style={{ background: c }} onClick={() => onPick(c)} />)}
    </div>
  );

  const slider = (label: string, value: number, min: number, max: number, step: number, fmt: (v: number) => string, onInput: (v: number) => void): ReactNode => (
    <div className="pfield" key={label}>
      <label>{label}</label>
      <div className="slider-row">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onInput(parseFloat(e.target.value))} />
        <span className="sval">{fmt(value)}</span>
      </div>
    </div>
  );

  // ===== Sem seleção: propriedades do documento =====
  if (ids.length === 0) {
    const L = editor.label;
    return (
      <div className="panel-body" id="panelProps">
        <div className="ed-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 3l14 7-6 2-2 6z" /></svg>
          <div>Selecione um elemento no rótulo para editar suas propriedades.</div>
        </div>
        <div className="pgroup">
          <div className="pgroup-h">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2" /></svg>
            Documento — {editor.face}
          </div>
          <div className="prow">{num("Largura", L.w, (v) => edUpdateLabel({ w: Math.max(10, v) }), "mm")}{num("Altura", L.h, (v) => edUpdateLabel({ h: Math.max(10, v) }), "mm")}</div>
          <div className="prow">{num("Sangria", L.bleed, (v) => edUpdateLabel({ bleed: Math.max(0, v) }), "mm")}{num("Margem segura", L.safe, (v) => edUpdateLabel({ safe: Math.max(0, v) }), "mm")}</div>
          {color("Cor de fundo", L.bg, (v) => edUpdateLabel({ bg: v }))}
        </div>
      </div>
    );
  }

  // ===== Multi-seleção =====
  if (ids.length > 1) {
    const sels = els.filter((e) => ids.includes(e.id));
    const allText = sels.every((e) => e.type === "text" || e.type === "textCurve");
    const haveFill = sels.every((e) => "fill" in e && e.fill !== undefined);
    const bulk = (patch: Partial<El>) => sels.forEach((e, i) => edUpdateEl(e.id, patch, i === sels.length - 1));
    const ALIGN: { k: string; t: string; d: string }[] = [
      { k: "left", t: "Esquerda", d: "M3 3v18M7 6h10M7 12h6M7 18h12" },
      { k: "hcenter", t: "Centro H", d: "M12 3v18M6 6h12M9 12h6M5 18h14" },
      { k: "right", t: "Direita", d: "M21 3v18M7 6h10M11 12h6M5 18h12" },
      { k: "top", t: "Topo", d: "M3 3h18M6 7v10M12 7v6M18 7v12" },
      { k: "vcenter", t: "Centro V", d: "M3 12h18M6 6v12M12 9v6M18 5v14" },
      { k: "bottom", t: "Base", d: "M3 21h18M6 7v10M12 11v6M18 5v12" },
    ];
    return (
      <div className="panel-body" id="panelProps">
        <div className="multi-banner">
          <div className="mb-h">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="3" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></svg>
            <span>{sels.length} itens selecionados</span>
          </div>
          <div className="mb-sub">Edições afetam todos. Clique fora ou ESC para limpar.</div>
        </div>
        <div className="pgroup">
          <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h18M3 12h12M3 19h18" /></svg>Alinhamento</div>
          <div className="align-grid">
            {ALIGN.map((a) => (
              <button key={a.k} className="align-btn" title={a.t} onClick={() => edAlignMulti(ids, a.k)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" dangerouslySetInnerHTML={{ __html: `<path d="${a.d}"/>` }} /></button>
            ))}
          </div>
          {sels.length >= 3 && (
            <div className="distribute-row">
              <button className="align-btn" onClick={() => edAlignMulti(ids, "distH")}>Distribuir H</button>
              <button className="align-btn" onClick={() => edAlignMulti(ids, "distV")}>Distribuir V</button>
            </div>
          )}
        </div>
        {haveFill && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>Aparência</div>
            {color("Preenchimento", sels[0].fill, (v) => bulk({ fill: v }))}
            {swatches((c) => bulk({ fill: c }))}
          </div>
        )}
        {allText && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V5h16v2M9 5v14M15 19h-6" /></svg>Texto em massa</div>
            {color("Cor do texto", sels[0].color, (v) => bulk({ color: v }))}
            {swatches((c) => bulk({ color: c }))}
          </div>
        )}
        <div className="pgroup"><div className="act-row">
          <button className="act-dup" onClick={() => sels.forEach((e) => edDuplicate(e.id))}>Duplicar todos</button>
          <button className="act-del" onClick={() => { if (confirm(`Excluir ${sels.length} itens?`)) sels.forEach((e) => edDelete(e.id)); }}>Excluir todos</button>
        </div></div>
      </div>
    );
  }

  // ===== Seleção única =====
  const el = els.find((e) => e.id === ids[0]);
  if (!el) return <div className="panel-body" id="panelProps" />;
  const up = (patch: Partial<El>, commit = true) => edUpdateEl(el.id, patch, commit);

  return (
    <div className="panel-body" id="panelProps">
      <div className="props">
        {(el.type === "text" || el.type === "textCurve") && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V5h16v2M9 5v14M15 19h-6" /></svg>{el.type === "text" ? "Tipografia" : "Texto em curva"}</div>
            {el.type === "textCurve" && (
              <>
                <div className="pfield"><label>Conteúdo</label><input className="pinp" defaultValue={el.text} onBlur={(e) => up({ text: e.target.value })} /></div>
                <div className="pfield" style={{ marginTop: 9 }}><label>Curva</label>
                  <div className="curve-grid">
                    {CURVES.map((c) => (
                      <button key={c.id} className={"curve-opt " + (el.curve === c.id ? "on" : "")} onClick={() => up({ curve: c.id })}>
                        <svg viewBox="0 0 60 30" width="50" height="22" dangerouslySetInnerHTML={{ __html: renderCurvePreview(c.id) }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {slider("Intensidade da curva", el.radius || 50, 0, 100, 5, (v) => String(v), (v) => up({ radius: v }, false))}
              </>
            )}
            <div className="prow"><div className="pfield"><label>Fonte</label>
              <button className="pinp font-picker-btn" style={{ textAlign: "left", fontFamily: `'${el.font}'`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => onOpenFontPicker(el)}>
                <span>{el.font}</span>
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
              </button></div></div>
            {el.type === "text" && <div className="font-preview" style={{ fontFamily: `'${el.font}'` }}>Abc · Rótulo 123</div>}
            <div className="prow">{num("Tamanho", el.size || 12, (v) => up({ size: v }), "pt", 0.5)}
              <div className="pfield"><label>Peso</label>
                <select className="pinp" value={String(el.weight)} onChange={(e) => up({ weight: +e.target.value })}>{WEIGHTS.map((w) => <option key={w} value={w}>{w}</option>)}</select></div></div>
            {el.type === "text" && (
              <div className="prow"><div className="pfield"><label>Alinhamento</label>
                <div className="seg">
                  {(["left", "center", "right", "justify"] as const).map((a) => (
                    <button key={a} className={el.align === a ? "on" : ""} onClick={() => up({ align: a })}>{a[0].toUpperCase()}</button>
                  ))}
                </div></div>
                <div className="pfield" style={{ flex: "0 0 52px" }}><label>Estilo</label>
                  <div className="seg"><button className={el.italic ? "on" : ""} style={{ fontStyle: "italic" }} onClick={() => up({ italic: !el.italic })}>I</button></div></div>
              </div>
            )}
            {el.type === "text" && slider("Entrelinha", el.lh || 1.2, 0.8, 2.4, 0.05, (v) => v.toFixed(2), (v) => up({ lh: v }, false))}
            {slider("Espaçamento", el.ls || 0, -2, 20, 0.5, (v) => String(v), (v) => up({ ls: v }, false))}
            {color("Cor do texto", el.color, (v) => up({ color: v }))}
            {swatches((c) => up({ color: c }))}
            {el.type === "text" && <div className="pfield" style={{ marginTop: 11 }}><label>Conteúdo</label><textarea className="pinp" defaultValue={el.text} onBlur={(e) => up({ text: e.target.value, html: e.target.value })} /></div>}
          </div>
        )}

        {(el.type === "rect" || el.type === "ellipse") && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /></svg>Aparência</div>
            {color("Preenchimento", el.fill, (v) => up({ fill: v }))}
            {swatches((c) => up({ fill: c }))}
            <div style={{ height: 9 }} />
            {color("Contorno", el.stroke, (v) => up({ stroke: v }))}
            <div className="prow" style={{ marginTop: 9 }}>{num("Espessura", el.sw || 0, (v) => up({ sw: v }), "mm", 0.2)}{el.type === "rect" ? num("Cantos", el.radius || 0, (v) => up({ radius: v }), "mm", 0.5) : <div className="pfield" />}</div>
          </div>
        )}

        {el.type === "line" && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 19L19 5" /></svg>Linha</div>
            {color("Cor", el.stroke, (v) => up({ stroke: v }))}
            <div className="prow" style={{ marginTop: 9 }}>{num("Espessura", el.sw || 0, (v) => up({ sw: v }), "mm", 0.2)}<div className="pfield" /></div>
          </div>
        )}

        {el.type === "image" && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /></svg>Imagem</div>
            <div className="act-row"><button className="act-dup" onClick={() => pickFile((d) => up({ src: d }))}>{el.src ? "Substituir imagem" : "Enviar imagem"}</button></div>
          </div>
        )}

        {el.type === "barcode" && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5v14M8 5v14M11 5v14M14 5v14M17 5v14M20 5v14" /></svg>Código de barras</div>
            <div className="pfield"><label>Código EAN-13 (13 dígitos)</label><input className="pinp" defaultValue={el.code || ""} maxLength={13} onBlur={(e) => up({ code: e.target.value })} /></div>
            {color("Cor das barras", el.fg, (v) => up({ fg: v }))}
          </div>
        )}

        {el.type === "qr" && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>QR Code</div>
            <div className="pfield"><label>Conteúdo (link)</label><input className="pinp" defaultValue={el.seed || ""} placeholder="https://..." onBlur={(e) => up({ seed: e.target.value })} /></div>
            {color("Cor", el.fg, (v) => up({ fg: v }))}
          </div>
        )}

        {el.type === "shape" && (
          <div className="pgroup">
            <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,3 21,21 3,21" /></svg>Forma — {SHAPE_LIB[el.shapeKind || "heart"]?.name || "Forma"}</div>
            <div className="act-row" style={{ marginBottom: 11 }}><button className="act-dup" onClick={() => onChangeShape(el)}>Trocar forma</button></div>
            {color("Preenchimento", el.fill, (v) => up({ fill: v }))}
            {swatches((c) => up({ fill: c }))}
            {color("Borda", el.stroke, (v) => up({ stroke: v }))}
            <div className="prow" style={{ marginTop: 9 }}>{num("Espessura borda", el.sw || 0, (v) => up({ sw: v }), "mm", 0.2)}<div className="pfield" /></div>
          </div>
        )}

        {/* Posição e tamanho — todos */}
        <div className="pgroup">
          <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M3 8V5a2 2 0 0 1 2-2h3M21 16v3a2 2 0 0 1-2 2h-3" /></svg>Posição e tamanho</div>
          <div className="prow">{num("X", Math.round(el.x * 10) / 10, (v) => up({ x: v }), "mm", 0.5)}{num("Y", Math.round(el.y * 10) / 10, (v) => up({ y: v }), "mm", 0.5)}</div>
          <div className="prow">{num("Largura", Math.round(el.w * 10) / 10, (v) => up({ w: Math.max(el.type === "line" ? 5 : 5, v) }), "mm", 0.5)}{num("Altura", Math.round(el.h * 10) / 10, (v) => up({ h: Math.max(el.type === "line" ? 0.1 : 5, v) }), "mm", 0.5)}</div>
          <div className="prow">{num("Rotação", el.rot, (v) => up({ rot: v }), "°", 1)}{slider("Opacidade", el.opacity, 0, 100, 1, (v) => v + "%", (v) => up({ opacity: v }, false))}</div>
        </div>

        {/* Nome da camada */}
        <div className="pgroup">
          <div className="pgroup-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /></svg>Nome da camada</div>
          <div className="pfield"><input className="pinp" defaultValue={el.name} key={el.id + el.name} onBlur={(e) => up({ name: e.target.value.trim() || el.name })} /></div>
        </div>

        <FinishesSection el={el} />

        <div className="pgroup"><div className="act-row">
          <button className="act-dup" onClick={() => edDuplicate(el.id)}>Duplicar</button>
          <button className="act-del" onClick={() => edDelete(el.id)}>Excluir</button>
        </div></div>
      </div>
    </div>
  );
}
