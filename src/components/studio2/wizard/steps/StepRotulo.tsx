"use client";

import { useStudioStore } from "../../store/useStudioStore";
import { ROTULO_TIPOS } from "../../data/wizardData";
import { pickFile } from "../../hooks/useFilePicker";
import { toast } from "../../ui/Toast";
import Svg from "../../ui/Svg";

const KIND_LABEL: Record<string, string> = {
  image: "Imagem",
  svg: "SVG vetorial",
  pdf: "PDF",
  ai: "Illustrator",
  eps: "EPS",
  other: "Arquivo",
};

// Porte de RENDER.rotulo + renderRotCfg.
export default function StepRotulo() {
  const rotulo = useStudioStore((s) => s.rotulo);
  const patch = useStudioStore((s) => s.patch);

  const t = ROTULO_TIPOS.find((x) => x.id === rotulo.tipo);
  const showConfigs = !!(t?.configs && t.configs.length);
  const showSize = rotulo.tipo !== "inmold";
  const facaRequired = rotulo.tipo === "inmold";

  return (
    <div className="screen">
      <div className="eyebrow">Passo 2 · Tipo de rótulo</div>
      <h1 className="scr">
        Como o rótulo será <span className="hl">aplicado</span>?
      </h1>
      <p className="scr-sub">
        O tipo de rótulo define o processo de impressão, o formato e os arquivos técnicos (faca/molde) que a
        gráfica vai precisar.
      </p>

      <div className="cards c2">
        {ROTULO_TIPOS.map((rt) => (
          <button
            key={rt.id}
            className={`card ${rotulo.tipo === rt.id ? "sel" : ""}`}
            onClick={() => patch("rotulo", { tipo: rt.id, config: null })}
          >
            <span className="chk">
              <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.5} />
            </span>
            <span className="cico">
              <Svg paths={rt.ic} />
            </span>
            <h3>{rt.name}</h3>
            <p>{rt.desc}</p>
          </button>
        ))}
      </div>

      {t && (
        <div id="rotCfg">
          <div className="subpanel">
            <div className="sh">
              <Svg paths='<path d="M12 20h9M3 20h4M3 4h18M3 12h18"/>' sw={2.2} />
              Configuração — {t.name}
            </div>

            {showConfigs && (
              <div className="opt-list" style={{ marginBottom: 18 }}>
                {t.configs!.map((c) => (
                  <button
                    key={c}
                    className={`opt ${rotulo.config === c ? "sel" : ""}`}
                    onClick={() => patch("rotulo", { config: c })}
                  >
                    <span className="radio" />
                    <div className="otext">
                      <b>{c}</b>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showSize && (
              <div className="fgrid g2" style={{ marginBottom: 14 }}>
                <div className="fld">
                  <label>
                    Largura do rótulo <span className="req">*</span>
                  </label>
                  <div className="unit-wrap">
                    <input
                      className="ipt"
                      type="number"
                      value={rotulo.w}
                      min={10}
                      step={0.5}
                      onChange={(e) => patch("rotulo", { w: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="u">mm</span>
                  </div>
                </div>
                <div className="fld">
                  <label>
                    Altura do rótulo <span className="req">*</span>
                  </label>
                  <div className="unit-wrap">
                    <input
                      className="ipt"
                      type="number"
                      value={rotulo.h}
                      min={10}
                      step={0.5}
                      onChange={(e) => patch("rotulo", { h: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="u">mm</span>
                  </div>
                </div>
              </div>
            )}

            <div className="fld">
              <label>
                Faca ou molde da área de impressão{facaRequired && <span className="req"> *</span>}
              </label>
              {rotulo.faca ? (
                <div style={{ display: "flex", gap: 12, alignItems: "center", background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px" }}>
                  {rotulo.facaKind === "image" || rotulo.facaKind === "svg" ? (
                    <div className="thumb" style={{ width: 54, height: 54, backgroundColor: "#fff", backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundImage: `url(${rotulo.faca})`, flex: "none" }} />
                  ) : (
                    <div style={{ width: 54, height: 54, borderRadius: 8, background: "var(--panel-2)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "none", gap: 2 }}>
                      <Svg paths='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>' sw={1.8} width={22} height={22} />
                      <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: ".05em" }}>{(rotulo.facaKind || "file").toUpperCase()}</div>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rotulo.facaNome || "arquivo"}</div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-faint)", fontWeight: 600 }}>
                      {KIND_LABEL[rotulo.facaKind || "other"]}
                      {rotulo.facaSize ? " · " + rotulo.facaSize : ""}
                    </div>
                  </div>
                  <button
                    style={{ background: "var(--panel-2)", border: "1px solid var(--line)", borderRadius: 7, padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "var(--ink-dim)", display: "flex", alignItems: "center", gap: 5 }}
                    onClick={() => patch("rotulo", { faca: null, facaNome: null, facaKind: null, facaSize: null })}
                  >
                    <Svg paths='<path d="M18 6L6 18M6 6l12 12"/>' sw={2.5} width={11} height={11} />
                    Remover
                  </button>
                </div>
              ) : (
                <div
                  className="drop"
                  style={{ padding: 22 }}
                  onClick={() =>
                    pickFile(
                      (data, name, meta) => {
                        patch("rotulo", { faca: data, facaNome: name, facaKind: meta.kind, facaSize: meta.sizeHuman });
                        toast("Arquivo da faca anexado: " + name);
                      },
                      "image/*,.pdf,.svg,.ai,.eps,application/pdf,application/postscript,image/svg+xml",
                    )
                  }
                >
                  <div className="dico" style={{ width: 38, height: 38, marginBottom: 8 }}>
                    <Svg paths='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>' sw={2} />
                  </div>
                  <b>Anexar arquivo da faca/molde</b>
                  <span>PDF, SVG, AI, EPS ou imagem {facaRequired ? "· obrigatório para In Mold" : "· opcional"}</span>
                </div>
              )}
            </div>

            <div className="note">
              <Svg paths='<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>' sw={2.2} />
              <p>
                {facaRequired
                  ? "No In Mold, a faca define a área de impressão — por isso ela é obrigatória nesta etapa."
                  : "O tamanho informado define a área editável no editor. A faca/molde é usada pela gráfica para o recorte final."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
