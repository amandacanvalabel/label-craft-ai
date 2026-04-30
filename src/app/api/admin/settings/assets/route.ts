import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SITE_SETTINGS_ID, serializeSiteSettings } from "@/lib/site-settings";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const ASSET_FIELDS = {
  logoHeader: "logoHeaderUrl",
  logoFooter: "logoFooterUrl",
  favicon: "faviconUrl",
  openGraph: "openGraphImageUrl",
} as const;

const MAX_SIZE = 512 * 1024;
const ALLOWED_TYPES = ["image/png", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon", "image/jpeg", "image/webp"];

function extensionFor(file: File) {
  if (file.type === "image/svg+xml") return "svg";
  if (file.type === "image/x-icon" || file.type === "image/vnd.microsoft.icon") return "ico";
  return file.type.split("/")[1] || "png";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await req.formData();
  const assetType = formData.get("type");
  const file = formData.get("file") as File | null;

  if (typeof assetType !== "string" || !(assetType in ASSET_FIELDS)) {
    return NextResponse.json({ error: "Tipo de asset inválido" }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato inválido. Use PNG, SVG, ICO, JPG ou WebP." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande. Máximo 512KB." }, { status: 400 });
  }

  const ext = extensionFor(file);
  const { url } = await put(`site/${assetType}.${ext}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  const field = ASSET_FIELDS[assetType as keyof typeof ASSET_FIELDS];
  const settings = await prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: { [field]: url },
    create: { id: SITE_SETTINGS_ID, [field]: url },
  });

  return NextResponse.json({ url, settings: serializeSiteSettings(settings) });
}
