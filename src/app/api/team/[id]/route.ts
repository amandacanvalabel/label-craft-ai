import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Alterar papel do membro (ADMIN/MEMBER).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const { role } = (await req.json()) as { role?: string };
  if (role !== "ADMIN" && role !== "MEMBER") return NextResponse.json({ error: "Papel inválido" }, { status: 400 });

  const updated = await prisma.teamMember.updateMany({ where: { id, ownerId: session.id }, data: { role } });
  if (updated.count === 0) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Remover membro / cancelar convite.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const deleted = await prisma.teamMember.deleteMany({ where: { id, ownerId: session.id } });
  if (deleted.count === 0) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
