const ASAAS_API_URL = process.env.ASAAS_API_URL || "https://api.asaas.com/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || "";

// Erro vindo do Asaas (com o status HTTP), para separar "o Asaas recusou"
// (mensagem pode ir ao cliente) de falhas internas (nunca mostradas cruas).
export class AsaasError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AsaasError";
    this.status = status;
    this.code = code;
  }
}

interface AsaasRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: Record<string, unknown>;
}

async function asaasRequest<T = Record<string, unknown>>(
  options: AsaasRequestOptions
): Promise<T> {
  const { method, path, body } = options;

  if (!ASAAS_API_KEY) {
    // Sem a chave nenhuma cobrança é gerada. Aparece nos logs da Vercel.
    console.error("[ASAAS] ASAAS_API_KEY não configurada — nenhuma cobrança pode ser gerada.");
    throw new AsaasError("ASAAS_API_KEY ausente", 401, "missing_api_key");
  }

  let res: Response;
  try {
    res = await fetch(`${ASAAS_API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CanvaLabel",
        access_token: ASAAS_API_KEY,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error("[ASAAS] falha de rede", path, err);
    throw new AsaasError("Falha de comunicação com o Asaas", 503, "network");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const first = data?.errors?.[0];
    const errorMsg = first?.description || data?.message || "Erro na API Asaas";
    console.error(`[ASAAS] ${method} ${path} → ${res.status}`, first?.code || "", errorMsg);
    throw new AsaasError(errorMsg, res.status, first?.code);
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
