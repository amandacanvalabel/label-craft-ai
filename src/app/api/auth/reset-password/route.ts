import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { peekResetToken, verifyResetToken } from "@/lib/reset-token";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Dados inválidos" },
        { status: 400 }
      );
    }
    const { token, password } = parsed.data;

    const peek = peekResetToken(token);
    if (!peek) {
      return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
    }

    // Busca a conta para pegar o hash de senha atual (chave do token).
    const account =
      peek.kind === "subscriber"
        ? await prisma.subscriber.findUnique({ where: { id: peek.id } })
        : await prisma.admin.findUnique({ where: { id: peek.id } });

    if (!account) {
      return NextResponse.json({ error: "Link inválido ou expirado." }, { status: 400 });
    }

    const valid = await verifyResetToken(token, account.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Este link expirou ou já foi utilizado. Solicite um novo." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    if (peek.kind === "subscriber") {
      await prisma.subscriber.update({ where: { id: account.id }, data: { password: hashed } });
    } else {
      await prisma.admin.update({ where: { id: account.id }, data: { password: hashed } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[RESET PASSWORD ERROR]", err);
    return NextResponse.json({ error: "Erro ao redefinir a senha." }, { status: 500 });
  }
}
