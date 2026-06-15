"use client";

import { useState } from "react";
import { useStudioStore } from "../store/useStudioStore";
import { fetchAiBrief } from "../generate/aiBrief";
import { toast } from "../ui/Toast";

// Refazer com IA: reabre o briefing (prompt) e regenera o layout do rótulo com
// IA real, mantendo tudo editável. A regeneração substitui o layout atual, mas
// é desfazível (Ctrl+Z) — empilhamos no histórico após aplicar.
export default function RefazerModal({ onClose }: { onClose: () => void }) {
  const initialPrompt = useStudioStore.getState().ai.prompt || "";
  const [prompt, setPrompt] = useState(initialPrompt);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const p = prompt.trim();
    if (!p) {
      toast("Descreva o estilo que você quer para a IA refazer.");
      return;
    }
    setBusy(true);
    const st = useStudioStore.getState();
    // Atualiza o prompt no state para o motor usá-lo.
    st.patch("ai", { prompt: p });

    // IA real → briefing (template + paleta). Null = sem chave/erro: cai no
    // parsing heurístico, então a regeneração funciona de qualquer forma.
    const brief = await fetchAiBrief(useStudioStore.getState());
    if (brief) useStudioStore.getState().patch("ai", { brief });

    // Regenera variações e aplica a recomendação (variação 0).
    useStudioStore.getState().generateVariationsNow();
    useStudioStore.getState().applyVariation(0);
    // Torna a regeneração desfazível.
    useStudioStore.getState().pushHistory();

    setBusy(false);
    toast(brief ? "Layout refeito com IA ✦" : "Layout refeito (IA indisponível — usei o motor padrão)");
    onClose();
  };

  return (
    <div className="modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2L12 8l6.5.5-5 4 1.5 6.5L9.5 15 4 19l1.5-6.5-5-4L7 8z" /></svg>
          <h3>Refazer com IA</h3>
          <button className="x" onClick={() => !busy && onClose()}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
        </div>
        <div className="modal-body">
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--ink-dim)", marginBottom: 8 }}>
            Descreva o estilo do rótulo
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={busy}
            rows={4}
            placeholder="Ex.: sérum facial natural e sofisticado, tons de verde-musgo e dourado, ar de farmácia premium"
            style={{ width: "100%", resize: "vertical", padding: "12px 14px", borderRadius: 11, fontSize: 14, lineHeight: 1.5 }}
            autoFocus
          />
          <p style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 12, lineHeight: 1.5 }}>
            A IA vai escolher um novo template e paleta a partir da sua descrição e montar um rótulo <b>editável</b>. O layout atual será substituído — você pode desfazer com <b>Ctrl+Z</b>.
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => !busy && onClose()} disabled={busy}>Cancelar</button>
          <button className="btn btn-primary" onClick={run} disabled={busy}>
            {busy ? "Refazendo…" : "Refazer com IA"}
          </button>
        </div>
      </div>
    </div>
  );
}
