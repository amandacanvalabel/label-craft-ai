"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineCheck,
  HiOutlineStar,
  HiOutlineXMark,
  HiOutlineCreditCard,
  HiOutlineQrCode,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

type BillingPeriod = "monthly" | "annual";
type PaymentMethod = "pix" | "card" | "boleto" | null;

interface PlanData {
  name: string;
  description: string;
  monthly: number;
  annual: number;
  popular: boolean;
  features: string[];
}

const plans: PlanData[] = [
  {
    name: "Starter",
    description: "Para quem está começando",
    monthly: 49.9,
    annual: 39.9,
    popular: false,
    features: [
      "5 rótulos por mês",
      "Templates básicos",
      "Exportação em PDF",
      "Validação ANVISA básica",
      "Suporte por email",
    ],
  },
  {
    name: "Profissional",
    description: "Para pequenas empresas",
    monthly: 99.9,
    annual: 79.9,
    popular: true,
    features: [
      "Rótulos ilimitados",
      "Todos os templates",
      "Exportação HD (300 DPI)",
      "Validação ANVISA completa",
      "Geração com IA",
      "Editor avançado",
      "Suporte prioritário",
    ],
  },
  {
    name: "Enterprise",
    description: "Para indústrias e grandes volumes",
    monthly: 249.9,
    annual: 199.9,
    popular: false,
    features: [
      "Tudo do Profissional",
      "API de integração",
      "Modelos de IA exclusivos",
      "Multi-usuários",
      "Gerente de conta dedicado",
      "SLA garantido",
      "White label",
    ],
  },
];

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

const Planos = () => {
  const [billing, setBilling] = useState<BillingPeriod>("annual");
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);

  const getPrice = (plan: PlanData) =>
    billing === "annual" ? plan.annual : plan.monthly;

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
                <span className="absolute -top-3 -right-3 text-[10px] font-bold text-white bg-emerald-500 rounded-full px-2 py-0.5">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-5 items-center max-w-[960px] mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(
                  "relative transition-all duration-300",
                  plan.popular
                    ? "rounded-[2rem] p-9 neo-card shadow-2xl ring-2 ring-primary/20 z-10 md:scale-105 md:-my-4"
                    : "rounded-[1.5rem] p-7 neo-card neo-card-hover"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 gradient-primary text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg shadow-primary/30">
                      <HiOutlineStar className="w-3.5 h-3.5" />
                      Mais popular
                    </span>
                  </div>
                )}

                {/* Glow for popular */}
                {plan.popular && (
                  <div className="absolute -inset-1 -z-10 gradient-primary opacity-[0.06] blur-2xl rounded-[2rem]" />
                )}

                <div className="mb-5">
                  <h3
                    className={cn(
                      "font-bold text-foreground",
                      plan.popular ? "text-2xl" : "text-xl"
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
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
                        plan.popular ? "text-5xl" : "text-4xl"
                      )}
                    >
                      {getPrice(plan).toFixed(0)}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">
                      /mês
                    </span>
                  </div>
                  {billing === "annual" && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Cobrado anualmente •{" "}
                      <span className="text-emerald-500 font-semibold">
                        Economia de R${" "}
                        {((plan.monthly - plan.annual) * 12).toFixed(0)}/ano
                      </span>
                    </p>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setPaymentMethod(null);
                  }}
                  className={cn(
                    "w-full font-semibold text-sm transition-all duration-300 cursor-pointer",
                    plan.popular
                      ? "gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 py-4 rounded-2xl"
                      : "bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border py-3.5 rounded-xl"
                  )}
                >
                  Assinar agora
                </button>

                {/* Features */}
                <ul className={cn("space-y-3", plan.popular ? "mt-9" : "mt-7")}>
                  {plan.features.map((feature) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedPlan(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
            >
              {/* Header */}
              <div className="gradient-primary p-6 text-white relative">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold">Assinar {selectedPlan.name}</h3>
                <p className="text-white/80 text-sm mt-1">
                  Selecione a forma de pagamento
                </p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-3xl font-extrabold">
                    R$ {getPrice(selectedPlan).toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-white/70 text-sm mb-0.5">/mês</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="p-6 space-y-3">
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
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              method.badgeColor
                            )}
                          >
                            {method.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {method.description}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        paymentMethod === method.id
                          ? "border-primary"
                          : "border-border"
                      )}
                    >
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

                {/* Confirm Button */}
                <button
                  disabled={!paymentMethod}
                  className={cn(
                    "w-full py-4 rounded-2xl font-semibold text-sm mt-4 transition-all duration-300",
                    paymentMethod
                      ? "gradient-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  {paymentMethod
                    ? `Pagar com ${
                        paymentMethod === "pix"
                          ? "PIX"
                          : paymentMethod === "card"
                          ? "Cartão"
                          : "Boleto"
                      }`
                    : "Selecione um método"}
                </button>

                <p className="text-center text-[11px] text-muted-foreground mt-2">
                  Pagamento processado de forma segura via Asaas. Cancele quando
                  quiser.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Planos;
