import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  // Admin
  const admin = await prisma.admin.upsert({
    where: { email: "admin@canvalabel.com" },
    update: {},
    create: {
      email: "admin@canvalabel.com",
      password: hashedPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  // Subscriber
  const subscriber = await prisma.subscriber.upsert({
    where: { email: "assinante@canvalabel.com" },
    update: {},
    create: {
      email: "assinante@canvalabel.com",
      password: hashedPassword,
      name: "Assinante Demo",
      cpfOrCnpj: "12345678900",
    },
  });

  console.log("✅ Seed executado com sucesso!");
  console.log("  Admin:", admin.email);
  console.log("  Assinante:", subscriber.email);
  console.log("  Senha padrão: Admin@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
