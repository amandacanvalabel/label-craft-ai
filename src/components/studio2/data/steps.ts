// Wizard: 13 etapas agrupadas em 5 fases. Porte de STEPS/STEP_GROUPS do editor original.

export interface Step {
  id: StepId;
  label: string;
}

export type StepId =
  | "produto"
  | "rotulo"
  | "verso"
  | "selos"
  | "frente"
  | "refs"
  | "resumo"
  | "gerando"
  | "variacoes"
  | "editor"
  | "material"
  | "acabamentos"
  | "exportar";

export const STEPS: Step[] = [
  { id: "produto", label: "Produto" },
  { id: "rotulo", label: "Rótulo" },
  { id: "verso", label: "Verso" },
  { id: "selos", label: "Selos" },
  { id: "frente", label: "Frente" },
  { id: "refs", label: "Referências" },
  { id: "resumo", label: "Revisão" },
  { id: "gerando", label: "Gerando" },
  { id: "variacoes", label: "Escolher" },
  { id: "editor", label: "Editor" },
  { id: "material", label: "Material" },
  { id: "acabamentos", label: "Acabamentos" },
  { id: "exportar", label: "Exportar" },
];

export interface StepGroup {
  id: string;
  label: string;
  sub: string;
  stepIds: StepId[];
}

export const STEP_GROUPS: StepGroup[] = [
  { id: "briefing", label: "Briefing", sub: "Produto e formato", stepIds: ["produto", "rotulo", "verso"] },
  { id: "conteudo", label: "Conteúdo", sub: "Informações do rótulo", stepIds: ["selos", "frente", "refs"] },
  { id: "geracao", label: "Geração", sub: "IA cria seu rótulo", stepIds: ["resumo", "gerando", "variacoes"] },
  { id: "edicao", label: "Edição", sub: "Ajustes finais", stepIds: ["editor"] },
  { id: "producao", label: "Produção", sub: "Material e exportação", stepIds: ["material", "acabamentos", "exportar"] },
];

export function stepIdx(id: StepId): number {
  return STEPS.findIndex((s) => s.id === id);
}

export function groupForStep(stepIndex: number): number {
  const id = STEPS[stepIndex]?.id;
  return STEP_GROUPS.findIndex((g) => g.stepIds.includes(id));
}

export function stepIdxInGroup(stepIndex: number): number {
  const id = STEPS[stepIndex]?.id;
  const gi = groupForStep(stepIndex);
  if (gi < 0) return 0;
  return STEP_GROUPS[gi].stepIds.indexOf(id);
}

export function hasConfigs(tipo: string | null): boolean {
  return tipo === "adesivo" || tipo === "serigrafia";
}
