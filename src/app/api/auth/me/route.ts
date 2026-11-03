import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanAccess } from "@/lib/access";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let planInfo: {
    planName: string;
    planType: string;
    status: "active" | "pending" | "expired" | "none";
    active: boolean;
    activatedAt: string | null;
    expiresAt: string | null;
    needsCpf: boolean;
  } | null = null;
  let avatar: string | null = null;

  if (session.role === "SUBSCRIBER") {
    const [subscriber, access] = await Promise.all([
      prisma.subscriber.findUnique({ where: { id: session.id }, select: { avatar: true, cpfOrCnpj: true } }),
      getPlanAccess(session.id),
    ]);
    avatar = subscriber?.avatar ?? null;
    if (access.plan) {
      planInfo = {
        planName: access.plan.name,
        planType: access.plan.type,
        status: access.status,
        active: access.active,
        activatedAt: access.activatedAt ? access.activatedAt.toISOString() : null,
        expiresAt: access.expiresAt ? access.expiresAt.toISOString() : null,
        needsCpf: !subscriber?.cpfOrCnpj,
      };
    }
  }

  return NextResponse.json({ user: session, planInfo, avatar });
}
