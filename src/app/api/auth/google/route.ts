// Início do login com Google: guarda um "state" anti-CSRF (e o destino
// pós-login) num cookie e manda a pessoa para a tela do Google.
import { NextRequest, NextResponse } from "next/server";
import { googleAuthUrl, googleEnabled } from "@/lib/google-oauth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!googleEnabled()) return NextResponse.redirect(new URL("/login?erro=google", req.url));
  const next = req.nextUrl.searchParams.get("next") || "";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "";
  const state = crypto.randomUUID();
  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(googleAuthUrl(origin, state));
  res.cookies.set("g_state", JSON.stringify({ state, next: safeNext }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
