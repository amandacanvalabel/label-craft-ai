import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { ensureSchema } from "./schema-sync";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const base = new PrismaClient({ adapter });
  // Antes da primeira consulta de cada processo, garante as colunas novas
  // (schema-sync). Usa o client "cru" por dentro para não entrar em loop.
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        await ensureSchema(base);
        return query(args);
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
