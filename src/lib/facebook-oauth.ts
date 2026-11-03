// Login com Facebook (OAuth 2.0 / Graph API) sem biblioteca extra.
// Liga sozinho quando FACEBOOK_APP_ID e FACEBOOK_APP_SECRET existem no
// ambiente (Vercel → Settings → Environment Variables). Sem as chaves, o botão
// "Continuar com Facebook" não aparece.
//
// Configuração em developers.facebook.com → Meus apps → Criar app
// (caso de uso "Autenticar e solicitar dados dos usuários com o Login do Facebook"):
//   Login do Facebook → Configurações → URIs de redirecionamento do OAuth válidos:
//       https://www.canvalabel.com.br/api/auth/facebook/callback
//   Configurações → Básico: URL da Política de Privacidade = https://www.canvalabel.com.br/privacidade
//                           URL dos Termos de Serviço        = https://www.canvalabel.com.br/termos
//                           URL de instruções de exclusão de dados = https://www.canvalabel.com.br/exclusao-de-dados
//   Permissões usadas: public_profile e email (não exigem análise do app).
const GRAPH = "https://graph.facebook.com/v19.0";

export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || "";
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";

export const facebookEnabled = () => !!FACEBOOK_APP_ID && !!FACEBOOK_APP_SECRET;

export function facebookRedirectUri(origin: string) {
  return `${origin}/api/auth/facebook/callback`;
}

export function facebookAuthUrl(origin: string, state: string) {
  const p = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    redirect_uri: facebookRedirectUri(origin),
    state,
    response_type: "code",
    scope: "public_profile,email",
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${p.toString()}`;
}

export interface FacebookProfile {
  id: string;
  name?: string;
  email?: string;
  picture?: { data?: { url?: string } };
}

export async function exchangeFacebookCode(origin: string, code: string): Promise<FacebookProfile> {
  const q = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    redirect_uri: facebookRedirectUri(origin),
    code,
  });
  const tokenRes = await fetch(`${GRAPH}/oauth/access_token?${q.toString()}`);
  const tokens = (await tokenRes.json()) as { access_token?: string; error?: { message?: string } };
  if (!tokenRes.ok || !tokens.access_token) throw new Error(tokens.error?.message || "Falha ao autenticar com o Facebook");

  const meRes = await fetch(
    `${GRAPH}/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(tokens.access_token)}`,
  );
  const profile = (await meRes.json()) as FacebookProfile;
  if (!meRes.ok || !profile.id) throw new Error("Não foi possível obter seu perfil do Facebook");
  return profile;
}
