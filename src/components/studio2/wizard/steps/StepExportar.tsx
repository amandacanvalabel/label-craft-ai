"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudioStore } from "../../store/useStudioStore";
import { stepIdx } from "../../data/steps";
import { getMaterialLabel, isMaterialComplete } from "../../data/materials";
import { exportPDF } from "../../export/pdf";
import { exportPNG } from "../../export/png";
import { toast } from "../../ui/Toast";
import { useCanExport } from "../../hooks/useCanExport";
import Svg from "../../ui/Svg";
import PreviewModal from "../../editor/PreviewModal";

// Porte de RENDER.exportar — exportação final.
export default function StepExportar() {
  const go = useStudioStore((s) => s.go);
  const router = useRouter();
  const canExport = useCanExport();
  const [busy, setBusy] = useState<"" | "pdf" | "png">("");
  const [preview, setPreview] = useState(false);

  const L = useStudioStore((s) => s.editor.label);
  const material = useStudioStore((s) => s.material);
  const facesMap = useStudioStore((s) => s.editor.faces);
  const faces = Object.keys(facesMap || {});
  const matComplete = isMaterialComplete(material);

  const locked = canExport === false; // plano grátis / sem plano
  const loading = canExport === null; // ainda verificando o plano

  const goUpgrade = () => router.push("/dashboard/meu-plano");

  const doPDF = async () => {
    if (locked) { goUpgrade(); return; }
    setBusy("pdf");
    try { const f = await exportPDF(useStudioStore.getState()); toast(`PDF gerado: ${f}`); }
    catch (e) { toast("Erro no PDF: " + (e as Error).message); }
    finally { setBusy(""); }
  };
  const doPNG = async () => {
    if (locked) { goUpgrade(); return; }
    setBusy("png");
    try { const f = await exportPNG(useStudioStore.getState()); toast(`PNG salvo: ${f}`); }
    catch (e) { toast("Erro no PNG: " + (e as Error).message); }
    finally { setBusy(""); }
  };

  return (
    <div className="screen">
      <div className="eyebrow">Passo 13 · Produção</div>
      <h1 className="scr">Exportar seu <span className="hl">rótulo</span></h1>
      <p className="scr-sub">Gere o PDF técnico pronto para a gráfica (tamanho real, sangria e marcas de corte) ou um PNG de alta resolução para uso digital.</p>

      <div className="ex-summary">
        <div className="ex-row"><span>Dimensões</span><b>{L.w} × {L.h} mm</b></div>
        <div className="ex-row"><span>Faces</span><b>{faces.join(", ") || "—"}</b></div>
        <div className="ex-row"><span>Material</span><b>{getMaterialLabel(material)}</b></div>
        <div className="ex-row"><span>Resolução</span><b>300 DPI</b></div>
      </div>

      {!matComplete && (
        <div className="note warn" style={{ marginTop: 16 }}>
          <Svg paths='<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>' sw={2.2} />
          <p>O material ainda não está completo. Você pode exportar mesmo assim, mas recomendamos definir o material em &quot;Material&quot; para a ficha técnica ficar correta.</p>
        </div>
      )}

      {locked && (
        <div className="note warn" style={{ marginTop: 16 }}>
          <Svg paths='<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>' sw={2.2} />
          <p><b>Exportação disponível nos planos pagos.</b> No plano gratuito você pode criar e visualizar seus rótulos, mas o download do PDF/PNG é liberado ao assinar um plano.</p>
        </div>
      )}

      <div className="ex-cards" style={{ display: "flex", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {locked ? (
          <button className="btn btn-primary" onClick={goUpgrade}>
            <Svg paths='<path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 17l-6.3 4.4L8 14 2 9.4h7.6z"/>' sw={2.2} />
            Fazer upgrade para exportar
          </button>
        ) : (
          <>
            <button className="btn btn-primary" disabled={!!busy || loading} onClick={doPDF}>
              <Svg paths='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>' sw={2.2} />
              {busy === "pdf" ? "Gerando PDF…" : loading ? "Verificando…" : "Baixar PDF técnico"}
            </button>
            <button className="btn btn-ghost" disabled={!!busy || loading} onClick={doPNG}>
              <Svg paths='<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>' sw={2.2} />
              {busy === "png" ? "Gerando PNG…" : loading ? "Verificando…" : "Baixar PNG (face atual)"}
            </button>
          </>
        )}
        <button className="btn btn-ghost" onClick={() => setPreview(true)}>
          <Svg paths='<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>' sw={2.2} />
          Ver preview
        </button>
      </div>

      <div className="step-nav" style={{ marginTop: 28 }}>
        <button className="btn btn-ghost" onClick={() => go(stepIdx("acabamentos"))}>
          <Svg paths='<path d="M19 12H5M12 19l-7-7 7-7"/>' sw={2.2} />Voltar — Acabamentos
        </button>
        <button className="btn btn-ghost" onClick={() => go(stepIdx("editor"))}>Voltar ao editor</button>
      </div>

      {preview && <PreviewModal onClose={() => setPreview(false)} />}
    </div>
  );
}
