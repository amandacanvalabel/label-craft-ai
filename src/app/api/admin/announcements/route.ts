import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

const VARIANTS = ["INFO", "SUCCESS", "WARNING", "PROMO"] as const;
type Variant = (typeof VARIANTS)[number];

export async function GET() {
  if (!(await guardAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await guardAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const b = await req.json();
  if (!b.title?.trim() || !b.message?.trim()) {
    return NextResponse.json({ error: "Título e mensagem são obrigatórios" }, { status: 400 });
  }
  const variant: Variant = VARIANTS.includes(b.variant) ? b.variant : "INFO";

  const created = await prisma.announcement.create({
    data: {
      title: b.title.trim(),
      message: b.message.trim(),
      variant,
      linkUrl: b.linkUrl?.trim() || null,
      linkLabel: b.linkLabel?.trim() || null,
      isActive: b.isActive ?? true,
      startsAt: b.startsAt ? new Date(b.startsAt) : null,
      endsAt: b.endsAt ? new Date(b.endsAt) : null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
