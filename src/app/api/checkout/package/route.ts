import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  createCustomer,
  findCustomerByEmail,
  createPayment,
  getPixQrCode,
  type AsaasBillingType,
} from "@/lib/asaas";
import { validateCoupon, redeemCoupon } from "@/lib/coupon";
import { addCredits } from "@/lib/usage";

// Compra de um pacote de créditos avulsos por um assinante autenticado.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SUBSCRIBER") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { packageId, paymentMethod, creditCard, couponCode } = (await req.json()) as {
      packageId: string;
      paymentMethod: "pix" | "card" | "boleto";
      creditCard?: {
        holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string;
        postalCode?: string; addressNumber?: string;
      };
      couponCode?: string;
    };

    if (!packageId || !paymentMethod) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const pkg = await prisma.creditPackage.findFirst({ where: { id: packageId, isActive: true } });
    if (!pkg) return NextResponse.json({ error: "Pacote inválido" }, { status: 400 });

    const subscriber = await prisma.subscriber.findUnique({ where: { id: session.id } });
    if (!subscriber) return NextResponse.json({ error: "Assinante não encontrado" }, { status: 404 });

    // Cupom (opcional)
    let value = pkg.price;
    let appliedCoupon: string | null = null;
    if (couponCode?.trim()) {
      const v = await validateCoupon(couponCode, pkg.price);
      if (!v.valid) return NextResponse.json({ error: v.error || "Cupom inválido" }, { status: 400 });
      value = v.finalAmount ?? pkg.price;
      appliedCoupon = v.code ?? null;
    }

    // Cliente Asaas
    let asaasCustomer = subscriber.asaasCustomerId
      ? { id: subscriber.asaasCustomerId }
      : await findCustomerByEmail(subscriber.email);
    if (!asaasCustomer) {
      asaasCustomer = await createCustomer({
        name: subscriber.name, email: subscriber.email, cpfCnpj: subscriber.cpfOrCnpj, phone: subscriber.phone ?? undefined,
      });
      await prisma.subscriber.update({ where: { id: subscriber.id }, data: { asaasCustomerId: asaasCustomer.id } });
    }

    const billingTypeMap: Record<string, AsaasBillingType> = { pix: "PIX", card: "CREDIT_CARD", boleto: "BOLETO" };
    const billingType = billingTypeMap[paymentMethod];

    const paymentData: Parameters<typeof createPayment>[0] = {
      customerId: asaasCustomer.id,
      value,
      billingType,
      description: `CanvaLabel — ${pkg.name} (${pkg.aiCredits} IA + ${pkg.imageCredits} imagens)`,
    };
    if (paymentMethod === "card" && creditCard) {
      paymentData.creditCard = {
        holderName: creditCard.holderName, number: creditCard.number.replace(/\D/g, ""),
        expiryMonth: creditCard.expiryMonth, expiryYear: creditCard.expiryYear, ccv: creditCard.ccv,
      };
      paymentData.creditCardHolderInfo = {
        name: subscriber.name, email: subscriber.email, cpfCnpj: subscriber.cpfOrCnpj,
        phone: subscriber.phone?.replace(/\D/g, "") || "",
        postalCode: creditCard.postalCode || "00000000", addressNumber: creditCard.addressNumber || "0",
      };
    }

    const asaasPayment = await createPayment(paymentData);
    const confirmed = asaasPayment.status === "CONFIRMED" || asaasPayment.status === "RECEIVED";

    const payment = await prisma.payment.create({
      data: {
        amount: value,
        method: paymentMethod === "card" ? "CARD" : (paymentMethod.toUpperCase() as "PIX" | "BOLETO" | "CARD"),
        kind: "CREDIT_PACKAGE",
        status: confirmed ? "CONFIRMED" : "PENDING",
        asaasPaymentId: asaasPayment.id,
        asaasInvoiceUrl: asaasPayment.invoiceUrl,
        couponCode: appliedCoupon,
        creditsApplied: confirmed,
        subscriberId: subscriber.id,
        creditPackageId: pkg.id,
      },
    });

    // Pagamento já confirmado (cartão): credita na hora.
    if (confirmed) await addCredits(subscriber.id, pkg.aiCredits, pkg.imageCredits);
    if (appliedCoupon) await redeemCoupon(appliedCoupon);

    const result: Record<string, unknown> = {
      paymentId: payment.id, status: asaasPayment.status, method: paymentMethod, confirmed,
    };
    if (paymentMethod === "pix") {
      const pix = await getPixQrCode(asaasPayment.id);
      result.pix = { qrCodeImage: pix.encodedImage, qrCodePayload: pix.payload, expirationDate: pix.expirationDate };
    }
    if (paymentMethod === "boleto") {
      result.boleto = { invoiceUrl: asaasPayment.invoiceUrl, bankSlipUrl: asaasPayment.bankSlipUrl };
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[CHECKOUT PACKAGE ERROR]", error);
    const message = error instanceof Error ? error.message : "Erro no checkout do pacote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
