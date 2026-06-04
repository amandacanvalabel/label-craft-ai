"use client";

import { useStudioStore } from "../../store/useStudioStore";
import { stepIdx } from "../../data/steps";
import { getMaterialLabel, isMaterialComplete } from "../../data/materials";
import { HOT_STAMPING_COLORS } from "../../data/hotStamping";
import type { El } from "../../types";
import Svg from "../../ui/Svg";

// Porte de RENDER.acabamentos — revisão dos acabamentos por camada.
export default function StepAcabamentos() {
  const editor = useStudioStore((s) => s.editor);
  const finishes = useStudioStore((s) => s.finishes);
  const material = useStudioStore((s) => s.material);
  const go = useStudioStore((s) => s.go);

  const matStr = material.family ? getMaterialLabel(material) : "Não escolhido";
  const matComplete = isMaterialComplete(material);

  // Agrupa por tipo de acabamento
  const groups: { key: string; name: string; items: { face: string; el: El }[] }[] = [
    { key: "hotstamp_silver", name: "Hot Stamping Prata", items: [] },
    { key: "hotstamp_gold", name: "Hot Stamping Ouro", items: [] },
    { key: "hotstamp_copper", name: "Hot Stamping Cobre", items: [] },
    { key: "hotstamp_holografico", name: "Hot Stamping Holográfico", items: [] },
    { key: "verniz", name: "Verniz Localizado", items: [] },
    { key: "baixoRelevo", name: "Baixo Relevo", items: [] },
  ];
  const byKey = Object.fromEntries(groups.map((g) => [g.key, g]));
  Object.entries(editor.faces || {}).forEach(([face, els]) => {
    els.forEach((el) => {
      const f = finishes[el.id];
      if (!f) return;
      if (f.hotstamp && byKey["hotstamp_" + f.hotstamp]) byKey["hotstamp_" + f.hotstamp].items.push({ face, el });
      if (f.verniz) byKey.verniz.items.push({ face, el });
      if (f.baixoRelevo) byKey.baixoRelevo.items.push({ face, el });
    });
  });
  const active = groups.filter((g) => g.items.length > 0);

  return (
    <div className="screen">
      <div className="eyebrow">Passo 12 · Produção</div>
      <h1 className="scr">Revisão de <span className="hl">acabamentos</span></h1>
      <p className="scr-sub">Confira os acabamentos especiais aplicados. Para alterar, volte ao editor e selecione um elemento — a seção &quot;Acabamentos especiais&quot; aparece no painel direito.</p>

      <div className="ac-material-box">
        <div className="ac-mb-label">Material escolhido</div>
        <div className="ac-mb-name">{matStr}</div>
        {!matComplete && <div className="ac-mb-warn">⚠ Material incompleto — defina antes de exportar.</div>}
      </div>

      {active.length === 0 ? (
        <div className="note" style={{ marginTop: 18 }}>
          <Svg paths='<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>' sw={2.2} />
          <p>Nenhum acabamento especial aplicado. Isso é opcional — você pode exportar assim mesmo, ou voltar ao editor e aplicar verniz, hot stamping ou baixo relevo a elementos específicos.</p>
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          {active.map((g) => {
            const hs = g.key.startsWith("hotstamp_") ? g.key.replace("hotstamp_", "") : null;
            return (
              <div key={g.key} className="ac-group">
                <div className="ac-group-h">
                  <span className={"ac-swatch " + (hs ? "fin-sw-" + hs : g.key === "verniz" ? "fin-sw-verniz" : "fin-sw-bxr")} style={hs ? { background: HOT_STAMPING_COLORS[hs]?.css } : undefined} />
                  {g.name} <span className="ac-count">{g.items.length}</span>
                </div>
                <div className="ac-items">
                  {g.items.map(({ face, el }, i) => (
                    <span key={i} className="pill accent">{el.name} · {face}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="step-nav">
        <button className="btn btn-ghost" onClick={() => go(stepIdx("material"))}>
          <Svg paths='<path d="M19 12H5M12 19l-7-7 7-7"/>' sw={2.2} />Voltar — Material
        </button>
        <button className="btn btn-primary" onClick={() => go(stepIdx("exportar"))}>
          Avançar — Exportar
          <Svg paths='<path d="M5 12h14M12 5l7 7-7 7"/>' sw={2.2} />
        </button>
      </div>
    </div>
  );
}
