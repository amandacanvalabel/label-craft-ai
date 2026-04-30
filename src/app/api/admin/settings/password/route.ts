import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual obrigatória"),
  newPassword: z
    .string()
    .min(8, "Nova senha deve ter ao menos 8 caracteres")
    .regex(/[A-Z]/, "Nova senha deve conter uma letra maiúscula")
    .regex(/[a-z]/, "Nova senha deve conter uma letra minúscula")
    .regex(/[0-9]/, "Nova senha deve conter um número"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
      select: { password: true },
    });
    if (!admin) return NextResponse.json({ error: "Administrador não encontrado" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({ where: { id: session.id }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
