import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const METHOD_LABEL: Record<string, string> = {
  PIX: "PIX",
  BOLETO: "Boleto",
  CARD: "Cartão",
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    subscribersAtivos,
    receitaMensalAgg,
    rotulosCriados,
    plans,
    revenuePerPlan,
    recentPayments,
    topSubs,
    recentSignups,
    recentModels,
  ] = await Promise.all([
    // 1. Total subscribers
    prisma.subscriber.count(),

    // 2. Revenue this month (confirmed payments)
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "CONFIRMED", createdAt: { gte: startOfMonth } },
    }),

    // 3. Total labels created
    prisma.subscriberModel.count(),

    // 4. Plans with subscriber count
    prisma.plan.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: { select: { subscribers: true } },
      },
      orderBy: { price: "asc" },
    }),

    // 5. Total confirmed revenue per plan
    prisma.payment.groupBy({
      by: ["planId"],
      _sum: { amount: true },
      where: { status: "CONFIRMED" },
    }),

    // 6. Recent sales (last 5 confirmed/pending payments)
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        createdAt: true,
        subscriber: { select: { name: true } },
        plan: { select: { name: true } },
      },
    }),

    // 7. Top subscribers by label count
    prisma.subscriber.findMany({
      take: 5,
      orderBy: { models: { _count: "desc" } },
      select: {
        id: true,
        name: true,
        plan: { select: { name: true } },
        _count: { select: { models: true } },
        payments: {
          where: { status: "CONFIRMED" },
          select: { amount: true },
        },
      },
    }),

    // 8. Recent signups (for activity)
    prisma.subscriber.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true, plan: { select: { name: true } } },
    }),

    // 9. Recent models (for activity)
    prisma.subscriberModel.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        subscriber: { select: { name: true } },
      },
    }),
  ]);

  // Plan distribution
  const revenueMap = new Map(revenuePerPlan.map((r) => [r.planId, r._sum.amount ?? 0]));
  const totalSubs = subscribersAtivos || 1;
  const planSummary = plans.map((p) => ({
    id: p.id,
    name: p.name,
    count: p._count.subscribers,
    pct: Math.round((p._count.subscribers / totalSubs) * 100),
    revenue: revenueMap.get(p.id) ?? 0,
  }));

  // Recent sales
  const recentSales = recentPayments.map((p) => ({
    id: p.id,
    subscriberName: p.subscriber.name,
    planName: p.plan.name,
    method: METHOD_LABEL[p.method] ?? p.method,
    amount: p.amount,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
  }));

  // Top subscribers
  const topSubscribers = topSubs.map((s) => ({
    id: s.id,
    name: s.name,
    planName: s.plan?.name ?? "Sem plano",
    labelsCount: s._count.models,
    totalRevenue: s.payments.reduce((acc, p) => acc + p.amount, 0),
  }));

  // Activity: merge signups + payments + models, sort desc, take 6
  type ActivityItem = {
    id: string;
    type: "signup" | "payment" | "model";
    title: string;
    description: string;
    createdAt: string;
  };

  const activity: ActivityItem[] = [
    ...recentSignups.map((s) => ({
      id: `signup-${s.id}`,
      type: "signup" as const,
      title: "Novo assinante",
      description: `${s.name} se cadastrou${s.plan ? ` no plano ${s.plan.name}` : ""}`,
      createdAt: s.createdAt.toISOString(),
    })),
    ...recentPayments
      .filter((p) => p.status === "CONFIRMED")
      .map((p) => ({
        id: `payment-${p.id}`,
        type: "payment" as const,
        title: "Pagamento confirmado",
        description: `${p.method === "PIX" ? "PIX" : p.method === "BOLETO" ? "Boleto" : "Cartão"} de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.amount)} — ${p.subscriber.name}`,
        createdAt: p.createdAt.toISOString(),
      })),
    ...recentModels.map((m) => ({
      id: `model-${m.id}`,
      type: "model" as const,
      title: "Rótulo criado",
      description: `${m.subscriber.name} criou "${m.name}"`,
      createdAt: m.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return NextResponse.json({
    stats: {
      subscribersAtivos,
      receitaMensal: receitaMensalAgg._sum.amount ?? 0,
      rotulosCriados,
      usoDeIA: rotulosCriados,
    },
    planSummary,
    recentSales,
    topSubscribers,
    activity,
  });
}
