import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Try admin first
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Credenciais inválidas" },
          { status: 401 }
        );
      }

      const token = await signToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: "ADMIN",
      });

      const response = NextResponse.json({
        success: true,
        user: { id: admin.id, email: admin.email, name: admin.name, role: "ADMIN" },
        redirect: "/admin",
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    // Try subscriber
    const subscriber = await prisma.subscriber.findUnique({ where: { email } });
    if (subscriber) {
      const valid = await bcrypt.compare(password, subscriber.password);
      if (!valid) {
        return NextResponse.json(
          { error: "Credenciais inválidas" },
          { status: 401 }
        );
      }

      const token = await signToken({
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
        role: "SUBSCRIBER",
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: subscriber.id,
          email: subscriber.email,
          name: subscriber.name,
          role: "SUBSCRIBER",
        },
        redirect: "/dashboard",
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
