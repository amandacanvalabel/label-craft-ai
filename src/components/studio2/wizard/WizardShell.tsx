"use client";

import { useStudioStore, validateStep } from "../store/useStudioStore";
import {
  STEPS,
  STEP_GROUPS,
  groupForStep,
  stepIdx,
  stepIdxInGroup,
} from "../data/steps";
import { toast } from "../ui/Toast";
import Stepper from "./Stepper";
import StepScreen from "./StepScreen";
import ThemeToggle from "../ui/ThemeToggle";
import BrandMark from "../ui/BrandMark";

// Porte de #app + wz-head/wz-body/wz-foot/foot-meta.
export default function WizardShell() {
  const cur = useStudioStore((s) => s.cur);
  const go = useStudioStore((s) => s.go);
  const state = useStudioStore((s) => s);

  const id = STEPS[cur].id;
  const gi = groupForStep(cur);
  const groupLabel = gi >= 0 ? STEP_GROUPS[gi].label : "";
  const inGroup = stepIdxInGroup(cur);
  const groupTotal = gi >= 0 ? STEP_GROUPS[gi].stepIds.length : 1;
  const subtitle = groupTotal > 1 ? `${STEPS[cur].label} · ${inGroup + 1}/${groupTotal}` : STEPS[cur].label;
  const footMeta = `Fase ${gi + 1} · ${groupLabel} · ${subtitle} · CanvaLabel`;

  // Etapas com navegação própria não mostram o rodapé padrão.
  const ownNav = id === "gerando" || id === "material" || id === "acabamentos" || id === "exportar" || id === "editor";
  const v = validateStep(id, state);
  const canBack = cur > 0;

  const editorAlreadyExists =
    state.edReady && Object.values(state.editor.faces || {}).some((f) => f.length > 0);

  let nextLabel = "Continuar";
  let nextAction = () => {
    const vv = validateStep(id, state);
    if (!vv.ok) {
      toast(vv.msg || "Preencha os campos obrigatórios");
      return;
    }
    go(cur + 1);
  };
  if (id === "resumo") {
    if (editorAlreadyExists) {
      nextLabel = "Voltar ao editor (sem regenerar)";
      nextAction = () => go(stepIdx("editor"));
    } else {
      nextLabel = "Gerar rótulo com IA";
    }
  }

  const onBack = () => {
    let prev = cur - 1;
    if (prev >= 0 && STEPS[prev].id === "gerando") prev--;
    if (prev >= 0 && STEPS[prev].id === "variacoes") prev--;
    go(prev);
  };

  return (
    <>
      <div id="app">
        <div className="wz-head">
          <BrandMark withLabel id="brandHome" />
          <Stepper />
          <ThemeToggle id="themeToggleWiz" />
        </div>
        <div className="wz-body" id="body">
          <div id="screen">
            <StepScreen stepId={id} />
          </div>
        </div>
      </div>

      {!ownNav && (
        <div className="wz-foot" id="foot">
          {editorAlreadyExists &&
            ["produto", "rotulo", "verso", "selos", "frente", "refs", "resumo"].includes(id) && (
              <div className="edit-banner">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h0" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <span>
                  Você já gerou o rótulo. As alterações aqui <b>não regeneram</b> automaticamente — para aplicar mudanças no design, volte ao editor.
                </span>
                <button className="edit-banner-go" onClick={() => go(stepIdx("editor"))}>
                  Voltar ao editor
                </button>
              </div>
            )}
          <div className="foot-buttons">
            <button className="btn btn-ghost" id="bBack" disabled={!canBack} onClick={onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <button className="btn btn-primary" id="bNext" disabled={!v.ok} onClick={nextAction}>
              {nextLabel}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="foot-meta" id="footMeta">
        {footMeta}
      </div>
    </>
  );
}
