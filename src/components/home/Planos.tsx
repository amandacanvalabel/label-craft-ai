"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineCheck,
  HiOutlineStar,
  HiOutlineXMark,
  HiOutlineCreditCard,
  HiOutlineQrCode,
  HiOutlineDocumentText,
  HiOutlineArrowLeft,
  HiOutlineClipboard,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { isValidCpfCnpj, isValidPhone, maskCardNumber, maskCep, maskCpfCnpj, maskPhone, normalizeEmail, EMAIL_RE, passwordIssue } from "@/lib/validation";

type BillingPeriod = "monthly" | "annual";
type PaymentMethod = "pix" | "card" | "boleto" | null;
type ModalStep = "method" | "userdata" | "processing" | "payment" | "success" | "payment_failed";

// Sessão atual (quem já tem conta assina sem recriar cadastro).
interface MeInfo {
  id: string;
  name: string;
  email: string;
  needsCpf: boolean;
  planName: string | null;
  planStatus: "active" | "pending" | "expired" | "none" | null;
}

interface DBPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promotionalPrice: number | null;
  type: string;
  benefits: string[];
  // Limites reais aplicados pelo sistema (-1 = ilimitado). Opcionais para
  // não quebrar caso a API antiga ainda esteja em cache.
  maxLabels?: number;
  monthlyAiCredits?: number;
  monthlyImageCredits?: number;
  storageMb?: number;
}

/** "9,90" / "29,90" / "30" — centavos só quando existem. */
const fmtBRL = (v: number) =>
  Number.isInteger(v) ? String(v) : v.toFixed(2).replace(".", ",");

/** -1 vira "Ilimitados"; undefined vira "—". */
const fmtLimit = (v: number | undefined, unit = "") =>
  v === undefined ? "—" : v < 0 ? "Ilimitados" : `${v}${unit}`;

const fmtStorage = (mb: number | undefined) =>
  mb === undefined ? "—" : mb < 0 ? "Ilimitado" : mb >= 1024 ? `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB` : `${mb} MB`;

interface UserFormData {
  name: string;
  email: string;
  cpfOrCnpj: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface CardFormData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  postalCode: string;
  addressNumber: string;
}

interface CheckoutResult {
  paymentId: string;
  asaasPaymentId: string;
  status: string;
  method: string;
  authenticated?: boolean;
  redirectTo?: string;
  accountCreated?: boolean;
  confirmed?: boolean;
  amount?: number;
  pix?: {
    qrCodeImage: string;
    qrCodePayload: string;
    expirationDate: string;
  };
  boleto?: {
    invoiceUrl: string;
    bankSlipUrl: string;
  };
}

const paymentMethods = [
  {
    id: "pix" as PaymentMethod,
    label: "PIX",
    description: "Aprovação instantânea",
    icon: HiOutlineQrCode,
    badge: "Mais rápido",
    badgeColor: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "card" as PaymentMethod,
    label: "Cartão de Crédito",
    description: "Aprovação na hora",
    icon: HiOutlineCreditCard,
    badge: null,
    badgeColor: "",
  },
  {
    id: "boleto" as PaymentMethod,
    label: "Boleto Bancário",
    description: "Compensa em até 3 dias úteis",
    icon: HiOutlineDocumentText,
    badge: null,
    badgeColor: "",
  },
];

const inputCls = (invalid: boolean) =>
  cn(
    "w-full px-4 py-3 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 transition-all",
    invalid ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-border/60 focus:ring-primary/30 focus:border-primary",
  );

const Field = ({ label, required, error, hint, className, children }: { label: string; required?: boolean; error?: string; hint?: string; className?: string; children: React.ReactNode }) => (
  <div className={className}>
    <label className="text-xs font-medium text-muted-foreground mb-1 block">
      {label}{required ? " *" : ""}
    </label>
    {children}
    {error ? <p className="text-[11px] text-red-500 mt-1">{error}</p> : hint ? <p className="text-[11px] text-muted-foreground/70 mt-1">{hint}</p> : null}
  </div>
);

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const PlanCardSkeleton = () => (
  <div className="rounded-[1.5rem] p-7 neo-card animate-pulse space-y-4">
    <div className="h-5 w-28 bg-muted rounded-full" />
    <div className="h-3 w-40 bg-muted rounded-full" />
    <div className="h-10 w-24 bg-muted rounded-full mt-4" />
    <div className="space-y-2 mt-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-3 bg-muted rounded-full" style={{ width: `${70 + i * 5}%` }} />
      ))}
    </div>
    <div className="h-12 bg-muted rounded-xl mt-4" />
  </div>
);

// Para onde ir depois de criar a conta. Quem veio do funil da IA
// (/planos?next=/canvalabel-alimentos.html) VOLTA pra ferramenta, com o modelo
// gerado intacto. Sem "next", segue o padrão de sempre (/dashboard).
const destinoPosCadastro = (padrao: string): string => {
  try {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n && n.startsWith("/") && !n.startsWith("//")) return n;
  } catch {
    /* ignora */
  }
  return padrao;
};

const Planos = () => {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingPeriod>("annual");
  const [plans, setPlans] = useState<DBPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<DBPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [step, setStep] = useState<ModalStep>("method");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState<{ discount: number; finalAmount: number; label: string } | null>(null);
  const [couponErr, setCouponErr] = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string>>({});
  // Atualiza um campo e limpa o erro dele (feedback some assim que a pessoa corrige).
  const clearErr = (k: string) => setFieldErr((e) => (e[k] ? Object.fromEntries(Object.entries(e).filter(([x]) => x !== k)) : e));
  const [showPw, setShowPw] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [me, setMe] = useState<MeInfo | null>(null);
  const [googleLogin, setGoogleLogin] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [userData, setUserData] = useState<UserFormData>({
    name: "",
    email: "",
    cpfOrCnpj: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [cardData, setCardData] = useState<CardFormData>({
    holderName: "",
    number: "",
    expiryMonth: "",
    expiryYear: "",
    ccv: "",
    postalCode: "",
    addressNumber: "",
  });

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.ok ? r.json() : [])
      .then((data: DBPlan[]) => setPlans(data))
      .catch(() => {})
      .finally(() => setPlansLoading(false));
    // Quem já está logado assina/renova sem preencher cadastro de novo.
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user?.role === "SUBSCRIBER") {
          setMe({
            id: d.user.id, name: d.user.name, email: d.user.email,
            needsCpf: !!d.planInfo?.needsCpf || !d.planInfo, planName: d.planInfo?.planName ?? null, planStatus: d.planInfo?.status ?? "none",
          });
        }
      })
      .catch(() => {});
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setGoogleLogin(!!d?.google))
      .catch(() => {});
  }, []);

  // Valor cobrado agora (anual = 12 meses de uma vez).
  const chargeFor = (plan: DBPlan) => {
    const perMonth = getPrice(plan);
    const months = billing === "annual" ? 12 : 1;
    return { perMonth, months, total: Math.round(perMonth * months * 100) / 100 };
  };

  const hasDiscount = plans.some(
    (p) => p.promotionalPrice !== null && p.promotionalPrice < p.price
  );

  const getPrice = (plan: DBPlan) =>
    billing === "annual" && plan.promotionalPrice !== null
      ? plan.promotionalPrice
      : plan.price;

  // Plano gratuito: preço final igual a zero. Nesse caso o checkout não passa
  // por pagamento, então pulamos a etapa de método de pagamento.
  const isFreePlan = (plan: DBPlan | null) => !!plan && getPrice(plan) <= 0;

  const resetModal = useCallback(() => {
    setSelectedPlan(null);
    setPaymentMethod(null);
    setStep("method");
    setError("");
    setLoading(false);
    setCheckoutResult(null);
    setPixCopied(false);
    setFieldErr({});
    if (pollingRef.current) clearInterval(pollingRef.current);
  }, []);

  // Polling para PIX/Boleto
  useEffect(() => {
    if (
      step === "payment" &&
      checkoutResult?.paymentId &&
      (paymentMethod === "pix" || paymentMethod === "boleto")
    ) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(
            `/api/checkout/status/${checkoutResult.paymentId}`
          );
          const data = await res.json();
          if (data.status === "CONFIRMED" && data.authenticated) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            track("assinatura_confirmada", { plano: selectedPlan?.name, metodo: paymentMethod ?? undefined });
            setStep("success");
            setTimeout(() => router.push(destinoPosCadastro("/dashboard")), 2500);
          }
        } catch {
          // silently retry
        }
      }, 4000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [step, checkoutResult, paymentMethod, router]);

  const handleSubmitUserData = async () => {
    setError("");
    const errs: Record<string, string> = {};
    const loggedIn = !!me;

    if (!loggedIn) {
      if (userData.name.trim().length < 3) errs.name = "Informe seu nome completo";
      if (!EMAIL_RE.test(normalizeEmail(userData.email))) errs.email = "Informe um e-mail válido";
      const pw = passwordIssue(userData.password);
      if (pw) errs.password = pw;
      if (userData.password !== userData.confirmPassword) errs.confirmPassword = "As senhas não coincidem";
      if (!acceptTerms) errs.acceptTerms = "Aceite os Termos de Uso e a Política de Privacidade para continuar";
    }
    if ((!loggedIn || me?.needsCpf) && !freeFlow) {
      if (!isValidCpfCnpj(userData.cpfOrCnpj)) errs.cpfOrCnpj = "CPF ou CNPJ inválido";
    } else if (!loggedIn && userData.cpfOrCnpj && !isValidCpfCnpj(userData.cpfOrCnpj)) {
      errs.cpfOrCnpj = "CPF ou CNPJ inválido";
    }
    if (!isValidPhone(userData.phone)) errs.phone = "Telefone inválido (DDD + número)";
    if (paymentMethod === "card") {
      if (!cardData.holderName.trim()) errs.holderName = "Nome como está no cartão";
      if (cardData.number.replace(/\D/g, "").length < 13) errs.cardNumber = "Número do cartão inválido";
      const mm = parseInt(cardData.expiryMonth, 10);
      if (!(mm >= 1 && mm <= 12)) errs.expiryMonth = "Mês inválido";
      if (!/^(\d{2}|\d{4})$/.test(cardData.expiryYear)) errs.expiryYear = "Ano inválido";
      if (!/^\d{3,4}$/.test(cardData.ccv)) errs.ccv = "CVV inválido";
    }
    setFieldErr(errs);
    if (Object.keys(errs).length) {
      setError("Confira os campos destacados.");
      return;
    }

    setStep("processing");
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        planName: selectedPlan!.name,
        billingPeriod: billing,
        paymentMethod: freeFlow ? null : paymentMethod,
        phone: userData.phone,
      };
      if (userData.cpfOrCnpj) body.cpfOrCnpj = userData.cpfOrCnpj;
      if (!loggedIn) {
        body.name = userData.name.trim();
        body.email = normalizeEmail(userData.email);
        body.password = userData.password;
        body.acceptTerms = acceptTerms;
      }
      if (couponInfo && coupon.trim()) body.couponCode = coupon.trim();
      if (paymentMethod === "card") {
        body.creditCard = {
          holderName: cardData.holderName,
          number: cardData.number,
          expiryMonth: cardData.expiryMonth,
          expiryYear: cardData.expiryYear,
          ccv: cardData.ccv,
          postalCode: cardData.postalCode,
          addressNumber: cardData.addressNumber,
        };
      }

      const res = await fetch(loggedIn ? "/api/subscriber/subscribe" : "/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Conta criada, mas a cobrança falhou: a pessoa não perde nada.
        if (data.accountCreated || data.paymentFailed) {
          track("cadastro_concluido", { plano: selectedPlan?.name, pagamento: "falhou" });
          setError(data.error || "Não foi possível gerar o pagamento agora.");
          setStep("payment_failed");
          return;
        }
        if (data.field) setFieldErr({ [data.field]: data.error });
        throw new Error(data.error || "Erro ao processar. Tente novamente.");
      }

      setCheckoutResult(data);
      if (!loggedIn) track("cadastro_concluido", { plano: selectedPlan?.name, metodo: paymentMethod ?? "gratis" });

      if (data.confirmed || (data.authenticated && data.method === "free")) {
        track("assinatura_confirmada", { plano: selectedPlan?.name, metodo: paymentMethod ?? undefined });
        setStep("success");
        setTimeout(() => router.push(destinoPosCadastro(data.redirectTo || "/dashboard")), 2500);
      } else {
        track("pagamento_gerado", { plano: selectedPlan?.name, metodo: paymentMethod ?? undefined });
        setStep("payment");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setStep("userdata");
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim() || !selectedPlan) return;
    setCouponErr("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon, amount: chargeFor(selectedPlan).total }),
      });
      const d = await res.json();
      if (d.valid) { setCouponInfo({ discount: d.discount, finalAmount: d.finalAmount, label: d.label }); }
      else { setCouponInfo(null); setCouponErr(d.error || "Cupom inválido"); }
    } catch {
      setCouponErr("Erro ao validar o cupom");
    }
  };

  const copyPixCode = async () => {
    if (checkoutResult?.pix?.qrCodePayload) {
      await navigator.clipboard.writeText(checkoutResult.pix.qrCodePayload);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  // Step indicators — no plano grátis só existe a etapa de dados.
  const freeFlow = isFreePlan(selectedPlan);
  const stepLabels = freeFlow ? ["Dados"] : ["Método", "Dados", "Pagamento"];
  const stepIndex = freeFlow
    ? 0
    : step === "method" ? 0 : step === "userdata" ? 1 : 2;

  return (
    <>
      <section id="planos" className="relative py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-muted/30" />
        <div className="blur-brush-blue -top-60 left-1/3 opacity-15" />
        <div className="blur-brush-cyan -bottom-40 right-1/4 opacity-20" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Planos
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Menos que um lanche por mês.{" "}
              <span className="gradient-text">Muito menos que um designer.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Um único rótulo feito fora custa R$ 2 a 3 mil e leva semanas.
              Aqui você escolhe o tamanho da sua operação, começa hoje e cancela
              quando quiser. Todos os planos têm tudo: IA, revisor ANVISA,
              tabela nutricional e PDF pra gráfica.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center gap-3 bg-muted rounded-full p-1.5">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                  billing === "monthly"
                    ? "gradient-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 relative",
                  billing === "annual"
                    ? "gradient-primary text-white shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Anual
                {hasDiscount && (
                  <span className="absolute -top-3 -right-3 text-[10px] font-bold text-white bg-emerald-500 rounded-full px-2 py-0.5">
                    -20%
                  </span>
                )}
              </button>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-5 items-center max-w-[960px] mx-auto">
            {plansLoading ? (
              [...Array(3)].map((_, i) => <PlanCardSkeleton key={i} />)
            ) : plans.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <p className="text-sm">Nenhum plano disponível no momento.</p>
              </div>
            ) : (
              plans.map((plan, i) => {
                const isPopular = plans.length >= 2 && i === Math.floor((plans.length - 1) / 2);
                const annualSavings =
                  billing === "annual" &&
                  plan.promotionalPrice !== null &&
                  plan.promotionalPrice < plan.price
                    ? ((plan.price - plan.promotionalPrice) * 12).toFixed(0)
                    : null;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={cn(
                      "relative transition-all duration-300",
                      isPopular
                        ? "rounded-[2rem] p-9 neo-card shadow-2xl ring-2 ring-primary/20 z-10 md:scale-105 md:-my-4"
                        : "rounded-[1.5rem] p-7 neo-card neo-card-hover"
                    )}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 gradient-primary text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg shadow-primary/30">
                          <HiOutlineStar className="w-3.5 h-3.5" />
                          Mais popular
                        </span>
                      </div>
                    )}

                    {/* Glow for popular */}
                    {isPopular && (
                      <div className="absolute -inset-1 -z-10 gradient-primary opacity-[0.06] blur-2xl rounded-[2rem]" />
                    )}

                    <div className="mb-5">
                      <h3
                        className={cn(
                          "font-bold text-foreground",
                          isPopular ? "text-2xl" : "text-xl"
                        )}
                      >
                        {plan.name}
                      </h3>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-7">
                      <div className="flex items-end gap-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          R$
                        </span>
                        <span
                          className={cn(
                            "font-extrabold text-foreground leading-none",
                            isPopular ? "text-5xl" : "text-4xl"
                          )}
                        >
                          {fmtBRL(getPrice(plan))}
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">
                          /mês
                        </span>
                      </div>
                      {annualSavings && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Cobrado anualmente •{" "}
                          <span className="text-emerald-500 font-semibold">
                            Economia de R$ {annualSavings}/ano
                          </span>
                        </p>
                      )}
                      {/* Âncora de valor: quanto sai cada rótulo */}
                      {plan.maxLabels !== undefined && getPrice(plan) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {plan.maxLabels < 0
                            ? "Rótulos ilimitados no mês"
                            : plan.maxLabels > 0
                            ? `≈ R$ ${(getPrice(plan) / plan.maxLabels).toFixed(2).replace(".", ",")} por rótulo`
                            : null}
                        </p>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => {
                        track("plano_selecionado", { plano: plan.name, cobranca: billing, preco: getPrice(plan) });
                        setSelectedPlan(plan);
                        setPaymentMethod(null);
                        // Plano grátis pula direto para o cadastro (sem método de pagamento).
                        setStep(getPrice(plan) <= 0 ? "userdata" : "method");
                        setError("");
                      }}
                      className={cn(
                        "w-full font-semibold text-sm transition-all duration-300 cursor-pointer",
                        isPopular
                          ? "gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 py-4 rounded-2xl"
                          : "bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border py-3.5 rounded-xl"
                      )}
                    >
                      {getPrice(plan) <= 0 ? "Começar grátis" : isPopular ? "Quero este plano" : "Assinar agora"}
                    </button>

                    {/* Features */}
                    <ul className={cn("space-y-3", isPopular ? "mt-9" : "mt-7")}>
                      {plan.benefits.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                          <HiOutlineCheck className="w-4 h-4 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Linha de confiança — tira as objeções de última hora */}
          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              "7 dias de garantia: não gostou, devolvemos",
              "Sem fidelidade: cancele quando quiser",
              "PIX, cartão em até 12x ou boleto",
              "Troque de plano a qualquer momento",
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <HiOutlineCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                {item}
              </span>
            ))}
          </motion.div>

          {/* ============ COMPARATIVO ============ */}
          {!plansLoading && plans.length >= 2 && (
            <motion.div
              className="mt-20 max-w-[1000px] mx-auto"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Compare e escolha pelo{" "}
                  <span className="gradient-text">tamanho da sua produção</span>
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Os recursos são os mesmos em todos os planos. O que muda é
                  quantos rótulos você faz por mês e quanto de IA tem à disposição.
                </p>
              </div>

              <div className="neo-card rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="text-left font-semibold text-muted-foreground px-5 py-4 w-[40%]">
                          O que você recebe
                        </th>
                        {plans.map((plan, i) => {
                          const popular = plans.length >= 2 && i === Math.floor((plans.length - 1) / 2);
                          return (
                            <th key={plan.id} className={cn("px-4 py-4 text-center", popular && "bg-primary/5")}>
                              <p className="font-bold text-foreground">{plan.name}</p>
                              <p className="text-xs font-normal text-muted-foreground mt-0.5">
                                R$ {fmtBRL(getPrice(plan))}/mês
                              </p>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Linhas de quantidade — vêm dos limites reais de cada plano */}
                      {(
                        [
                          { label: "Rótulos por mês", get: (p: DBPlan) => fmtLimit(p.maxLabels) },
                          { label: "Créditos de IA por mês (layouts e textos)", get: (p: DBPlan) => fmtLimit(p.monthlyAiCredits) },
                          { label: "Imagens geradas por IA por mês", get: (p: DBPlan) => fmtLimit(p.monthlyImageCredits) },
                          { label: "Armazenamento de projetos", get: (p: DBPlan) => fmtStorage(p.storageMb) },
                        ] as { label: string; get: (p: DBPlan) => string }[]
                      ).map((row) => (
                        <tr key={row.label} className="border-b border-border/40">
                          <td className="px-5 py-3.5 text-foreground/90">{row.label}</td>
                          {plans.map((plan, i) => {
                            const popular = plans.length >= 2 && i === Math.floor((plans.length - 1) / 2);
                            const v = row.get(plan);
                            return (
                              <td key={plan.id} className={cn("px-4 py-3.5 text-center font-semibold", popular && "bg-primary/5", v === "Ilimitados" || v === "Ilimitado" ? "text-emerald-600" : "text-foreground")}>
                                {v}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Linhas de recurso — incluídas em todos os planos */}
                      {[
                        "Layout inicial gerado por IA a partir da descrição",
                        "Revisor com 32 regras da ANVISA antes de exportar",
                        "Tabela nutricional automática (Anexo IX, base TACO/USDA)",
                        "Lupa “ALTO EM”, alérgenos e “contém glúten”",
                        "Editor visual com camadas, fontes e modelos prontos",
                        "PDF 300 DPI, CMYK, sangria e marcas de corte",
                        "Rótulos de alimentos e de cosméticos",
                        "Suporte por e-mail",
                      ].map((label) => (
                        <tr key={label} className="border-b border-border/40 last:border-0">
                          <td className="px-5 py-3.5 text-foreground/90">{label}</td>
                          {plans.map((plan, i) => {
                            const popular = plans.length >= 2 && i === Math.floor((plans.length - 1) / 2);
                            return (
                              <td key={plan.id} className={cn("px-4 py-3.5 text-center", popular && "bg-primary/5")}>
                                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 inline-block" />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comparação com o caminho tradicional */}
              <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center">
                {[
                  { k: "Designer freelancer", v: "R$ 2.000 a 3.000", s: "por rótulo, 2 a 4 semanas, sem garantia de norma" },
                  { k: "Lote impresso com erro", v: "Gráfica 2x", s: "reimprimir tudo, mais o atraso do lançamento" },
                  { k: "CanvaLabel", v: `a partir de R$ ${fmtBRL(getPrice(plans[0]))}`, s: "por mês, com design, revisão e PDF inclusos", hi: true },
                ].map((c) => (
                  <div key={c.k} className={cn("rounded-2xl p-5 border", c.hi ? "gradient-primary text-white border-transparent shadow-lg shadow-primary/20" : "neo-card")}>
                    <p className={cn("text-xs font-semibold uppercase tracking-wider", c.hi ? "text-white/80" : "text-muted-foreground")}>{c.k}</p>
                    <p className="mt-2 text-2xl font-extrabold">{c.v}</p>
                    <p className={cn("mt-1 text-xs", c.hi ? "text-white/80" : "text-muted-foreground")}>{c.s}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ============ PAYMENT MODAL ============ */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={step !== "processing" ? resetModal : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
            >
              {/* Header */}
              <div className="gradient-primary p-6 text-white relative shrink-0">
                {step !== "processing" && (
                  <button
                    onClick={resetModal}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                )}
                {step !== "method" && step !== "processing" && step !== "success" && step !== "payment_failed" && (
                  <button
                    onClick={() => {
                      // No fluxo grátis não há etapa de método: voltar reinicia a seleção.
                      if (freeFlow) { resetModal(); return; }
                      setStep(step === "payment" ? "userdata" : "method");
                    }}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                  </button>
                )}

                <h3 className="text-xl font-bold">
                  {step === "success" ? (freeFlow ? "Conta criada!" : "Pagamento confirmado!") : step === "payment_failed" ? "Conta criada" : `Assinar ${selectedPlan.name}`}
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  {step === "method" && "Selecione a forma de pagamento"}
                  {step === "userdata" && (me ? `Assinando como ${me.email}` : freeFlow ? "Crie sua conta gratuita" : "Crie sua conta e escolha como pagar")}
                  {step === "payment_failed" && "O pagamento não saiu agora — mas sua conta está salva"}
                  {step === "processing" && "Processando seu pagamento..."}
                  {step === "payment" && paymentMethod === "pix" && "Escaneie o QR Code ou copie o código"}
                  {step === "payment" && paymentMethod === "boleto" && "Acesse o boleto para pagamento"}
                  {step === "success" && "Bem-vindo ao CanvaLabel!"}
                </p>
                {step !== "success" && (
                  freeFlow ? (
                    <div className="mt-3 flex items-end gap-1">
                      <span className="text-3xl font-extrabold">Grátis</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-end gap-1">
                      {couponInfo && (
                        <span className="text-lg font-semibold line-through text-white/50 mr-1">
                          R$ {chargeFor(selectedPlan).total.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                      <span className="text-3xl font-extrabold">
                        R$ {(couponInfo ? couponInfo.finalAmount : getPrice(selectedPlan)).toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-white/70 text-sm mb-0.5">{couponInfo ? (billing === "annual" ? "/ano" : "/mês") : "/mês"}</span>
                      {couponInfo && <span className="ml-2 mb-0.5 px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 text-[11px] font-semibold">{couponInfo.label}</span>}
                    </div>
                  )
                )}
                {step !== "success" && !freeFlow && (
                  <p className="mt-1 text-[12px] text-white/75">
                    {billing === "annual"
                      ? `Cobrança única de R$ ${fmtBRL(chargeFor(selectedPlan).total)} por 12 meses${couponInfo ? " (antes do cupom)" : ""}. Sem renovação automática.`
                      : "Cobrança de 1 mês. Sem renovação automática — você renova quando quiser."}
                  </p>
                )}

                {/* Step indicators */}
                {step !== "processing" && step !== "success" && step !== "payment_failed" && (
                  <div className="flex items-center gap-2 mt-4">
                    {stepLabels.map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                            i <= stepIndex
                              ? "bg-white text-primary"
                              : "bg-white/20 text-white/60"
                          )}
                        >
                          {i < stepIndex ? (
                            <HiOutlineCheck className="w-3.5 h-3.5" />
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span className={cn(
                          "text-[11px] font-medium",
                          i <= stepIndex ? "text-white" : "text-white/50"
                        )}>
                          {label}
                        </span>
                        {i < stepLabels.length - 1 && (
                          <div className={cn(
                            "w-6 h-[2px] rounded-full",
                            i < stepIndex ? "bg-white" : "bg-white/20"
                          )} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  {/* ---- STEP 1: Payment Method ---- */}
                  {step === "method" && (
                    <motion.div
                      key="method"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3"
                    >
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => { setPaymentMethod(method.id); track("metodo_pagamento", { metodo: method.id ?? undefined, plano: selectedPlan?.name }); }}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                            paymentMethod === method.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 hover:border-primary/30 hover:bg-muted/30"
                          )}
                        >
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                              paymentMethod === method.id
                                ? "gradient-primary text-white shadow-md shadow-primary/20"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <method.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">
                                {method.label}
                              </span>
                              {method.badge && (
                                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", method.badgeColor)}>
                                  {method.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {method.description}
                            </span>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            paymentMethod === method.id ? "border-primary" : "border-border"
                          )}>
                            {paymentMethod === method.id && (
                              <motion.div
                                className="w-2.5 h-2.5 rounded-full gradient-primary"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 15 }}
                              />
                            )}
                          </div>
                        </button>
                      ))}

                      <button
                        disabled={!paymentMethod}
                        onClick={() => setStep("userdata")}
                        className={cn(
                          "w-full py-4 rounded-2xl font-semibold text-sm mt-4 transition-all duration-300",
                          paymentMethod
                            ? "gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        )}
                      >
                        Continuar
                      </button>
                    </motion.div>
                  )}

                  {/* ---- STEP 2: User Data ---- */}
                  {step === "userdata" && (
                    <motion.div
                      key="userdata"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                          {error}
                        </div>
                      )}

                      {me ? (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                          <p className="font-semibold text-foreground">Você já está logada(o) como {me.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {me.planStatus === "pending" ? "Sua conta está criada e aguarda o pagamento. " : ""}
                            A assinatura vai para a conta <b>{me.email}</b>.
                          </p>
                        </div>
                      ) : (
                        <>
                          {googleLogin && (
                            <div>
                              <a
                                href={`/api/auth/google?next=${encodeURIComponent("/planos")}`}
                                onClick={() => track("login_google_click", { local: "cadastro" })}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/70 bg-white text-sm font-semibold hover:bg-muted/40 transition-colors"
                              >
                                <GoogleMark />
                                Continuar com Google
                              </a>
                              <div className="flex items-center gap-3 my-4 text-[11px] text-muted-foreground">
                                <div className="flex-1 h-px bg-border/60" />
                                ou preencha seus dados
                                <div className="flex-1 h-px bg-border/60" />
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground -mt-1">
                            Já tem conta?{" "}
                            <Link href={`/login?next=${encodeURIComponent("/planos")}`} className="text-primary font-semibold hover:underline">
                              Entrar
                            </Link>
                          </p>
                        </>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {!me && (
                          <>
                            <Field label="Nome completo" required error={fieldErr.name} className="col-span-2">
                              <input
                                type="text"
                                autoComplete="name"
                                value={userData.name}
                                onChange={(e) => { setUserData({ ...userData, name: e.target.value }); clearErr("name"); }}
                                className={inputCls(!!fieldErr.name)}
                                placeholder="Como no seu documento"
                              />
                            </Field>
                            <Field label="E-mail" required error={fieldErr.email} className="col-span-2">
                              <input
                                type="email"
                                autoComplete="email"
                                inputMode="email"
                                value={userData.email}
                                onChange={(e) => { setUserData({ ...userData, email: e.target.value }); clearErr("email"); }}
                                className={inputCls(!!fieldErr.email)}
                                placeholder="voce@empresa.com.br"
                              />
                            </Field>
                          </>
                        )}
                        {(!me || me.needsCpf) && (
                          <Field label="CPF ou CNPJ" required={!freeFlow} error={fieldErr.cpfOrCnpj} hint={!me ? "Usado só na emissão do pagamento" : undefined}>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              value={userData.cpfOrCnpj}
                              onChange={(e) => { setUserData({ ...userData, cpfOrCnpj: maskCpfCnpj(e.target.value) }); clearErr("cpfOrCnpj"); }}
                              className={inputCls(!!fieldErr.cpfOrCnpj)}
                              placeholder="000.000.000-00"
                            />
                          </Field>
                        )}
                        <Field label="WhatsApp / telefone" error={fieldErr.phone} className={me && !me.needsCpf ? "col-span-2" : ""}>
                          <input
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            value={userData.phone}
                            onChange={(e) => { setUserData({ ...userData, phone: maskPhone(e.target.value) }); clearErr("phone"); }}
                            className={inputCls(!!fieldErr.phone)}
                            placeholder="(11) 99999-9999"
                          />
                        </Field>
                        {!me && (
                          <>
                            <Field label="Senha" required error={fieldErr.password}>
                              <div className="relative">
                                <input
                                  type={showPw ? "text" : "password"}
                                  autoComplete="new-password"
                                  value={userData.password}
                                  onChange={(e) => { setUserData({ ...userData, password: e.target.value }); clearErr("password"); }}
                                  className={cn(inputCls(!!fieldErr.password), "pr-10")}
                                  placeholder="6+ caracteres, letras e números"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPw((v) => !v)}
                                  aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPw ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                              </div>
                            </Field>
                            <Field label="Confirmar senha" required error={fieldErr.confirmPassword}>
                              <input
                                type={showPw ? "text" : "password"}
                                autoComplete="new-password"
                                value={userData.confirmPassword}
                                onChange={(e) => { setUserData({ ...userData, confirmPassword: e.target.value }); clearErr("confirmPassword"); }}
                                className={inputCls(!!fieldErr.confirmPassword)}
                                placeholder="Repita a senha"
                              />
                            </Field>
                          </>
                        )}
                      </div>

                      {/* Card fields */}
                      {paymentMethod === "card" && (
                        <div className="pt-3 border-t border-border/40 space-y-3">
                          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <HiOutlineCreditCard className="w-4 h-4 text-primary" />
                            Dados do cartão
                          </h4>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Nome no cartão *
                            </label>
                            <input
                              type="text"
                              autoComplete="cc-name"
                              value={cardData.holderName}
                              onChange={(e) => { setCardData({ ...cardData, holderName: e.target.value }); clearErr("holderName"); }}
                              className={inputCls(!!fieldErr.holderName)}
                              placeholder="Como está no cartão"
                            />
                            {fieldErr.holderName && <p className="text-[11px] text-red-500 mt-1">{fieldErr.holderName}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Número do cartão *
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-number"
                              value={cardData.number}
                              onChange={(e) => { setCardData({ ...cardData, number: maskCardNumber(e.target.value) }); clearErr("cardNumber"); }}
                              className={inputCls(!!fieldErr.cardNumber)}
                              placeholder="0000 0000 0000 0000"
                              maxLength={23}
                            />
                            {fieldErr.cardNumber && <p className="text-[11px] text-red-500 mt-1">{fieldErr.cardNumber}</p>}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Mês *</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-exp-month"
                                value={cardData.expiryMonth}
                                onChange={(e) => { setCardData({ ...cardData, expiryMonth: e.target.value.replace(/\D/g, "") }); clearErr("expiryMonth"); }}
                                className={inputCls(!!fieldErr.expiryMonth)}
                                placeholder="MM"
                                maxLength={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ano *</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-exp-year"
                                value={cardData.expiryYear}
                                onChange={(e) => { setCardData({ ...cardData, expiryYear: e.target.value.replace(/\D/g, "") }); clearErr("expiryYear"); }}
                                className={inputCls(!!fieldErr.expiryYear)}
                                placeholder="AAAA"
                                maxLength={4}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">CVV *</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                value={cardData.ccv}
                                onChange={(e) => { setCardData({ ...cardData, ccv: e.target.value.replace(/\D/g, "") }); clearErr("ccv"); }}
                                className={inputCls(!!fieldErr.ccv)}
                                placeholder="000"
                                maxLength={4}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">CEP</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="postal-code"
                                value={cardData.postalCode}
                                onChange={(e) => setCardData({ ...cardData, postalCode: maskCep(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                placeholder="00000-000"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nº endereço</label>
                              <input
                                type="text"
                                value={cardData.addressNumber}
                                onChange={(e) => setCardData({ ...cardData, addressNumber: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cupom de desconto — não se aplica ao plano grátis */}
                      {!freeFlow && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Cupom de desconto</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={coupon}
                            onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponInfo(null); setCouponErr(""); }}
                            className="flex-1 px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            placeholder="Ex.: BEMVINDO10"
                          />
                          <button
                            type="button"
                            onClick={applyCoupon}
                            className="px-4 py-3 rounded-xl border border-border/60 bg-muted/40 text-sm font-semibold hover:bg-muted/70 transition-all"
                          >
                            Aplicar
                          </button>
                        </div>
                        {couponErr && <p className="text-xs text-red-500 mt-1.5">{couponErr}</p>}
                        {couponInfo && <p className="text-xs text-emerald-600 mt-1.5">Cupom {couponInfo.label} aplicado — você economiza R$ {couponInfo.discount.toFixed(2).replace(".", ",")}</p>}
                      </div>
                      )}

                      {!me && (
                        <label className={cn("flex items-start gap-2.5 text-xs leading-relaxed cursor-pointer rounded-xl p-2 -m-2", fieldErr.acceptTerms && "bg-red-50")}>
                          <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => { setAcceptTerms(e.target.checked); clearErr("acceptTerms"); }}
                            className="mt-0.5 w-4 h-4 rounded border-border accent-[var(--color-primary)]"
                          />
                          <span className="text-muted-foreground">
                            Li e aceito os{" "}
                            <Link href="/termos" target="_blank" className="text-primary font-semibold hover:underline">Termos de Uso</Link>{" "}
                            e a{" "}
                            <Link href="/privacidade" target="_blank" className="text-primary font-semibold hover:underline">Política de Privacidade</Link>
                            . Seus dados são usados só para a sua conta e o pagamento.
                          </span>
                        </label>
                      )}
                      {fieldErr.acceptTerms && <p className="text-[11px] text-red-500 -mt-2">{fieldErr.acceptTerms}</p>}

                      <button
                        onClick={handleSubmitUserData}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl font-semibold text-sm gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer transition-all duration-300 disabled:opacity-60"
                      >
                        {freeFlow
                          ? "Criar conta grátis"
                          : paymentMethod === "pix"
                          ? `${me ? "Gerar" : "Criar conta e gerar"} PIX de R$ ${fmtBRL(couponInfo ? couponInfo.finalAmount : chargeFor(selectedPlan).total)}`
                          : paymentMethod === "card"
                          ? `Pagar R$ ${fmtBRL(couponInfo ? couponInfo.finalAmount : chargeFor(selectedPlan).total)} no cartão`
                          : `${me ? "Gerar" : "Criar conta e gerar"} boleto`}
                      </button>

                      <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                        <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                        {freeFlow
                          ? "Seus dados estão protegidos. Nenhuma cobrança será feita."
                          : "Pagamento processado pelo Asaas. Sua conta fica salva mesmo se você pagar depois."}
                      </p>
                    </motion.div>
                  )}

                  {/* ---- STEP: Processing ---- */}
                  {step === "processing" && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="mt-6 text-sm font-medium text-muted-foreground">
                        Processando seu pagamento...
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/60">
                        Isso pode levar alguns segundos
                      </p>
                    </motion.div>
                  )}

                  {/* ---- STEP 3: Payment (PIX / Boleto) ---- */}
                  {step === "payment" && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* PIX */}
                      {paymentMethod === "pix" && checkoutResult?.pix && (
                        <div className="flex flex-col items-center">
                          <div className="bg-white border-2 border-border/40 rounded-2xl p-4 shadow-sm">
                            <img
                              src={`data:image/png;base64,${checkoutResult.pix.qrCodeImage}`}
                              alt="QR Code PIX"
                              className="w-52 h-52"
                            />
                          </div>

                          <p className="mt-4 text-sm font-medium text-foreground">
                            Escaneie com o app do banco
                          </p>

                          <div className="mt-3 w-full">
                            <div className="flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border/40">
                              <code className="flex-1 text-xs text-muted-foreground break-all line-clamp-2">
                                {checkoutResult.pix.qrCodePayload}
                              </code>
                              <button
                                onClick={copyPixCode}
                                className={cn(
                                  "shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                                  pixCopied
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                )}
                              >
                                {pixCopied ? (
                                  <span className="flex items-center gap-1">
                                    <HiOutlineCheck className="w-3.5 h-3.5" /> Copiado!
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <HiOutlineClipboard className="w-3.5 h-3.5" /> Copiar
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            Aguardando confirmação do pagamento (o PIX vale por 24h)...
                          </div>
                        </div>
                      )}
                      {paymentMethod === "pix" && !checkoutResult?.pix && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
                          Não conseguimos exibir o QR Code agora. Abra <b>Meu plano</b> no painel para pagar — sua conta já está criada.
                        </div>
                      )}

                      {/* Boleto */}
                      {paymentMethod === "boleto" && checkoutResult?.boleto && (
                        <div className="flex flex-col items-center py-4">
                          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                            <HiOutlineDocumentText className="w-10 h-10 text-white" />
                          </div>

                          <h4 className="text-lg font-bold text-foreground">
                            Boleto gerado!
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground text-center">
                            Acesse o link abaixo para visualizar e pagar seu boleto.
                            A compensação leva de 1 a 3 dias úteis.
                          </p>

                          {checkoutResult.boleto.invoiceUrl && (
                            <a
                              href={checkoutResult.boleto.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 w-full py-4 rounded-2xl font-semibold text-sm gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                              Abrir Boleto
                            </a>
                          )}

                          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            Aguardando compensação do boleto (1 a 3 dias úteis)...
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-border/40 text-center">
                        <p className="text-xs text-emerald-700 font-medium flex items-center justify-center gap-1">
                          <HiOutlineCheckCircle className="w-4 h-4" /> Sua conta já está criada e salva.
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Prefere pagar depois? O QR Code fica disponível em <b>Meu plano</b>.
                        </p>
                        <Link
                          href={destinoPosCadastro("/dashboard")}
                          className="inline-flex mt-2 text-sm font-semibold text-primary hover:underline"
                        >
                          Entrar no painel agora →
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {/* ---- STEP: conta criada, pagamento falhou ---- */}
                  {step === "payment_failed" && (
                    <motion.div
                      key="payment_failed"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex flex-col items-center text-center py-2">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                          <HiOutlineCheckCircle className="w-9 h-9 text-emerald-500" />
                        </div>
                        <h4 className="mt-4 text-lg font-bold text-foreground">Conta criada com sucesso</h4>
                        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                          Você já pode entrar no painel. Só não conseguimos gerar o pagamento agora:
                        </p>
                      </div>
                      <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 flex gap-2">
                        <HiOutlineExclamationTriangle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                      </div>
                      <button
                        onClick={() => router.push("/dashboard/meu-plano")}
                        className="w-full py-4 rounded-2xl font-semibold text-sm gradient-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                      >
                        Ir para o painel e pagar depois
                      </button>
                      <button
                        onClick={() => { setMe({ id: "", name: userData.name, email: normalizeEmail(userData.email), needsCpf: false, planName: selectedPlan.name, planStatus: "pending" }); setError(""); setStep("method"); }}
                        className="w-full py-3 rounded-2xl font-semibold text-sm border border-border/70 hover:bg-muted/40 transition-colors"
                      >
                        Tentar outra forma de pagamento
                      </button>
                    </motion.div>
                  )}

                  {/* ---- STEP: Success ---- */}
                  {step === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, delay: 0.2 }}
                        className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center"
                      >
                        <HiOutlineCheckCircle className="w-14 h-14 text-emerald-500" />
                      </motion.div>

                      <h4 className="mt-5 text-xl font-bold text-foreground">
                        {freeFlow ? "Conta criada!" : "Pagamento confirmado!"}
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground text-center">
                        {freeFlow ? "Sua conta no plano" : "Sua assinatura do plano"} <strong>{selectedPlan.name}</strong> {freeFlow ? "está pronta" : "foi ativada com sucesso"}. Redirecionando para seu painel...
                      </p>

                      <div className="mt-6 w-full">
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full gradient-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "linear" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Planos;
