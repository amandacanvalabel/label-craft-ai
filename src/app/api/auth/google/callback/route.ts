// Volta do Google: valida o state, troca o código pelo perfil e entrega para a
// lógica comum de login social (encontra/cria a conta e abre a sessão).
import { NextRequest } from "next/server";
import { exchangeGoogleCode, googleEnabled } from "@/lib/google-oauth";
import { finishSocialLogin, readSocialState, socialFail } from "@/lib/social-login";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!googleEnabled()) return socialFail(req, "google", "google");
  if (req.nextUrl.searchParams.get("error")) return socialFail(req, "google", "social_cancelado");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const saved = readSocialState(req, "google");
  if (!code || !state || !saved.state || saved.state !== state) return socialFail(req, "google", "social_state");

  try {
    const profile = await exchangeGoogleCode(req.nextUrl.origin, code);
    if (!profile.email_verified) return socialFail(req, "google", "social_email");
    return await finishSocialLogin(
      req,
      { provider: "google", providerId: profile.sub, email: profile.email, name: profile.name, picture: profile.picture },
      saved.next,
    );
  } catch (err) {
    console.error("[GOOGLE CALLBACK]", err);
    return socialFail(req, "google", "social_falhou");
  }
}
