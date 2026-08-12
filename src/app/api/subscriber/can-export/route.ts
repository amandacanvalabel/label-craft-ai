import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Permissão de exportação do estúdio.
// Regra: só quem está em um plano PAGO (preço > 0) pode exportar (PDF/PNG).
// Plano gratuito (preço 0) ou sem plano → exportação bloqueada.
// Admin/staff → liberado.
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ canExport: false });
  }

  // Usuários que não são assinantes (ex.: ADMIN) podem exportar.
  if (session.role !== "SUBSCRIBER") {
    return NextResponse.json({ canExport: true });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: session.id },
    select: { plan: { select: { price: true } } },
  });

  const canExport = !!subscriber?.plan && subscriber.plan.price > 0;

  return NextResponse.json({ canExport });
}
