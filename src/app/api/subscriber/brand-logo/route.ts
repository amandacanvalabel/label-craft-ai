import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// Upload do logotipo da marca (identidade visual). Espelha o upload de avatar.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("logo") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use PNG, SVG, JPG ou WebP." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 2MB." }, { status: 400 });
  }

  const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1];
  const { url } = await put(`brand-logos/${session.id}.${ext}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  await prisma.subscriber.update({
    where: { id: session.id },
    data: { brandLogo: url },
  });

  return NextResponse.json({ brandLogo: url });
}

// Remover o logotipo da marca.
export async function DELETE() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  await prisma.subscriber.update({ where: { id: session.id }, data: { brandLogo: null } });
  return NextResponse.json({ success: true });
}
