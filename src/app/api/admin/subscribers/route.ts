import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { normalizeEmail, passwordIssue } from "@/lib/validation";

import { INTERNAL_PLAN_NAME } from "@/lib/access";

// Plano interno para contas de teste/equipe: grátis, sem limites e ESCONDIDO
// (isActive = false → não aparece na landing, em /planos nem no checkout).
// Plano de preço zero é sempre "ativo" para quem o tem (ver src/lib/access.ts).

async function ensureInternalPlan() {
  const found = await prisma.plan.findFirst({ where: { name: INTERNAL_PLAN_NAME } });
  if (found) return found;
  return prisma.plan.create({
    data: {
      name: INTERNAL_PLAN_NAME,
      description: "Uso interno: contas de teste da equipe. Não aparece para clientes.",
      benefits: ["Tudo ilimitado", "Somente para testes internos"],
      type: "LIFETIME",
      price: 0,
      promotionalPrice: null,
      isActive: false,
      monthlyAiCredits: -1,
      monthlyImageCredits: -1,
      maxLabels: -1,
      storageMb: -1,
    },
  });
}

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
      // Planos à venda + o plano interno (para poder atribuí-lo pelo painel).
      where: { OR: [{ isActive: true }, { name: INTERNAL_PLAN_NAME }] },
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

// Cria uma conta de teste já no plano interno ilimitado (só admin).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { name?: string; email?: string; password?: string };
  const name = (body.name || "").trim();
  const email = normalizeEmail(body.email || "");
  const password = body.password || "";
  if (name.length < 2) return NextResponse.json({ error: "Informe o nome", field: "name" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "E-mail inválido", field: "email" }, { status: 400 });
  const pw = passwordIssue(password);
  if (pw) return NextResponse.json({ error: pw, field: "password" }, { status: 400 });

  const [sub, adm] = await Promise.all([
    prisma.subscriber.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }),
    prisma.admin.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }),
  ]);
  if (sub || adm) return NextResponse.json({ error: "Já existe uma conta com este e-mail", field: "email" }, { status: 409 });

  const plan = await ensureInternalPlan();
  const created = await prisma.subscriber.create({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 12),
      planId: plan.id,
      termsAcceptedAt: new Date(),
    },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json({ ...created, plan: plan.name });
}
