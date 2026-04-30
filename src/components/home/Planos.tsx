"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "annual";
type PaymentMethod = "pix" | "card" | "boleto" | null;
type ModalStep = "method" | "userdata" | "processing" | "payment" | "success";

interface DBPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  promotionalPrice: number | null;
  type: string;
  benefits: string[];
}

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
    description: "Até 12x sem juros",
    icon: HiOutlineCreditCard,
    badge: null,
    badgeColor: "",
  },
  {
    id: "boleto" as PaymentMethod,
    label: "Boleto Bancário",
    description: "Compensação em 1-3 dias",
    icon: HiOutlineDocumentText,
    badge: null,
    badgeColor: "",
  },
];

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
  }, []);

  const hasDiscount = plans.some(
    (p) => p.promotionalPrice !== null && p.promotionalPrice < p.price
  );

  const getPrice = (plan: DBPlan) =>
    billing === "annual" && plan.promotionalPrice !== null
      ? plan.promotionalPrice
      : plan.price;

  const resetModal = useCallback(() => {
    setSelectedPlan(null);
    setPaymentMethod(null);
    setStep("method");
    setError("");
    setLoading(false);
    setCheckoutResult(null);
    setPixCopied(false);
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
            setStep("success");
            setTimeout(() => router.push("/dashboard"), 2500);
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

    if (!userData.name || !userData.email || !userData.cpfOrCnpj || !userData.password) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }
    if (userData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (userData.password !== userData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardData.holderName || !cardData.number || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
        setError("Preencha todos os dados do cartão");
        return;
      }
    }

    setStep("processing");
    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        name: userData.name,
        email: userData.email,
        cpfOrCnpj: userData.cpfOrCnpj,
        phone: userData.phone,
        password: userData.password,
        planName: selectedPlan!.name,
        billingPeriod: billing,
        paymentMethod,
      };

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

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar pagamento");
      }

      setCheckoutResult(data);

      // Cartão aprovado direto
      if (data.authenticated && data.redirectTo) {
        setStep("success");
        setTimeout(() => router.push(data.redirectTo), 2500);
      } else {
        setStep("payment");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setStep("userdata");
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (checkoutResult?.pix?.qrCodePayload) {
      await navigator.clipboard.writeText(checkoutResult.pix.qrCodePayload);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  // Step indicators
  const stepLabels = ["Método", "Dados", "Pagamento"];
  const stepIndex = step === "method" ? 0 : step === "userdata" ? 1 : 2;

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
              Preços
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Planos que cabem no{" "}
              <span className="gradient-text">seu bolso</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio. Todos incluem suporte e
              atualizações.
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
                          {getPrice(plan).toFixed(0)}
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
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setPaymentMethod(null);
                        setStep("method");
                        setError("");
                      }}
                      className={cn(
                        "w-full font-semibold text-sm transition-all duration-300 cursor-pointer",
                        isPopular
                          ? "gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 py-4 rounded-2xl"
                          : "bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border py-3.5 rounded-xl"
                      )}
                    >
                      Assinar agora
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
                {step !== "processing" && step !== "success" && (
                  <button
                    onClick={resetModal}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <HiOutlineXMark className="w-5 h-5" />
                  </button>
                )}
                {step !== "method" && step !== "processing" && step !== "success" && (
                  <button
                    onClick={() => setStep(step === "payment" ? "userdata" : "method")}
                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                  </button>
                )}

                <h3 className="text-xl font-bold">
                  {step === "success" ? "Pagamento confirmado!" : `Assinar ${selectedPlan.name}`}
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  {step === "method" && "Selecione a forma de pagamento"}
                  {step === "userdata" && "Preencha seus dados para continuar"}
                  {step === "processing" && "Processando seu pagamento..."}
                  {step === "payment" && paymentMethod === "pix" && "Escaneie o QR Code ou copie o código"}
                  {step === "payment" && paymentMethod === "boleto" && "Acesse o boleto para pagamento"}
                  {step === "success" && "Bem-vindo ao CanvaLabel!"}
                </p>
                {step !== "success" && (
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-3xl font-extrabold">
                      R$ {getPrice(selectedPlan).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-white/70 text-sm mb-0.5">/mês</span>
                  </div>
                )}

                {/* Step indicators */}
                {step !== "processing" && step !== "success" && (
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
                          onClick={() => setPaymentMethod(method.id)}
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

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Nome completo *
                          </label>
                          <input
                            type="text"
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            placeholder="Seu nome completo"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            E-mail *
                          </label>
                          <input
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            placeholder="seu@email.com"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            CPF/CNPJ *
                          </label>
                          <input
                            type="text"
                            value={userData.cpfOrCnpj}
                            onChange={(e) => setUserData({ ...userData, cpfOrCnpj: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            placeholder="000.000.000-00"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Telefone
                          </label>
                          <input
                            type="text"
                            value={userData.phone}
                            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            placeholder="(11) 99999-9999"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Senha *
                          </label>
                          <input
                            type="password"
                            value={userData.password}
                            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            placeholder="Mínimo 6 caracteres"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Confirmar senha *
                          </label>
                          <input
                            type="password"
                            value={userData.confirmPassword}
                            onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                            placeholder="Repita a senha"
                          />
                        </div>
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
                              value={cardData.holderName}
                              onChange={(e) => setCardData({ ...cardData, holderName: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              placeholder="Como está no cartão"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">
                              Número do cartão *
                            </label>
                            <input
                              type="text"
                              value={cardData.number}
                              onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                              placeholder="0000 0000 0000 0000"
                              maxLength={19}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Mês *</label>
                              <input
                                type="text"
                                value={cardData.expiryMonth}
                                onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                placeholder="MM"
                                maxLength={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ano *</label>
                              <input
                                type="text"
                                value={cardData.expiryYear}
                                onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                placeholder="AAAA"
                                maxLength={4}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">CVV *</label>
                              <input
                                type="text"
                                value={cardData.ccv}
                                onChange={(e) => setCardData({ ...cardData, ccv: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
                                value={cardData.postalCode}
                                onChange={(e) => setCardData({ ...cardData, postalCode: e.target.value })}
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

                      <button
                        onClick={handleSubmitUserData}
                        className="w-full py-4 rounded-2xl font-semibold text-sm gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
                      >
                        {paymentMethod === "pix"
                          ? "Gerar QR Code PIX"
                          : paymentMethod === "card"
                          ? "Pagar agora"
                          : "Gerar Boleto"}
                      </button>

                      <p className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                        <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                        Seus dados estão protegidos e o pagamento é seguro via Asaas.
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
                            Aguardando confirmação do pagamento...
                          </div>
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
                            Aguardando confirmação do pagamento...
                          </div>
                        </div>
                      )}
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
                        Pagamento confirmado!
                      </h4>
                      <p className="mt-2 text-sm text-muted-foreground text-center">
                        Sua assinatura do plano <strong>{selectedPlan.name}</strong> foi
                        ativada com sucesso. Redirecionando para seu painel...
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
