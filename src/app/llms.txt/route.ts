// /llms.txt — resumo do site em texto puro para assistentes de IA
// (formato proposto em llmstxt.org). Gerado a partir dos guias, então fica
// sempre igual ao que está publicado.
import { CATEGORIAS, GUIAS, type Categoria } from "@/lib/guias";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const blocos = (Object.keys(CATEGORIAS) as Categoria[])
    .map((c) => {
      const itens = GUIAS.filter((g) => g.categoria === c)
        .map((g) => `- [${g.titulo}](${SITE_URL}/guias/${g.slug}): ${g.descricao}`)
        .join("\n");
      return `## Guias de rotulagem: ${CATEGORIAS[c].nome}\n\n${itens}`;
    })
    .join("\n\n");

  const texto = `# CanvaLabel

> CanvaLabel (${SITE_URL}) é uma plataforma brasileira on-line para criar rótulos de alimentos e de cosméticos dentro das normas da ANVISA, sem precisar de designer. Monta o rótulo com IA, calcula a tabela nutricional (RDC 429/2020 e IN 75/2020), indica e aplica a lupa “ALTO EM”, gera as advertências de alérgenos, glúten e lactose (RDC 727/2022 e Lei 10.674/2003), organiza os campos de cosméticos (RDC 907/2024: INCI, modo de uso, advertências, lote, validade), confere os itens obrigatórios antes de exportar e entrega PDF em alta resolução para a gráfica. Planos a partir de R$ 9,90 por mês.

Indicado para pequenos e médios produtores de alimentos (confeitaria, padaria, conservas, temperos, bebidas, produtos artesanais) e de cosméticos (sabonetes, hidratantes, cosméticos naturais), além de nutricionistas, designers e gráficas que fazem rótulos para clientes.

## Produto

- [Página inicial](${SITE_URL}/): o que a plataforma faz, exemplos, planos e perguntas frequentes.
- [Gerar prévia grátis com IA](${SITE_URL}/criar): descreva o alimento ou cosmético e veja uma prévia do rótulo sem cadastro.
- [Planos e cadastro](${SITE_URL}/planos): preços e criação de conta.
- [Checklist ANVISA de 32 itens](${SITE_URL}/checklist-anvisa-32-itens.html): lista para conferir o rótulo de alimento antes de imprimir.

${blocos}

## Texto completo

- [Todos os guias em um só arquivo](${SITE_URL}/llms-full.txt)

## Contato

- E-mail: contato@canvalabel.com.br
- [Termos de uso](${SITE_URL}/termos) · [Política de privacidade](${SITE_URL}/privacidade)
`;
  return new Response(texto, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
