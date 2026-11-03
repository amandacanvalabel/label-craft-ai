// Cobrança de assinatura (compartilhada pelo cadastro público em /api/checkout
// e pela assinatura de quem já tem conta em /api/subscriber/subscribe).
//
// Regra de preço: `price` é o valor mensal; `promotionalPrice` é o valor por
// mês quando a pessoa paga o ano de uma vez (12 meses). O valor cobrado no
// anual é promotionalPrice × 12 (ou price × 12 se não houver promoção).
import { prisma } from "./prisma";
import { AsaasError, createCustomer, createPayment, findCustomerByEmail, getPixQrCode, type AsaasBillingType } from "./asaas";
import { redeemCoupon, validateCoupon } from "./coupon";
import { sendPlanConfirmationEmail } from "./email";
import { onlyDigits } from "./validation";

export type BillingPeriod = "monthly" | "annual";

// Erro de dado informado pela pessoa (cupom, CPF, cartão): a mensagem é clara
// e pode ser mostrada como está.
export class BillingInputError extends Error {}
export type CheckoutMethod = "pix" | "card" | "boleto";

export interface CardInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  postalCode?: string;
  addressNumber?: string;
}

export interface PlanLite {
  id: string;
  name: string;
  price: number;
  promotionalPrice: number | null;
}

export function priceFor(plan: PlanLite, period: BillingPeriod) {
  const perMonth = period === "annual" && plan.promotionalPrice !== null ? plan.promotionalPrice : plan.price;
  const months = period === "annual" ? 12 : 1;
  const amount = Math.round(perMonth * months * 100) / 100;
  return { perMonth, months, amount };
}

export interface PaymentOutcome {
  paymentId: string;
  asaasPaymentId: string | null;
  status: string;
  method: CheckoutMethod | "free";
  confirmed: boolean;
  amount: number;
  pix?: { qrCodeImage: string; qrCodePayload: string; expirationDate: string };
  boleto?: { invoiceUrl?: string; bankSlipUrl?: string };
}

interface SubscriberLite {
  id: string;
  name: string;
  email: string;
  cpfOrCnpj: string | null;
  phone: string | null;
  asaasCustomerId: string | null;
}

// Cria (ou reaproveita) o cliente no Asaas e gera a cobrança da assinatura.
// Lança erro com mensagem amigável quando o Asaas recusa.
export async function createSubscriptionPayment(opts: {
  subscriber: SubscriberLite;
  plan: PlanLite;
  period: BillingPeriod;
  method: CheckoutMethod;
  creditCard?: CardInput;
  couponCode?: string;
}): Promise<PaymentOutcome> {
  const { subscriber, plan, period, method } = opts;
  const { amount: baseAmount, months } = priceFor(plan, period);

  // Cupom (opcional)
  let amount = baseAmount;
  let appliedCoupon: string | null = null;
  if (opts.couponCode?.trim()) {
    const v = await validateCoupon(opts.couponCode, baseAmount);
    if (!v.valid) throw new BillingInputError(v.error || "Cupom inválido");
    amount = v.finalAmount ?? baseAmount;
    appliedCoupon = v.code ?? null;
  }

  // Cupom de 100%: ativa sem cobrança.
  if (amount <= 0) {
    const payment = await prisma.payment.create({
      data: { amount: 0, method: "PIX", kind: "SUBSCRIPTION", status: "CONFIRMED", months, couponCode: appliedCoupon, subscriberId: subscriber.id, planId: plan.id },
    });
    if (appliedCoupon) await redeemCoupon(appliedCoupon);
    return { paymentId: payment.id, asaasPaymentId: null, status: "CONFIRMED", method: "free", confirmed: true, amount: 0 };
  }

  if (!subscriber.cpfOrCnpj) throw new BillingInputError("Informe seu CPF ou CNPJ para gerar o pagamento");

  // Cliente Asaas
  let customer = subscriber.asaasCustomerId ? { id: subscriber.asaasCustomerId } : await findCustomerByEmail(subscriber.email);
  if (!customer) {
    customer = await createCustomer({ name: subscriber.name, email: subscriber.email, cpfCnpj: subscriber.cpfOrCnpj, phone: subscriber.phone ?? undefined });
  }
  if (customer.id !== subscriber.asaasCustomerId) {
    // Guardar o id do cliente é só um atalho para a próxima cobrança: se não
    // der (ex.: id já vinculado a outra conta), segue sem travar o pagamento.
    await prisma.subscriber
      .update({ where: { id: subscriber.id }, data: { asaasCustomerId: customer.id } })
      .catch((err) => console.error("[BILLING] não salvou asaasCustomerId", err));
  }

  const billingTypeMap: Record<CheckoutMethod, AsaasBillingType> = { pix: "PIX", card: "CREDIT_CARD", boleto: "BOLETO" };
  const periodLabel = months === 12 ? "anual" : "mensal";
  const paymentData: Parameters<typeof createPayment>[0] = {
    customerId: customer.id,
    value: amount,
    billingType: billingTypeMap[method],
    description: `CanvaLabel — plano ${plan.name} (${periodLabel})`,
  };
  if (method === "boleto") {
    // Boleto vence em 3 dias (hoje seria recusado por alguns bancos).
    paymentData.dueDate = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
  }
  if (method === "card") {
    const cc = opts.creditCard;
    if (!cc) throw new BillingInputError("Preencha os dados do cartão");
    paymentData.creditCard = {
      holderName: cc.holderName,
      number: onlyDigits(cc.number),
      expiryMonth: cc.expiryMonth.padStart(2, "0"),
      expiryYear: cc.expiryYear.length === 2 ? `20${cc.expiryYear}` : cc.expiryYear,
      ccv: cc.ccv,
    };
    paymentData.creditCardHolderInfo = {
      name: cc.holderName || subscriber.name,
      email: subscriber.email,
      cpfCnpj: onlyDigits(subscriber.cpfOrCnpj),
      phone: onlyDigits(subscriber.phone || "") || "11999999999",
      postalCode: onlyDigits(cc.postalCode || "") || "01310100",
      addressNumber: cc.addressNumber || "0",
    };
  }

  const asaasPayment = await createPayment(paymentData);
  const confirmed = asaasPayment.status === "CONFIRMED" || asaasPayment.status === "RECEIVED";

  const payment = await prisma.payment.create({
    data: {
      amount,
      method: method === "card" ? "CARD" : method === "pix" ? "PIX" : "BOLETO",
      kind: "SUBSCRIPTION",
      status: confirmed ? "CONFIRMED" : "PENDING",
      months,
      asaasPaymentId: asaasPayment.id,
      asaasInvoiceUrl: asaasPayment.invoiceUrl,
      couponCode: appliedCoupon,
      subscriberId: subscriber.id,
      planId: plan.id,
    },
  });
  if (appliedCoupon) await redeemCoupon(appliedCoupon);

  if (confirmed) {
    sendPlanConfirmationEmail(subscriber.email, subscriber.name, plan.name, amount).catch(() => {});
  }

  const out: PaymentOutcome = {
    paymentId: payment.id,
    asaasPaymentId: asaasPayment.id,
    status: asaasPayment.status,
    method,
    confirmed,
    amount,
  };
  if (method === "pix") {
    try {
      const pix = await getPixQrCode(asaasPayment.id);
      out.pix = { qrCodeImage: pix.encodedImage, qrCodePayload: pix.payload, expirationDate: pix.expirationDate };
    } catch (err) {
      console.error("[PIX QRCODE]", err);
    }
  }
  if (method === "boleto") {
    out.boleto = { invoiceUrl: asaasPayment.invoiceUrl, bankSlipUrl: asaasPayment.bankSlipUrl };
  }
  return out;
}

// Mensagens do Asaas em português claro para o cliente. Erros internos
// (banco, código) nunca aparecem crus: viram uma mensagem genérica.
export function friendlyPaymentError(err: unknown): string {
  const later = "Sua conta está salva — você pode pagar depois em “Meu plano”.";
  if (err instanceof AsaasError) {
    const m = err.message || "";
    if (err.status === 401 || err.status === 403 || /access_token|chave de api|api key/i.test(m)) {
      return `O serviço de pagamento está indisponível no momento. ${later}`;
    }
    if (err.status >= 500 || err.code === "network") return `A instituição de pagamento não respondeu. Tente de novo em instantes. ${later}`;
    if (/cpf|cnpj/i.test(m)) return "CPF/CNPJ não aceito pela instituição de pagamento. Confira os números e tente de novo.";
    if (/cart[aã]o|card|transa[cç][aã]o n[aã]o autorizada/i.test(m)) return "O cartão foi recusado. Confira os dados ou tente PIX.";
    return m;
  }
  if (err instanceof BillingInputError) return err.message;
  return `Não foi possível gerar o pagamento agora. ${later}`;
}
