// Cliente da geração da IMAGEM-BASE ("cara" do rótulo) por IA.
// Falha de forma graciosa: devolve null se não houver chave, se estiver offline,
// se estourar limite/crédito, ou em qualquer erro — a geração editável nunca
// quebra por causa disso (a imagem é um extra por cima do motor de templates).

import type { StudioState } from "../types";

export async function fetchAiImage(state: StudioState): Promise<string | null> {
  try {
    const w = state.rotulo?.w || 70;
    const h = state.rotulo?.h || 90;
    const ratio = h > 0 ? w / h : 0.78;

    const res = await fetch("/api/ai/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: state.frente.nome || "",
        productType: state.produto || "",
        ativos: state.frente.ativos || "",
        volumagem: state.frente.volume || "",
        moodKeywords: state.ai.prompt?.trim() || "",
        artPrompt: state.ai.brief?.artPrompt || "",
        refs: Array.isArray(state.refs) ? state.refs.slice(0, 3) : [],
        ratio,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { imageBase64?: string };
    return data?.imageBase64 && data.imageBase64.startsWith("data:image/") ? data.imageBase64 : null;
  } catch {
    return null;
  }
}
