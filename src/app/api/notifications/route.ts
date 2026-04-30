import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  type Notif = {
    id: string;
    type: "signup" | "payment" | "model";
    title: string;
    desc: string;
    createdAt: string;
  };

  const items: Notif[] = [];

  if (session.role === "ADMIN") {
    const [recentSubs, recentPayments] = await Promise.all([
      prisma.subscriber.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, createdAt: true, plan: { select: { name: true } } },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: "CONFIRMED" },
        select: {
          id: true, amount: true, method: true, createdAt: true,
          subscriber: { select: { name: true } },
        },
      }),
    ]);

    const METHOD_LABEL: Record<string, string> = { PIX: "PIX", BOLETO: "Boleto", CARD: "Cartão" };

    for (const s of recentSubs) {
      items.push({
        id: `sub-${s.id}`,
        type: "signup",
        title: "Novo assinante",
        desc: s.plan
          ? `${s.name} assinou o plano ${s.plan.name}`
          : `${s.name} se cadastrou`,
        createdAt: s.createdAt.toISOString(),
      });
    }

    for (const p of recentPayments) {
      items.push({
        id: `pay-${p.id}`,
        type: "payment",
        title: "Pagamento confirmado",
        desc: `${METHOD_LABEL[p.method] ?? p.method} de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.amount)} — ${p.subscriber.name}`,
        createdAt: p.createdAt.toISOString(),
      });
    }
  } else {
    // SUBSCRIBER: their own models + confirmed payments
    const [models, payments] = await Promise.all([
      prisma.subscriberModel.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { subscriberId: session.id },
        select: { id: true, name: true, createdAt: true },
      }),
      prisma.payment.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        where: { subscriberId: session.id, status: "CONFIRMED" },
        select: { id: true, amount: true, createdAt: true, plan: { select: { name: true } } },
      }),
    ]);

    for (const m of models) {
      items.push({
        id: `mdl-${m.id}`,
        type: "model",
        title: "Rótulo salvo",
        desc: `"${m.name}" foi salvo na sua galeria`,
        createdAt: m.createdAt.toISOString(),
      });
    }

    for (const p of payments) {
      items.push({
        id: `pay-${p.id}`,
        type: "payment",
        title: "Pagamento confirmado",
        desc: `Seu pagamento do plano ${p.plan.name} foi confirmado`,
        createdAt: p.createdAt.toISOString(),
      });
    }
  }

  // Sort by most recent, cap at 8
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(items.slice(0, 8));
}
