import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

  const { name, canvasData } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const model = await prisma.subscriberModel.create({
    data: {
      name: name.trim(),
      canvasData: canvasData ?? {},
      subscriberId: session.id,
    },
  });

  return NextResponse.json(model, { status: 201 });
}
