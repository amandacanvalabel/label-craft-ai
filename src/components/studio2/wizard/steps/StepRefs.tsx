"use client";

import { useStudioStore } from "../../store/useStudioStore";
import { PROMPT_EXAMPLES } from "../../data/wizardData";
import { pickFiles } from "../../hooks/useFilePicker";
import { analyzeReferences } from "../../generate/analyze";
import Svg from "../../ui/Svg";
import AnalysisCard from "./AnalysisCard";

// Porte de RENDER.refs. A análise visual (analyzeReferences / renderAnalysisCard)
// é ligada na Fase 3 (motor de geração).
export default function StepRefs() {
  const ai = useStudioStore((s) => s.ai);
  const refs = useStudioStore((s) => s.refs);
  const patch = useStudioStore((s) => s.patch);
  const set = useStudioStore((s) => s.set);
  const setAnalysis = useStudioStore((s) => s.setAnalysis);

  const addPrompt = (p: string) => {
    const cur = ai.prompt.trim();
    patch("ai", { prompt: cur ? cur + ", " + p.toLowerCase() : p });
  };

  const reanalyze = async (list: string[]) => {
    setAnalysis(list.length ? await analyzeReferences(list) : null);
  };

  const onUpload = (arr: string[]) => {
    const next = [...refs, ...arr];
    set({ refs: next });
    reanalyze(next);
  };

  const onRemove = (i: number) => {
    const next = refs.filter((_, j) => j !== i);
    set({ refs: next });
    reanalyze(next);
  };

  return (
    <div className="screen">
      <div className="eyebrow">Passo 6 · Estilo</div>
      <h1 className="scr">
        Conte para a <span className="hl">IA</span> como você imagina
      </h1>
      <p className="scr-sub">
        Descreva o estilo do rótulo em palavras, anexe referências visuais, ou faça as duas coisas. Quanto mais
        a IA souber, mais alinhado vai ser o resultado.
      </p>

      <div className="prompt-box">
        <label>
          <Svg paths='<path d="M9.5 2L12 8l6.5.5-5 4 1.5 6.5L9.5 15 4 19l1.5-6.5-5-4L7 8z"/>' sw={2.4} />
          Como você imagina seu rótulo?
        </label>
        <textarea
          placeholder="Ex.: minimalista e moderno, com cores terrosas e tipografia editorial. Quero que transmita sofisticação e naturalidade..."
          value={ai.prompt}
          onChange={(e) => patch("ai", { prompt: e.target.value })}
        />
        <div className="prompt-chips">
          <span className="pc-label">Sugestões:</span>
          {PROMPT_EXAMPLES.map((p) => (
            <button key={p} onClick={() => addPrompt(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="section-h">Imagens de referência</div>
      <p className="scr-sub" style={{ fontSize: 12.5, marginBottom: 14 }}>
        Anexe rótulos, paletas ou estilos que você gosta. A IA vai extrair as cores dominantes automaticamente.
      </p>

      <div className="fld">
        {refs.length > 0 && (
          <div className="thumbs">
            {refs.map((r, i) => (
              <div key={i} className="thumb lg" style={{ backgroundImage: `url(${r})` }}>
                <button className="rm" onClick={() => onRemove(i)}>
                  <Svg paths='<path d="M18 6L6 18M6 6l12 12"/>' sw={3} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className="drop"
          style={{ marginTop: refs.length ? 14 : 0, padding: 38 }}
          onClick={() => pickFiles(onUpload)}
        >
          <div className="dico">
            <Svg paths='<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>' sw={2} />
          </div>
          <b>Arraste ou clique para anexar referências</b>
          <span>JPG ou PNG · quantas quiser · totalmente opcional</span>
        </div>

        {ai.analysis && <AnalysisCard analysis={ai.analysis} prompt={ai.prompt} onRecalc={() => reanalyze(refs)} />}
      </div>

      <div className="note" style={{ marginTop: 18 }}>
        <Svg paths='<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>' sw={2.2} />
        <p>
          Tudo aqui é <b>opcional</b>. Se você deixar em branco, a IA usa estilos padrão e você pode iterar
          depois no editor — tem um botão <b>&quot;Refazer com prompt&quot;</b> lá dentro.
        </p>
      </div>
    </div>
  );
}
