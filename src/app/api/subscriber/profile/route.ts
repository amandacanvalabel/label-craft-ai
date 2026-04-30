import { getSession, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const subscriber = await prisma.subscriber.findUnique({
    where: { id: session.id },
    select: {
      name: true,
      email: true,
      phone: true,
      cpfOrCnpj: true,
      city: true,
      state: true,
      street: true,
      number: true,
      neighborhood: true,
      country: true,
      avatar: true,
    },
  });

  if (!subscriber) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(subscriber);
}

const updateSchema = z.object({
  name: z.string().min(2, "Nome muito curto").optional(),
  email: z.string().email("E-mail inválido").optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const data = updateSchema.parse(body);

  // Check if email already taken by someone else
  if (data.email && data.email !== session.email) {
    const existing = await prisma.subscriber.findUnique({ where: { email: data.email } });
    if (existing) return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const updated = await prisma.subscriber.update({
    where: { id: session.id },
    data,
    select: { name: true, email: true },
  });

  const res = NextResponse.json({ success: true });

  // Re-issue token if name or email changed
  if (data.name || data.email) {
    const token = await signToken({
      id: session.id,
      email: updated.email,
      name: updated.name,
      role: "SUBSCRIBER",
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return res;
}
