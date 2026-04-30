const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

interface AsaasRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: Record<string, unknown>;
}

async function asaasRequest<T = Record<string, unknown>>(
  options: AsaasRequestOptions
): Promise<T> {
  const { method, path, body } = options;

  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      access_token: ASAAS_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMsg =
      data?.errors?.[0]?.description || data?.message || "Erro na API Asaas";
    throw new Error(errorMsg);
  }

  return data as T;
}

// ==================== CUSTOMERS ====================

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}

export async function createCustomer(data: {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
}): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>({
    method: "POST",
    path: "/customers",
    body: {
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpfCnpj.replace(/\D/g, ""),
      phone: data.phone?.replace(/\D/g, ""),
      notificationDisabled: false,
    },
  });
}

export async function findCustomerByEmail(
  email: string
): Promise<AsaasCustomer | null> {
  const result = await asaasRequest<{
    data: AsaasCustomer[];
    totalCount: number;
  }>({
    method: "GET",
    path: `/customers?email=${encodeURIComponent(email)}`,
  });

  return result.data.length > 0 ? result.data[0] : null;
}

// ==================== PAYMENTS ====================

export type AsaasBillingType = "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: AsaasBillingType;
  status: string;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  description?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export async function createPayment(data: {
  customerId: string;
  value: number;
  billingType: AsaasBillingType;
  description?: string;
  dueDate?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone: string;
    postalCode: string;
    addressNumber: string;
  };
}): Promise<AsaasPayment> {
  const today = new Date();
  const dueDate =
    data.dueDate || today.toISOString().split("T")[0];

  const body: Record<string, unknown> = {
    customer: data.customerId,
    billingType: data.billingType,
    value: data.value,
    dueDate,
    description: data.description || "Assinatura CanvaLabel",
  };

  if (data.billingType === "CREDIT_CARD" && data.creditCard) {
    body.creditCard = data.creditCard;
    body.creditCardHolderInfo = data.creditCardHolderInfo;
  }

  return asaasRequest<AsaasPayment>({
    method: "POST",
    path: "/payments",
    body,
  });
}

export async function getPixQrCode(
  paymentId: string
): Promise<AsaasPixQrCode> {
  return asaasRequest<AsaasPixQrCode>({
    method: "GET",
    path: `/payments/${paymentId}/pixQrCode`,
  });
}

export async function getPaymentStatus(
  paymentId: string
): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>({
    method: "GET",
    path: `/payments/${paymentId}`,
  });
}
