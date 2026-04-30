import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { prompt, currentFields } = await req.json() as {
      prompt: string;
      currentFields?: Record<string, string>;
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API de IA não configurada" }, { status: 500 });
    }

    const contextNote = currentFields?.productName
      ? `\nContexto atual do rótulo: Produto "${currentFields.productName}"${currentFields.brandName ? `, marca "${currentFields.brandName}"` : ""}${currentFields.weight ? `, ${currentFields.weight}` : ""}.`
      : "";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.35,
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content: `Você é especialista em rotulagem cosmética no Brasil, com profundo conhecimento da RDC 21/2022, RDC 07/2015 e demais normativas ANVISA.
Ao receber a descrição de um produto cosmético, gere os textos obrigatórios do rótulo em português brasileiro.${contextNote}

Responda SEMPRE com JSON válido nesta estrutura exata:
{
  "message": "Mensagem amigável e objetiva resumindo o que foi gerado (máx. 2 frases)",
  "fields": {
    "productName": "Nome comercial do produto",
    "brandName": "Nome da marca/fabricante",
    "weight": "Conteúdo líquido com unidade (ex: 50g, 120ml, 200ml)",
    "ingredients": "Lista de ingredientes em nomenclatura INCI, separados por vírgulas, em ordem decrescente de concentração",
    "directions": "Modo de uso em 1 a 3 frases claras e objetivas",
    "warnings": "Advertências obrigatórias conforme ANVISA para a categoria do produto"
  }
}

Regras obrigatórias:
- Ingredientes: use nomenclatura INCI (nomes em latim/inglês conforme Cosmetic Ingredient Database)
- Advertências mínimas para cosméticos em geral: "Uso externo. Evite contato com os olhos. Em caso de irritação, suspenda o uso e consulte um médico. Mantenha fora do alcance de crianças."
- Adicione advertências específicas se o produto contiver ácidos, retinol, filtros solares, corantes, etc.
- Deixe string vazia ("") nos campos que não conseguir inferir da descrição
- Não invente dados regulatórios (ANVISA, SAC) — esses campos ficam vazios
- Seja técnico mas acessível ao consumidor final`,
          },
          {
            role: "user",
            content: prompt.trim(),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[OpenAI error]", response.status, errBody);
      return NextResponse.json({ error: "Erro na API de IA. Tente novamente." }, { status: 502 });
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Resposta vazia da IA" }, { status: 502 });
    }

    const parsed = JSON.parse(content) as {
      message?: string;
      fields?: Record<string, string>;
    };

    const fields = parsed.fields ?? {};
    const filledCount = Object.values(fields).filter((v) => v?.trim()).length;

    return NextResponse.json({
      message: parsed.message ?? `${filledCount} campo(s) gerado(s) com sucesso.`,
      fields,
    });
  } catch (error) {
    console.error("[GENERATE LABEL ERROR]", error);
    return NextResponse.json({ error: "Erro interno ao gerar conteúdo" }, { status: 500 });
  }
}
