// src/app/planos/page.tsx
// Página de planos + cadastro REAL. Reaproveita o componente
// Planos, que cria a conta via /api/checkout e, ao concluir, manda pro /dashboard.
// É pra cá que o funil (prévia com IA) envia quem ainda não tem conta.
import Planos from "@/components/home/Planos";
import JsonLd from "@/components/home/JsonLd";
import Link from "next/link";

export const metadata = {
  title: "Planos e cadastro | CanvaLabel",
  description:
    "Crie sua conta no CanvaLabel — a partir de R$ 9,90/mês — e finalize seu rótulo com tudo que a ANVISA exige.",
};

export default async function PlanosPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Quem veio do funil leva o destino junto pro login ("Já tenho conta").
  const loginHref = next && next.startsWith("/") && !next.startsWith("//") ? `/login?next=${encodeURIComponent(next)}` : "/login";
  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="font-extrabold text-lg text-foreground">
          CanvaLabel
        </Link>
        <Link
          href={loginHref}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Já tenho conta
        </Link>
      </header>
      <JsonLd />
      <Planos />
    </main>
  );
}
