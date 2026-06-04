"use client";

import { useStudioStore } from "../../store/useStudioStore";
import { stepIdx } from "../../data/steps";
import { MATERIAIS_TREE, isMaterialComplete, getMatPreviewSVG } from "../../data/materials";
import Svg from "../../ui/Svg";

function MatSvg({ family, variant, subvariant }: { family: string; variant?: string; subvariant?: string }) {
  return <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" dangerouslySetInnerHTML={{ __html: getMatPreviewSVG(family, variant, subvariant) }} />;
}

// Porte de RENDER.material — árvore de 3 níveis (família → variante → subvariante).
export default function StepMaterial() {
  const M = useStudioStore((s) => s.material);
  const setMaterial = useStudioStore((s) => s.setMaterial);
  const go = useStudioStore((s) => s.go);

  const arrow = '<path d="M9 6l6 6-6 6"/>';
  const check = '<path d="M20 6L9 17l-5-5"/>';
  const fam = M.family ? MATERIAIS_TREE[M.family] : null;
  const variant = fam && M.variant ? fam.variants[M.variant] : null;
  const level2 = fam && (!M.variant || (variant && !variant.subvariants));
  const level3 = fam && variant && variant.subvariants && !level2;

  return (
    <div className="screen">
      <div className="eyebrow">Passo 11 · Produção</div>
      <h1 className="scr">Em qual <span className="hl">material</span> seu rótulo será impresso?</h1>
      <p className="scr-sub">Cada material tem visual, durabilidade e custos diferentes. A escolha define quais acabamentos especiais ficam disponíveis na próxima etapa.</p>

      {fam && (
        <div className="mat-trail">
          <button className="mat-trail-item active" onClick={() => setMaterial({ family: null, variant: null, subvariant: null })}>{fam.name}</button>
          {variant && (
            <>
              <span className="mat-trail-sep">›</span>
              <button className="mat-trail-item active" onClick={() => setMaterial({ variant: null, subvariant: null })}>{variant.name}</button>
              {M.subvariant && variant.subvariants && (
                <>
                  <span className="mat-trail-sep">›</span>
                  <span className="mat-trail-item current">{variant.subvariants[M.subvariant].name}</span>
                </>
              )}
            </>
          )}
        </div>
      )}

      {!fam && (
        <div className="mat-grid">
          {Object.entries(MATERIAIS_TREE).map(([key, f]) => (
            <button key={key} className="mat-card" onClick={() => setMaterial({ family: key, variant: null, subvariant: null })}>
              <div className={"mat-swatch mat-swatch-" + key}><MatSvg family={key} /></div>
              <div className="mat-card-body"><div className="mat-name">{f.name}</div><div className="mat-desc">{f.desc}</div></div>
              <div className="mat-arrow"><Svg paths={arrow} sw={2.4} /></div>
            </button>
          ))}
        </div>
      )}

      {level2 && fam && (
        <div className="mat-section">
          <div className="mat-section-h">{fam.name} — escolha a variante</div>
          <div className="mat-grid">
            {Object.entries(fam.variants).map(([vkey, v]) => {
              const sel = M.variant === vkey;
              const hasSubs = !!v.subvariants;
              return (
                <button key={vkey} className={"mat-card " + (sel ? "sel" : "")} onClick={() => setMaterial({ variant: vkey, subvariant: null })}>
                  <div className={"mat-swatch mat-swatch-" + M.family + "-" + vkey}><MatSvg family={M.family!} variant={vkey} /></div>
                  <div className="mat-card-body"><div className="mat-name">{v.name}</div><div className="mat-desc">{v.desc}</div></div>
                  {hasSubs ? <div className="mat-arrow"><Svg paths={arrow} sw={2.4} /></div> : <div className="mat-check">{sel && <Svg paths={check} sw={3} />}</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {level3 && fam && variant?.subvariants && (
        <div className="mat-section">
          <div className="mat-section-h">{fam.name} {variant.name} — escolha o acabamento de superfície</div>
          <div className="mat-grid">
            {Object.entries(variant.subvariants).map(([svkey, sv]) => {
              const sel = M.subvariant === svkey;
              return (
                <button key={svkey} className={"mat-card " + (sel ? "sel" : "")} onClick={() => setMaterial({ subvariant: svkey })}>
                  <div className={"mat-swatch mat-swatch-" + M.family + "-" + M.variant + "-" + svkey}><MatSvg family={M.family!} variant={M.variant!} subvariant={svkey} /></div>
                  <div className="mat-card-body"><div className="mat-name">{sv.name}</div><div className="mat-desc">{sv.desc}</div></div>
                  <div className="mat-check">{sel && <Svg paths={check} sw={3} />}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="step-nav">
        <button className="btn btn-ghost" onClick={() => go(stepIdx("editor"))}>
          <Svg paths='<path d="M19 12H5M12 19l-7-7 7-7"/>' sw={2.2} />Voltar ao editor
        </button>
        <button className="btn btn-primary" disabled={!isMaterialComplete(M)} onClick={() => isMaterialComplete(M) && go(stepIdx("acabamentos"))}>
          Avançar — Acabamentos
          <Svg paths='<path d="M5 12h14M12 5l7 7-7 7"/>' sw={2.2} />
        </button>
      </div>
    </div>
  );
}
