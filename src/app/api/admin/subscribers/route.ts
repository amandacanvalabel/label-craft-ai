import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PLAN_DURATION_DAYS: Record<string, number> = {
  MONTHLY: 30, QUARTERLY: 90, SEMIANNUAL: 180, ANNUAL: 365, LIFETIME: 0,
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, newThisMonth, plans, subscribers] = await Promise.all([
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      select: { id: true, name: true, type: true, price: true, promotionalPrice: true },
    }),
    prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpfOrCnpj: true,
        city: true,
        state: true,
        createdAt: true,
        planId: true,
        updatedAt: true,
        plan: { select: { id: true, name: true, type: true } },
        _count: { select: { models: true } },
        payments: {
          orderBy: { createdAt: "asc" },
          select: { amount: true, createdAt: true, status: true },
        },
      },
    }),
  ]);

  const list = subscribers.map((s) => {
    const allPayments = s.payments;
    const confirmed = allPayments.filter((p) => p.status === "CONFIRMED");
    const hasPending = allPayments.some((p) => p.status === "PENDING");
    const earliest = confirmed[0] ?? null;
    const latest = confirmed[confirmed.length - 1] ?? null;
    const confirmedRevenue = confirmed.reduce((acc, p) => acc + p.amount, 0);

    // "pending" only when there are PENDING payments waiting for confirmation.
    // Admin-assigned (planId set, zero payments) → treat as active.
    let status: "active" | "pending" | "no_plan";
    if (!s.planId) status = "no_plan";
    else if (confirmed.length > 0) status = "active";
    else if (hasPending) status = "pending";
    else status = "active"; // admin-assigned, no payment flow

    // activatedAt: first confirmed payment, or updatedAt when admin assigned plan directly
    const activatedAt = earliest
      ? earliest.createdAt.toISOString()
      : s.planId
      ? s.updatedAt.toISOString()
      : null;

    // expiresAt: latest confirmed + duration, or updatedAt + duration for admin-assigned
    const baseDate = latest ? latest.createdAt : (s.planId && !hasPending ? s.updatedAt : null);
    let expiresAt: string | null = null;
    if (baseDate && s.plan) {
      const dur = PLAN_DURATION_DAYS[s.plan.type] ?? 30;
      if (dur > 0) {
        expiresAt = new Date(baseDate.getTime() + dur * 86_400_000).toISOString();
      }
    }

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      cpfOrCnpj: s.cpfOrCnpj,
      planId: s.planId,
      planName: s.plan?.name ?? null,
      city: s.city,
      state: s.state,
      labelsCount: s._count.models,
      status,
      confirmedRevenue,
      createdAt: s.createdAt.toISOString(),
      activatedAt,
      expiresAt,
    };
  });

  const withPlan = list.filter((s) => s.status !== "no_plan").length;
  const retentionPct = total > 0 ? Math.round((withPlan / total) * 100) : 0;

  return NextResponse.json({
    stats: { total, newThisMonth, retentionPct },
    subscribers: list,
    plans,
  });
}
