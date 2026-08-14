import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkCredit, consumeCredit } from "@/lib/usage";

/**
 * POST /api/ai/generate-image
 *
 * Gera a ARTE DE FRENTE do rótulo (a "cara"), sem texto legal, a partir da
 * descrição do produto + estética desejada + IMAGENS DE REFERÊNCIA do usuário,
 * usando gpt-image-1. Essa imagem entra como camada de FUNDO no editor, e o
 * motor coloca por cima a tabela nutricional e os textos obrigatórios editáveis.
 *
 * Quando há referências, usamos /v1/images/edits passando as imagens como
 * base — assim a arte é REALMENTE baseada nas referências. Sem referências,
 * caímos em /v1/images/generations (texto puro).
 *
 * Body:
 *   {
 *     productName?: string, brandName?: string, productType?: string,
 *     ativos?: string, volumagem?: string,
 *     moodKeywords?: string,   // estilo desejado
 *     artPrompt?: string,      // descrição rica vinda do briefing de visão
 *     refs?: string[],         // data URLs das imagens de referência
 *     ratio?: number,          // largura/altura do rótulo (para escolher o tamanho)
 *   }
 * Response: { imageBase64: string, prompt: string }
 */

export const runtime = "nodejs";
export const maxDuration = 60;

function isImageDataUrl(v: unknown): v is string {
  return typeof v === "string" && /^data:image\/(png|jpe?g|webp);base64,/i.test(v);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(",");
  const meta = dataUrl.slice(0, comma);
  const b64 = dataUrl.slice(comma + 1);
  const mime = /data:(.*?);base64/i.exec(meta)?.[1] || "image/png";
  const buf = Buffer.from(b64, "base64");
  return new Blob([buf], { type: mime });
}

// gpt-image-1 aceita 1024x1024, 1024x1536 (retrato) e 1536x1024 (paisagem).
function pickSize(ratio?: number): "1024x1024" | "1024x1536" | "1536x1024" {
  if (typeof ratio !== "number" || !isFinite(ratio) || ratio <= 0) return "1024x1536";
  if (ratio > 1.25) return "1536x1024";
  if (ratio < 0.8) return "1024x1536";
  return "1024x1024";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = (await req.json()) as {
      productName?: string;
      brandName?: string;
      productType?: string;
      ativos?: string;
      volumagem?: string;
      moodKeywords?: string;
      artPrompt?: string;
      refs?: string[];
      ratio?: number;
      // Modo "peça isolada": gera SÓ um elemento (ilustração ou ornamento) com
      // fundo transparente, para entrar como camada editável separada no editor.
      assetPrompt?: string;
      transparent?: boolean;
    };

    if (session.role === "SUBSCRIBER") {
      const c = await checkCredit(session.id, "image");
      if (!c.ok) return NextResponse.json({ error: c.error, code: "LIMIT_REACHED" }, { status: 402 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API de IA não configurada" }, { status: 500 });
    }

    const productName = body.productName?.trim() || "Produto";
    const brandName = body.brandName?.trim() || "";
    const productType = body.productType?.trim() || "produto";
    const ativos = body.ativos?.trim() || "";
    const volumagem = body.volumagem?.trim() || "";
    const mood = body.moodKeywords?.trim() || "elegante, moderno, limpo";
    const art = body.artPrompt?.trim() || "";

    const images = Array.isArray(body.refs) ? body.refs.filter(isImageDataUrl).slice(0, 3) : [];
    const hasRefs = images.length > 0;
    const size = pickSize(body.ratio);
    const asset = body.assetPrompt?.trim() || "";
    const wantTransparent = body.transparent === true || asset.length > 0;

    const prompt = asset
      // Peça isolada (ilustração ou ornamento) — fundo transparente, sem texto.
      ? `${asset}
${hasRefs ? "Inspire-se na paleta, clima e estilo das imagens de referência anexadas, sem copiá-las. " : ""}Requisitos ESTRITOS:
- FUNDO 100% TRANSPARENTE (PNG com alpha), sem cenário, sem retângulo de fundo, sem sombra dura.
- Apenas o elemento isolado, centralizado, arte plana (flat), com margem de respiro nas bordas.
- SEM QUALQUER TEXTO, letras, números, marca, tabela ou código de barras.
- Alta resolução, pronta para composição em um editor de rótulos.`
      // Arte de rótulo completa (modo antigo, fundo opaco).
      : `Arte de FRENTE de rótulo de ${productType} "${productName}"${brandName ? ` da marca "${brandName}"` : ""}, vista plana (flat), para impressão.
${art ? `Direção visual: ${art} ` : `Estilo/estética: ${mood}. `}${ativos ? `Elementos em destaque: ${ativos}. ` : ""}${volumagem ? `Volume: ${volumagem}. ` : ""}
${hasRefs ? "Inspire-se nas imagens de referência anexadas (paleta, clima, texturas e estilo), sem copiá-las literalmente. " : ""}
Requisitos:
- Composição de fundo editorial e limpa, com áreas de respiro para receber textos depois.
- NÃO inclua tabela nutricional, lista de ingredientes, avisos legais, códigos de barras nem texto fictício. No máximo o nome do produto de forma estilizada.
- Sem mockup 3D, sem frasco, sem mãos — apenas a arte plana do rótulo.
- Alta resolução, pronta para impressão.`;

    let response: Response;

    if (hasRefs) {
      // /images/edits — multipart, com as referências como base.
      const form = new FormData();
      form.append("model", "gpt-image-1");
      form.append("prompt", prompt);
      form.append("size", size);
      form.append("n", "1");
      form.append("quality", "medium");
      if (wantTransparent) {
        form.append("background", "transparent");
        form.append("output_format", "png");
      }
      images.forEach((url, i) => form.append("image[]", dataUrlToBlob(url), `ref${i}.png`));

      response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } else {
      const genBody: Record<string, unknown> = { model: "gpt-image-1", prompt, size, n: 1, quality: "medium" };
      if (wantTransparent) {
        genBody.background = "transparent";
        genBody.output_format = "png";
      }
      response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(genBody),
      });
    }

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[generate-image OpenAI error]", response.status, errBody);
      return NextResponse.json({ error: "Erro ao gerar imagem com IA" }, { status: 502 });
    }

    const data = (await response.json()) as { data: Array<{ b64_json?: string; url?: string }> };
    const first = data.data?.[0];
    if (!first) return NextResponse.json({ error: "Resposta vazia da IA" }, { status: 502 });

    const imageBase64 = first.b64_json
      ? `data:image/png;base64,${first.b64_json}`
      : first.url ?? "";
    if (!imageBase64) return NextResponse.json({ error: "Imagem não retornada pela IA" }, { status: 502 });

    if (session.role === "SUBSCRIBER") await consumeCredit(session.id, "image");

    return NextResponse.json({ imageBase64, prompt });
  } catch (error) {
    console.error("[GENERATE IMAGE ERROR]", error);
    return NextResponse.json({ error: "Erro interno ao gerar a imagem" }, { status: 500 });
  }
}
