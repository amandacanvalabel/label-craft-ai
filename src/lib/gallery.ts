import { list } from "@vercel/blob";

// Galeria de exemplos exibida na landing page.
// As imagens ficam no Vercel Blob sob este prefixo — não precisa de banco de dados.
// O admin sobe/remove as imagens; a landing lista e mostra o que estiver aqui.
export const GALLERY_PREFIX = "lp-galeria/";

export interface GalleryImage {
  url: string;
  pathname: string;
  uploadedAt: string;
}

// Lista as imagens da galeria (ordenadas da mais antiga para a mais recente).
// Retorna [] em caso de erro para nunca quebrar a página inicial.
export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const { blobs } = await list({ prefix: GALLERY_PREFIX });
    return blobs
      .map((b) => ({
        url: b.url,
        pathname: b.pathname,
        uploadedAt:
          b.uploadedAt instanceof Date ? b.uploadedAt.toISOString() : String(b.uploadedAt),
      }))
      .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
  } catch {
    return [];
  }
}
