import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: session.id },
    include: {
      plan: { select: { name: true, type: true } },
      models: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, canvasData: true, createdAt: true,
        },
      },
      payments: {
        where: { status: "CONFIRMED" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, amount: true, createdAt: true },
      },
    },
  });

  if (!subscriber) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const totalModels = subscriber.models.length;

  // Stats
  const stats = {
    labelsCreated: totalModels,
    modelsSaved: totalModels,
    planName: subscriber.plan?.name ?? "Sem plano",
    estimatedHoursSaved: Math.round(totalModels * 0.75),
  };

  // Recent models (last 4)
  const recentModels = subscriber.models.slice(0, 4).map((m) => {
    const cd = (m.canvasData ?? {}) as Record<string, unknown>;
    return {
      id: m.id,
      name: m.name,
      category: (cd.category as string) ?? "—",
      img: (cd.img as string) ?? "📋",
      status: (cd.status as string) ?? "draft",
      createdAt: m.createdAt.toISOString(),
    };
  });

  // Activity: interleave recent models + payments, sorted by date, max 5
  type ActivityItem = { type: "model" | "payment"; text: string; date: string };
  const activity: ActivityItem[] = [
    ...subscriber.models.slice(0, 5).map((m) => ({
      type: "model" as const,
      text: `Rótulo "${m.name}" salvo na galeria`,
      date: m.createdAt.toISOString(),
    })),
    ...subscriber.payments.map((p) => ({
      type: "payment" as const,
      text: `Pagamento de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.amount)} confirmado`,
      date: p.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return NextResponse.json({
    name: subscriber.name,
    stats,
    recentModels,
    activity,
    planName: subscriber.plan?.name ?? null,
  });
}
