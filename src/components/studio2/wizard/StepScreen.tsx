"use client";

import type { StepId } from "../data/steps";
import { STEPS, STEP_GROUPS, groupForStep, stepIdx } from "../data/steps";
import StepProduto from "./steps/StepProduto";
import StepRotulo from "./steps/StepRotulo";
import StepVerso from "./steps/StepVerso";
import StepSelos from "./steps/StepSelos";
import StepFrente from "./steps/StepFrente";
import StepRefs from "./steps/StepRefs";
import StepResumo from "./steps/StepResumo";
import StepGerando from "./steps/StepGerando";
import StepVariacoes from "./steps/StepVariacoes";
import StepMaterial from "./steps/StepMaterial";
import StepAcabamentos from "./steps/StepAcabamentos";
import StepExportar from "./steps/StepExportar";

// Roteador de telas do wizard.
export default function StepScreen({ stepId }: { stepId: StepId }) {
  switch (stepId) {
    case "produto":
      return <StepProduto />;
    case "rotulo":
      return <StepRotulo />;
    case "verso":
      return <StepVerso />;
    case "selos":
      return <StepSelos />;
    case "frente":
      return <StepFrente />;
    case "refs":
      return <StepRefs />;
    case "resumo":
      return <StepResumo />;
    case "gerando":
      return <StepGerando />;
    case "variacoes":
      return <StepVariacoes />;
    case "material":
      return <StepMaterial />;
    case "acabamentos":
      return <StepAcabamentos />;
    case "exportar":
      return <StepExportar />;
    default:
      return <StepPlaceholder stepId={stepId} />;
  }
}

function StepPlaceholder({ stepId }: { stepId: StepId }) {
  const idx = stepIdx(stepId);
  const gi = groupForStep(idx);
  const group = gi >= 0 ? STEP_GROUPS[gi] : null;
  return (
    <div className="screen">
      <div className="eyebrow">{group ? `Fase ${gi + 1} · ${group.label}` : "Etapa"}</div>
      <h1 className="scr">{STEPS[idx].label}</h1>
      <p className="scr-sub">
        Tela <code>{stepId}</code> — em construção (Fases 3 e 7).
      </p>
    </div>
  );
}
