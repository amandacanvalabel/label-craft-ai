// /llms-full.txt — o texto completo de todos os guias em Markdown, para
// assistentes de IA lerem de uma vez (complementa o /llms.txt).
import { CATEGORIAS, GUIAS, fmtData } from "@/lib/guias";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const guias = GUIAS.map((g) => {
    const partes: string[] = [
      `## ${g.titulo}`,
      `Fonte: ${SITE_URL}/guias/${g.slug} · ${CATEGORIAS[g.categoria].nome} · atualizado em ${fmtData(g.atualizado)}`,
      `**Resposta curta:** ${g.resposta}`,
    ];
    for (const s of g.secoes) {
      partes.push(`### ${s.h2}`);
      s.p?.forEach((t) => partes.push(t));
      if (s.ul) partes.push(s.ul.map((t) => `- ${t}`).join("\n"));
      if (s.tabela) {
        partes.push(
          [`| ${s.tabela.cab.join(" | ")} |`, `| ${s.tabela.cab.map(() => "---").join(" | ")} |`, ...s.tabela.linhas.map((l) => `| ${l.join(" | ")} |`)].join("\n"),
        );
      }
      if (s.nota) partes.push(`> ${s.nota}`);
    }
    partes.push("### Perguntas frequentes");
    partes.push(g.faq.map((f) => `**${f.q}**\n${f.a}`).join("\n\n"));
    partes.push("### Fontes oficiais");
    partes.push(g.normas.map((n) => `- [${n.nome}](${n.url})`).join("\n"));
    return partes.join("\n\n");
  }).join("\n\n---\n\n");

  const texto = `# CanvaLabel — guias de rotulagem ANVISA (texto completo)

> Conteúdo dos guias públicos do CanvaLabel (${SITE_URL}), plataforma brasileira para criar rótulos de alimentos e cosméticos dentro das normas da ANVISA. Conteúdo informativo; não substitui o responsável técnico nem a leitura da norma completa. Resumo do site: ${SITE_URL}/llms.txt

${guias}
`;
  return new Response(texto, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
