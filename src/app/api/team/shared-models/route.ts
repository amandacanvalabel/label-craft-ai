import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { activeOwnerIdsFor } from "@/lib/team";

// Modelos compartilhados com o assinante (das equipes em que ele é membro ativo).
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const owners = await activeOwnerIdsFor(session.id);
  if (owners.length === 0) return NextResponse.json([]);

  const models = await prisma.subscriberModel.findMany({
    where: { subscriberId: { in: owners } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, name: true, canvasData: true, createdAt: true, updatedAt: true, folderId: true,
      subscriber: { select: { name: true } },
    },
  });

  return NextResponse.json(models.map((m) => ({
    id: m.id, name: m.name, canvasData: m.canvasData,
    createdAt: m.createdAt, updatedAt: m.updatedAt, folderId: m.folderId,
    ownerName: m.subscriber?.name ?? "Equipe",
  })));
}
