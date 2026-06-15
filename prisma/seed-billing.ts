import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// Limites por tier (heurística por nome do plano). -1 = ilimitado.
function limitsFor(name: string, price: number) {
  const n = name.toLowerCase();
  if (n.includes("pro") || n.includes("profis")) return { monthlyAiCredits: -1, monthlyImageCredits: 200, maxLabels: -1, storageMb: 10240 };
  if (n.includes("start") || n.includes("básic") || n.includes("basic")) return { monthlyAiCredits: 200, monthlyImageCredits: 50, maxLabels: 100, storageMb: 2048 };
  if (price === 0 || n.includes("free") || n.includes("grát") || n.includes("gratis")) return { monthlyAiCredits: 20, monthlyImageCredits: 5, maxLabels: 10, storageMb: 100 };
  // fallback intermediário
  return { monthlyAiCredits: 100, monthlyImageCredits: 25, maxLabels: 50, storageMb: 1024 };
}

async function main() {
  const plans = await prisma.plan.findMany();
  for (const p of plans) {
    const lim = limitsFor(p.name, p.price);
    await prisma.plan.update({ where: { id: p.id }, data: lim });
    console.log(`  Plano "${p.name}" → IA ${lim.monthlyAiCredits}, img ${lim.monthlyImageCredits}, rótulos ${lim.maxLabels}, ${lim.storageMb}MB`);
  }

  // Pacotes de crédito avulsos
  const packages = [
    { name: "Pacote Essencial", description: "50 gerações de IA + 10 imagens", aiCredits: 50, imageCredits: 10, price: 19.9 },
    { name: "Pacote Plus", description: "150 gerações de IA + 40 imagens", aiCredits: 150, imageCredits: 40, price: 49.9 },
    { name: "Pacote Studio", description: "500 gerações de IA + 150 imagens", aiCredits: 500, imageCredits: 150, price: 129.9 },
  ];
  for (const pk of packages) {
    const existing = await prisma.creditPackage.findFirst({ where: { name: pk.name } });
    if (existing) await prisma.creditPackage.update({ where: { id: existing.id }, data: pk });
    else await prisma.creditPackage.create({ data: pk });
    console.log(`  Pacote "${pk.name}" pronto`);
  }

  // Cupom de boas-vindas
  await prisma.coupon.upsert({
    where: { code: "BEMVINDO10" },
    update: { type: "PERCENT", value: 10, isActive: true },
    create: { code: "BEMVINDO10", type: "PERCENT", value: 10, isActive: true },
  });
  console.log("  Cupom BEMVINDO10 (10%) pronto");

  console.log("✅ Seed de cobrança concluído");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
