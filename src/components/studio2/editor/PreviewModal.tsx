"use client";

import { useRef, useState } from "react";
import { useStudioStore } from "../store/useStudioStore";
import ElementView from "./ElementView";
import { toast } from "../ui/Toast";
import Svg from "../ui/Svg";

// Porte de openPreviewModal / renderPreviewStage — preview profissional + PNG.
export default function PreviewModal({ onClose }: { onClose: () => void }) {
  const editor = useStudioStore((s) => s.editor);
  const finishes = useStudioStore((s) => s.finishes);
  const preview = useStudioStore((s) => s.preview);
  const setPreview = useStudioStore((s) => s.setPreview);
  const stageRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const faces = Object.keys(editor.faces || {});
  const L = editor.label;
  const facesToShow = preview.view === "both" && faces.length >= 2 ? [faces[0], faces[1]] : [faces[0]];

  // escala para caber num slot ~360px
  const slotW = 360;
  const scale = Math.min(slotW / L.w, 460 / L.h, 4);

  const download = async () => {
    if (!stageRef.current) return;
    setBusy(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(stageRef.current, { scale: 2.5, backgroundColor: null, useCORS: true, allowTaint: true, logging: false });
      const docname = (editor.docname || "rotulo").replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();
      const filename = `canvalabel_preview_${docname}.png`;
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        toast(`PNG salvo: ${filename}`);
      }, "image/png");
    } catch (e) {
      toast("Erro ao gerar PNG: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pv-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pv-modal">
        <div className="pv-head">
          <div className="pv-h-title">
            <Svg paths='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' sw={2.2} width={18} height={18} />
            Preview do rótulo
          </div>
          <button className="pv-close" onClick={onClose}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
        </div>
        <div className="pv-body">
          <div className="pv-side">
            <div className="pv-side-h">Fundo</div>
            <div className="pv-bg-grid">
              {([["white", "Branco"], ["light", "Cinza claro"], ["dark", "Cinza escuro"], ["black", "Preto"]] as const).map(([bg, lbl]) => (
                <button key={bg} className={`pv-bg-card pv-bg-${bg}` + (preview.background === bg ? " sel" : "")} onClick={() => setPreview({ background: bg })}>{lbl}</button>
              ))}
            </div>
            <div className="pv-side-h">Vista</div>
            <div className="pv-view-grid">
              <button className={"pv-view-row" + (preview.view === "flat" ? " sel" : "")} onClick={() => setPreview({ view: "flat" })}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>Plano (frente)</button>
              <button className={"pv-view-row" + (preview.view === "curved" ? " sel" : "")} onClick={() => setPreview({ view: "curved" })}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6c4-3 12-3 16 0v12c-4 3-12 3-16 0z" /><path d="M4 6c4 3 12 3 16 0" /></svg>Curvado (cilindro)</button>
              {faces.length >= 2 && (
                <button className={"pv-view-row" + (preview.view === "both" ? " sel" : "")} onClick={() => setPreview({ view: "both" })}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="8" height="14" rx="1" /><rect x="13" y="5" width="8" height="14" rx="1" /></svg>Frente + Verso</button>
              )}
            </div>
            <div className="pv-toggle">
              <div>
                <div className="pv-toggle-label">Mostrar acabamentos</div>
                <div className="pv-toggle-sub">Efeitos visuais de verniz e foil</div>
              </div>
              <div className={"pv-switch" + (preview.showFinishes ? " on" : "")} onClick={() => setPreview({ showFinishes: !preview.showFinishes })} />
            </div>
          </div>

          <div className={"pv-stage bg-" + preview.background} id="pvStage" ref={stageRef}>
            {faces.length === 0 ? (
              <div style={{ color: "#888", fontSize: 13 }}>Crie um rótulo no editor primeiro.</div>
            ) : (
              <div className="pv-label-wrap">
                {facesToShow.map((faceId, idx) => (
                  <div key={faceId} style={{ position: "relative" }}>
                    <div className={"studio2 theme-light " + (preview.view === "curved" ? "pv-label-curved" : "pv-label-shadow")} style={{ position: "relative", width: L.w * scale, height: L.h * scale, background: L.bg || "#fff", overflow: "hidden" }}>
                      {(editor.faces[faceId] || []).map((el) => (
                        <ElementView key={el.id} el={el} ppm={scale} selected={false} finish={preview.showFinishes ? finishes[el.id] : undefined} />
                      ))}
                    </div>
                    {facesToShow.length > 1 && <div className="pv-face-label">{idx === 0 ? "Frente" : "Verso"}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="pv-foot">
          <div className="pv-info">Os efeitos visuais simulam o resultado final. Aprove com prova física antes da impressão.</div>
          <div className="pv-actions">
            <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
            <button className="btn btn-primary" onClick={download} disabled={busy}>
              <Svg paths='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>' sw={2.4} width={14} height={14} />
              {busy ? "Gerando..." : "Baixar PNG"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
