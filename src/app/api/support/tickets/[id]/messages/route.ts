import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { aiSupportReply } from "@/lib/support";

// Envia mensagem do usuário; se o chamado está no modo IA, gera a resposta.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const { content, attachmentUrl, attachmentName } = (await req.json()) as {
    content?: string; attachmentUrl?: string; attachmentName?: string;
  };
  if (!content?.trim() && !attachmentUrl) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

  const ticket = await prisma.supportTicket.findFirst({ where: { id, subscriberId: session.id }, select: { id: true, status: true } });
  if (!ticket) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.supportMessage.create({
    data: {
      ticketId: id, role: "USER", content: content?.trim() || "(anexo)",
      attachmentUrl: attachmentUrl || null, attachmentName: attachmentName || null,
    },
  });

  // Reabre automaticamente se estava resolvido.
  let status = ticket.status;
  if (status === "RESOLVED") status = "HUMAN";

  let aiReply: string | null = null;
  if (status === "AI") {
    const history = await prisma.supportMessage.findMany({
      where: { ticketId: id }, orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });
    aiReply = await aiSupportReply(history.map((m) => ({ role: m.role, content: m.content })));
    await prisma.supportMessage.create({ data: { ticketId: id, role: "ASSISTANT", content: aiReply, readByUser: false } });
  }

  await prisma.supportTicket.update({ where: { id }, data: { status, lastMessageAt: new Date() } });
  return NextResponse.json({ ok: true, aiReply });
}
