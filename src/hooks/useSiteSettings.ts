"use client";

import { useEffect, useState } from "react";

export interface PublicSiteSettings {
  siteName: string;
  siteTagline: string;
  logoHeaderUrl: string | null;
  logoFooterUrl: string | null;
  faviconUrl: string | null;
  openGraphImageUrl: string | null;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  defaultTheme: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
}

const fallback: PublicSiteSettings = {
  siteName: "CanvaLabel",
  siteTagline: "Crie rótulos profissionais com IA",
  logoHeaderUrl: null,
  logoFooterUrl: null,
  faviconUrl: null,
  openGraphImageUrl: null,
  metaTitle: "CanvaLabel — Crie rótulos profissionais com IA",
  metaDescription: "Plataforma inteligente para criação de rótulos e etiquetas em conformidade com a ANVISA. Geração com IA, editor visual e exportação para gráficas.",
  canonicalUrl: "https://canvalabel.com.br",
  defaultTheme: "system",
  primaryColor: "#2563eb",
  accentColor: "#0ea5e9",
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>(fallback);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setSettings({ ...fallback, ...data.settings });
      })
      .catch(() => {});
  }, []);

  return settings;
}
