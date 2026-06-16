import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// Conversa completa para o admin.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await guardAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      subscriber: { select: { name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!ticket) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json({
    id: ticket.id, subject: ticket.subject, status: ticket.status,
    subscriberName: ticket.subscriber?.name ?? "—", subscriberEmail: ticket.subscriber?.email ?? "",
    messages: ticket.messages.map((m) => ({
      id: m.id, role: m.role, content: m.content,
      attachmentUrl: m.attachmentUrl, attachmentName: m.attachmentName,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
