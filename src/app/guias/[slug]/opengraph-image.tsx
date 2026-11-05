import { ogCard, OG_SIZE } from "@/components/guias/ogCard";
import { CATEGORIAS, GUIAS, fmtData, guiaPorSlug } from "@/lib/guias";

export const alt = "Guia de rotulagem CanvaLabel";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return GUIAS.map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guiaPorSlug(slug);
  return ogCard({
    etiqueta: g ? `Guia · ${CATEGORIAS[g.categoria].nome}` : "Guia",
    titulo: g?.titulo || "Guias de rotulagem ANVISA",
    rodape: g ? `Atualizado em ${fmtData(g.atualizado)} · normas da ANVISA` : "Normas da ANVISA",
  });
}
