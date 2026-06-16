import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Mensagens de um chamado (e marca as respostas como lidas).
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, subscriberId: session.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!ticket) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Marca respostas (IA/atendente) como lidas.
  await prisma.supportMessage.updateMany({
    where: { ticketId: id, role: { in: ["ASSISTANT", "AGENT"] }, readByUser: false },
    data: { readByUser: true },
  });

  return NextResponse.json({
    id: ticket.id, subject: ticket.subject, status: ticket.status,
    messages: ticket.messages.map((m) => ({
      id: m.id, role: m.role, content: m.content,
      attachmentUrl: m.attachmentUrl, attachmentName: m.attachmentName,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
