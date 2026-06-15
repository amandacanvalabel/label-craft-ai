import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Lista os pacotes de créditos avulsos disponíveis para compra.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const packages = await prisma.creditPackage.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
    select: { id: true, name: true, description: true, aiCredits: true, imageCredits: true, price: true },
  });

  return NextResponse.json(packages);
}
