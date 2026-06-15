import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Subpastas são recurso do plano Profissional.
async function isPro(subscriberId: string): Promise<boolean> {
  const s = await prisma.subscriber.findUnique({
    where: { id: subscriberId },
    select: { plan: { select: { name: true } } },
  });
  const n = (s?.plan?.name ?? "").toLowerCase();
  return n.includes("pro") || n.includes("profis");
}

// Lista as pastas do assinante com a contagem de rótulos em cada uma.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const folders = await prisma.folder.findMany({
    where: { subscriberId: session.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, name: true, color: true, parentId: true,
      _count: { select: { models: true } },
    },
  });

  return NextResponse.json(
    folders.map((f) => ({ id: f.id, name: f.name, color: f.color, parentId: f.parentId, count: f._count.models })),
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { name, color, parentId } = (await req.json()) as { name?: string; color?: string; parentId?: string | null };
  if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  if (parentId) {
    if (!(await isPro(session.id))) {
      return NextResponse.json({ error: "Subpastas estão disponíveis no plano Profissional.", code: "PRO_ONLY" }, { status: 402 });
    }
    // Garante que a pasta-pai é do próprio assinante e é de 1º nível (sem aninhar além de 1 nível).
    const parent = await prisma.folder.findFirst({ where: { id: parentId, subscriberId: session.id }, select: { parentId: true } });
    if (!parent) return NextResponse.json({ error: "Pasta-pai inválida" }, { status: 400 });
    if (parent.parentId) return NextResponse.json({ error: "Só é permitido um nível de subpasta." }, { status: 400 });
  }

  const folder = await prisma.folder.create({
    data: {
      name: name.trim(),
      color: /^#[0-9a-fA-F]{6}$/.test(color ?? "") ? color! : "#2563eb",
      parentId: parentId || null,
      subscriberId: session.id,
    },
    select: { id: true, name: true, color: true, parentId: true },
  });

  return NextResponse.json({ ...folder, count: 0 }, { status: 201 });
}
