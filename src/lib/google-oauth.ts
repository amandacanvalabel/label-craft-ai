// Login com Google (OAuth 2.0 / OpenID Connect) sem biblioteca extra.
// Liga sozinho quando GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET existem no
// ambiente (Vercel → Settings → Environment Variables). Sem as chaves, o botão
// "Continuar com Google" não aparece e nada mais muda.
//
// Configuração no Google Cloud Console (APIs e serviços → Credenciais →
// ID do cliente OAuth → Aplicativo da Web):
//   Origens JavaScript autorizadas: https://www.canvalabel.com.br
//   URIs de redirecionamento:       https://www.canvalabel.com.br/api/auth/google/callback
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export const googleEnabled = () => !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET;

export function googleRedirectUri(origin: string) {
  return `${origin}/api/auth/google/callback`;
}

export function googleAuthUrl(origin: string, state: string) {
  const p = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

export async function exchangeGoogleCode(origin: string, code: string): Promise<GoogleProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  const tokens = (await tokenRes.json()) as { access_token?: string; error_description?: string };
  if (!tokenRes.ok || !tokens.access_token) throw new Error(tokens.error_description || "Falha ao autenticar com o Google");

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = (await infoRes.json()) as GoogleProfile;
  if (!infoRes.ok || !profile.sub || !profile.email) throw new Error("Não foi possível obter seu e-mail do Google");
  return profile;
}
