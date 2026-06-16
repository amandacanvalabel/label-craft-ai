import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// Lista todos os chamados para o admin.
export async function GET() {
  if (!(await guardAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { lastMessageAt: "desc" },
    select: {
      id: true, subject: true, status: true, lastMessageAt: true, createdAt: true,
      subscriber: { select: { name: true, email: true, avatar: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { role: true, content: true } },
    },
  });

  return NextResponse.json(tickets.map((t) => ({
    id: t.id, subject: t.subject, status: t.status,
    lastMessageAt: t.lastMessageAt.toISOString(),
    subscriberName: t.subscriber?.name ?? "—",
    subscriberEmail: t.subscriber?.email ?? "",
    avatar: t.subscriber?.avatar ?? null,
    lastMessage: t.messages[0]?.content ?? "",
    waitingReply: t.status === "HUMAN" && t.messages[0]?.role === "USER",
  })));
}
