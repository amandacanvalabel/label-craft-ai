import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Duration in days per plan type
const PLAN_DURATION_DAYS: Record<string, number> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  SEMIANNUAL: 180,
  ANNUAL: 365,
  LIFETIME: 0,
};

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let planInfo: {
    planName: string;
    planType: string;
    activatedAt: string | null;
    expiresAt: string | null;
  } | null = null;
  let avatar: string | null = null;

  if (session.role === "SUBSCRIBER") {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id: session.id },
      include: {
        plan: { select: { name: true, type: true } },
        payments: {
          where: { status: "CONFIRMED" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    avatar = subscriber?.avatar ?? null;

    if (subscriber?.plan) {
      const confirmedPayment = subscriber.payments[0] ?? null;
      const activatedAt = confirmedPayment?.createdAt ?? subscriber.createdAt;
      const duration = PLAN_DURATION_DAYS[subscriber.plan.type] ?? 30;
      const expiresAt =
        subscriber.plan.type === "LIFETIME"
          ? null
          : new Date(activatedAt.getTime() + duration * 86_400_000);

      planInfo = {
        planName: subscriber.plan.name,
        planType: subscriber.plan.type,
        activatedAt: activatedAt.toISOString(),
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
      };
    }
  }

  return NextResponse.json({ user: session, planInfo, avatar });
}
