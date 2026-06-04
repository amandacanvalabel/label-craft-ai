"use client";

import { useStudioStore } from "../../store/useStudioStore";
import { renderMiniLabel } from "../../generate/engine";
import Svg from "../../ui/Svg";

// Porte de RENDER.variacoes.
export default function StepVariacoes() {
  const vars = useStudioStore((s) => s.ai.variations);
  const chosen = useStudioStore((s) => s.ai.chosenVariation);
  const applyVariation = useStudioStore((s) => s.applyVariation);
  const state = useStudioStore((s) => s);

  return (
    <div className="screen">
      <div className="eyebrow">Passo 8 · Escolha o design</div>
      <h1 className="scr">
        Qual <span className="hl">variação</span> você prefere?
      </h1>
      <p className="scr-sub">
        A IA gerou 4 versões do seu rótulo combinando estilos e paletas diferentes. Escolha uma para começar —
        depois você ajusta tudo no editor.
      </p>
      <div className="vars-grid" id="varsGrid">
        {vars.map((v, i) => (
          <button key={v.id} className={`vcard ${i === chosen ? "sel" : ""}`} onClick={() => applyVariation(i)}>
            <div className="vchk">
              <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.5} />
            </div>
            <div className="vthumb" style={{ background: v.palette.bg }} dangerouslySetInnerHTML={{ __html: renderMiniLabel(state, v) }} />
            <div className="vname">{v.templateName}</div>
            <div className="vdesc">Paleta: {v.paletteSource}</div>
            <div className="vpalette">
              {(["bg", "primary", "accent", "secondary"] as const).map((k) => (
                <div key={k} className="vp" style={{ background: v.palette[k] }} />
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="note teal" style={{ marginTop: 24 }}>
        <Svg paths='<path d="M9.5 2L12 8l6.5.5-5 4 1.5 6.5L9.5 15 4 19l1.5-6.5-5-4L7 8z"/>' sw={2.2} />
        <p>
          Clique numa variação para selecionar e depois <b>Continuar</b>. Você poderá editar tudo (cores, fontes,
          posições, textos) no editor.
        </p>
      </div>
    </div>
  );
}
