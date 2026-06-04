"use client";

import { useStudioStore } from "../../store/useStudioStore";
import { OQUE_OPCOES } from "../../data/wizardData";
import { pickFile } from "../../hooks/useFilePicker";
import { toast } from "../../ui/Toast";
import Svg from "../../ui/Svg";

// Porte de RENDER.frente.
export default function StepFrente() {
  const f = useStudioStore((s) => s.frente);
  const patch = useStudioStore((s) => s.patch);

  return (
    <div className="screen">
      <div className="eyebrow">Passo 5 · Frente do rótulo</div>
      <h1 className="scr">
        O que vai na <span className="hl">frente</span> do produto?
      </h1>
      <p className="scr-sub">
        A frente é o rosto do seu produto na prateleira. A IA vai usar estas informações + as referências de
        estilo (próxima etapa) para montar a frente.
      </p>

      <div className="fld" style={{ marginBottom: 22 }}>
        <label>Logotipo da marca</label>
        {f.logo ? (
          <div style={{ display: "flex", gap: 14, alignItems: "center", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 11, padding: 12 }}>
            <div
              className="thumb"
              style={{
                width: 80,
                height: 80,
                backgroundImage: `url(${f.logo}),repeating-conic-gradient(#e8e8ec 0% 25%,#dadadf 0% 50%)`,
                backgroundSize: "contain,16px 16px",
                backgroundPosition: "center,0 0",
                backgroundRepeat: "no-repeat,repeat",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 3 }}>{f.logoNome || "logo"}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>Use um arquivo em alta resolução para impressão</div>
            </div>
            <button
              style={{ background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 7, padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "var(--ink-dim)" }}
              onClick={() => patch("frente", { logo: null, logoNome: null })}
            >
              Remover
            </button>
          </div>
        ) : (
          <div
            className="drop"
            style={{ padding: 24 }}
            onClick={() =>
              pickFile(
                (data, name, meta) => {
                  if (meta.kind === "pdf" || meta.kind === "ai" || meta.kind === "eps") {
                    toast("PDF/AI/EPS não podem ser visualizados no editor — use PNG ou SVG para o logo");
                    return;
                  }
                  patch("frente", { logo: data, logoNome: name });
                },
                "image/*,.svg,image/svg+xml",
              )
            }
          >
            <div className="dico">
              <Svg paths='<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>' sw={2} />
            </div>
            <b>Anexar logotipo</b>
            <span>PDF ou PNG de alta resolução</span>
          </div>
        )}
      </div>

      <div className="fgrid g2">
        <div className="fld">
          <label>
            Nome do produto <span className="req">*</span>
          </label>
          <input className="ipt" value={f.nome} placeholder="Ex.: Hidratação Intensa" onChange={(e) => patch("frente", { nome: e.target.value })} />
        </div>
        <div className="fld">
          <label>O que é</label>
          <select className="ipt" value={f.oque} onChange={(e) => patch("frente", { oque: e.target.value })}>
            <option value="">Selecione...</option>
            {OQUE_OPCOES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div className="fld">
          <label>Ativos em destaque</label>
          <input className="ipt" value={f.ativos} placeholder="Ex.: Óleo de argan, Pantenol, Queratina" onChange={(e) => patch("frente", { ativos: e.target.value })} />
        </div>
        <div className="fld">
          <label>Volumagem</label>
          <input className="ipt" value={f.volume} placeholder="Ex.: 300 mL" onChange={(e) => patch("frente", { volume: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
