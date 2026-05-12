import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * POST /api/ai/generate-image
 *
 * Gera uma arte de FRENTE de rótulo (sem texto manipulável) a partir
 * dos dados do produto + mood board do usuário, usando gpt-image-1.
 *
 * Body:
 *   {
 *     productName: string,
 *     brandName?: string,
 *     productType?: string,    // "Shampoo", "Creme facial", etc
 *     ativos?: string,
 *     volumagem?: string,
 *     moodKeywords?: string,   // estilo desejado (ex: "minimalista, dourado, premium")
 *     size?: "1024x1024" | "1024x1536" | "1536x1024",
 *   }
 *
 * Response:
 *   { imageBase64: string, prompt: string }
 */
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
      size?: "1024x1024" | "1024x1536" | "1536x1024";
    };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API de IA não configurada" }, { status: 500 });
    }

    const productName = body.productName?.trim() || "Produto Cosmético";
    const brandName = body.brandName?.trim() || "";
    const productType = body.productType?.trim() || "cosmético";
    const ativos = body.ativos?.trim() || "";
    const volumagem = body.volumagem?.trim() || "";
    const mood = body.moodKeywords?.trim() || "elegante, moderno, limpo";

    // Construímos um prompt rico e específico
    const prompt = `Design de rótulo de produto cosmético, vista frontal (face vendedora) para impressão.
Produto: ${productType} "${productName}"${brandName ? ` da marca "${brandName}"` : ""}.
${ativos ? `Ativos em destaque: ${ativos}. ` : ""}${volumagem ? `Volumagem: ${volumagem}. ` : ""}
Estilo / referência estética: ${mood}.

Requisitos técnicos do rótulo:
- Layout retangular vertical, proporção 2:3.
- Composição editorial limpa, com hierarquia tipográfica clara.
- Use APENAS o nome do produto e marca como texto principal — NÃO inclua texto fictício de ingredientes, modo de uso ou avisos regulatórios.
- Fundo coerente com a estética solicitada.
- Sem mockup 3D, sem frasco — apenas a arte plana do rótulo.
- Saída em alta resolução, pronta para impressão.`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: body.size ?? "1024x1536",
        n: 1,
        quality: "high",
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[generate-image OpenAI error]", response.status, errBody);
      return NextResponse.json({ error: "Erro ao gerar imagem com IA" }, { status: 502 });
    }

    const data = (await response.json()) as {
      data: Array<{ b64_json?: string; url?: string }>;
    };

    const first = data.data?.[0];
    if (!first) {
      return NextResponse.json({ error: "Resposta vazia da IA" }, { status: 502 });
    }

    const imageBase64 = first.b64_json
      ? `data:image/png;base64,${first.b64_json}`
      : first.url ?? "";

    if (!imageBase64) {
      return NextResponse.json({ error: "Imagem não retornada pela IA" }, { status: 502 });
    }

    return NextResponse.json({ imageBase64, prompt });
  } catch (error) {
    console.error("[GENERATE IMAGE ERROR]", error);
    return NextResponse.json({ error: "Erro interno ao gerar a imagem" }, { status: 500 });
  }
}
