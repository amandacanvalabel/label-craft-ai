// Parte comum do login social (Google e Facebook): encontra ou cria a conta,
// abre a sessão e decide para onde mandar a pessoa.
//
// Regras:
//  - Conta já existente com o mesmo e-mail é VINCULADA (o provedor só entrega
//    e-mails confirmados), então quem se cadastrou com senha também pode
//    entrar com Google/Facebook.
//  - Conta nova nasce sem plano e sem CPF; a pessoa escolhe o plano já logada
//    em /planos e informa o CPF só na hora de pagar.
//  - Admin NÃO entra por login social: o painel administrativo exige e-mail e
//    senha (e 2FA, quando ligado).
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { signToken } from "./auth";
import { sendWelcomeEmail } from "./email";
import { normalizeEmail } from "./validation";

export type SocialProvider = "google" | "facebook";

export interface SocialProfile {
  provider: SocialProvider;
  providerId: string;
  email: string;
  name?: string;
  picture?: string | null;
}

const STATE_COOKIE: Record<SocialProvider, string> = { google: "g_state", facebook: "fb_state" };

export function stateCookieName(p: SocialProvider) {
  return STATE_COOKIE[p];
}

// Guarda o "state" anti-CSRF e o destino pós-login (só caminhos internos).
export function startSocialLogin(req: NextRequest, provider: SocialProvider, authUrl: (state: string) => string) {
  const next = req.nextUrl.searchParams.get("next") || "";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "";
  const state = crypto.randomUUID();
  const res = NextResponse.redirect(authUrl(state));
  res.cookies.set(STATE_COOKIE[provider], JSON.stringify({ state, next: safeNext }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}

export function readSocialState(req: NextRequest, provider: SocialProvider): { state?: string; next?: string } {
  try {
    return JSON.parse(req.cookies.get(STATE_COOKIE[provider])?.value || "{}");
  } catch {
    return {};
  }
}

export function socialFail(req: NextRequest, provider: SocialProvider, reason: string) {
  const res = NextResponse.redirect(new URL(`/login?erro=${encodeURIComponent(reason)}`, req.url));
  res.cookies.set(STATE_COOKIE[provider], "", { maxAge: 0, path: "/" });
  return res;
}

export async function finishSocialLogin(req: NextRequest, profile: SocialProfile, next?: string) {
  const email = normalizeEmail(profile.email);
  const idField = profile.provider === "google" ? "googleId" : "facebookId";

  const admin = await prisma.admin.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
  if (admin) return socialFail(req, profile.provider, "admin_social");

  let subscriber =
    (await prisma.subscriber.findFirst({ where: { [idField]: profile.providerId } })) ??
    (await prisma.subscriber.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }));
  let isNew = false;

  if (subscriber) {
    if (!subscriber[idField]) {
      subscriber = await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { [idField]: profile.providerId, avatar: subscriber.avatar || profile.picture || null },
      });
    }
  } else {
    isNew = true;
    // Senha aleatória: a pessoa pode criar uma depois em "Esqueci minha senha".
    const random = await bcrypt.hash(crypto.randomUUID() + Date.now(), 10);
    subscriber = await prisma.subscriber.create({
      data: {
        name: profile.name?.trim() || email.split("@")[0],
        email,
        password: random,
        [idField]: profile.providerId,
        avatar: profile.picture || null,
        // O botão social mostra "ao continuar, você aceita os Termos e a Privacidade".
        termsAcceptedAt: new Date(),
      },
    });
    sendWelcomeEmail(subscriber.email, subscriber.name).catch(() => {});
  }

  const token = await signToken({ id: subscriber.id, email: subscriber.email, name: subscriber.name, role: "SUBSCRIBER" });
  // Conta nova (ou sem plano) volta para os planos. Se veio do modal de um
  // plano (/planos?plano=…), volta direto para a etapa de pagamento dele.
  const voltaPlanos = next && next.startsWith("/planos") ? next + (next.includes("?") ? "&" : "?") + "bemvindo=1" : "/planos?bemvindo=1";
  const dest = isNew || !subscriber.planId ? voltaPlanos : next || "/dashboard";
  const res = NextResponse.redirect(new URL(dest, req.url));
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 86400,
    path: "/",
  });
  res.cookies.set(STATE_COOKIE[profile.provider], "", { maxAge: 0, path: "/" });
  return res;
}
