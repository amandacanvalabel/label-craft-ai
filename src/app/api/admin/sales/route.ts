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

  const [receitaMensalAgg, confirmedTotal, pendingTotal, ticketAgg, payments] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "CONFIRMED", createdAt: { gte: startOfMonth } },
    }),
    prisma.payment.count({ where: { status: "CONFIRMED" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.payment.aggregate({
      _avg: { amount: true },
      where: { status: "CONFIRMED" },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        asaasInvoiceUrl: true,
        createdAt: true,
        subscriber: { select: { name: true, email: true } },
        plan: { select: { name: true, type: true } },
      },
    }),
  ]);

  const sales = payments.map((p) => {
    const dur = PLAN_DURATION_DAYS[p.plan.type] ?? 30;
    const expiresAt = p.status === "CONFIRMED" && dur > 0
      ? new Date(p.createdAt.getTime() + dur * 86_400_000).toISOString()
      : null;

    return {
      id: p.id,
      subscriberName: p.subscriber.name,
      subscriberEmail: p.subscriber.email,
      planName: p.plan.name,
      method: p.method,
      amount: p.amount,
      status: p.status,
      invoiceUrl: p.asaasInvoiceUrl ?? null,
      createdAt: p.createdAt.toISOString(),
      expiresAt,
    };
  });

  return NextResponse.json({
    stats: {
      receitaMensal: receitaMensalAgg._sum.amount ?? 0,
      confirmedTotal,
      pendingTotal,
      ticketMedio: ticketAgg._avg.amount ?? 0,
    },
    sales,
  });
}
