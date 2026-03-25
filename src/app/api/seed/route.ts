import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

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

    return NextResponse.json({
      success: true,
      admin: { email: admin.email, name: admin.name },
      subscriber: { email: subscriber.email, name: subscriber.name },
      defaultPassword: "Admin@123",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
