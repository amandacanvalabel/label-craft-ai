import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkCredit, consumeCredit } from "@/lib/usage";

// Interpretação do prompt livre por IA real → "briefing de design" que alimenta
// o motor de geração editável (templates + paleta). A IA NÃO posiciona elementos
// (isso quebraria a edição); ela escolhe estilo, template e cores, e o motor
// monta os Elements editáveis. Mantém WYSIWYG e edição livre no editor.

const STYLE_AXES = [
  "formal", "denso", "quente", "retro", "ornamental",
  "feminino", "luxo", "vibrante", "natural", "sofisticado",
] as const;

const TEMPLATES = [
  { id: "botanical", name: "Botanical Editorial — natural, ornamentado, editorial, herbal/spa, sofisticado" },
  { id: "minimal", name: "Studio Minimal — clean, tipográfico, muito espaço em branco, moderno, premium" },
  { id: "apothecary", name: "Apothecary Vintage — retrô, farmácia antiga, ornamental, quente, clássico" },
  { id: "bold", name: "Bold Modern — vibrante, alto contraste, marcante, jovem, pop" },
  { id: "feminine", name: "Feminine Delicate — delicado, suave, romântico, pastel, manuscrito" },
];

const HEX = /^#[0-9a-fA-F]{6}$/;
function okHex(v: unknown, fallback: string): string {
  return typeof v === "string" && HEX.test(v) ? v.toLowerCase() : fallback;
}
function okAxis(v: unknown): number {
  const n = typeof v === "number" ? v : 0.5;
  return Math.max(0, Math.min(1, n));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { prompt, product, fields } = (await req.json()) as {
      prompt: string;
      product?: string;
      fields?: Record<string, string>;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 });
    }

    // Limite de uso (cobrança avançada) — admins não consomem créditos.
    if (session.role === "SUBSCRIBER") {
      const c = await checkCredit(session.id, "ai");
      if (!c.ok) return NextResponse.json({ error: c.error, code: "LIMIT_REACHED" }, { status: 402 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API de IA não configurada" }, { status: 500 });
    }

    const ctx = [
      product ? `Tipo de produto: ${product}.` : "",
      fields?.nome ? `Nome já informado: "${fields.nome}".` : "",
      fields?.oque ? `Categoria: "${fields.oque}".` : "",
      fields?.volume ? `Volume: "${fields.volume}".` : "",
    ].filter(Boolean).join(" ");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content: `Você é diretor de arte especializado em rótulos de cosméticos no Brasil. A partir da descrição livre do usuário, defina a direção visual do rótulo. ${ctx}

Templates disponíveis (escolha o mais adequado à descrição):
${TEMPLATES.map((t) => `- "${t.id}": ${t.name}`).join("\n")}

Eixos de estilo (0 a 1, onde 0.5 é neutro):
formal, denso (quantidade de detalhes), quente (temperatura de cor), retro, ornamental, feminino, luxo, vibrante, natural, sofisticado.

Responda SEMPRE com JSON válido nesta estrutura exata:
{
  "templateId": "<um dos ids acima>",
  "style": { "formal": 0.5, "denso": 0.5, "quente": 0.5, "retro": 0.5, "ornamental": 0.5, "feminino": 0.5, "luxo": 0.5, "vibrante": 0.5, "natural": 0.5, "sofisticado": 0.5 },
  "palette": { "bg": "#hex", "primary": "#hex", "secondary": "#hex", "accent": "#hex", "text": "#hex" },
  "palettes": [ { "name": "Variação quente", "roles": { "bg":"#hex","primary":"#hex","secondary":"#hex","accent":"#hex","text":"#hex" } } ],
  "copy": { "nome": "", "oque": "", "ativos": "", "volume": "" },
  "note": "1 frase explicando a direção escolhida"
}

Regras:
- Cores SEMPRE em hex de 6 dígitos (#rrggbb). "bg" é o fundo do rótulo; "primary" o texto principal; "accent" o destaque; "secondary" textos de apoio; "text" corpo de texto. Garanta contraste legível entre bg e primary/text.
- "palettes": forneça de 1 a 3 paletas alternativas coerentes para o usuário escolher.
- "copy": preencha SOMENTE o que o usuário descreveu explicitamente; caso contrário deixe "". Não invente nome de marca/produto.
- "style": traduza fielmente os adjetivos do usuário para os eixos.
- Não escreva nada fora do JSON.`,
          },
          { role: "user", content: prompt.trim() },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[OpenAI design error]", response.status, errBody);
      return NextResponse.json({ error: "Erro na API de IA. Tente novamente." }, { status: 502 });
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "Resposta vazia da IA" }, { status: 502 });

    const raw = JSON.parse(content) as Record<string, unknown>;

    // Sanitiza: nunca confiar cegamente no LLM antes de alimentar o motor.
    const validId = TEMPLATES.some((t) => t.id === raw.templateId);
    const templateId = validId ? (raw.templateId as string) : "minimal";

    const rawStyle = (raw.style ?? {}) as Record<string, unknown>;
    const style: Record<string, number> = {};
    STYLE_AXES.forEach((a) => (style[a] = okAxis(rawStyle[a])));

    const sanitizePalette = (p: unknown) => {
      const o = (p ?? {}) as Record<string, unknown>;
      return {
        bg: okHex(o.bg, "#ffffff"),
        primary: okHex(o.primary, "#111827"),
        secondary: okHex(o.secondary, "#6b7280"),
        accent: okHex(o.accent, "#2563eb"),
        text: okHex(o.text, "#374151"),
      };
    };
    const palette = sanitizePalette(raw.palette);

    const palettes = Array.isArray(raw.palettes)
      ? (raw.palettes as unknown[]).slice(0, 3).map((p, i) => {
          const o = (p ?? {}) as Record<string, unknown>;
          return { name: typeof o.name === "string" ? o.name : `Paleta ${i + 1}`, roles: sanitizePalette(o.roles) };
        })
      : [];

    const rawCopy = (raw.copy ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const copy = {
      nome: str(rawCopy.nome),
      oque: str(rawCopy.oque),
      ativos: str(rawCopy.ativos),
      volume: str(rawCopy.volume),
    };

    if (session.role === "SUBSCRIBER") await consumeCredit(session.id, "ai");

    return NextResponse.json({
      templateId,
      style,
      palette,
      palettes,
      copy,
      note: typeof raw.note === "string" ? raw.note : "",
    });
  } catch (error) {
    console.error("[GENERATE DESIGN ERROR]", error);
    return NextResponse.json({ error: "Erro interno ao interpretar o prompt" }, { status: 500 });
  }
}
