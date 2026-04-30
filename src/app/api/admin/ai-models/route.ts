import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

function maskKey(key: string) {
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 6) + "•".repeat(Math.min(12, key.length - 10)) + key.slice(-4);
}

export async function GET() {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const models = await prisma.aIModel.findMany({
    orderBy: { createdAt: "asc" },
  });

  const activeCount = models.filter((m) => m.isActive).length;
  const providers = new Set(models.map((m) => m.provider));

  const list = models.map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    apiKeyMasked: maskKey(m.apiKey),
    baseUrl: m.baseUrl,
    isActive: m.isActive,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  }));

  // Provider distribution for pie chart
  const providerDist = Array.from(providers).map((p) => ({
    provider: p,
    count: models.filter((m) => m.provider === p).length,
  }));

  return NextResponse.json({
    stats: {
      totalModels: models.length,
      activeCount,
      inactiveCount: models.length - activeCount,
      uniqueProviders: providers.size,
    },
    models: list,
    providerDist,
  });
}

export async function POST(req: NextRequest) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json() as {
    name: string; provider: string; apiKey: string; baseUrl?: string; isActive: boolean;
  };

  if (!body.name?.trim()) return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  if (!body.apiKey?.trim()) return NextResponse.json({ error: "API Key obrigatória" }, { status: 400 });

  const model = await prisma.aIModel.create({
    data: {
      name: body.name.trim(),
      provider: body.provider as never,
      apiKey: body.apiKey.trim(),
      baseUrl: body.baseUrl?.trim() || null,
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json({ ...model, apiKeyMasked: maskKey(model.apiKey) }, { status: 201 });
}
