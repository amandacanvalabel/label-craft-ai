import { prisma } from "./prisma";

// Cobrança avançada: limites de uso, créditos avulsos e reset mensal do ciclo.

export const PERIOD_MS = 30 * 86_400_000;

// Limites do tier gratuito (assinante sem plano ativo).
export const FREE_LIMITS = {
  monthlyAiCredits: 20,
  monthlyImageCredits: 5,
  maxLabels: 10,
  storageMb: 100,
};

export type CreditKind = "ai" | "image";

type Limits = {
  monthlyAiCredits: number;
  monthlyImageCredits: number;
  maxLabels: number;
  storageMb: number;
};

// Reseta os contadores do ciclo se já passou o período. Retorna o subscriber
// (atualizado quando houve reset). null se não existir.
async function ensurePeriod(subscriberId: string) {
  const s = await prisma.subscriber.findUnique({ where: { id: subscriberId } });
  if (!s) return null;
  if (Date.now() - s.usagePeriodStart.getTime() >= PERIOD_MS) {
    return prisma.subscriber.update({
      where: { id: subscriberId },
      data: { aiCreditsUsed: 0, imageCreditsUsed: 0, usagePeriodStart: new Date() },
    });
  }
  return s;
}

async function limitsFor(planId: string | null): Promise<Limits> {
  if (!planId) return { ...FREE_LIMITS };
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: { monthlyAiCredits: true, monthlyImageCredits: true, maxLabels: true, storageMb: true },
  });
  return plan ?? { ...FREE_LIMITS };
}

// Estima o armazenamento usado (MB) pelos modelos salvos do assinante.
async function estimateStorageMb(subscriberId: string): Promise<number> {
  const models = await prisma.subscriberModel.findMany({
    where: { subscriberId },
    select: { thumbnail: true, canvasData: true },
  });
  let bytes = 0;
  for (const m of models) {
    if (m.thumbnail) bytes += m.thumbnail.length * 0.75; // base64 → bytes
    if (m.canvasData) bytes += JSON.stringify(m.canvasData).length;
  }
  return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

function remaining(limit: number, used: number): number | null {
  return limit === -1 ? null : Math.max(0, limit - used);
}

export interface UsageInfo {
  ai: { used: number; limit: number; extra: number; remaining: number | null };
  image: { used: number; limit: number; extra: number; remaining: number | null };
  labels: { used: number; limit: number; remaining: number | null };
  storage: { usedMb: number; limitMb: number };
  periodStart: string;
  periodEnd: string;
}

export async function getUsage(subscriberId: string): Promise<UsageInfo | null> {
  const s = await ensurePeriod(subscriberId);
  if (!s) return null;
  const lim = await limitsFor(s.planId);
  const [labelsUsed, storageMb] = await Promise.all([
    prisma.subscriberModel.count({ where: { subscriberId } }),
    estimateStorageMb(subscriberId),
  ]);
  const periodEnd = new Date(s.usagePeriodStart.getTime() + PERIOD_MS);
  return {
    ai: { used: s.aiCreditsUsed, limit: lim.monthlyAiCredits, extra: s.extraAiCredits, remaining: remaining(lim.monthlyAiCredits, s.aiCreditsUsed) },
    image: { used: s.imageCreditsUsed, limit: lim.monthlyImageCredits, extra: s.extraImageCredits, remaining: remaining(lim.monthlyImageCredits, s.imageCreditsUsed) },
    labels: { used: labelsUsed, limit: lim.maxLabels, remaining: remaining(lim.maxLabels, labelsUsed) },
    storage: { usedMb: storageMb, limitMb: lim.storageMb },
    periodStart: s.usagePeriodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };
}

// Verifica (sem cobrar) se o assinante pode gerar. Faz o reset de ciclo.
export async function checkCredit(subscriberId: string, kind: CreditKind): Promise<{ ok: boolean; error?: string }> {
  const s = await ensurePeriod(subscriberId);
  if (!s) return { ok: false, error: "Assinante não encontrado" };
  const lim = await limitsFor(s.planId);
  const limit = kind === "ai" ? lim.monthlyAiCredits : lim.monthlyImageCredits;
  const used = kind === "ai" ? s.aiCreditsUsed : s.imageCreditsUsed;
  const extra = kind === "ai" ? s.extraAiCredits : s.extraImageCredits;
  if (limit === -1 || used < limit || extra > 0) return { ok: true };
  return {
    ok: false,
    error: kind === "ai"
      ? "Você atingiu o limite de gerações de IA do seu plano. Faça upgrade ou compre um pacote de créditos."
      : "Você atingiu o limite de gerações de imagem do seu plano. Faça upgrade ou compre um pacote de créditos.",
  };
}

// Cobra 1 crédito (chamar após o sucesso da geração). Usa o limite do ciclo
// primeiro; só consome créditos avulsos quando o ciclo esgota.
export async function consumeCredit(subscriberId: string, kind: CreditKind): Promise<void> {
  const s = await ensurePeriod(subscriberId);
  if (!s) return;
  const lim = await limitsFor(s.planId);
  const limit = kind === "ai" ? lim.monthlyAiCredits : lim.monthlyImageCredits;
  const used = kind === "ai" ? s.aiCreditsUsed : s.imageCreditsUsed;
  const extra = kind === "ai" ? s.extraAiCredits : s.extraImageCredits;

  if (limit !== -1 && used >= limit && extra > 0) {
    await prisma.subscriber.update({
      where: { id: subscriberId },
      data: kind === "ai" ? { extraAiCredits: { decrement: 1 } } : { extraImageCredits: { decrement: 1 } },
    });
    return;
  }
  await prisma.subscriber.update({
    where: { id: subscriberId },
    data: kind === "ai" ? { aiCreditsUsed: { increment: 1 } } : { imageCreditsUsed: { increment: 1 } },
  });
}

// Adiciona créditos avulsos (compra de pacote confirmada).
export async function addCredits(subscriberId: string, aiCredits: number, imageCredits: number): Promise<void> {
  await prisma.subscriber.update({
    where: { id: subscriberId },
    data: { extraAiCredits: { increment: aiCredits }, extraImageCredits: { increment: imageCredits } },
  });
}
