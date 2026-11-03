// Volta do Facebook: valida o state, busca o perfil e entrega para a lógica
// comum de login social.
import { NextRequest } from "next/server";
import { exchangeFacebookCode, facebookEnabled } from "@/lib/facebook-oauth";
import { finishSocialLogin, readSocialState, socialFail } from "@/lib/social-login";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!facebookEnabled()) return socialFail(req, "facebook", "facebook");
  if (req.nextUrl.searchParams.get("error")) return socialFail(req, "facebook", "social_cancelado");
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const saved = readSocialState(req, "facebook");
  if (!code || !state || !saved.state || saved.state !== state) return socialFail(req, "facebook", "social_state");

  try {
    const profile = await exchangeFacebookCode(req.nextUrl.origin, code);
    // Conta do Facebook criada só com telefone não tem e-mail: sem ele não dá
    // para criar a conta (é o login e o canal de recibos).
    if (!profile.email) return socialFail(req, "facebook", "facebook_sem_email");
    return await finishSocialLogin(
      req,
      { provider: "facebook", providerId: profile.id, email: profile.email, name: profile.name, picture: profile.picture?.data?.url },
      saved.next,
    );
  } catch (err) {
    console.error("[FACEBOOK CALLBACK]", err);
    return socialFail(req, "facebook", "social_falhou");
  }
}
