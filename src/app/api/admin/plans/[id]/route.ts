import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as {
    name?: string; description?: string; type?: string;
    price?: number; promotionalPrice?: number | null;
    isActive?: boolean; benefits?: string[];
  };

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.type !== undefined && { type: body.type as never }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.promotionalPrice !== undefined && { promotionalPrice: body.promotionalPrice || null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.benefits !== undefined && { benefits: body.benefits }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const subscriberCount = await prisma.subscriber.count({ where: { planId: id } });
  if (subscriberCount > 0) {
    return NextResponse.json(
      { error: `Este plano tem ${subscriberCount} assinante(s) vinculado(s). Remova-os antes de excluir.` },
      { status: 409 }
    );
  }

  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
