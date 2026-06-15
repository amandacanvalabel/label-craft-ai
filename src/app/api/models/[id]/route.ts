import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessModel } from "@/lib/team";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Dono OU membro ativo da equipe do dono.
  if (!(await canAccessModel(session.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const model = await prisma.subscriberModel.findUnique({ where: { id } });
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(model);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, canvasData, thumbnail, folderId } = await req.json();

  const model = await prisma.subscriberModel.findUnique({ where: { id }, select: { subscriberId: true } });
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = model.subscriberId === session.id;
  // Não-dono só edita se for membro ativo da equipe do dono (colaboração).
  if (!isOwner && !(await canAccessModel(session.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Mover para pasta é só do dono (pastas pertencem a ele).
  if (isOwner && folderId) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, subscriberId: session.id }, select: { id: true } });
    if (!folder) return NextResponse.json({ error: "Pasta inválida" }, { status: 400 });
  }

  await prisma.subscriberModel.update({
    where: { id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(canvasData !== undefined ? { canvasData } : {}),
      ...(typeof thumbnail === "string" ? { thumbnail } : {}),
      ...(isOwner && folderId !== undefined ? { folderId: folderId || null } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const deleted = await prisma.subscriberModel.deleteMany({
    where: { id, subscriberId: session.id },
  });

  if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
