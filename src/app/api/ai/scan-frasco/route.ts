import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * POST /api/ai/scan-frasco
 *
 * Recebe uma imagem (data URL ou URL pública) de um frasco/embalagem
 * cosmética e devolve metadados identificados pela visão computacional
 * (GPT-4o vision) para que o usuário possa sugerir o rótulo certo.
 *
 * Body:
 *   { imageUrl: string }
 *
 * Response (200):
 *   {
 *     packaging: "Pote" | "Frasco" | "Bisnaga" | "Pump" | "Spray" | "Roll-on" | "Sachê" | "Outro",
 *     shape: "cilíndrico" | "quadrado" | "oval" | "irregular",
 *     volumeEstimate: string,   // ex: "200ml"
 *     material: string,          // ex: "PET", "vidro", "alumínio"
 *     suggestedLabelType: "sleeve" | "adesivo" | "serigrafia" | "in-mold",
 *     suggestedLabelSide: "unico" | "frente" | "verso" | "ambos",
 *     productCategory: string,
 *     notes: string
 *   }
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { imageUrl } = (await req.json()) as { imageUrl?: string };
    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl obrigatório" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API de IA não configurada" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content: `Você é especialista em embalagens cosméticas e impressão de rótulos.
Analise a imagem da embalagem enviada e identifique propriedades técnicas relevantes para a escolha do tipo de rótulo.

Responda SEMPRE com JSON válido nesta estrutura exata:
{
  "packaging": "Pote | Frasco | Bisnaga | Pump | Spray | Roll-on | Sachê | Outro",
  "shape": "cilíndrico | quadrado | oval | irregular",
  "volumeEstimate": "string com volume aproximado e unidade (ex: 200ml, 50g)",
  "material": "material aparente (ex: PET, vidro, alumínio, plástico opaco)",
  "suggestedLabelType": "sleeve | adesivo | serigrafia | in-mold",
  "suggestedLabelSide": "unico | frente | verso | ambos",
  "productCategory": "Cosméticos | Higiene | Perfumaria | Capilar | Outro",
  "notes": "Observações sobre a embalagem (máx 2 frases)"
}

Regras:
- Use "sleeve" para potes redondos e frascos cilíndricos sem ranhuras.
- Use "adesivo" para frascos cilíndricos lisos comuns, embalagens com superfície plana.
- Use "serigrafia" para vidros e embalagens premium.
- Use "in-mold" se você não consegue identificar.
- Se a embalagem é totalmente cilíndrica e lisa, "suggestedLabelSide" geralmente é "unico" (envolve toda a face).
- Em caso de dúvida, prefira "adesivo" + "ambos".`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identifique a embalagem e o melhor tipo de rótulo." },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[scan-frasco OpenAI error]", response.status, errBody);
      return NextResponse.json({ error: "Erro na API de visão. Tente novamente." }, { status: 502 });
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Resposta vazia da IA" }, { status: 502 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[SCAN FRASCO ERROR]", error);
    return NextResponse.json({ error: "Erro interno ao escanear o frasco" }, { status: 500 });
  }
}
