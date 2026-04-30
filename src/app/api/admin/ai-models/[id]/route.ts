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

// Returns the full apiKey so admin can edit it
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const model = await prisma.aIModel.findUnique({ where: { id } });
  if (!model) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(model);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const body = await req.json() as {
    name?: string; provider?: string; apiKey?: string; baseUrl?: string | null; isActive?: boolean;
  };

  const updated = await prisma.aIModel.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.provider !== undefined && { provider: body.provider as never }),
      ...(body.apiKey !== undefined && body.apiKey.trim() && { apiKey: body.apiKey.trim() }),
      ...(body.baseUrl !== undefined && { baseUrl: body.baseUrl?.trim() || null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json({ ...updated, apiKeyMasked: maskKey(updated.apiKey) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.aIModel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
