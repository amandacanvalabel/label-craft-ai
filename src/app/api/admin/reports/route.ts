import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Period = "7d" | "30d" | "90d" | "12m";

function startOf(period: Period): Date {
  const d = new Date();
  switch (period) {
    case "7d":  d.setDate(d.getDate() - 7);   break;
    case "30d": d.setDate(d.getDate() - 30);  break;
    case "90d": d.setDate(d.getDate() - 90);  break;
    case "12m": d.setMonth(d.getMonth() - 12); break;
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(d: Date)   { return d.toISOString().slice(0, 10); }
function weekKey(d: Date)  {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildTimeline(period: Period): { key: string; label: string }[] {
  const slots: { key: string; label: string }[] = [];
  const now = new Date();

  if (period === "7d") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const weekday = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()];
      slots.push({ key: dayKey(d), label: weekday });
    }
  } else if (period === "30d") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = i % 5 === 0 ? String(d.getDate()).padStart(2, "0") : "";
      slots.push({ key: dayKey(d), label });
    }
  } else if (period === "90d") {
    // Weekly buckets: 13 weeks
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      slots.push({ key: weekKey(d), label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}` });
    }
  } else {
    // 12m: monthly buckets
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      slots.push({ key: monthKey(d), label: MONTH_NAMES[d.getMonth()] });
    }
  }
  return slots;
}

function getKey(date: Date, period: Period) {
  if (period === "7d" || period === "30d") return dayKey(date);
  if (period === "90d") return weekKey(date);
  return monthKey(date);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const period = (req.nextUrl.searchParams.get("period") ?? "30d") as Period;
  const since = startOf(period);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    siteMetrics,
    subscribers,
    confirmedPayments,
    newSubsMonth,
    viewsMonthAgg,
    clicksMonthAgg,
    salesByPlanRaw,
    salesByMethodRaw,
  ] = await Promise.all([
    // Traffic timeline
    prisma.siteMetrics.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "asc" },
      select: { date: true, views: true, clicks: true },
    }),

    // Subscribers timeline
    prisma.subscriber.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // Revenue timeline
    prisma.payment.findMany({
      where: { status: "CONFIRMED", createdAt: { gte: since } },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // New subscribers this month (stat card)
    prisma.subscriber.count({ where: { createdAt: { gte: startOfMonth } } }),

    // Views this month (stat card)
    prisma.siteMetrics.aggregate({
      _sum: { views: true },
      where: { date: { gte: startOfMonth } },
    }),

    // Clicks this month (stat card)
    prisma.siteMetrics.aggregate({
      _sum: { clicks: true },
      where: { date: { gte: startOfMonth } },
    }),

    // Sales by plan this month
    prisma.payment.groupBy({
      by: ["planId"],
      _count: { id: true },
      _sum: { amount: true },
      where: { status: "CONFIRMED", createdAt: { gte: startOfMonth } },
    }),

    // Sales by method this month
    prisma.payment.groupBy({
      by: ["method"],
      _count: { id: true },
      _sum: { amount: true },
      where: { status: "CONFIRMED", createdAt: { gte: startOfMonth } },
    }),
  ]);

  // Build timeline slots
  const slots = buildTimeline(period);

  // Traffic timeline
  const trafficMap = new Map<string, { views: number; clicks: number }>();
  for (const m of siteMetrics) {
    const k = getKey(m.date, period);
    const cur = trafficMap.get(k) ?? { views: 0, clicks: 0 };
    trafficMap.set(k, { views: cur.views + m.views, clicks: cur.clicks + m.clicks });
  }

  // Subscribers timeline
  const subsMap = new Map<string, number>();
  for (const s of subscribers) {
    const k = getKey(s.createdAt, period);
    subsMap.set(k, (subsMap.get(k) ?? 0) + 1);
  }

  // Revenue timeline
  const revenueMap = new Map<string, number>();
  for (const p of confirmedPayments) {
    const k = getKey(p.createdAt, period);
    revenueMap.set(k, (revenueMap.get(k) ?? 0) + p.amount);
  }

  const trafficTimeline = slots.map((s) => ({
    label: s.label,
    views: trafficMap.get(s.key)?.views ?? 0,
    clicks: trafficMap.get(s.key)?.clicks ?? 0,
  }));

  const subscribersTimeline = slots.map((s) => ({
    label: s.label,
    count: subsMap.get(s.key) ?? 0,
  }));

  const revenueTimeline = slots.map((s) => ({
    label: s.label,
    amount: Math.round((revenueMap.get(s.key) ?? 0) * 100) / 100,
  }));

  // Sales by plan — fetch plan names
  const planIds = salesByPlanRaw.map((r) => r.planId);
  const plans = planIds.length
    ? await prisma.plan.findMany({ where: { id: { in: planIds } }, select: { id: true, name: true } })
    : [];
  const planNameMap = new Map(plans.map((p) => [p.id, p.name]));

  const salesByPlan = salesByPlanRaw.map((r) => ({
    name: planNameMap.get(r.planId) ?? "Desconhecido",
    count: r._count.id,
    revenue: r._sum.amount ?? 0,
  }));

  const METHOD_LABEL: Record<string, string> = { PIX: "PIX", BOLETO: "Boleto", CARD: "Cartão" };
  const METHOD_COLOR: Record<string, string> = {
    PIX: "#10b981", BOLETO: "#f59e0b", CARD: "#3b82f6",
  };
  const salesByMethod = salesByMethodRaw.map((r) => ({
    method: METHOD_LABEL[r.method] ?? r.method,
    color: METHOD_COLOR[r.method] ?? "#8b5cf6",
    count: r._count.id,
    amount: r._sum.amount ?? 0,
  }));

  // Stats
  const viewsThisMonth  = viewsMonthAgg._sum.views ?? 0;
  const clicksThisMonth = clicksMonthAgg._sum.clicks ?? 0;
  const revenueThisMonth = confirmedPayments
    .filter((p) => p.createdAt >= startOfMonth)
    .reduce((a, p) => a + p.amount, 0);
  const conversionPct = viewsThisMonth > 0
    ? Math.round((newSubsMonth / viewsThisMonth) * 10000) / 100
    : 0;

  return NextResponse.json({
    stats: { viewsThisMonth, clicksThisMonth, newSubscribersThisMonth: newSubsMonth, conversionPct, revenueThisMonth },
    trafficTimeline,
    subscribersTimeline,
    revenueTimeline,
    salesByPlan,
    salesByMethod,
  });
}
