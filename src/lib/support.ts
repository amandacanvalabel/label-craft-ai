// Assistente de suporte com IA real. Gera uma resposta de atendimento a partir
// do histórico da conversa. Não consome créditos do plano (suporte é gratuito).

type Msg = { role: "USER" | "ASSISTANT" | "AGENT"; content: string };

const SYSTEM = `Você é o assistente de suporte do CanvaLabel, um app brasileiro de criação de rótulos de cosméticos com IA.
Ajude o usuário com dúvidas de uso: estúdio/editor (arrastar, texto, formas, faces, zoom), geração com IA, materiais e acabamentos, conformidade ANVISA, exportação de PDF/PNG, planos e créditos, pastas, equipe e conta.
Seja cordial, objetivo e em português do Brasil (no máximo 2 parágrafos curtos).
Se a dúvida envolver dados sensíveis (cobrança específica, reembolso, problema na conta) ou se você não tiver certeza, oriente o usuário a clicar em "Falar com atendente" para falar com uma pessoa do time.
Nunca invente políticas, valores ou prazos.`;

export async function aiSupportReply(history: Msg[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const fallback = 'No momento o assistente automático está indisponível. Clique em "Falar com atendente" que uma pessoa do nosso time vai te ajudar. 🙂';
  if (!apiKey) return fallback;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM },
          ...history.slice(-10).map((m) => ({
            role: m.role === "USER" ? "user" : "assistant",
            content: m.content,
          })),
        ],
      }),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content?.trim() || fallback;
  } catch {
    return fallback;
  }
}
