import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [plans, subscriberTotal, revenuePerPlan] = await Promise.all([
    prisma.plan.findMany({
      orderBy: { price: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        price: true,
        promotionalPrice: true,
        isActive: true,
        benefits: true,
        _count: { select: { subscribers: true } },
      },
    }),
    prisma.subscriber.count(),
    prisma.payment.groupBy({
      by: ["planId"],
      _sum: { amount: true },
      where: { status: "CONFIRMED" },
    }),
  ]);

  const revenueMap = new Map(revenuePerPlan.map((r) => [r.planId, r._sum.amount ?? 0]));

  const list = plans.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    type: p.type,
    price: p.price,
    promotionalPrice: p.promotionalPrice,
    isActive: p.isActive,
    benefits: p.benefits,
    subscriberCount: p._count.subscribers,
    totalRevenue: revenueMap.get(p.id) ?? 0,
  }));

  const activePlans = list.filter((p) => p.isActive).length;
  const totalRevenue = list.reduce((acc, p) => acc + p.totalRevenue, 0);
  const mostPopular = list.reduce((best, p) => (p.subscriberCount > (best?.subscriberCount ?? -1) ? p : best), list[0] ?? null);

  return NextResponse.json({
    stats: { activePlans, subscriberTotal, totalRevenue, mostPopularName: mostPopular?.name ?? "—" },
    plans: list,
  });
}

export async function POST(req: NextRequest) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json() as {
    name: string; description?: string; type: string;
    price: number; promotionalPrice?: number | null;
    isActive: boolean; benefits: string[];
  };

  if (!body.name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });

  const plan = await prisma.plan.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      type: body.type as never,
      price: body.price,
      promotionalPrice: body.promotionalPrice || null,
      isActive: body.isActive,
      benefits: body.benefits ?? [],
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
