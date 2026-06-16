import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { aiSupportReply } from "@/lib/support";

// Lista meus chamados (histórico) + total de respostas não lidas.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { subscriberId: session.id },
    orderBy: { lastMessageAt: "desc" },
    select: {
      id: true, subject: true, status: true, lastMessageAt: true,
      messages: { where: { role: { in: ["ASSISTANT", "AGENT"] }, readByUser: false }, select: { id: true } },
    },
  });

  const list = tickets.map((t) => ({
    id: t.id, subject: t.subject, status: t.status,
    lastMessageAt: t.lastMessageAt.toISOString(), unread: t.messages.length,
  }));
  const unread = list.reduce((s, t) => s + t.unread, 0);

  return NextResponse.json({ tickets: list, unread });
}

// Abre um novo chamado: 1ª mensagem do usuário + resposta da IA.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { subject, message } = (await req.json()) as { subject?: string; message?: string };
  if (!message?.trim()) return NextResponse.json({ error: "Escreva sua dúvida" }, { status: 400 });

  const ticket = await prisma.supportTicket.create({
    data: {
      subject: (subject?.trim() || message.trim().slice(0, 60)),
      subscriberId: session.id,
      status: "AI",
      messages: { create: { role: "USER", content: message.trim() } },
    },
  });

  const reply = await aiSupportReply([{ role: "USER", content: message.trim() }]);
  await prisma.supportMessage.create({
    data: { ticketId: ticket.id, role: "ASSISTANT", content: reply, readByUser: false },
  });
  await prisma.supportTicket.update({ where: { id: ticket.id }, data: { lastMessageAt: new Date() } });

  return NextResponse.json({ id: ticket.id }, { status: 201 });
}
