import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * POST /api/ai/preview
 *
 * Gera uma PRÉVIA da arte do rótulo com IA para VISITANTE ANÔNIMO (sem login),
 * a partir do prompt digitado na landing. É a "isca" do funil: a pessoa vê a
 * cara do rótulo e, para continuar (dados da ANVISA), precisa se cadastrar.
 *
 * Anti-abuso: no máximo ANON_PREVIEW_LIMIT gerações por IP. Depois disso o
 * endpoint devolve { limit: true } e o cliente força o cadastro.
 *
 * A contagem por IP fica numa tabela própria criada sob demanda (CREATE TABLE
 * IF NOT EXISTS) — não exige migração do Prisma.
 *
 * Body: { prompt: string, produto?: 'alimento' | 'cosmetico', ratio?: number }
 * Resp: { imageBase64, remaining } | { limit: true, remaining: 0 } | { error }
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const ANON_PREVIEW_LIMIT = 2;      // gerações grátis por IP...
const ANON_PREVIEW_WINDOW_H = 24;  // ...dentro dessa janela (reseta a cada 24h)

function pickSize(ratio?: number): "1024x1024" | "1024x1536" | "1536x1024" {
  if (typeof ratio !== "number" || !isFinite(ratio) || ratio <= 0) return "1024x1536";
  if (ratio > 1.25) return "1536x1024";
  if (ratio < 0.8) return "1024x1536";
  return "1024x1024";
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "desconhecido"
  );
}

// Garante a tabela de contagem (uma vez; barato com IF NOT EXISTS).
async function ensureTable() {
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS anon_preview_quota (
       ip TEXT PRIMARY KEY,
       count INTEGER NOT NULL DEFAULT 0,
       updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
     )`
  );
}

// Conta só o que foi gerado DENTRO da janela (24h). Fora disso, considera 0
// (reset diário) — evita bloquear para sempre e é mais justo em IPs compartilhados.
async function getCount(ip: string): Promise<number> {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT count FROM anon_preview_quota
       WHERE ip = $1 AND updated_at >= now() - ($2 || ' hours')::interval`,
    ip,
    String(ANON_PREVIEW_WINDOW_H)
  )) as Array<{ count: number }>;
  return rows.length ? Number(rows[0].count) : 0;
}

async function bumpCount(ip: string): Promise<void> {
  // Se o último uso foi há mais de 24h, recomeça do 1; senão incrementa.
  await prisma.$executeRawUnsafe(
    `INSERT INTO anon_preview_quota (ip, count, updated_at)
       VALUES ($1, 1, now())
     ON CONFLICT (ip) DO UPDATE
       SET count = CASE
             WHEN anon_preview_quota.updated_at < now() - ($2 || ' hours')::interval THEN 1
             ELSE anon_preview_quota.count + 1
           END,
           updated_at = now()`,
    ip,
    String(ANON_PREVIEW_WINDOW_H)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      prompt?: string;
      produto?: string;
      ratio?: number;
    };
    const prompt = (body.prompt || "").trim();
    if (prompt.length < 4) {
      return NextResponse.json({ error: "Descreva o produto" }, { status: 400 });
    }

    // Usuário logado (inclui admin) NÃO tem limite de prévia — o anti-abuso é
    // só para visitante anônimo. Isso também libera você para testar à vontade.
    let isLoggedIn = false;
    try {
      isLoggedIn = !!(await getSession());
    } catch (_e) {
      isLoggedIn = false;
    }

    const ip = clientIp(req);

    // Checa o limite por IP (só para anônimo).
    let used = 0;
    if (!isLoggedIn) {
      try {
        await ensureTable();
        used = await getCount(ip);
      } catch (e) {
        // Se o banco falhar, não trava o funil: segue sem contagem confiável.
        console.error("[preview quota]", e);
      }
      if (used >= ANON_PREVIEW_LIMIT) {
        return NextResponse.json({ limit: true, remaining: 0 });
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API de IA não configurada" }, { status: 500 });
    }

    const produto =
      body.produto === "cosmetico" ? "cosmético" : "alimento";
    const size = pickSize(body.ratio);

    const genPrompt = `Arte de FRENTE de rótulo de ${produto}, vista plana (flat), para impressão, a partir da descrição do produto: "${prompt}".
Requisitos:
- Composição de fundo editorial e limpa, com áreas de respiro para receber textos depois.
- NÃO inclua tabela nutricional, lista de ingredientes, avisos legais, códigos de barras nem texto fictício. No máximo o nome do produto de forma estilizada.
- Sem mockup 3D, sem frasco, sem mãos — apenas a arte plana do rótulo.
- Alta resolução, visual atraente.`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: genPrompt,
        size,
        n: 1,
        quality: "high", // prévia caprichada (mais lenta/custosa que "low"/"medium")
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("[preview OpenAI error]", response.status, errBody);
      return NextResponse.json({ error: "Erro ao gerar a prévia" }, { status: 502 });
    }

    const data = (await response.json()) as {
      data: Array<{ b64_json?: string; url?: string }>;
    };
    const first = data.data?.[0];
    const imageBase64 = first?.b64_json
      ? `data:image/png;base64,${first.b64_json}`
      : first?.url ?? "";
    if (!imageBase64) {
      return NextResponse.json({ error: "Imagem não retornada pela IA" }, { status: 502 });
    }

    // Só conta para anônimo, e só quando gerou de verdade.
    if (!isLoggedIn) {
      try {
        await bumpCount(ip);
      } catch (e) {
        console.error("[preview bump]", e);
      }
    }

    return NextResponse.json({
      imageBase64,
      remaining: isLoggedIn ? null : Math.max(0, ANON_PREVIEW_LIMIT - (used + 1)),
    });
  } catch (error) {
    console.error("[PREVIEW ERROR]", error);
    return NextResponse.json({ error: "Erro interno ao gerar a prévia" }, { status: 500 });
  }
}
