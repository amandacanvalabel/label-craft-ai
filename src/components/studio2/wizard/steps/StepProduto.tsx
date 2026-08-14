"use client";

import { useStudioStore } from "../../store/useStudioStore";
import { PRODUTO_CATS, CONHECE_OPTS } from "../../data/wizardData";
import { pickFile } from "../../hooks/useFilePicker";
import { toast } from "../../ui/Toast";
import Svg from "../../ui/Svg";

// Porte de RENDER.produto + renderConheceBox + renderFrascoBox.
export default function StepProduto() {
  const produto = useStudioStore((s) => s.produto);
  const conhece = useStudioStore((s) => s.conhece);
  const frascoFoto = useStudioStore((s) => s.frascoFoto);
  const set = useStudioStore((s) => s.set);

  const selectCat = (id: string) => {
    if (id !== "cosmetico") set({ produto: id, conhece: null, frascoFoto: null });
    else set({ produto: id });
  };

  return (
    <div className="screen">
      <div className="eyebrow">Passo 1 · Novo rótulo</div>
      <h1 className="scr">
        Que tipo de <span className="hl">produto</span> você vai rotular?
      </h1>
      <p className="scr-sub">
        Escolha a categoria do produto. Cada categoria tem regras de rotulagem e modelos próprios. Hoje a
        criação está disponível para cosméticos, e <b>alimentos</b> abrem a calculadora de tabela nutricional —
        as demais chegam em breve.
      </p>

      <div className="cards c3">
        {PRODUTO_CATS.map((c) => (
          <button
            key={c.id}
            className={`card ${produto === c.id ? "sel" : ""} ${c.soon ? "soon" : ""}`}
            disabled={c.soon}
            onClick={() => (c.href ? window.open(c.href, "_blank", "noopener") : selectCat(c.id))}
          >
            {c.soon ? (
              <span className="soon-tag">Em breve</span>
            ) : c.href ? (
              <span className="soon-tag" style={{ background: "#2563eb", color: "#fff" }}>Ferramenta</span>
            ) : (
              <span className="chk">
                <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.5} />
              </span>
            )}
            <span className="cico">
              <Svg paths={c.ic} />
            </span>
            <h3>{c.name}</h3>
            <p>{c.desc}</p>
          </button>
        ))}
      </div>

      {produto === "cosmetico" && (
        <div id="conheceBox">
          <div className="section-h">Sobre o seu rótulo</div>
          <div className="cards c2">
            {CONHECE_OPTS.map((o) => (
              <button
                key={o.id}
                className={`card ${conhece === o.id ? "sel" : ""}`}
                onClick={() => set(o.id === "sei" ? { conhece: "sei", frascoFoto: null } : { conhece: o.id })}
              >
                <span className="chk">
                  <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.5} />
                </span>
                <span className="cico">
                  <Svg paths={o.ic} />
                </span>
                <h3>{o.t}</h3>
                <p>{o.s}</p>
              </button>
            ))}
          </div>

          {conhece === "naosei" && (
            <div id="frascoBox">
              <div className="subpanel">
                <div className="sh">
                  <Svg paths='<path d="M12 2v6m0 0l3-3m-3 3L9 5"/><rect x="4" y="8" width="16" height="14" rx="2"/>' sw={2.2} />
                  Identificação do frasco
                </div>
                {frascoFoto ? (
                  <>
                    <div className="thumbs">
                      <div className="thumb lg" style={{ backgroundImage: `url(${frascoFoto})` }}>
                        <button className="rm" onClick={() => set({ frascoFoto: null })}>
                          <Svg paths='<path d="M18 6L6 18M6 6l12 12"/>' sw={3} />
                        </button>
                      </div>
                    </div>
                    <div className="id-result">
                      <div className="ir-ico">
                        <Svg paths='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>' sw={2.4} />
                      </div>
                      <div>
                        <b>Frasco identificado: cosmético cilíndrico, ~300 mL</b>
                        <span>
                          Tipos de rótulo recomendados: <b>Adesivo frente e verso</b> ou <b>Sleeve</b>. Você
                          confirma o tipo na próxima etapa.
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className="drop"
                    onClick={() =>
                      pickFile((data) => {
                        set({ frascoFoto: data });
                        toast("Frasco enviado");
                      })
                    }
                  >
                    <div className="dico">
                      <Svg paths='<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>' sw={2} />
                    </div>
                    <b>Escaneie ou envie uma foto do frasco</b>
                    <span>JPG ou PNG · a IA identifica o formato e o volume</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
