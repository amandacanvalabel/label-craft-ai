import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Liberado para buscadores e assistentes de IA (Google, Bing, ChatGPT,
// Claude, Perplexity, Gemini…). Fora só o que é privado ou não tem conteúdo.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/api/", "/login", "/reset-password"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
