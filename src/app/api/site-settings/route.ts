import { getSiteSettings, serializeSiteSettings } from "@/lib/site-settings";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings: serializeSiteSettings(settings) });
}
