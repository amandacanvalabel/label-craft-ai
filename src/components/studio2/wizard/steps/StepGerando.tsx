"use client";

import { useEffect, useRef, useState } from "react";
import { useStudioStore } from "../../store/useStudioStore";
import { stepIdx } from "../../data/steps";
import { analyzeReferences } from "../../generate/analyze";
import { fetchAiBrief } from "../../generate/aiBrief";
import { fetchAiImage } from "../../generate/aiImage";

// Porte de RENDER.gerando — animação de etapas + geração assíncrona.
export default function StepGerando() {
  const go = useStudioStore((s) => s.go);
  const prompt = useStudioStore((s) => s.ai.prompt);
  const refs = useStudioStore((s) => s.refs);
  const setAnalysis = useStudioStore((s) => s.setAnalysis);
  const generateVariationsNow = useStudioStore((s) => s.generateVariationsNow);
  const applyVariation = useStudioStore((s) => s.applyVariation);
  const patch = useStudioStore((s) => s.patch);

  const hasPrompt = !!(prompt && prompt.trim().length > 0);
  const hasRefs = !!(refs && refs.length > 0);

  const steps = [
    "Analisando informações do produto",
    hasPrompt ? "Interpretando sua descrição" : "Lendo as imagens de referência",
    hasRefs ? "Lendo as referências com visão (IA)" : "Definindo a direção visual",
    "Desenhando a arte da frente com IA",
    "Organizando os parágrafos do verso",
    "Criando variações de design para você escolher",
  ];

  const [active, setActive] = useState(0); // índice em andamento; >= steps.length = concluído
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Limpa qualquer fundo IA de uma geração anterior antes de recomeçar.
    patch("ai", { aiBackground: null });

    // Navega para "variacoes" só quando animação E geração terminarem — assim a
    // chamada de IA (que pode demorar mais que a animação) sempre é refletida.
    let animDone = false;
    let genDone = false;
    let navigated = false;
    const maybeGo = () => {
      if (animDone && genDone && !navigated) {
        navigated = true;
        go(stepIdx("variacoes"));
      }
    };

    // Geração em paralelo à animação
    (async () => {
      if (hasRefs) {
        const analysis = await analyzeReferences(refs);
        setAnalysis(analysis);
      }
      // IA real (visão) interpreta prompt + referências → briefing de design
      // (template + paleta + cópia + artPrompt). Null = sem chave/offline/erro:
      // cai no parsing heurístico.
      const brief = await fetchAiBrief(useStudioStore.getState());
      if (brief) {
        patch("ai", { brief });
        // Preenche campos da frente só quando o usuário não informou (não
        // sobrescreve o que ele digitou no wizard).
        const f = useStudioStore.getState().frente;
        const fill: Record<string, string> = {};
        (["nome", "oque", "ativos", "volume"] as const).forEach((k) => {
          if (!f[k]?.trim() && brief.copy[k]?.trim()) fill[k] = brief.copy[k];
        });
        if (Object.keys(fill).length) patch("frente", fill);
      }

      // "Cara" do rótulo pela IA (imagem-base baseada no prompt + referências).
      // Roda em paralelo — NÃO travamos a navegação por ela. Quando chegar,
      // injetamos como fundo e reaplicamos a variação atual. Falha vira null e
      // o rótulo segue sem fundo IA (motor editável normal).
      if (hasPrompt || hasRefs) {
        fetchAiImage(useStudioStore.getState())
          .then((img) => {
            if (!img) return;
            patch("ai", { aiBackground: img });
            const st = useStudioStore.getState();
            st.applyVariation(st.ai.chosenVariation ?? 0);
          })
          .catch(() => {});
      }

      generateVariationsNow();
      applyVariation(0);
      genDone = true;
      maybeGo();
    })();

    // Animação dos passos
    let i = 0;
    const tick = () => {
      i++;
      setActive(i);
      if (i < steps.length) {
        timer = setTimeout(tick, 520);
      } else {
        timer = setTimeout(() => {
          animDone = true;
          maybeGo();
        }, 380);
      }
    };
    let timer = setTimeout(tick, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen">
      <div className="genwrap">
        <div className="gen-orb" />
        <div className="eyebrow" style={{ justifyContent: "center" }}>Gerando com IA</div>
        <h1 className="scr" style={{ fontSize: 28 }}>
          Criando seu rótulo <span className="hl">editável</span>
        </h1>
        <p className="scr-sub" style={{ textAlign: "center", margin: "0 auto" }}>
          A IA está montando 4 variações com base em tudo que você preencheu
          {hasPrompt ? ", incluindo sua descrição" : ""}
          {hasRefs ? " e nas suas referências visuais" : ""}.
        </p>
        <div className="gen-steps" id="genSteps">
          {steps.map((s, i) => {
            const done = i < active;
            const isActive = i === active;
            return (
              <div key={i} className={"gen-step" + (isActive ? " active" : "") + (done ? " ok" : "")}>
                <span className="gs-ico">
                  {done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : isActive ? (
                    <div className="spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  )}
                </span>
                {s}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
