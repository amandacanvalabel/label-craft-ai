// Volta do Google: valida o state, troca o código pelo perfil, encontra ou
// cria a conta e abre a sessão. Conta nova via Google nasce SEM plano e SEM
// CPF — a pessoa escolhe o plano em /planos (já logada) e informa o CPF só na
// hora de pagar. Nada se perde se ela fechar antes.
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { exchangeGoogleCode, googleEnabled } from "@/lib/google-oauth";
import { sendWelcomeEmail } from "@/lib/email";
import { normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

function fail(req: NextRequest, reason: string) {
  const res = NextResponse.redirect(new URL(`/login?erro=${encodeURIComponent(reason)}`, req.url));
  res.cookies.set("g_state", "", { maxAge: 0, path: "/" });
  return res;
}

export async function GET(req: NextRequest) {
  if (!googleEnabled()) return fail(req, "google");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  let saved: { state?: string; next?: string } = {};
  try {
    saved = JSON.parse(req.cookies.get("g_state")?.value || "{}");
  } catch {
    saved = {};
  }
  if (!code || !state || !saved.state || saved.state !== state) return fail(req, "google_state");

  try {
    const profile = await exchangeGoogleCode(req.nextUrl.origin, code);
    if (!profile.email_verified) return fail(req, "google_email");
    const email = normalizeEmail(profile.email);

    // Admin com este e-mail? Entra como admin.
    const admin = await prisma.admin.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
    if (admin) {
      const token = await signToken({ id: admin.id, email: admin.email, name: admin.name, role: "ADMIN" });
      const res = NextResponse.redirect(new URL("/admin", req.url));
      res.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 86400, path: "/" });
      res.cookies.set("g_state", "", { maxAge: 0, path: "/" });
      return res;
    }

    let subscriber =
      (await prisma.subscriber.findFirst({ where: { googleId: profile.sub } })) ??
      (await prisma.subscriber.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }));
    let isNew = false;

    if (subscriber) {
      if (!subscriber.googleId) {
        subscriber = await prisma.subscriber.update({
          where: { id: subscriber.id },
          data: { googleId: profile.sub, avatar: subscriber.avatar || profile.picture || null },
        });
      }
    } else {
      isNew = true;
      // Senha aleatória (a pessoa pode definir uma depois em "Esqueci minha senha").
      const random = await bcrypt.hash(crypto.randomUUID() + Date.now(), 10);
      subscriber = await prisma.subscriber.create({
        data: {
          name: profile.name || email.split("@")[0],
          email,
          password: random,
          googleId: profile.sub,
          avatar: profile.picture || null,
          termsAcceptedAt: new Date(),
        },
      });
      sendWelcomeEmail(subscriber.email, subscriber.name).catch(() => {});
    }

    const token = await signToken({ id: subscriber.id, email: subscriber.email, name: subscriber.name, role: "SUBSCRIBER" });
    // Conta nova (ou sem plano) → escolher plano já logada; senão, destino pedido ou painel.
    const dest = isNew || !subscriber.planId ? "/planos?bemvindo=1" : saved.next || "/dashboard";
    const res = NextResponse.redirect(new URL(dest, req.url));
    res.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 7 * 86400, path: "/" });
    res.cookies.set("g_state", "", { maxAge: 0, path: "/" });
    return res;
  } catch (err) {
    console.error("[GOOGLE CALLBACK]", err);
    return fail(req, "google_falhou");
  }
}
