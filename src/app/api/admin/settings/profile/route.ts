import { getSession, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("E-mail inválido"),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);

    if (data.email !== session.email) {
      const existing = await prisma.admin.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== session.id) {
        return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
      }
    }

    const admin = await prisma.admin.update({
      where: { id: session.id },
      data,
      select: { name: true, email: true },
    });

    const token = await signToken({
      id: session.id,
      email: admin.email,
      name: admin.name,
      role: "ADMIN",
    });

    const res = NextResponse.json({ success: true, admin });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
