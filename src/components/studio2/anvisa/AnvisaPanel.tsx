"use client";

import { useStudioStore } from "../store/useStudioStore";
import { stepIdx } from "../data/steps";
import { toast } from "../ui/Toast";
import { runAnvisaChecks, type Issue, type IssueAction } from "./checks";
import Svg from "../ui/Svg";

const STEP_MAP: Record<number, string> = { 1: "produto", 2: "rotulo", 3: "verso", 4: "verso", 5: "selos", 6: "frente", 7: "refs" };

// Porte de #anvisaPanel + anvisaRender + anvisaExecuteAction.
export default function AnvisaPanel({ onClose }: { onClose: () => void }) {
  const state = useStudioStore((s) => s);
  const go = useStudioStore((s) => s.go);
  const edSetFace = useStudioStore((s) => s.edSetFace);
  const edSelect = useStudioStore((s) => s.edSelect);

  const issues = runAnvisaChecks(state);
  const crit = issues.filter((i) => i.level === "crit");
  const warn = issues.filter((i) => i.level === "warn");
  const info = issues.filter((i) => i.level === "info");

  const exec = (action: IssueAction) => {
    if (action.kind === "wizard") {
      const targetIdx = stepIdx((STEP_MAP[action.step] || "verso") as never);
      if (targetIdx < 0) return;
      onClose();
      toast("Voltando para a etapa...");
      setTimeout(() => go(targetIdx), 200);
    } else if (action.kind === "select") {
      const faces = Object.entries(state.editor.faces || {});
      for (const [face, els] of faces) {
        const found = els.find((e) => e.id === action.id);
        if (found) {
          if (state.editor.face !== face) edSetFace(face);
          edSelect(found.id);
          toast("Elemento selecionado: " + found.name);
          return;
        }
      }
      toast("Elemento não encontrado");
    }
  };

  const summClass = crit.length > 0 ? "crit" : warn.length > 0 ? "warn" : "ok";
  const summTitle = crit.length > 0 ? `${crit.length} ${crit.length === 1 ? "pendência crítica" : "pendências críticas"}` : warn.length > 0 ? `${warn.length} ${warn.length === 1 ? "recomendação" : "recomendações"}` : "Rótulo conforme as regras básicas";
  const summSub = crit.length > 0 ? "Esses itens são obrigatórios pela ANVISA. O produto pode não ser aprovado / sofrer autuação enquanto não corrigidos." : warn.length > 0 ? "Não bloqueiam a aprovação, mas são boas práticas que evitam dúvidas em fiscalização." : "Todos os itens obrigatórios da RDC 907/2024 verificáveis automaticamente parecem presentes.";

  const ICON: Record<string, string> = {
    crit: '<path d="M18 6L6 18M6 6l12 12"/>',
    warn: '<path d="M12 9v4M12 17h0"/>',
    info: '<path d="M12 16v-4M12 8h0"/>',
  };

  const Section = ({ title, items }: { title: string; items: Issue[] }) =>
    items.length === 0 ? null : (
      <>
        <div className="anvisa-section">{title}</div>
        {items.map((it, idx) => (
          <div key={title + idx} className={`anvisa-item ${it.level}`}>
            <div className="ai-icon"><Svg paths={ICON[it.level]} sw={3} /></div>
            <div className="ai-body">
              <div className="ai-title">{it.title}</div>
              <div className="ai-desc">{it.desc}</div>
              {it.ref && <div className="ai-ref">{it.ref}</div>}
              {it.action && (
                <div className="ai-actions">
                  <button className="ai-btn" onClick={() => exec(it.action!)}>
                    <Svg paths='<path d="M5 12h14M12 5l7 7-7 7"/>' sw={2.2} />
                    {it.action.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </>
    );

  return (
    <div className="anvisa-panel" id="anvisaPanel" style={{ display: "flex" }}>
      <div className="anvisa-head">
        <div className="anvisa-h-title">
          <Svg paths='<path d="M12 2L3 5v6c0 5 4 9 9 11 5-2 9-6 9-11V5l-9-3z"/>' sw={2.2} width={16} height={16} />
          Revisão ANVISA
        </div>
        <button className="anvisa-close" onClick={onClose} title="Fechar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="anvisa-meta">RDC 907/2024 — produtos cosméticos Grau 1</div>

      <div className={"anvisa-summary " + summClass} id="anvisaSummary">
        <div className="anvisa-summ-title">
          {crit.length === 0 && warn.length === 0 ? (
            <Svg paths='<path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/>' sw={2.4} width={16} height={16} />
          ) : (
            <Svg paths='<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h0"/>' sw={2.4} width={16} height={16} />
          )}
          {summTitle}
        </div>
        <div className="anvisa-summ-sub">{summSub}</div>
        <div className="anvisa-counts">
          <span className="anvisa-count crit"><span className="anvisa-count-dot" />{crit.length} crítico{crit.length !== 1 ? "s" : ""}</span>
          <span className="anvisa-count warn"><span className="anvisa-count-dot" />{warn.length} aviso{warn.length !== 1 ? "s" : ""}</span>
          <span className="anvisa-count info"><span className="anvisa-count-dot" />{info.length} {info.length !== 1 ? "sugestões" : "sugestão"}</span>
        </div>
      </div>

      <div className="anvisa-list" id="anvisaList">
        {issues.length === 0 ? (
          <div className="anvisa-empty">
            <Svg paths='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>' sw={2} />
            <div className="anvisa-empty-title">Tudo certo!</div>
            <div className="anvisa-empty-sub">Não encontramos problemas verificáveis automaticamente no seu rótulo.</div>
          </div>
        ) : (
          <>
            <Section title="Crítico — obrigatório" items={crit} />
            <Section title="Avisos — recomendado" items={warn} />
            <Section title="Sugestões" items={info} />
          </>
        )}
      </div>

      <div className="anvisa-foot">
        <div className="anvisa-disclaimer">
          <Svg paths='<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h0"/>' sw={2.3} width={11} height={11} />
          <span>Esta é uma checagem automática. <b>Não substitui</b> consultoria jurídica/regulatória profissional para a aprovação final do rótulo na ANVISA.</span>
        </div>
      </div>
    </div>
  );
}
