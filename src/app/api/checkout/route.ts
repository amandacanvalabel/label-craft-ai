// Cadastro + assinatura (modal de planos da landing / página /planos).
//
// Ordem de prioridade: a CONTA É CRIADA E SALVA PRIMEIRO, antes de falar com
// o Asaas. Se o pagamento falhar (ou a pessoa fechar o PIX sem pagar), ela
// continua com a conta, entra no painel e paga depois em "Meu plano".
// A sessão (cookie) é criada aqui mesmo — não dependemos da confirmação.
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";
import { createSubscriptionPayment, friendlyPaymentError, priceFor, type BillingPeriod, type CheckoutMethod } from "@/lib/billing";
import { isValidCpfCnpj, isValidPhone, normalizeEmail, onlyDigits, passwordIssue } from "@/lib/validation";

export const runtime = "nodejs";

const cardSchema = z.object({
  holderName: z.string().min(2, "Nome no cartão obrigatório"),
  number: z.string().min(13, "Número do cartão inválido"),
  expiryMonth: z.string().min(1),
  expiryYear: z.string().min(2),
  ccv: z.string().min(3, "CVV inválido"),
  postalCode: z.string().optional(),
  addressNumber: z.string().optional(),
});

const schema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(160),
  // CPF agora é pedido na etapa de pagamento (depois da conta criada).
  cpfOrCnpj: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres").max(72),
  planName: z.string().min(1),
  billingPeriod: z.enum(["monthly", "annual"]).default("monthly"),
  paymentMethod: z.enum(["pix", "card", "boleto"]).nullable().optional(),
  creditCard: cardSchema.optional(),
  couponCode: z.string().optional(),
  acceptTerms: z.boolean().optional(),
  // true = só cria a conta (etapa 1 do modal). O pagamento vem depois, em
  // /api/subscriber/subscribe, já com a pessoa logada.
  createOnly: z.boolean().optional(),
});

function sessionCookie(res: NextResponse, token: string) {
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Dados inválidos" }, { status: 400 });
  }
  const d = parsed.data;
  const email = normalizeEmail(d.email);
  const cpf = onlyDigits(d.cpfOrCnpj);
  const phone = onlyDigits(d.phone || "");

  if (cpf && !isValidCpfCnpj(cpf)) return NextResponse.json({ error: "CPF ou CNPJ inválido. Confira os números.", field: "cpfOrCnpj" }, { status: 400 });
  if (!isValidPhone(phone)) return NextResponse.json({ error: "Telefone inválido. Use DDD + número.", field: "phone" }, { status: 400 });
  const pwIssue = passwordIssue(d.password);
  if (pwIssue) return NextResponse.json({ error: pwIssue, field: "password" }, { status: 400 });
  if (!d.acceptTerms) return NextResponse.json({ error: "Para continuar, aceite os Termos de Uso e a Política de Privacidade.", field: "acceptTerms" }, { status: 400 });

  try {
    const plan = await prisma.plan.findFirst({ where: { name: d.planName, isActive: true } });
    if (!plan) return NextResponse.json({ error: "Plano não encontrado. Recarregue a página e tente de novo." }, { status: 400 });

    const period: BillingPeriod = d.billingPeriod;
    const { amount } = priceFor(plan, period);
    const isFree = amount <= 0;
    if (!isFree && !d.createOnly && !d.paymentMethod) return NextResponse.json({ error: "Escolha a forma de pagamento." }, { status: 400 });

    // Conta já existe? Não revelamos nada além do necessário, mas orientamos.
    const [byEmail, byCpf] = await Promise.all([
      prisma.subscriber.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } }),
      cpf ? prisma.subscriber.findFirst({ where: { cpfOrCnpj: cpf }, select: { id: true } }) : Promise.resolve(null),
    ]);
    if (byEmail) {
      return NextResponse.json(
        { error: "Já existe uma conta com este e-mail. Entre com sua senha para continuar (ou use “Esqueci minha senha”).", field: "email", code: "EMAIL_EXISTS" },
        { status: 409 },
      );
    }
    if (byCpf) {
      return NextResponse.json(
        { error: "Este CPF/CNPJ já está cadastrado em outra conta. Entre com o e-mail usado no cadastro.", field: "cpfOrCnpj", code: "CPF_EXISTS" },
        { status: 409 },
      );
    }
    const admin = await prisma.admin.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: { id: true } });
    if (admin) return NextResponse.json({ error: "Este e-mail já está em uso.", field: "email" }, { status: 409 });

    // 1) Cria a conta (salva mesmo que o pagamento não aconteça).
    const hashed = await bcrypt.hash(d.password, 12);
    const subscriber = await prisma.subscriber.create({
      data: {
        name: d.name,
        email,
        cpfOrCnpj: cpf || null,
        phone: phone || null,
        password: hashed,
        planId: plan.id,
        termsAcceptedAt: new Date(),
      },
    });

    // 2) Sessão imediata.
    const token = await signToken({ id: subscriber.id, email: subscriber.email, name: subscriber.name, role: "SUBSCRIBER" });
    sendWelcomeEmail(subscriber.email, subscriber.name, plan.name).catch(() => {});

    // 3) Plano gratuito (ou valor zero): ativa sem cobrança.
    if (isFree) {
      await prisma.payment.create({
        data: { amount: 0, method: "PIX", kind: "SUBSCRIPTION", status: "CONFIRMED", months: period === "annual" ? 12 : 1, subscriberId: subscriber.id, planId: plan.id },
      });
      return sessionCookie(
        NextResponse.json({ accountCreated: true, paymentId: null, status: "CONFIRMED", method: "free", confirmed: true, authenticated: true, redirectTo: "/dashboard" }),
        token,
      );
    }

    // 3b) Só cadastro: a pessoa escolhe a forma de pagamento na etapa seguinte.
    if (d.createOnly) {
      return sessionCookie(
        NextResponse.json({
          accountCreated: true,
          authenticated: true,
          user: { id: subscriber.id, name: subscriber.name, email: subscriber.email },
          needsCpf: !subscriber.cpfOrCnpj,
          redirectTo: "/dashboard/meu-plano",
        }),
        token,
      );
    }

    // 4) Cobrança no Asaas. Se falhar, a conta fica — e avisamos como pagar depois.
    try {
      const outcome = await createSubscriptionPayment({
        subscriber,
        plan,
        period,
        method: d.paymentMethod as CheckoutMethod,
        creditCard: d.creditCard,
        couponCode: d.couponCode,
      });
      return sessionCookie(
        NextResponse.json({
          accountCreated: true,
          authenticated: true,
          redirectTo: "/dashboard",
          ...outcome,
        }),
        token,
      );
    } catch (err) {
      console.error("[CHECKOUT PAYMENT ERROR]", err);
      return sessionCookie(
        NextResponse.json(
          {
            accountCreated: true,
            authenticated: true,
            redirectTo: "/dashboard/meu-plano",
            paymentFailed: true,
            error: friendlyPaymentError(err),
          },
          { status: 502 },
        ),
        token,
      );
    }
  } catch (err) {
    console.error("[CHECKOUT ERROR]", err);
    return NextResponse.json({ error: "Não foi possível concluir o cadastro agora. Tente novamente em instantes." }, { status: 500 });
  }
}
