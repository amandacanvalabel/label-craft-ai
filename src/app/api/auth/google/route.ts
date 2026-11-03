// Início do login com Google: guarda um "state" anti-CSRF (e o destino
// pós-login) num cookie e manda a pessoa para a tela do Google.
import { NextRequest, NextResponse } from "next/server";
import { googleAuthUrl, googleEnabled } from "@/lib/google-oauth";
import { startSocialLogin } from "@/lib/social-login";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!googleEnabled()) return NextResponse.redirect(new URL("/login?erro=google", req.url));
  return startSocialLogin(req, "google", (state) => googleAuthUrl(req.nextUrl.origin, state));
}
