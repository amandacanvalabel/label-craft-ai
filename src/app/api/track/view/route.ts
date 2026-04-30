import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  // Normalize to UTC midnight so one record per calendar day
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await prisma.siteMetrics.upsert({
    where: { date: today },
    create: { date: today, views: 1, pageViews: 1, clicks: 0, uniqueVisitors: 0, bounceRate: 0 },
    update: { views: { increment: 1 }, pageViews: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
