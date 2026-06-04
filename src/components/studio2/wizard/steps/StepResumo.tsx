"use client";

import { useStudioStore } from "../../store/useStudioStore";
import { MATERIAIS_RECICLAGEM } from "../../data/wizardData";
import { stepIdx } from "../../data/steps";
import Svg from "../../ui/Svg";

const PRODUTO_LABEL: Record<string, string> = { cosmetico: "Cosmético", bebidas: "Bebidas", suplementos: "Suplementos", alimento: "Alimento", limpeza: "Limpeza" };
const TIPO_LABEL: Record<string, string> = { adesivo: "Adesivo", sleeve: "Sleeve", serigrafia: "Serigrafia", inmold: "In Mold" };

function SV({ children, empty }: { children?: React.ReactNode; empty?: string }) {
  if (children === undefined || children === null || children === "" ) return <span className="sv empty">{empty || "(em branco)"}</span>;
  return <span className="sv">{children}</span>;
}

// Porte de RENDER.resumo.
export default function StepResumo() {
  const s = useStudioStore((st) => st);
  const go = useStudioStore((st) => st.go);

  const selosAtivos: string[] = [];
  if (s.selos.vegano) selosAtivos.push("Vegano");
  if (s.selos.materialReciclavel) selosAtivos.push("Material Reciclável");
  if (s.selos.jogueLixo) selosAtivos.push("Jogue no Lixo");
  if (s.selos.euReciclo) selosAtivos.push("eureciclo");
  if (s.selos.crueltyFree) selosAtivos.push("Cruelty Free");
  if (s.selos.naoTestado) selosAtivos.push("Não testado em animais");
  if (s.selos.tipoMaterial) {
    const m = MATERIAIS_RECICLAGEM.find((x) => x.code === s.selos.tipoMaterial);
    if (m) selosAtivos.push(`${m.code} – ${m.name}`);
  }
  if (s.selos.validadeAbertura) selosAtivos.push(`PAO ${s.selos.validadeAbertura}`);
  s.selos.outros.forEach((_, i) => selosAtivos.push(`Selo próprio #${i + 1}`));

  const editIco = '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>';
  const EditBtn = (step: number) => (
    <button className="edit" onClick={() => go(step)}>
      <Svg paths={editIco} sw={2.2} /> Editar
    </button>
  );

  const ingShort = s.verso.ingPt || s.verso.ingEn;

  return (
    <div className="screen">
      <div className="eyebrow">Passo 7 · Revisão</div>
      <h1 className="scr">
        Pronto para a <span className="hl">IA gerar</span> seu rótulo?
      </h1>
      <p className="scr-sub">
        Confira tudo antes de gerar. Você pode voltar em qualquer etapa para ajustar. Depois da geração, o editor
        abre com o rótulo editável.
      </p>

      <div className="sum-grid">
        <div className="sum-card">
          <div className="sh"><Svg paths='<path d="M9 2h6v3H9z"/><path d="M7 8h10l-1 13H8z"/>' sw={2.2} />Produto</div>
          {EditBtn(0)}
          <div className="sum-row"><span className="sk">Categoria</span><span className="sv">{PRODUTO_LABEL[s.produto || ""] || "—"}</span></div>
          <div className="sum-row"><span className="sk">Caminho</span><span className="sv">{s.conhece === "sei" ? "Já sabe o rótulo" : s.conhece === "naosei" ? "Identificou pelo frasco" : "—"}</span></div>
        </div>

        <div className="sum-card">
          <div className="sh"><Svg paths='<rect x="6" y="3" width="12" height="18" rx="2"/>' sw={2.2} />Rótulo</div>
          {EditBtn(1)}
          <div className="sum-row"><span className="sk">Tipo</span><span className="sv">{TIPO_LABEL[s.rotulo.tipo || ""] || "—"}</span></div>
          {s.rotulo.config && <div className="sum-row"><span className="sk">Configuração</span><span className="sv">{s.rotulo.config}</span></div>}
          <div className="sum-row"><span className="sk">Tamanho</span><span className="sv">{s.rotulo.tipo !== "inmold" ? `${s.rotulo.w} × ${s.rotulo.h} mm` : "Definido pela faca"}</span></div>
          <div className="sum-row"><span className="sk">Faca/Molde</span>{s.rotulo.faca ? <span className="sv"><span className="pill accent">{s.rotulo.facaNome || "anexado"}</span></span> : <span className="sv empty">não anexado</span>}</div>
        </div>

        <div className="sum-card full">
          <div className="sh"><Svg paths='<path d="M3 7h18M3 12h18M3 17h12"/>' sw={2.2} />Verso (informações obrigatórias)</div>
          {EditBtn(2)}
          <div className="sum-row"><span className="sk">Nome</span><SV empty="—">{s.verso.nome || undefined}</SV></div>
          <div className="sum-row"><span className="sk">Modo de uso</span><SV>{s.verso.modoUso || undefined}</SV></div>
          <div className="sum-row"><span className="sk">Ingredientes</span>{s.verso.qrLink ? <span className="sv"><span className="pill accent">QR Code</span> {s.verso.qrLink}</span> : ingShort ? <span className="sv">{ingShort.slice(0, 80)}…</span> : <span className="sv empty">em branco</span>}</div>
          <div className="sum-row"><span className="sk">Fabricado por</span><span className="sv">{s.verso.fabNome || <span className="sv empty">em branco</span>}{s.verso.fabCnpj ? ` · ${s.verso.fabCnpj}` : ""}</span></div>
          <div className="sum-row"><span className="sk">SAC</span><SV empty="em branco">{s.verso.sac || undefined}</SV></div>
          <div className="sum-row"><span className="sk">Cód. de barras</span><SV empty="em branco">{s.verso.codBarras || undefined}</SV></div>
          <div className="sum-row"><span className="sk">Processo ANVISA</span><SV empty="em branco — será gerada versão sem este número também">{s.verso.fabAnvisa || undefined}</SV></div>
        </div>

        <div className="sum-card">
          <div className="sh"><Svg paths='<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>' sw={2.2} />Selos</div>
          {EditBtn(3)}
          {selosAtivos.length ? (
            <div style={{ paddingTop: 6 }}>{selosAtivos.map((x) => <span key={x} className="pill accent">{x}</span>)}</div>
          ) : (
            <div className="sum-row"><span className="sv empty" style={{ minWidth: 0 }}>Nenhum selo selecionado</span></div>
          )}
        </div>

        <div className="sum-card">
          <div className="sh"><Svg paths='<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' sw={2.2} />Frente</div>
          {EditBtn(4)}
          <div className="sum-row"><span className="sk">Logo</span>{s.frente.logo ? <span className="sv"><span className="pill accent">{s.frente.logoNome || "anexado"}</span></span> : <span className="sv empty">não anexado</span>}</div>
          <div className="sum-row"><span className="sk">Nome</span><SV empty="—">{s.frente.nome || undefined}</SV></div>
          <div className="sum-row"><span className="sk">O que é</span><SV empty="—">{s.frente.oque || undefined}</SV></div>
          <div className="sum-row"><span className="sk">Ativos</span><SV empty="—">{s.frente.ativos || undefined}</SV></div>
          <div className="sum-row"><span className="sk">Volume</span><SV empty="—">{s.frente.volume || undefined}</SV></div>
        </div>

        <div className="sum-card full">
          <div className="sh"><Svg paths='<path d="M9.5 2L12 8l6.5.5-5 4 1.5 6.5L9.5 15 4 19l1.5-6.5-5-4L7 8z"/>' sw={2.2} />Briefing para a IA</div>
          {EditBtn(5)}
          <div className="sum-row"><span className="sk">Descrição</span>{s.ai.prompt && s.ai.prompt.trim() ? <span className="sv">&quot;{s.ai.prompt}&quot;</span> : <span className="sv empty">não informada — a IA usará estilo padrão</span>}</div>
          <div className="sum-row">
            <span className="sk">Referências</span>
            {s.refs.length ? (
              <span className="sv">
                <div className="thumbs" style={{ margin: "4px 0" }}>
                  {s.refs.map((r, i) => <div key={i} className="thumb" style={{ width: 48, height: 48, backgroundImage: `url(${r})` }} />)}
                </div>
                {s.ai.extractedPalette.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    {s.ai.extractedPalette.map((c, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: c, border: "1px solid rgba(255,255,255,.1)" }} />)}
                    <span style={{ fontSize: 10, color: "var(--ink-faint)", fontWeight: 600, alignSelf: "center", marginLeft: 6 }}>paleta extraída</span>
                  </div>
                )}
              </span>
            ) : (
              <span className="sv empty">nenhuma anexada</span>
            )}
          </div>
        </div>
      </div>

      <div className="note teal" style={{ marginTop: 24 }}>
        <Svg paths='<path d="M9.5 2L12 8l6.5.5-5 4 1.5 6.5L9.5 15 4 19l1.5-6.5-5-4L7 8z"/>' sw={2.2} />
        <p>
          Tudo certo? Clique em <b>Gerar rótulo com IA</b>. A próxima etapa monta <b>4 variações</b> para você
          escolher — depois você ajusta tudo no editor.
        </p>
      </div>
    </div>
  );
}
