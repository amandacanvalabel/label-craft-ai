import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    // Sempre respondemos "ok" para não revelar se o e-mail existe (segurança).
    if (!parsed.success) return NextResponse.json({ ok: true });

    const email = parsed.data.email.trim().toLowerCase();

    // Procura no subscriber e, se não achar, no admin.
    const subscriber = await prisma.subscriber.findUnique({ where: { email } });
    let account: { id: string; name: string; password: string; kind: "subscriber" | "admin" } | null = null;
    if (subscriber) {
      account = { id: subscriber.id, name: subscriber.name, password: subscriber.password, kind: "subscriber" };
    } else {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (admin) account = { id: admin.id, name: admin.name, password: admin.password, kind: "admin" };
    }

    if (account) {
      const token = await makeResetToken({ id: account.id, kind: account.kind, passwordHash: account.password });
      const resetUrl = `${req.nextUrl.origin}/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail(email, account.name, resetUrl);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[FORGOT PASSWORD ERROR]", err);
    // Mesmo em erro, não vazamos detalhes.
    return NextResponse.json({ ok: true });
  }
}
