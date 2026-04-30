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
    name?: string; email?: string; phone?: string;
    city?: string; state?: string; planId?: string | null;
  };

  // Email uniqueness check
  if (body.email) {
    const conflict = await prisma.subscriber.findFirst({
      where: { email: body.email, NOT: { id } },
    });
    if (conflict) return NextResponse.json({ error: "E-mail já em uso" }, { status: 409 });
  }

  const updated = await prisma.subscriber.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.state !== undefined && { state: body.state }),
      ...(body.planId !== undefined && { planId: body.planId || null }),
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  await prisma.subscriber.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
