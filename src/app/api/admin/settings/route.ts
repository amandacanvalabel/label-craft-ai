import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings, serializeSiteSettings, SITE_SETTINGS_ID } from "@/lib/site-settings";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function guardAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor deve estar no formato #RRGGBB");
const optionalUrl = z.union([z.string().url("URL inválida"), z.literal(""), z.null()]).optional();

const settingsSchema = z.object({
  siteName: z.string().trim().min(2, "Nome do site muito curto").max(80).optional(),
  siteTagline: z.string().trim().max(140).optional(),
  logoHeaderUrl: optionalUrl,
  logoFooterUrl: optionalUrl,
  faviconUrl: optionalUrl,
  openGraphImageUrl: optionalUrl,
  metaTitle: z.string().trim().min(10, "Meta title muito curto").max(70, "Meta title deve ter até 70 caracteres").optional(),
  metaDescription: z.string().trim().min(40, "Meta description muito curta").max(180, "Meta description deve ter até 180 caracteres").optional(),
  canonicalUrl: z.string().trim().url("Canonical URL inválida").optional(),
  keywords: z.array(z.string().trim().min(1)).max(25).optional(),
  maintenanceMode: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeoutDays: z.number().int().min(1).max(30).optional(),
  defaultTheme: z.enum(["light", "dark", "system"]).optional(),
  primaryColor: hexColor.optional(),
  accentColor: hexColor.optional(),
});

export async function GET() {
  const session = await guardAdmin();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const [settings, admin] = await Promise.all([
    getSiteSettings(),
    prisma.admin.findUnique({
      where: { id: session.id },
      select: { name: true, email: true },
    }),
  ]);

  if (!admin) return NextResponse.json({ error: "Administrador não encontrado" }, { status: 404 });

  return NextResponse.json({
    settings: serializeSiteSettings(settings),
    admin,
  });
}

export async function PATCH(req: NextRequest) {
  if (!await guardAdmin()) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = settingsSchema.parse(body);

    const normalized = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
    );

    const updated = await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      update: normalized,
      create: { ...normalized, id: SITE_SETTINGS_ID },
    });

    return NextResponse.json({ settings: serializeSiteSettings(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
