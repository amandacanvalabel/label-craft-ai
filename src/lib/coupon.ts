import { prisma } from "./prisma";

export interface CouponResult {
  valid: boolean;
  error?: string;
  code?: string;
  discount?: number;     // valor descontado em R$
  finalAmount?: number;  // valor final após desconto
  label?: string;        // ex: "10% OFF" ou "R$ 20 OFF"
}

// Valida um cupom contra um valor e calcula o desconto. Não muta nada.
export async function validateCoupon(rawCode: string, amount: number): Promise<CouponResult> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { valid: false, error: "Informe um cupom" };

  const c = await prisma.coupon.findUnique({ where: { code } });
  if (!c || !c.isActive) return { valid: false, error: "Cupom inválido" };
  if (c.expiresAt && c.expiresAt.getTime() < Date.now()) return { valid: false, error: "Cupom expirado" };
  if (c.maxUses != null && c.usedCount >= c.maxUses) return { valid: false, error: "Cupom esgotado" };
  if (c.minAmount != null && amount < c.minAmount) {
    return { valid: false, error: `Este cupom exige compra mínima de R$ ${c.minAmount.toFixed(2)}` };
  }

  const discount = c.type === "PERCENT" ? amount * (c.value / 100) : Math.min(c.value, amount);
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    valid: true,
    code: c.code,
    discount: round(discount),
    finalAmount: Math.max(0, round(amount - discount)),
    label: c.type === "PERCENT" ? `${c.value}% OFF` : `R$ ${c.value.toFixed(2)} OFF`,
  };
}

// Marca uma utilização do cupom (chamar ao criar a cobrança).
export async function redeemCoupon(rawCode: string): Promise<void> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return;
  await prisma.coupon.updateMany({ where: { code }, data: { usedCount: { increment: 1 } } });
}
