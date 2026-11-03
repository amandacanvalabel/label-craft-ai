import { NextResponse } from "next/server";
import { googleEnabled } from "@/lib/google-oauth";
import { facebookEnabled } from "@/lib/facebook-oauth";

// Quais logins sociais estão configurados (o front só mostra o botão se true).
export async function GET() {
  return NextResponse.json({ google: googleEnabled(), facebook: facebookEnabled() });
}
