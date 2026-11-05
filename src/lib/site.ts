// Endereço oficial do site. O domínio sem "www" redireciona para este, então
// é ele que vai no canonical, no sitemap, no robots e nos dados estruturados.
export const SITE_URL = "https://www.canvalabel.com.br";

// O admin guarda a URL canônica nas configurações; se ela vier sem "www"
// (o padrão antigo), usamos a versão com "www", que é a que o site serve.
export function canonicalBase(fromSettings?: string | null): string {
  try {
    const u = new URL(fromSettings || SITE_URL);
    if (u.hostname === "canvalabel.com.br") u.hostname = "www.canvalabel.com.br";
    return u.origin;
  } catch {
    return SITE_URL;
  }
}
