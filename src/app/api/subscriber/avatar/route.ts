import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WebP." }, { status: 400 });
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 2MB." }, { status: 400 });
  }

  const ext = file.type.split("/")[1];
  const { url } = await put(`avatars/${session.id}.${ext}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  await prisma.subscriber.update({
    where: { id: session.id },
    data: { avatar: url },
  });

  return NextResponse.json({ avatarUrl: url });
}
