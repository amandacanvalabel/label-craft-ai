import Link from "next/link";
import type { ReactNode } from "react";

// Moldura comum das páginas legais (Privacidade, Termos, Cookies).
export const LEGAL_UPDATED = "3 de novembro de 2026";

export default function LegalPage({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border max-w-[960px] mx-auto">
        <Link href="/" className="font-extrabold text-lg text-foreground">
          CanvaLabel
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/privacidade" className="text-muted-foreground hover:text-foreground">Privacidade</Link>
          <Link href="/termos" className="text-muted-foreground hover:text-foreground">Termos</Link>
          <Link href="/cookies" className="text-muted-foreground hover:text-foreground">Cookies</Link>
        </nav>
      </header>
      <article className="max-w-[760px] mx-auto px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">CanvaLabel</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
        <p className="mt-2 text-xs text-muted-foreground">Última atualização: {LEGAL_UPDATED}</p>
        <div className="legal-body mt-10 space-y-8 text-[15px] leading-relaxed text-foreground/90 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul]:mb-3 [&_a]:text-primary [&_a]:underline">
          {children}
        </div>
        <div className="mt-14 pt-6 border-t border-border text-xs text-muted-foreground">
          Dúvidas sobre este documento ou sobre seus dados: <a href="mailto:contato@canvalabel.com.br" className="underline">contato@canvalabel.com.br</a>
        </div>
      </article>
    </main>
  );
}
