"use client";

import { useState } from "react";
import type { AnalysisResult } from "../../types";
import { STYLE_AXES, mergeVectors, parsePrompt } from "../../generate/style";
import { visualAnalysisToVector } from "../../generate/analyze";
import Svg from "../../ui/Svg";

const AXIS_LABEL = (ax: string, val: number): string => {
  const map: Record<string, [string, string]> = {
    formal: ["casual", "formal"],
    denso: ["arejado", "denso"],
    quente: ["frio", "quente"],
    retro: ["moderno", "vintage"],
    ornamental: ["minimalista", "ornamentado"],
    feminino: ["neutro", "feminino"],
    luxo: ["popular", "premium"],
    vibrante: ["sóbrio", "vibrante"],
    natural: ["industrial", "natural"],
    sofisticado: ["despojado", "sofisticado"],
  };
  const pair = map[ax];
  if (!pair) return ax;
  return val < 0.5 ? pair[0] : pair[1];
};

// Porte de renderAnalysisCard — "O que a IA captou".
export default function AnalysisCard({ analysis, prompt, onRecalc }: { analysis: AnalysisResult; prompt: string; onRecalc: () => Promise<void> }) {
  const [recalcLabel, setRecalcLabel] = useState("↻ Recalcular");
  const a = analysis;
  const briefingVec = mergeVectors(parsePrompt(prompt || "").vec, visualAnalysisToVector(a), 2, 1);
  const ranked = STYLE_AXES.map((ax) => ({ axis: ax, val: briefingVec[ax], dist: Math.abs(briefingVec[ax] - 0.5) }))
    .sort((x, y) => y.dist - x.dist)
    .slice(0, 5);

  const warmth = a.warmth ?? 0.5;
  const saturation = a.saturation ?? 0.5;
  const density = a.density ?? 0.5;

  const handleRecalc = async () => {
    setRecalcLabel("↻ Analisando…");
    await onRecalc();
    setRecalcLabel("↻ Recalcular");
  };

  return (
    <div className="analysis-card" id="analysisCard">
      <div className="ac-head">
        <Svg paths='<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 10v6M3.51 9l5.19 3M15.31 12l5.19 3M3.51 15l5.19-3M15.31 12l5.19-3"/>' sw={2.4} className="" width={14} height={14} />
        <span>O que a IA captou</span>
      </div>
      <div className="ac-grid">
        <div className="ac-block">
          <div className="ac-label">Paleta dominante</div>
          <div className="ac-swatches">
            {a.palette.map((c, i) => (
              <div key={i} className="ac-sw" style={{ background: c }} title={c.toUpperCase()} />
            ))}
          </div>
        </div>
        <div className="ac-block">
          <div className="ac-label">Atmosfera detectada</div>
          <div className="ac-meter"><div className="ac-meter-fill" style={{ left: `${(1 - warmth) * 100}%`, width: `${Math.abs(warmth - 0.5) * 100}%` }} /></div>
          <div className="ac-meter-labels"><span>frio</span><span>quente</span></div>
        </div>
        <div className="ac-block">
          <div className="ac-label">Saturação</div>
          <div className="ac-meter"><div className="ac-meter-fill" style={{ left: "50%", width: `${(saturation - 0.5) * 100}%` }} /></div>
          <div className="ac-meter-labels"><span>muted</span><span>vibrante</span></div>
        </div>
        <div className="ac-block">
          <div className="ac-label">Densidade visual</div>
          <div className="ac-meter"><div className="ac-meter-fill" style={{ left: "50%", width: `${(density - 0.5) * 100}%` }} /></div>
          <div className="ac-meter-labels"><span>arejado</span><span>denso</span></div>
        </div>
      </div>
      <div className="ac-tags">
        {ranked.length > 0 && <span className="ac-tags-label">Briefing entendido:</span>}
        {ranked.map((r) => (
          <span key={r.axis} className="ac-tag" data-strength={r.dist > 0.2 ? "strong" : "soft"}>
            {AXIS_LABEL(r.axis, r.val)}
          </span>
        ))}
        <button className="pe-action" style={{ marginLeft: "auto" }} onClick={handleRecalc}>
          {recalcLabel}
        </button>
      </div>
    </div>
  );
}
