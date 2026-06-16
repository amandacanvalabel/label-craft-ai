import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// Resposta do atendente humano. Marca como não lida para o usuário (notificação).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guardAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const { content } = (await req.json()) as { content?: string };
  if (!content?.trim()) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id }, select: { id: true } });
  if (!ticket) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.supportMessage.create({ data: { ticketId: id, role: "AGENT", content: content.trim(), readByUser: false } });
  await prisma.supportTicket.update({ where: { id }, data: { status: "HUMAN", lastMessageAt: new Date() } });
  return NextResponse.json({ ok: true });
}
