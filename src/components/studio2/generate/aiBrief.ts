// Cliente do briefing de IA real (visão). Falha de forma graciosa: se a chamada
// não completar (sem chave, offline, erro), devolve null e o motor cai no
// parsing heurístico do prompt (parsePrompt) — a geração nunca quebra.

import type { AiBrief, StudioState } from "../types";

export async function fetchAiBrief(state: StudioState): Promise<AiBrief | null> {
  const prompt = state.ai.prompt?.trim();
  if (!prompt) return null;

  try {
    const res = await fetch("/api/ai/generate-design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        product: state.produto || "",
        fields: {
          nome: state.frente.nome || "",
          oque: state.frente.oque || "",
          volume: state.frente.volume || "",
        },
        // Envia as referências para a IA de visão "enxergar" de verdade.
        refs: Array.isArray(state.refs) ? state.refs.slice(0, 3) : [],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<AiBrief>;
    if (!data || !data.templateId || !data.palette || !data.style) return null;
    return {
      templateId: data.templateId,
      style: data.style,
      palette: data.palette,
      palettes: Array.isArray(data.palettes) ? data.palettes : [],
      copy: data.copy ?? { nome: "", oque: "", ativos: "", volume: "" },
      artPrompt: typeof data.artPrompt === "string" ? data.artPrompt : "",
      note: data.note ?? "",
    };
  } catch {
    return null;
  }
}
