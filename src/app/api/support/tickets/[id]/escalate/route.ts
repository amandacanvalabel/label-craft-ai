import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Escalar para atendente humano (ou reabrir um chamado resolvido).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;

  const ticket = await prisma.supportTicket.findFirst({ where: { id, subscriberId: session.id }, select: { id: true } });
  if (!ticket) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.supportTicket.update({ where: { id }, data: { status: "HUMAN", lastMessageAt: new Date() } });
  await prisma.supportMessage.create({
    data: { ticketId: id, role: "ASSISTANT", content: "Encaminhei sua conversa para um atendente humano. Em breve alguém do time responde por aqui. 🙋", readByUser: false },
  });
  return NextResponse.json({ ok: true });
}
