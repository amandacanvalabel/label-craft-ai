// Página 404: endereço que não existe. Responde com status 404 de verdade
// (buscadores não indexam) e leva a pessoa para algo útil.
import type { Metadata } from "next";
import Link from "next/link";
import GuiaShell from "@/components/guias/GuiaShell";
import { GUIAS } from "@/lib/guias";

export const metadata: Metadata = {
  title: "Página não encontrada | CanvaLabel",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <GuiaShell>
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-14 sm:pt-20 text-center">
        <p className="text-sm font-bold text-primary">Erro 404</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">Esta página não existe</h1>
        <p className="mt-3 text-muted-foreground">O endereço pode ter mudado ou estar digitado errado. Veja por onde continuar:</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex justify-center rounded-xl gradient-primary text-white font-semibold px-5 py-3 hover:opacity-90">
            Ir para o início
          </Link>
          <Link href="/criar" className="inline-flex justify-center rounded-xl border border-border font-semibold px-5 py-3 hover:bg-muted/40">
            Gerar prévia de rótulo grátis
          </Link>
        </div>
        <div className="mt-12 text-left">
          <h2 className="text-lg font-bold text-foreground">Guias de rotulagem</h2>
          <ul className="mt-3 grid sm:grid-cols-2 gap-2">
            {GUIAS.map((g) => (
              <li key={g.slug}>
                <Link href={`/guias/${g.slug}`} className="block rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5">
                  {g.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GuiaShell>
  );
}
