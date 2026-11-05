// Guia de rotulagem (/guias/[slug]). Página estática, toda em HTML no
// servidor: resposta direta no topo, norma vigente, perguntas frequentes e
// dados estruturados (Article, FAQPage e BreadcrumbList) para buscadores e IAs.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GuiaShell, { Rich } from "@/components/guias/GuiaShell";
import LupaCalculadora from "@/components/home/LupaCalculadora";
import { CATEGORIAS, GUIAS, fmtData, guiaPorSlug } from "@/lib/guias";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIAS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guiaPorSlug(slug);
  if (!g) return {};
  const url = `/guias/${g.slug}`;
  return {
    title: `${g.metaTitulo} | CanvaLabel`,
    description: g.descricao,
    alternates: { canonical: url },
    openGraph: { type: "article", title: g.metaTitulo, description: g.descricao, url, locale: "pt_BR", siteName: "CanvaLabel" },
    twitter: { card: "summary_large_image", title: g.metaTitulo, description: g.descricao },
  };
}

export default async function GuiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guiaPorSlug(slug);
  if (!g) notFound();
  const cat = CATEGORIAS[g.categoria];
  const url = `${SITE_URL}/guias/${g.slug}`;
  const relacionados = g.relacionados.map(guiaPorSlug).filter((x): x is NonNullable<typeof x> => !!x);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#artigo`,
        headline: g.titulo,
        description: g.descricao,
        inLanguage: "pt-BR",
        datePublished: g.publicado,
        dateModified: g.atualizado,
        mainEntityOfPage: url,
        author: { "@type": "Organization", name: "CanvaLabel", url: SITE_URL },
        publisher: { "@type": "Organization", name: "CanvaLabel", url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` } },
        about: g.normas.map((n) => n.nome),
        citation: g.normas.map((n) => n.url),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guias", item: `${SITE_URL}/guias` },
          { "@type": "ListItem", position: 3, name: g.titulo, item: url },
        ],
      },
    ],
  };

  return (
    <GuiaShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-[760px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <nav aria-label="Você está em" className="text-xs text-muted-foreground flex flex-wrap gap-1.5">
          <Link href="/guias" className="hover:text-foreground">Guias</Link>
          <span>/</span>
          <Link href={`/guias#${g.categoria}`} className="hover:text-foreground">{cat.nome}</Link>
        </nav>
        <h1 className="mt-3 text-[28px] sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">{g.titulo}</h1>
        <p className="mt-3 text-xs text-muted-foreground">
          Atualizado em <time dateTime={g.atualizado}>{fmtData(g.atualizado)}</time> · Conferido nos textos oficiais da ANVISA
        </p>

        <section aria-label="Resposta curta" className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Resposta curta</p>
          <p className="mt-2 text-[15px] sm:text-base leading-relaxed text-foreground">{g.resposta}</p>
        </section>

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-foreground/85">
          {g.secoes.map((s) => (
            <section key={s.h2}>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{s.h2}</h2>
              {s.p?.map((t, i) => (
                <p key={i} className="mt-3"><Rich text={t} /></p>
              ))}
              {s.ul && (
                <ul className="mt-3 list-disc pl-5 space-y-1.5">
                  {s.ul.map((t, i) => (
                    <li key={i}><Rich text={t} /></li>
                  ))}
                </ul>
              )}
              {s.tabela && (
                <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>{s.tabela.cab.map((c) => <th key={c} className="px-3 py-2.5 font-semibold text-foreground">{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {s.tabela.linhas.map((l, i) => (
                        <tr key={i} className="border-t border-border align-top">
                          {l.map((c, j) => <td key={j} className="px-3 py-2.5">{c}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {s.nota && <p className="mt-3 text-sm text-muted-foreground border-l-2 border-primary/40 pl-3"><Rich text={s.nota} /></p>}
            </section>
          ))}
        </div>
      </article>

      {g.slug === "lupa-alto-em-quando-usar" && <LupaCalculadora ctaHref="/criar" mostrarGuia={false} />}

      <div className="max-w-[760px] mx-auto px-4 sm:px-6">
        <section className="mt-12 rounded-2xl gradient-primary text-white p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold">Faça o rótulo já dentro dessas regras</h2>
          <p className="mt-2 text-white/85 text-sm sm:text-[15px]">
            O CanvaLabel monta o rótulo de {g.categoria === "alimentos" ? "alimentos (tabela nutricional, lupa e advertências)" : "cosméticos (INCI, advertências, lote e validade)"} e
            confere os itens obrigatórios antes de você exportar o PDF para a gráfica.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Link href={cat.ctaHref} className="inline-flex justify-center rounded-xl bg-white text-primary font-semibold px-5 py-3 hover:bg-white/90">
              {cat.cta}
            </Link>
            <Link href="/planos" className="inline-flex justify-center rounded-xl border border-white/40 font-semibold px-5 py-3 hover:bg-white/10">
              Ver planos
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Perguntas frequentes</h2>
          <div className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {g.faq.map((f) => (
              <details key={f.q} className="group p-4 sm:p-5">
                <summary className="cursor-pointer font-semibold text-foreground list-none flex justify-between gap-4">
                  {f.q}
                  <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold text-foreground">Fontes oficiais</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {g.normas.map((n) => (
              <li key={n.url}>
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 break-words">{n.nome}</a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            Conteúdo informativo, preparado a partir dos textos oficiais. Não substitui a orientação do responsável técnico
            nem a consulta à norma completa. Viu algo desatualizado? Escreva para contato@canvalabel.com.br.
          </p>
        </section>

        {relacionados.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-foreground">Leia também</h2>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {relacionados.map((r) => (
                <Link key={r.slug} href={`/guias/${r.slug}`} className="rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">{CATEGORIAS[r.categoria].nome}</p>
                  <p className="mt-1 font-semibold text-foreground leading-snug">{r.titulo}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </GuiaShell>
  );
}
