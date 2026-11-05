// Índice dos guias de rotulagem (/guias).
import type { Metadata } from "next";
import Link from "next/link";
import GuiaShell from "@/components/guias/GuiaShell";
import { CATEGORIAS, GUIAS, fmtData, type Categoria } from "@/lib/guias";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Guias de rotulagem ANVISA para alimentos e cosméticos | CanvaLabel",
  description:
    "Guias práticos e atualizados sobre o que é obrigatório no rótulo de alimentos e de cosméticos: RDC 727/2022, tabela nutricional, lupa ALTO EM, alérgenos, RDC 907/2024, grau 1 e 2 e INCI.",
  alternates: { canonical: "/guias" },
};

const INTRO: Record<Categoria, string> = {
  alimentos: "Rotulagem geral (RDC 727/2022), tabela nutricional e lupa “ALTO EM” (RDC 429/2020 e IN 75/2020), alérgenos, glúten e lactose.",
  cosmeticos: "Rotulagem de higiene pessoal, cosméticos e perfumes (RDC 907/2024), classificação grau 1 e grau 2 e lista de ingredientes INCI.",
};

export default function GuiasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Guias de rotulagem ANVISA",
    url: `${SITE_URL}/guias`,
    inLanguage: "pt-BR",
    hasPart: GUIAS.map((g) => ({ "@type": "Article", headline: g.titulo, url: `${SITE_URL}/guias/${g.slug}`, dateModified: g.atualizado })),
  };
  return (
    <GuiaShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Guias CanvaLabel</p>
        <h1 className="mt-2 text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl leading-tight">
          Rotulagem ANVISA sem complicação, para alimentos e cosméticos
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
          Respostas diretas para as dúvidas de quem produz e precisa colocar o produto na prateleira dentro da norma.
          Cada guia cita a resolução vigente e o link oficial, e é revisado quando a ANVISA publica mudanças.
        </p>

        {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
          <section key={c} id={c} className="mt-12 scroll-mt-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{CATEGORIAS[c].nome}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{INTRO[c]}</p>
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GUIAS.filter((g) => g.categoria === c).map((g) => (
                <Link
                  key={g.slug}
                  href={`/guias/${g.slug}`}
                  className="flex flex-col rounded-2xl border border-border p-5 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <span className="font-semibold text-foreground leading-snug">{g.titulo}</span>
                  <span className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{g.descricao}</span>
                  <span className="mt-auto pt-4 text-xs text-muted-foreground">Atualizado em {fmtData(g.atualizado)}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-14 rounded-2xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Quer o rótulo pronto, já dentro das regras?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Descreva o produto e veja uma prévia grátis. Depois finalize e exporte o PDF para a gráfica.</p>
          </div>
          <Link href="/criar" className="shrink-0 inline-flex justify-center rounded-xl gradient-primary text-white font-semibold px-5 py-3 hover:opacity-90">
            Gerar prévia grátis
          </Link>
        </section>
      </div>
    </GuiaShell>
  );
}
