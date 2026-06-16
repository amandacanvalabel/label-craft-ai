import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Reabrir um chamado resolvido (volta para o assistente IA).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;

  const ticket = await prisma.supportTicket.findFirst({ where: { id, subscriberId: session.id }, select: { id: true } });
  if (!ticket) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.supportTicket.update({ where: { id }, data: { status: "AI", lastMessageAt: new Date() } });
  return NextResponse.json({ ok: true });
}
