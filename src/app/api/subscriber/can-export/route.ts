import { getSession } from "@/lib/auth";
import { getPlanAccess, isInternalPlan } from "@/lib/access";
import { NextResponse } from "next/server";

// Permissão de exportação do estúdio.
// Regra: só quem está em um plano PAGO (preço > 0) com pagamento confirmado e
// dentro do prazo pode exportar (PDF/PNG). Conta sem pagar, plano gratuito ou
// vencido → exportação bloqueada (o estúdio mostra "regularize para exportar").
// Admin/staff e contas de teste internas (plano interno) → liberado.
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ canExport: false });
  }

  // Usuários que não são assinantes (ex.: ADMIN) podem exportar.
  if (session.role !== "SUBSCRIBER") {
    return NextResponse.json({ canExport: true });
  }

  const access = await getPlanAccess(session.id);
  const canExport = access.active && !!access.plan && (access.plan.price > 0 || isInternalPlan(access.plan));

  return NextResponse.json({ canExport, planStatus: access.status });
}
