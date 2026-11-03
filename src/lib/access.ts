// Situação do plano de um assinante: ativo (pago e dentro do prazo), pendente
// (conta criada, pagamento ainda não confirmado) ou expirado. A conta existe e
// entra no painel em qualquer caso — mas limites e exportação seguem o tier
// gratuito enquanto não houver pagamento confirmado válido.
import { prisma } from "./prisma";

export const PLAN_DURATION_DAYS: Record<string, number> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  SEMIANNUAL: 180,
  ANNUAL: 365,
  LIFETIME: 0,
};

export type PlanStatus = "none" | "active" | "pending" | "expired";

export interface PlanAccess {
  status: PlanStatus;
  active: boolean; // pode usar os limites do plano / exportar
  plan: { id: string; name: string; type: string; price: number; promotionalPrice: number | null } | null;
  activatedAt: Date | null;
  expiresAt: Date | null;
  pendingPayment: {
    id: string;
    amount: number;
    method: "PIX" | "BOLETO" | "CARD";
    asaasPaymentId: string | null;
    asaasInvoiceUrl: string | null;
    createdAt: Date;
  } | null;
}

export async function getPlanAccess(subscriberId: string): Promise<PlanAccess> {
  const s = await prisma.subscriber.findUnique({
    where: { id: subscriberId },
    include: {
      plan: { select: { id: true, name: true, type: true, price: true, promotionalPrice: true } },
      payments: {
        where: { kind: "SUBSCRIPTION" },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, amount: true, method: true, status: true, months: true, asaasPaymentId: true, asaasInvoiceUrl: true, createdAt: true },
      },
    },
  });
  const empty: PlanAccess = { status: "none", active: false, plan: null, activatedAt: null, expiresAt: null, pendingPayment: null };
  if (!s || !s.plan) return empty;

  const pending = s.payments.find((p) => p.status === "PENDING") ?? null;
  const pendingPayment = pending
    ? { id: pending.id, amount: pending.amount, method: pending.method, asaasPaymentId: pending.asaasPaymentId, asaasInvoiceUrl: pending.asaasInvoiceUrl, createdAt: pending.createdAt }
    : null;

  // Plano gratuito (preço 0): sempre ativo.
  if (s.plan.price <= 0) {
    return { status: "active", active: true, plan: s.plan, activatedAt: s.createdAt, expiresAt: null, pendingPayment };
  }

  const confirmed = s.payments.filter((p) => p.status === "CONFIRMED");
  if (!confirmed.length) {
    return { status: "pending", active: false, plan: s.plan, activatedAt: null, expiresAt: null, pendingPayment };
  }
  const latest = confirmed[0];
  const base = PLAN_DURATION_DAYS[s.plan.type] ?? 30;
  const days = s.plan.type === "LIFETIME" ? 0 : base * Math.max(1, latest.months || 1);
  const expiresAt = days ? new Date(latest.createdAt.getTime() + days * 86_400_000) : null;
  const active = !expiresAt || expiresAt.getTime() > Date.now();
  return {
    status: active ? "active" : "expired",
    active,
    plan: s.plan,
    activatedAt: confirmed[confirmed.length - 1].createdAt,
    expiresAt,
    pendingPayment,
  };
}
