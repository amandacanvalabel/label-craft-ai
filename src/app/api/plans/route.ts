import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    },
  });
  return NextResponse.json(plans);
}
