import type { MetadataRoute } from "next";
import { GUIAS } from "@/lib/guias";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const ultimaAtualizacao = GUIAS.reduce((m, g) => (g.atualizado > m ? g.atualizado : m), "2026-11-05");
  const fixas: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/guias`, lastModified: ultimaAtualizacao, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/criar`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/planos`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/checklist-anvisa-32-itens.html`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.1 },
  ];
  const guias: MetadataRoute.Sitemap = GUIAS.map((g) => ({
    url: `${SITE_URL}/guias/${g.slug}`,
    lastModified: g.atualizado,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [...fixas, ...guias];
}
