import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Renomear / mudar cor da pasta.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { name, color } = (await req.json()) as { name?: string; color?: string };

  const data: { name?: string; color?: string } = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)) data.color = color;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });

  const updated = await prisma.folder.updateMany({ where: { id, subscriberId: session.id }, data });
  if (updated.count === 0) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Excluir pasta. Rótulos dentro dela voltam para "Sem pasta" (folderId = null,
// via onDelete: SetNull); subpastas são removidas (onDelete: Cascade).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const deleted = await prisma.folder.deleteMany({ where: { id, subscriberId: session.id } });
  if (deleted.count === 0) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
