import { getSession } from "@/lib/auth";
import { list, put, del } from "@vercel/blob";
import { GALLERY_PREFIX, getGalleryImages } from "@/lib/gallery";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

async function guardAdmin() {
  const session = await getSession();
  return session && session.role === "ADMIN" ? session : null;
}

// Lista as imagens da galeria (para o painel admin).
export async function GET() {
  if (!(await guardAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const images = await getGalleryImages();
  return NextResponse.json({ images });
}

// Envia uma nova imagem para a galeria (Vercel Blob).
export async function POST(req: NextRequest) {
  if (!(await guardAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use PNG, JPG ou WebP." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 2MB." }, { status: 400 });
  }

  const ext = file.type.split("/")[1] || "png";
  const { url, pathname } = await put(`${GALLERY_PREFIX}${Date.now()}.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url, pathname });
}

// Remove uma imagem da galeria pelo URL.
export async function DELETE(req: NextRequest) {
  if (!(await guardAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { url } = (await req.json()) as { url?: string };
  if (!url) return NextResponse.json({ error: "URL não informada" }, { status: 400 });

  // Segurança: só remove imagens que pertencem à galeria.
  if (!url.includes(GALLERY_PREFIX)) {
    return NextResponse.json({ error: "Imagem inválida" }, { status: 400 });
  }

  await del(url);
  return NextResponse.json({ ok: true });
}
