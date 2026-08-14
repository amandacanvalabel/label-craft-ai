import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkCredit, consumeCredit } from "@/lib/usage";

// Interpretação do prompt + REFERÊNCIAS VISUAIS por IA real (visão) → "briefing
// de design" que alimenta o motor de geração editável (templates + paleta) e
// também um "artPrompt" para a geração da imagem-base (a "cara" do rótulo).
//
// Antes: só o texto do prompt ia para um modelo fraco (gpt-4o-mini), e as
// imagens de referência NUNCA chegavam à IA (viravam só paleta de cor local).
// Agora: usamos gpt-4o com VISÃO — a IA realmente "vê" as referências e traduz
// estilo, composição, tipografia e cores para o briefing. A IA continua não
// posicionando elementos (isso quebraria a edição): ela escolhe estilo, template
// e cores, e o motor monta os Elements editáveis. Mantém WYSIWYG e edição livre.

export const runtime = "nodejs";
export const maxDuration = 45;

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

// Só aceitamos data URLs de imagem (as referências enviadas pelo usuário).
function isImageDataUrl(v: unknown): v is string {
  return typeof v === "string" && /^data:image\/(png|jpe?g|webp);base64,/i.test(v);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { prompt, product, fields, refs } = (await req.json()) as {
      prompt: string;
      product?: string;
      fields?: Record<string, string>;
      refs?: string[];
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

    // Até 3 referências, apenas data URLs válidas (segurança: nunca buscar URL externa).
    const images = Array.isArray(refs) ? refs.filter(isImageDataUrl).slice(0, 3) : [];
    const hasRefs = images.length > 0;

    const systemContent = `Você é diretor de arte especializado em rótulos de alimentos e cosméticos no Brasil. A partir da descrição do usuário${hasRefs ? " E das imagens de referência anexadas" : ""}, defina a direção visual do rótulo. ${ctx}

${hasRefs ? `IMPORTANTE: analise de verdade as imagens de referência — extraia a paleta de cores predominante, o clima/estética (ex.: vintage, clean, luxuoso, natural), o estilo tipográfico e a composição. O briefing deve refletir fielmente essas referências combinadas com o texto do usuário. Quando o usuário e a referência conflitarem, priorize o pedido explícito do texto.` : ""}

Templates disponíveis (escolha o mais adequado):
${TEMPLATES.map((t) => `- "${t.id}": ${t.name}`).join("\n")}

Eixos de estilo (0 a 1, onde 0.5 é neutro):
formal, denso (quantidade de detalhes), quente (temperatura de cor), retro, ornamental, feminino, luxo, vibrante, natural, sofisticado.

Responda SEMPRE com JSON válido nesta estrutura exata:
{
  "templateId": "<um dos ids acima>",
  "style": { "formal": 0.5, "denso": 0.5, "quente": 0.5, "retro": 0.5, "ornamental": 0.5, "feminino": 0.5, "luxo": 0.5, "vibrante": 0.5, "natural": 0.5, "sofisticado": 0.5 },
  "palette": { "bg": "#hex", "primary": "#hex", "secondary": "#hex", "accent": "#hex", "text": "#hex" },
  "palettes": [ { "name": "Variação", "roles": { "bg":"#hex","primary":"#hex","secondary":"#hex","accent":"#hex","text":"#hex" } } ],
  "copy": { "nome": "", "oque": "", "ativos": "", "volume": "" },
  "artPrompt": "Descrição visual rica, em português, do FUNDO/arte da frente do rótulo (cores, texturas, motivos, clima, estilo tipográfico), fiel ao pedido e às referências, para gerar a imagem-base. NÃO descreva textos legais nem tabela nutricional.",
  "illustration": "Descreva em 1 frase a ILUSTRAÇÃO principal, isolada, que representa o produto (ex.: 'morangos frescos maduros com folhas verdes', 'espiga de trigo dourada'), no estilo escolhido. Sem texto, sem moldura, sem fundo.",
  "ornament": "Descreva em 1 frase o ORNAMENTO/moldura decorativa que combina com o estilo (ex.: 'moldura oval botânica art nouveau com ramos finos', 'borda de folhas de louro clássica'). Só o traçado do ornamento, sem texto e sem fundo.",
  "note": "1 frase explicando a direção escolhida"
}

Regras:
- Cores SEMPRE em hex de 6 dígitos (#rrggbb). "bg" é o fundo; "primary" o texto principal; "accent" o destaque; "secondary" apoio; "text" corpo. Garanta contraste legível entre bg e primary/text.
- "palettes": de 1 a 3 paletas alternativas coerentes.
- "copy": preencha SOMENTE o que o usuário descreveu explicitamente; senão deixe "". Não invente nome de marca/produto.
- "style": traduza fielmente os adjetivos do usuário${hasRefs ? " e o clima das referências" : ""}.
- "artPrompt": 2 a 4 frases, concreto e visual.
- Não escreva nada fora do JSON.`;

    // Conteúdo do usuário: texto + imagens (visão). detail "low" reduz custo.
    const userContent: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail: "low" } }
    > = [{ type: "text", text: prompt.trim() }];
    images.forEach((url) => userContent.push({ type: "image_url", image_url: { url, detail: "low" } }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 900,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
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

    const artPrompt = str(raw.artPrompt);
    const illustration = str(raw.illustration);
    const ornament = str(raw.ornament);

    if (session.role === "SUBSCRIBER") await consumeCredit(session.id, "ai");

    return NextResponse.json({
      templateId,
      style,
      palette,
      palettes,
      copy,
      artPrompt,
      illustration,
      ornament,
      note: typeof raw.note === "string" ? raw.note : "",
    });
  } catch (error) {
    console.error("[GENERATE DESIGN ERROR]", error);
    return NextResponse.json({ error: "Erro interno ao interpretar o prompt" }, { status: 500 });
  }
}
