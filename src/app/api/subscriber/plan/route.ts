import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUsage } from "@/lib/usage";
import { getPlanAccess } from "@/lib/access";
import { NextResponse } from "next/server";

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

  // Situação real do plano (pago e no prazo / pendente / vencido).
  const access = await getPlanAccess(session.id);
  let currentPlan = null;
  if (subscriber.plan) {
    const confirmedPayments = subscriber.payments.filter((p) => p.status === "CONFIRMED");
    const latestConfirmed = confirmedPayments[0] ?? null;
    currentPlan = {
      id: subscriber.plan.id,
      name: subscriber.plan.name,
      type: subscriber.plan.type,
      price: subscriber.plan.price,
      promotionalPrice: subscriber.plan.promotionalPrice,
      benefits: subscriber.plan.benefits,
      status: access.status,
      active: access.active,
      activatedAt: (access.activatedAt ?? subscriber.createdAt).toISOString(),
      expiresAt: access.expiresAt ? access.expiresAt.toISOString() : null,
      lastPaymentMethod: latestConfirmed ? (METHOD_LABEL[latestConfirmed.method] ?? latestConfirmed.method) : null,
      pendingPaymentId: access.pendingPayment?.id ?? null,
    };
  }

  // Uso detalhado (IA, imagem, rótulos, storage) com limites do plano.
  const usage = await getUsage(session.id);

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
