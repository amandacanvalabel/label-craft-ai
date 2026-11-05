import Link from "next/link";
import type { ReactNode } from "react";

// Moldura das páginas de guia: cabeçalho simples, conteúdo legível e rodapé
// com os links que importam (buscadores seguem esses links).
export default function GuiaShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-foreground">
            <img src="/favicon.png" alt="" className="w-7 h-7 object-contain" />
            CanvaLabel
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6 text-sm">
            <Link href="/guias" className="text-muted-foreground hover:text-foreground">Guias</Link>
            <Link href="/planos" className="hidden sm:inline text-muted-foreground hover:text-foreground">Planos</Link>
            <Link href="/criar" className="rounded-full gradient-primary text-white font-semibold px-4 py-2 hover:opacity-90">
              Criar rótulo
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border mt-16">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-8 text-xs text-muted-foreground flex flex-col sm:flex-row gap-3 justify-between">
          <p>© {new Date().getFullYear()} CanvaLabel · Rótulos de alimentos e cosméticos dentro das normas da ANVISA.</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/" className="hover:text-foreground">Início</Link>
            <Link href="/guias" className="hover:text-foreground">Guias</Link>
            <Link href="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <Link href="/termos" className="hover:text-foreground">Termos</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

// "**negrito**" → <strong>. Mantém o texto dos guias simples de editar.
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return <>{parts.map((p, i) => (i % 2 ? <strong key={i} className="font-semibold text-foreground">{p}</strong> : p))}</>;
}
