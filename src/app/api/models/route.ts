import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getUsage } from "@/lib/usage";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const models = await prisma.subscriberModel.findMany({
    where: { subscriberId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(models);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, canvasData, thumbnail, folderId } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  // Pasta opcional — valida que pertence ao assinante.
  if (folderId) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, subscriberId: session.id }, select: { id: true } });
    if (!folder) return NextResponse.json({ error: "Pasta inválida" }, { status: 400 });
  }

  // Limite de rótulos salvos do plano (cobrança avançada).
  if (session.role === "SUBSCRIBER") {
    const usage = await getUsage(session.id);
    if (usage && usage.labels.remaining !== null && usage.labels.remaining <= 0) {
      return NextResponse.json(
        { error: "Você atingiu o limite de rótulos salvos do seu plano. Faça upgrade para salvar mais.", code: "LIMIT_REACHED" },
        { status: 402 },
      );
    }
  }

  const model = await prisma.subscriberModel.create({
    data: {
      name: name.trim(),
      canvasData: canvasData ?? {},
      ...(typeof thumbnail === "string" ? { thumbnail } : {}),
      ...(folderId ? { folderId } : {}),
      subscriberId: session.id,
    },
  });

  return NextResponse.json(model, { status: 201 });
}
