import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isPro } from "@/lib/team";

// Lista os membros da equipe do assinante (dono).
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [members, pro] = await Promise.all([
    prisma.teamMember.findMany({
      where: { ownerId: session.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true, email: true, role: true, status: true, createdAt: true,
        member: { select: { name: true, avatar: true } },
      },
    }),
    isPro(session.id),
  ]);

  return NextResponse.json({
    isPro: pro,
    members: members.map((m) => ({
      id: m.id, email: m.email, role: m.role, status: m.status,
      name: m.member?.name ?? null, avatar: m.member?.avatar ?? null,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

// Convida um membro por e-mail.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!(await isPro(session.id))) {
    return NextResponse.json({ error: "Equipe é um recurso do plano Profissional.", code: "PRO_ONLY" }, { status: 402 });
  }

  const { email, role } = (await req.json()) as { email?: string; role?: string };
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }
  if (cleanEmail === session.email.toLowerCase()) {
    return NextResponse.json({ error: "Você já é o dono da equipe" }, { status: 400 });
  }

  const existing = await prisma.teamMember.findUnique({ where: { ownerId_email: { ownerId: session.id, email: cleanEmail } } });
  if (existing) return NextResponse.json({ error: "Esse e-mail já foi convidado" }, { status: 409 });

  // Se o e-mail já é um assinante, vincula e ativa direto; senão fica pendente.
  const sub = await prisma.subscriber.findUnique({ where: { email: cleanEmail }, select: { id: true } });

  const created = await prisma.teamMember.create({
    data: {
      ownerId: session.id,
      email: cleanEmail,
      role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      status: sub ? "ACTIVE" : "PENDING",
      memberId: sub?.id ?? null,
      acceptedAt: sub ? new Date() : null,
    },
    select: { id: true, email: true, role: true, status: true },
  });

  return NextResponse.json(created, { status: 201 });
}
