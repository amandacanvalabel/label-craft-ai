import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  currentPassword: z.string().min(1, "Senha atual obrigatória"),
  newPassword: z.string().min(8, "Nova senha deve ter ao menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { currentPassword, newPassword } = schema.parse(body);

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: session.id },
    select: { password: true },
  });
  if (!subscriber) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, subscriber.password);
  if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.subscriber.update({ where: { id: session.id }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
