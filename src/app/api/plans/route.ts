import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Planos ativos para a landing. Além de preço e benefícios (texto livre),
// expõe os limites reais (rótulos, créditos, armazenamento) para a tabela
// comparativa da home ser montada a partir do que o sistema de fato aplica.
export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      promotionalPrice: true,
      type: true,
      benefits: true,
      maxLabels: true,
      monthlyAiCredits: true,
      monthlyImageCredits: true,
      storageMb: true,
    },
  });
  return NextResponse.json(plans);
}
