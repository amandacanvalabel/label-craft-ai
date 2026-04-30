import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import {
  createCustomer,
  findCustomerByEmail,
  createPayment,
  getPixQrCode,
  type AsaasBillingType,
} from "@/lib/asaas";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      cpfOrCnpj,
      phone,
      password,
      planName,
      billingPeriod,
      paymentMethod,
      creditCard,
    } = body;

    // Validação básica
    if (!name || !email || !cpfOrCnpj || !password || !planName || !paymentMethod) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Mapear plano e preço
    const planMap: Record<string, { monthly: number; annual: number }> = {
      Starter: { monthly: 49.9, annual: 39.9 },
      Profissional: { monthly: 99.9, annual: 79.9 },
      Enterprise: { monthly: 249.9, annual: 199.9 },
    };

    const planPricing = planMap[planName];
    if (!planPricing) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const price =
      billingPeriod === "annual" ? planPricing.annual : planPricing.monthly;

    // Buscar ou criar plano no DB
    let plan = await prisma.plan.findFirst({
      where: { name: planName, isActive: true },
    });

    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          name: planName,
          description: `Plano ${planName}`,
          type: billingPeriod === "annual" ? "ANNUAL" : "MONTHLY",
          price,
          benefits: planMap[planName]
            ? Object.keys(planMap)
            : [],
          isActive: true,
        },
      });
    }

    // Verificar se subscriber já existe
    let subscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    // Mapear método de pagamento para Asaas
    const billingTypeMap: Record<string, AsaasBillingType> = {
      pix: "PIX",
      card: "CREDIT_CARD",
      boleto: "BOLETO",
    };
    const billingType = billingTypeMap[paymentMethod];

    // Criar ou buscar cliente no Asaas
    let asaasCustomer = await findCustomerByEmail(email);
    if (!asaasCustomer) {
      asaasCustomer = await createCustomer({
        name,
        email,
        cpfCnpj: cpfOrCnpj,
        phone,
      });
    }

    // Criar subscriber no DB se não existir
    if (!subscriber) {
      const hashedPassword = await bcrypt.hash(password, 12);
      subscriber = await prisma.subscriber.create({
        data: {
          name,
          email,
          cpfOrCnpj: cpfOrCnpj.replace(/\D/g, ""),
          phone,
          password: hashedPassword,
          asaasCustomerId: asaasCustomer.id,
          planId: plan.id,
        },
      });
    } else {
      // Atualizar dados se já existe
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          asaasCustomerId: asaasCustomer.id,
          planId: plan.id,
        },
      });
    }

    // Criar cobrança no Asaas
    const paymentData: Parameters<typeof createPayment>[0] = {
      customerId: asaasCustomer.id,
      value: price,
      billingType,
      description: `Assinatura CanvaLabel - Plano ${planName} (${billingPeriod === "annual" ? "Anual" : "Mensal"})`,
    };

    // Cartão de crédito
    if (paymentMethod === "card" && creditCard) {
      paymentData.creditCard = {
        holderName: creditCard.holderName,
        number: creditCard.number.replace(/\D/g, ""),
        expiryMonth: creditCard.expiryMonth,
        expiryYear: creditCard.expiryYear,
        ccv: creditCard.ccv,
      };
      paymentData.creditCardHolderInfo = {
        name,
        email,
        cpfCnpj: cpfOrCnpj.replace(/\D/g, ""),
        phone: phone?.replace(/\D/g, "") || "",
        postalCode: creditCard.postalCode || "00000000",
        addressNumber: creditCard.addressNumber || "0",
      };
    }

    const asaasPayment = await createPayment(paymentData);

    // Salvar pagamento no DB
    const payment = await prisma.payment.create({
      data: {
        amount: price,
        method: paymentMethod.toUpperCase() === "CARD" ? "CARD" : paymentMethod.toUpperCase() as "PIX" | "BOLETO" | "CARD",
        status:
          asaasPayment.status === "CONFIRMED" || asaasPayment.status === "RECEIVED"
            ? "CONFIRMED"
            : "PENDING",
        asaasPaymentId: asaasPayment.id,
        asaasInvoiceUrl: asaasPayment.invoiceUrl,
        subscriberId: subscriber.id,
        planId: plan.id,
      },
    });

    // Resultado baseado no método de pagamento
    const result: Record<string, unknown> = {
      paymentId: payment.id,
      asaasPaymentId: asaasPayment.id,
      status: asaasPayment.status,
      method: paymentMethod,
    };

    // PIX - gerar QR Code
    if (paymentMethod === "pix") {
      const pixData = await getPixQrCode(asaasPayment.id);
      result.pix = {
        qrCodeImage: pixData.encodedImage,
        qrCodePayload: pixData.payload,
        expirationDate: pixData.expirationDate,
      };
    }

    // Boleto - URL
    if (paymentMethod === "boleto") {
      result.boleto = {
        invoiceUrl: asaasPayment.invoiceUrl,
        bankSlipUrl: asaasPayment.bankSlipUrl,
      };
    }

    // Cartão - se confirmado, já logar
    if (
      paymentMethod === "card" &&
      (asaasPayment.status === "CONFIRMED" || asaasPayment.status === "RECEIVED")
    ) {
      const token = await signToken({
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
        role: "SUBSCRIBER",
      });

      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      result.authenticated = true;
      result.redirectTo = "/dashboard";
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[CHECKOUT ERROR]", error);
    const message =
      error instanceof Error ? error.message : "Erro interno no checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
