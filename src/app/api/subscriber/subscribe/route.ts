// Assinatura para quem JÁ TEM CONTA (conta criada sem pagar, renovação,
// troca de plano ou conta criada via Google).
//   GET  → situação do plano + pagamento pendente (com QR Code PIX renovado)
//   POST → gera uma nova cobrança para o plano escolhido
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPlanAccess } from "@/lib/access";
import { getPaymentStatus, getPixQrCode } from "@/lib/asaas";
import { createSubscriptionPayment, friendlyPaymentError, priceFor, type CheckoutMethod } from "@/lib/billing";
import { isValidCpfCnpj, isValidPhone, onlyDigits } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const access = await getPlanAccess(session.id);
  const subscriber = await prisma.subscriber.findUnique({ where: { id: session.id }, select: { cpfOrCnpj: true, phone: true } });
  let pending: Record<string, unknown> | null = null;

  if (access.pendingPayment) {
    const p = access.pendingPayment;
    pending = { id: p.id, amount: p.amount, method: p.method, invoiceUrl: p.asaasInvoiceUrl, createdAt: p.createdAt };
    if (p.asaasPaymentId) {
      try {
        const remote = await getPaymentStatus(p.asaasPaymentId);
        if (remote.status === "CONFIRMED" || remote.status === "RECEIVED") {
          await prisma.payment.update({ where: { id: p.id }, data: { status: "CONFIRMED" } });
          pending = null;
        } else if (remote.status === "OVERDUE" || remote.status === "DELETED" || remote.status === "REFUNDED") {
          await prisma.payment.update({ where: { id: p.id }, data: { status: "CANCELLED" } });
          pending = null;
        } else if (p.method === "PIX") {
          const pix = await getPixQrCode(p.asaasPaymentId);
          pending.pix = { qrCodeImage: pix.encodedImage, qrCodePayload: pix.payload, expirationDate: pix.expirationDate };
        }
      } catch (err) {
        console.error("[SUBSCRIBE GET]", err);
      }
    }
  }
  const fresh = pending ? access : await getPlanAccess(session.id);
  return NextResponse.json({
    status: fresh.status,
    active: fresh.active,
    plan: fresh.plan,
    expiresAt: fresh.expiresAt,
    pending,
    needsCpf: !subscriber?.cpfOrCnpj,
    hasPhone: !!subscriber?.phone,
  });
}

const schema = z.object({
  planName: z.string().min(1),
  billingPeriod: z.enum(["monthly", "annual"]).default("monthly"),
  paymentMethod: z.enum(["pix", "card", "boleto"]),
  creditCard: z
    .object({
      holderName: z.string(),
      number: z.string(),
      expiryMonth: z.string(),
      expiryYear: z.string(),
      ccv: z.string(),
      postalCode: z.string().optional(),
      addressNumber: z.string().optional(),
    })
    .optional(),
  couponCode: z.string().optional(),
  cpfOrCnpj: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 });
  const d = parsed.data;

  try {
    const subscriber = await prisma.subscriber.findUnique({ where: { id: session.id } });
    if (!subscriber) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });

    // Completa CPF/telefone quando a conta nasceu sem (login com Google).
    const data: { cpfOrCnpj?: string; phone?: string } = {};
    if (d.cpfOrCnpj) {
      const cpf = onlyDigits(d.cpfOrCnpj);
      if (!isValidCpfCnpj(cpf)) return NextResponse.json({ error: "CPF ou CNPJ inválido.", field: "cpfOrCnpj" }, { status: 400 });
      if (cpf !== subscriber.cpfOrCnpj) {
        const dup = await prisma.subscriber.findFirst({ where: { cpfOrCnpj: cpf, NOT: { id: subscriber.id } }, select: { id: true } });
        if (dup) return NextResponse.json({ error: "Este CPF/CNPJ já está em outra conta.", field: "cpfOrCnpj" }, { status: 409 });
        data.cpfOrCnpj = cpf;
      }
    }
    if (d.phone) {
      const ph = onlyDigits(d.phone);
      if (!isValidPhone(ph)) return NextResponse.json({ error: "Telefone inválido.", field: "phone" }, { status: 400 });
      data.phone = ph;
    }
    const sub = Object.keys(data).length ? await prisma.subscriber.update({ where: { id: subscriber.id }, data }) : subscriber;
    if (!sub.cpfOrCnpj) return NextResponse.json({ error: "Informe seu CPF ou CNPJ para gerar o pagamento.", field: "cpfOrCnpj" }, { status: 400 });

    const plan = await prisma.plan.findFirst({ where: { name: d.planName, isActive: true } });
    if (!plan) return NextResponse.json({ error: "Plano não encontrado." }, { status: 400 });

    // Cancela cobranças pendentes antigas desta conta (evita PIX duplicado).
    await prisma.payment.updateMany({ where: { subscriberId: sub.id, kind: "SUBSCRIPTION", status: "PENDING" }, data: { status: "CANCELLED" } });

    if (sub.planId !== plan.id) await prisma.subscriber.update({ where: { id: sub.id }, data: { planId: plan.id } });

    const { amount } = priceFor(plan, d.billingPeriod);
    if (amount <= 0) {
      await prisma.payment.create({ data: { amount: 0, method: "PIX", kind: "SUBSCRIPTION", status: "CONFIRMED", months: 1, subscriberId: sub.id, planId: plan.id } });
      return NextResponse.json({ status: "CONFIRMED", method: "free", confirmed: true, redirectTo: "/dashboard" });
    }

    const outcome = await createSubscriptionPayment({
      subscriber: sub,
      plan,
      period: d.billingPeriod,
      method: d.paymentMethod as CheckoutMethod,
      creditCard: d.creditCard,
      couponCode: d.couponCode,
    });
    return NextResponse.json({ ...outcome, authenticated: true, redirectTo: "/dashboard" });
  } catch (err) {
    console.error("[SUBSCRIBE POST]", err);
    return NextResponse.json({ error: friendlyPaymentError(err) }, { status: 502 });
  }
}
