// Ajustes de schema aplicados sob demanda (sem migration), no mesmo espírito
// das tabelas `anon_preview_quota` e `landing_leads`. Tudo é idempotente
// (IF NOT EXISTS / DROP NOT NULL) e roda UMA vez por processo, antes da
// primeira consulta do Prisma — veja src/lib/prisma.ts.
//
// Colunas novas (espelhadas em prisma/schema.prisma):
//   payments.months            — meses pagos naquela cobrança (1 mensal, 12 anual)
//   subscribers.termsAcceptedAt — aceite dos Termos/Privacidade (LGPD)
//   subscribers.googleId       — login com Google
//   subscribers.facebookId     — login com Facebook
//   subscribers.cpfOrCnpj      — passa a ser opcional (conta via Google nasce sem CPF)
import type { PrismaClient } from "@/generated/prisma/client";

const STATEMENTS = [
  `ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "months" INTEGER NOT NULL DEFAULT 1`,
  `ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3)`,
  `ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "googleId" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "subscribers_googleId_key" ON "subscribers"("googleId")`,
  `ALTER TABLE "subscribers" ADD COLUMN IF NOT EXISTS "facebookId" TEXT`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "subscribers_facebookId_key" ON "subscribers"("facebookId")`,
  `ALTER TABLE "subscribers" ALTER COLUMN "cpfOrCnpj" DROP NOT NULL`,
];

let done: Promise<void> | null = null;

export function ensureSchema(client: PrismaClient): Promise<void> {
  if (!done) {
    done = (async () => {
      for (const sql of STATEMENTS) {
        try {
          await client.$executeRawUnsafe(sql);
        } catch (err) {
          // Não derruba a aplicação: loga e segue (a próxima instrução pode
          // ser independente). Se algo falhar aqui, aparece nos logs da Vercel.
          console.error("[SCHEMA SYNC]", sql.slice(0, 60), err);
        }
      }
    })();
  }
  return done;
}
