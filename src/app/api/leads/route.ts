import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Captura de leads da landing (checklist ANVISA em troca do e-mail).
// Tabela própria criada sob demanda, no mesmo padrão da cota anônima de IA,
// para não depender de migration. Consulta rápida no banco:
//   SELECT email, source, created_at FROM landing_leads ORDER BY created_at DESC;
export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS landing_leads (
      id          BIGSERIAL PRIMARY KEY,
      email       TEXT NOT NULL,
      source      TEXT NOT NULL DEFAULT 'checklist',
      ip          TEXT,
      user_agent  TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS landing_leads_email_idx ON landing_leads (email)`
  );
}

export async function POST(req: NextRequest) {
  let body: { email?: string; source?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const source = String(body.source ?? "checklist").slice(0, 40);
  if (!EMAIL_RE.test(email) || email.length > 160) {
    return NextResponse.json({ error: "Informe um e-mail válido" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ua = (req.headers.get("user-agent") || "").slice(0, 300);

  try {
    await ensureTable();
    // Um registro por e-mail+origem (reenvio não duplica)
    const existing = (await prisma.$queryRawUnsafe(
      `SELECT id FROM landing_leads WHERE email = $1 AND source = $2 LIMIT 1`,
      email,
      source
    )) as { id: bigint }[];
    if (existing.length === 0) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO landing_leads (email, source, ip, user_agent) VALUES ($1, $2, $3, $4)`,
        email,
        source,
        ip,
        ua
      );
    }
  } catch (err) {
    console.error("[leads] erro ao salvar", err);
    // Não bloqueia a pessoa de receber o material.
  }

  return NextResponse.json({ ok: true, url: "/checklist-anvisa-32-itens.html" });
}

// Lista de leads para a Amanda (só ADMIN logado).
//   /api/leads            → JSON
//   /api/leads?format=csv → baixa CSV pra abrir no Excel / importar no e-mail marketing
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    await ensureTable();
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT email, source, created_at FROM landing_leads ORDER BY created_at DESC LIMIT 5000`
    )) as { email: string; source: string; created_at: Date }[];

    if (req.nextUrl.searchParams.get("format") === "csv") {
      const csv = ["email;origem;data", ...rows.map((r) => `${r.email};${r.source};${new Date(r.created_at).toISOString()}`)].join("\n");
      return new NextResponse("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="leads-canvalabel.csv"`,
        },
      });
    }
    return NextResponse.json({ total: rows.length, leads: rows });
  } catch (err) {
    console.error("[leads] erro ao listar", err);
    return NextResponse.json({ error: "Erro ao listar leads" }, { status: 500 });
  }
}
