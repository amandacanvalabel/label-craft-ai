"use client";

import { useStudioStore } from "../store/useStudioStore";
import type { El, LupaLayoutOpt, SelosState } from "../types";
import { MATERIAIS_RECICLAGEM } from "../data/wizardData";
import { NutriSvg, LupaSvg } from "../editor/svg";
import Svg from "../ui/Svg";
import { LUPA_LABEL, LUPA_LIMITES, buildNutriTable, calcLupas, defaultAlimento, fmt, fraseAlergenos, fraseGluten, v100Atual } from "./calc";
import { lupaAspect, lupaSizeMm } from "./lupaArt";

// Ocupa o slot "Selos" quando produto === "alimento": mostra a tabela
// nutricional e a lupa calculadas (pré-visualização fiel ao que vai pro
// rótulo) e os selos de embalagem que também valem para alimento.
// Selo booleano (componente estável, fora do render do passo).
function Chip({ id, label }: { id: "vegano" | "materialReciclavel" | "jogueLixo" | "euReciclo"; label: string }) {
  const on = useStudioStore((st) => st.selos[id]);
  const patch = useStudioStore((st) => st.patch);
  return (
    <button type="button" className={`chip ${on ? "sel" : ""}`} onClick={() => patch("selos", { [id]: !on } as Partial<SelosState>)}>
      <span className="cdot">{on ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : ""}</span>
      {label}
    </button>
  );
}

export default function StepNutricional() {
  const a = useStudioStore((s) => s.alimento) || defaultAlimento();
  const selos = useStudioStore((s) => s.selos);
  const rotulo = useStudioStore((s) => s.rotulo);
  const patch = useStudioStore((s) => s.patch);
  const go = useStudioStore((s) => s.go);
  const cur = useStudioStore((s) => s.cur);

  const tbl = buildNutriTable(a);
  const lupas = calcLupas(a);
  const v = v100Atual(a);
  const lim = LUPA_LIMITES[a.categoria];
  const un = a.categoria === "liquido" ? "ml" : "g";

  const tblEl: El = { id: "prev-nutri", type: "nutri", x: 0, y: 0, w: 70, h: 86, rot: 0, opacity: 100, visible: true, locked: false, nutri: tbl, fg: "#000" };
  const lupaLayout: LupaLayoutOpt = a.lupaLayout || "auto";
  // Mesma disposição que o motor vai usar no rótulo (o "auto" depende da largura da face).
  const lupaResolved = lupas.length ? lupaSizeMm(lupas, lupaLayout, rotulo.w || 80, rotulo.h || 100).layout : "linha";
  const lupaW = 56;
  const lupaEl: El = {
    id: "prev-lupa", type: "lupa", x: 0, y: 0, w: lupaW, h: lupas.length ? lupaW / lupaAspect(lupas, lupaResolved) : 12,
    rot: 0, opacity: 100, visible: true, locked: false, lupas, lupaLayout: lupaResolved,
  };
  const LAYOUTS: { id: LupaLayoutOpt; label: string }[] = [
    { id: "auto", label: "Automático" },
    { id: "linha", label: "Em linha" },
    { id: "bloco", label: "Bloco" },
    { id: "coluna", label: "Em coluna" },
  ];

  const linhas = [
    { k: "acucar" as const, nome: "Açúcares adicionados", valor: v.acucarA, lim: lim.acucar, un: "g" },
    { k: "gordura" as const, nome: "Gorduras saturadas", valor: v.gordSat, lim: lim.gordura, un: "g" },
    { k: "sodio" as const, nome: "Sódio", valor: v.sodio, lim: lim.sodio, un: "mg" },
  ];

  return (
    <div className="screen">
      <div className="eyebrow">Passo 4 · Tabela nutricional e lupa</div>
      <h1 className="scr">
        Sua <span className="hl">tabela nutricional</span> e a rotulagem frontal
      </h1>
      <p className="scr-sub">
        Calculadas a partir do passo anterior, com o arredondamento e o %VD da IN 75/2020 e os limites da RDC
        429/2020. Os dois viram elementos editáveis no rótulo; para mudar os números, volte ao passo anterior.
      </p>

      <div className="fgrid g2" style={{ alignItems: "start" }}>
        <div>
          <div className="section-h">Tabela de informação nutricional</div>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "grid", placeItems: "center" }}>
            <NutriSvg el={tblEl} ppm={4.4} />
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-faint)" }}>
            Modelo vertical · porção de {a.porcao || "—"} {un} · {tbl.porcoesLabel.replace("Porções por embalagem: ", "")} porções
          </div>
          <button type="button" className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => go(cur - 1)}>
            Ajustar ingredientes ou porção
          </button>
        </div>

        <div>
          <div className="section-h">Rotulagem frontal (lupa “ALTO EM”)</div>
          {lupas.length ? (
            <>
              <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 18, display: "grid", placeItems: "center" }}>
                <LupaSvg el={lupaEl} ppm={4.4} />
              </div>
              <div className="chips" style={{ marginTop: 10 }}>
                {LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    className={`chip ${lupaLayout === l.id ? "sel" : ""}`}
                    onClick={() => patch("alimento", { lupaLayout: l.id })}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ink-dim)", marginTop: 10, lineHeight: 1.6 }}>
                Seu produto é <b>alto em {lupas.map((l) => LUPA_LABEL[l].toLowerCase()).join(", ")}</b>. Esta é a arte
                oficial da ANVISA (Anexo XVII da IN 75/2020). A lupa entra na metade superior da frente, em preto
                sobre branco, no tamanho proporcional à área do painel (Anexo XVIII). Você pode mover no editor, mas
                não alterar cores nem proporção.
              </p>
            </>
          ) : (
            <div className="note teal">
              <Svg paths='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>' sw={2.2} />
              <p>
                <b>Sem lupa obrigatória.</b> Nenhum nutriente atinge o limite da RDC 429/2020 por 100 {un}. Se os valores
                mudarem, a lupa aparece aqui automaticamente.
              </p>
            </div>
          )}
          <div style={{ marginTop: 12, border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", fontSize: 12.5 }}>
            {linhas.map((l) => {
              const alto = l.valor >= l.lim;
              return (
                <div key={l.k} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, padding: "8px 12px", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
                  <span>{l.nome}</span>
                  <span style={{ color: "var(--ink-faint)" }}>limite {fmt(l.lim)} {l.un}</span>
                  <b style={{ color: alto ? "#dc2626" : "#059669" }}>{fmt(l.valor, l.un === "mg" ? 0 : 1)} {l.un}</b>
                </div>
              );
            })}
          </div>

          <div className="section-h" style={{ marginTop: 18 }}>Advertências que vão no verso</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.7, color: "var(--ink-dim)" }}>
            <div>{fraseAlergenos(a) || <span style={{ color: "var(--ink-faint)" }}>Nenhum alérgeno marcado.</span>}</div>
            <div><b>{fraseGluten(a) || "Glúten: não informado"}</b>{a.lactose ? " · CONTÉM LACTOSE" : ""}</div>
          </div>
        </div>
      </div>

      <div className="section-h" style={{ marginTop: 22 }}>Selos de embalagem (opcional)</div>
      <div className="chips">
        <Chip id="materialReciclavel" label="Material reciclável (Möbius)" />
        <Chip id="jogueLixo" label="Jogue no lixo" />
        <Chip id="euReciclo" label="eureciclo" />
        <Chip id="vegano" label="Vegano" />
      </div>
      <div className="fld" style={{ marginTop: 12 }}>
        <label>Material da embalagem (símbolo de reciclagem)</label>
        <div className="chips">
          {MATERIAIS_RECICLAGEM.map((m) => (
            <button key={m.code} type="button" className={`chip ${selos.tipoMaterial === m.code ? "sel" : ""}`} onClick={() => patch("selos", { tipoMaterial: selos.tipoMaterial === m.code ? null : m.code })}>
              <span className="cdot">{selos.tipoMaterial === m.code ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : m.code}</span>
              {m.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
