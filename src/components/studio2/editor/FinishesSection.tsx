"use client";

import { useStudioStore } from "../store/useStudioStore";
import type { El } from "../types";
import { getAvailableFinishes, getMaterialLabel } from "../data/materials";
import { HOT_STAMPING_COLORS } from "../data/hotStamping";
import Svg from "../ui/Svg";

// Porte de renderFinishesSection + bindFinishesUI (seção "Acabamentos especiais").
export default function FinishesSection({ el }: { el: El }) {
  const material = useStudioStore((s) => s.material);
  const finishes = useStudioStore((s) => s.finishes);
  const setFinish = useStudioStore((s) => s.setFinish);

  const avail = getAvailableFinishes(material);
  const f = finishes[el.id] || {};
  const matStr = material && material.family ? getMaterialLabel(material) : 'Não definido (escolha em "Material")';

  return (
    <div className="pgroup fin-pgroup">
      <div className="pgroup-h">
        <Svg paths='<path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/>' sw={2} />
        Acabamentos especiais
      </div>
      <div className="fin-mat-note">Material: <b>{matStr}</b></div>

      {avail.verniz ? (
        <label className={"fin-row " + (f.verniz ? "on" : "")}>
          <input type="checkbox" checked={!!f.verniz} onChange={(e) => setFinish(el.id, "verniz", e.target.checked || null)} />
          <div className="fin-info">
            <div className="fin-name"><span className="fin-swatch fin-sw-verniz" title="Verniz" />Verniz localizado</div>
            <div className="fin-desc">Brilho concentrado sobre o elemento. Efeito &quot;molhado&quot;.</div>
          </div>
        </label>
      ) : (
        <div className="fin-row disabled"><div className="fin-info"><div className="fin-name">Verniz localizado</div><div className="fin-desc fin-incompat">Não disponível para o material escolhido.</div></div></div>
      )}

      {avail.hotstamp ? (
        <>
          <label className={"fin-row " + (f.hotstamp ? "on" : "")}>
            <input type="checkbox" checked={!!f.hotstamp} onChange={(e) => setFinish(el.id, "hotstamp", e.target.checked ? "silver" : null)} />
            <div className="fin-info">
              <div className="fin-name"><span className={"fin-swatch fin-sw-" + (f.hotstamp || "silver")} />Hot stamping</div>
              <div className="fin-desc">Camada metálica aplicada a quente. Visual premium.</div>
            </div>
          </label>
          {f.hotstamp && (
            <div className="fin-color-row">
              {Object.entries(HOT_STAMPING_COLORS).map(([k, c]) => (
                <button key={k} className={"fin-color-opt " + (f.hotstamp === k ? "on" : "")} title={c.name} onClick={() => setFinish(el.id, "hotstamp", k)}>
                  <span className={"fin-color-swatch fin-sw-" + k} />
                  <span className="fin-color-name">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="fin-row disabled"><div className="fin-info"><div className="fin-name">Hot stamping</div><div className="fin-desc fin-incompat">Não disponível para o material escolhido ({matStr}).</div></div></div>
      )}

      {avail.baixoRelevo ? (
        <label className={"fin-row " + (f.baixoRelevo ? "on" : "")}>
          <input type="checkbox" checked={!!f.baixoRelevo} onChange={(e) => setFinish(el.id, "baixoRelevo", e.target.checked || null)} />
          <div className="fin-info">
            <div className="fin-name"><span className="fin-swatch fin-sw-bxr" title="Baixo relevo" />Baixo relevo</div>
            <div className="fin-desc">Afundamento tátil na superfície. Premium e discreto.</div>
          </div>
        </label>
      ) : (
        <div className="fin-row disabled"><div className="fin-info"><div className="fin-name">Baixo relevo</div><div className="fin-desc fin-incompat">Não disponível para o material escolhido.</div></div></div>
      )}

      {(!material || !material.family) && (
        <div className="fin-warning">
          <Svg paths='<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h0"/>' sw={2.3} width={11} height={11} />
          <span>Você ainda não escolheu o <b>material</b>. Algumas combinações de acabamento podem não ser viáveis.</span>
        </div>
      )}
    </div>
  );
}
