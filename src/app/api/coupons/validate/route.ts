import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupon";

// Valida um cupom contra um valor e devolve o desconto (sem aplicar).
export async function POST(req: NextRequest) {
  try {
    const { code, amount } = (await req.json()) as { code?: string; amount?: number };
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ valid: false, error: "Valor inválido" }, { status: 400 });
    }
    const result = await validateCoupon(code ?? "", amount);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ valid: false, error: "Erro ao validar o cupom" }, { status: 500 });
  }
}
