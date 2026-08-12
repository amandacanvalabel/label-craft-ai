import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import {
  createCustomer,
  findCustomerByEmail,
  createPayment,
  getPixQrCode,
  type AsaasBillingType,
  type AsaasCustomer,
} from "@/lib/asaas";
import { validateCoupon, redeemCoupon } from "@/lib/coupon";
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
      couponCode,
    } = body;

    // Validação básica
    // OBS: paymentMethod NÃO é exigido aqui, pois planos gratuitos não têm pagamento.
    // Para planos pagos ele é validado mais abaixo, depois de sabermos o preço.
    if (!name || !email || !cpfOrCnpj || !password || !planName) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Buscar plano no DB
    const plan = await prisma.plan.findFirst({
      where: { name: planName, isActive: true },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const basePrice =
      billingPeriod === "annual" && plan.promotionalPrice != null
        ? plan.promotionalPrice
        : plan.price;

    // Cupom de desconto (opcional)
    let price = basePrice;
    let appliedCoupon: string | null = null;
    if (couponCode?.trim()) {
      const v = await validateCoupon(couponCode, basePrice);
      if (!v.valid) return NextResponse.json({ error: v.error || "Cupom inválido" }, { status: 400 });
      price = v.finalAmount ?? basePrice;
      appliedCoupon = v.code ?? null;
    }

    // Plano gratuito (preço 0) — ou cupom de 100% de desconto.
    // Nesse caso NÃO devemos criar cobrança no Asaas: o gateway rejeita
    // valor 0 com o erro "O parâmetro value deve ser informado".
    const isFreeCheckout = price <= 0;

    // Para planos pagos o método de pagamento é obrigatório.
    if (!isFreeCheckout && !paymentMethod) {
      return NextResponse.json(
        { error: "Método de pagamento é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se subscriber já existe
    let subscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    // Criar/buscar cliente no Asaas SOMENTE para planos pagos.
    let asaasCustomer: AsaasCustomer | null = null;
    if (!isFreeCheckout) {
      asaasCustomer = await findCustomerByEmail(email);
      if (!asaasCustomer) {
        asaasCustomer = await createCustomer({
          name,
          email,
          cpfCnpj: cpfOrCnpj,
          phone,
        });
      }
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
          asaasCustomerId: asaasCustomer?.id ?? null,
          planId: plan.id,
        },
      });
    } else {
      // Atualizar dados se já existe
      await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          ...(asaasCustomer ? { asaasCustomerId: asaasCustomer.id } : {}),
          planId: plan.id,
        },
      });
    }

    // ==================== FLUXO GRATUITO ====================
    // Sem passar pelo Asaas: registra um pagamento confirmado de valor 0,
    // já ativa a conta e autentica o usuário direto no dashboard.
    if (isFreeCheckout) {
      const freePayment = await prisma.payment.create({
        data: {
          amount: 0,
          method: "PIX", // placeholder — nenhum valor é cobrado neste fluxo
          status: "CONFIRMED",
          couponCode: appliedCoupon,
          subscriberId: subscriber.id,
          planId: plan.id,
        },
      });

      if (appliedCoupon) await redeemCoupon(appliedCoupon);

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

      return NextResponse.json({
        paymentId: freePayment.id,
        status: "CONFIRMED",
        method: "free",
        authenticated: true,
        redirectTo: "/dashboard",
      });
    }

    // ==================== FLUXO PAGO ====================
    // Mapear método de pagamento para Asaas
    const billingTypeMap: Record<string, AsaasBillingType> = {
      pix: "PIX",
      card: "CREDIT_CARD",
      boleto: "BOLETO",
    };
    const billingType = billingTypeMap[paymentMethod];

    // Criar cobrança no Asaas (asaasCustomer sempre existe no fluxo pago)
    const paymentData: Parameters<typeof createPayment>[0] = {
      customerId: asaasCustomer!.id,
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
        couponCode: appliedCoupon,
        subscriberId: subscriber.id,
        planId: plan.id,
      },
    });

    if (appliedCoupon) await redeemCoupon(appliedCoupon);

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
