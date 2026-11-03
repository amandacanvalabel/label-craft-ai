// Início do login com Facebook (mesmo fluxo do Google).
import { NextRequest, NextResponse } from "next/server";
import { facebookAuthUrl, facebookEnabled } from "@/lib/facebook-oauth";
import { startSocialLogin } from "@/lib/social-login";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  if (!facebookEnabled()) return NextResponse.redirect(new URL("/login?erro=facebook", req.url));
  return startSocialLogin(req, "facebook", (state) => facebookAuthUrl(req.nextUrl.origin, state));
}
