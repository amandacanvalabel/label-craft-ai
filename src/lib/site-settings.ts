import { prisma } from "@/lib/prisma";

export const SITE_SETTINGS_ID = "site";

export const defaultSiteSettings = {
  id: SITE_SETTINGS_ID,
  siteName: "CanvaLabel",
  siteTagline: "Crie rótulos profissionais com IA",
  logoHeaderUrl: null,
  logoFooterUrl: null,
  faviconUrl: null,
  openGraphImageUrl: null,
  metaTitle: "CanvaLabel — Crie rótulos profissionais com IA",
  metaDescription:
    "Plataforma inteligente para criação de rótulos e etiquetas em conformidade com a ANVISA. Geração com IA, editor visual e exportação para gráficas.",
  canonicalUrl: "https://canvalabel.com.br",
  keywords: ["rótulos", "etiquetas", "ANVISA", "IA", "inteligência artificial", "editor visual"],
  maintenanceMode: false,
  twoFactorEnabled: false,
  sessionTimeoutDays: 7,
  defaultTheme: "system",
  primaryColor: "#2563eb",
  accentColor: "#0ea5e9",
};

export async function getSiteSettings() {
  const existing = await prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } });
  if (existing) return existing;

  try {
    return await prisma.siteSettings.create({ data: defaultSiteSettings });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      const createdByAnotherWorker = await prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } });
      if (createdByAnotherWorker) return createdByAnotherWorker;
    }
    throw error;
  }
}

export function serializeSiteSettings(settings: Awaited<ReturnType<typeof getSiteSettings>>) {
  return {
    id: settings.id,
    siteName: settings.siteName,
    siteTagline: settings.siteTagline,
    logoHeaderUrl: settings.logoHeaderUrl,
    logoFooterUrl: settings.logoFooterUrl,
    faviconUrl: settings.faviconUrl,
    openGraphImageUrl: settings.openGraphImageUrl,
    metaTitle: settings.metaTitle,
    metaDescription: settings.metaDescription,
    canonicalUrl: settings.canonicalUrl,
    keywords: settings.keywords,
    maintenanceMode: settings.maintenanceMode,
    twoFactorEnabled: settings.twoFactorEnabled,
    sessionTimeoutDays: settings.sessionTimeoutDays,
    defaultTheme: settings.defaultTheme,
    primaryColor: settings.primaryColor,
    accentColor: settings.accentColor,
    updatedAt: settings.updatedAt.toISOString(),
  };
}
