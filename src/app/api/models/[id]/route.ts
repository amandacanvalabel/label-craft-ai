import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const model = await prisma.subscriberModel.findFirst({
    where: { id, subscriberId: session.id },
  });

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

  // Mover para pasta: valida que a pasta é do próprio assinante (folderId null = "Sem pasta").
  if (folderId) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, subscriberId: session.id }, select: { id: true } });
    if (!folder) return NextResponse.json({ error: "Pasta inválida" }, { status: 400 });
  }

  const updated = await prisma.subscriberModel.updateMany({
    where: { id, subscriberId: session.id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(canvasData !== undefined ? { canvasData } : {}),
      ...(typeof thumbnail === "string" ? { thumbnail } : {}),
      ...(folderId !== undefined ? { folderId: folderId || null } : {}),
    },
  });

  if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
