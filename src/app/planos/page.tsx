// src/app/planos/page.tsx
// Página de planos + cadastro REAL (grátis ou pago). Reaproveita o componente
// Planos, que cria a conta via /api/checkout e, ao concluir, manda pro /dashboard.
// É pra cá que o funil (prévia com IA) envia quem ainda não tem conta.
import Planos from "@/components/home/Planos";
import JsonLd from "@/components/home/JsonLd";

export const metadata = {
  title: "Planos e cadastro | CanvaLabel",
  description:
    "Crie sua conta no CanvaLabel — plano grátis ou pago — e finalize seu rótulo com tudo que a ANVISA exige.",
};

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <a href="/" className="font-extrabold text-lg text-foreground">
          CanvaLabel
        </a>
        <a
          href="/login"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Já tenho conta
        </a>
      </header>
      <JsonLd />
      <Planos />
    </main>
  );
}
