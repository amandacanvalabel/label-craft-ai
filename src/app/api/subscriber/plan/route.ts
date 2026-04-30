import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PLAN_DURATION_DAYS: Record<string, number> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  SEMIANNUAL: 180,
  ANNUAL: 365,
  LIFETIME: 0,
};

const METHOD_LABEL: Record<string, string> = {
  PIX: "PIX",
  BOLETO: "Boleto",
  CARD: "Cartão",
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: "Pago",
  PENDING: "Pendente",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [subscriber, availablePlans] = await Promise.all([
    prisma.subscriber.findUnique({
      where: { id: session.id },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            asaasInvoiceUrl: true,
            createdAt: true,
          },
        },
        models: { select: { id: true } },
      },
    }),
    prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
      select: {
        id: true, name: true, type: true, price: true,
        promotionalPrice: true, benefits: true, description: true,
      },
    }),
  ]);

  if (!subscriber) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  // Build current plan info
  let currentPlan = null;
  if (subscriber.plan) {
    const confirmedPayments = subscriber.payments.filter((p) => p.status === "CONFIRMED");
    const latestConfirmed = confirmedPayments[0] ?? null;
    const earliestConfirmed = confirmedPayments[confirmedPayments.length - 1] ?? null;

    const activatedAt = earliestConfirmed?.createdAt ?? subscriber.createdAt;
    const duration = PLAN_DURATION_DAYS[subscriber.plan.type] ?? 30;
    const isLifetime = subscriber.plan.type === "LIFETIME";
    const expiresAt = isLifetime
      ? null
      : latestConfirmed
      ? new Date(latestConfirmed.createdAt.getTime() + duration * 86_400_000)
      : new Date(activatedAt.getTime() + duration * 86_400_000);

    currentPlan = {
      id: subscriber.plan.id,
      name: subscriber.plan.name,
      type: subscriber.plan.type,
      price: subscriber.plan.price,
      promotionalPrice: subscriber.plan.promotionalPrice,
      benefits: subscriber.plan.benefits,
      activatedAt: activatedAt.toISOString(),
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      lastPaymentMethod: latestConfirmed ? (METHOD_LABEL[latestConfirmed.method] ?? latestConfirmed.method) : null,
    };
  }

  // Usage
  const usage = {
    labelsCreated: subscriber.models.length,
  };

  // Billing history
  const billingHistory = subscriber.payments.map((p) => ({
    id: p.id,
    date: p.createdAt.toISOString(),
    amount: p.amount,
    method: METHOD_LABEL[p.method] ?? p.method,
    status: p.status,
    statusLabel: STATUS_LABEL[p.status] ?? p.status,
    invoiceUrl: p.asaasInvoiceUrl ?? null,
  }));

  return NextResponse.json({ currentPlan, usage, billingHistory, availablePlans });
}
