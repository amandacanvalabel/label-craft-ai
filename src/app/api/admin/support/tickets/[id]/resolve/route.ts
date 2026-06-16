import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// Marca o chamado como resolvido (e avisa o usuário).
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guardAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({ where: { id }, select: { id: true } });
  if (!ticket) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.supportMessage.create({
    data: { ticketId: id, role: "AGENT", content: "Marcamos este atendimento como resolvido. Se precisar, é só reabrir ou enviar uma nova mensagem. 💙", readByUser: false },
  });
  await prisma.supportTicket.update({ where: { id }, data: { status: "RESOLVED", lastMessageAt: new Date() } });
  return NextResponse.json({ ok: true });
}
