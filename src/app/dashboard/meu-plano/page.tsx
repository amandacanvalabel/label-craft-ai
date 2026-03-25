"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineRectangleGroup,
  HiOutlineCalendarDays,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineArrowUpCircle,
  HiOutlineShieldCheck,
  HiOutlineBolt,
  HiOutlineCloudArrowUp,
  HiOutlineDocumentText,
  HiOutlineReceiptPercent,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

const currentPlan = {
  name: "Profissional",
  price: "R$ 79,90",
  period: "mês",
  activatedAt: "15 Jan 2026",
  expiresAt: "15 Jan 2027",
  method: "PIX",
  status: "active" as const,
  nextBilling: "15 Abr 2026",
};

const planFeatures = [
  { label: "Rótulos por mês", value: "100", icon: HiOutlineDocumentText },
  { label: "Gerações de IA", value: "200", icon: HiOutlineSparkles },
  { label: "Armazenamento", value: "5 GB", icon: HiOutlineCloudArrowUp },
  { label: "Modelos de IA", value: "3 ativos", icon: HiOutlineBolt },
  { label: "Suporte", value: "Prioritário", icon: HiOutlineShieldCheck },
  { label: "Exportar PDF/PNG", value: "Ilimitado", icon: HiOutlineReceiptPercent },
];

const usageLimits = [
  { label: "Rótulos criados", used: 24, total: 100, color: "bg-blue-500" },
  { label: "Gerações de IA", used: 48, total: 200, color: "bg-violet-500" },
  { label: "Armazenamento", used: 1.2, total: 5, color: "bg-emerald-500", unit: "GB" },
];

const plans = [
  {
    name: "Starter",
    price: "R$ 39,90",
    desc: "Para quem está começando",
    features: ["30 rótulos/mês", "50 gerações IA", "1 GB armazenamento", "1 modelo IA", "Suporte email"],
    current: false,
    popular: false,
    color: "border-border/40 dark:border-white/8",
  },
  {
    name: "Profissional",
    price: "R$ 79,90",
    desc: "Para negócios em crescimento",
    features: ["100 rótulos/mês", "200 gerações IA", "5 GB armazenamento", "3 modelos IA", "Suporte prioritário", "Exportar PDF/PNG"],
    current: true,
    popular: true,
    color: "border-primary/50 ring-2 ring-primary/20",
  },
  {
    name: "Enterprise",
    price: "R$ 199,90",
    desc: "Para grandes operações",
    features: ["Ilimitado rótulos", "Ilimitado gerações IA", "50 GB armazenamento", "Todos modelos IA", "Suporte 24/7 dedicado", "API personalizada", "White label"],
    current: false,
    popular: false,
    color: "border-border/40 dark:border-white/8",
  },
];

const billingHistory = [
  { id: "PAY-012", date: "15 Mar 2026", amount: "R$ 79,90", method: "PIX", status: "paid" },
  { id: "PAY-011", date: "15 Fev 2026", amount: "R$ 79,90", method: "PIX", status: "paid" },
  { id: "PAY-010", date: "15 Jan 2026", amount: "R$ 79,90", method: "PIX", status: "paid" },
  { id: "PAY-009", date: "15 Dez 2025", amount: "R$ 39,90", method: "PIX", status: "paid" },
  { id: "PAY-008", date: "15 Nov 2025", amount: "R$ 39,90", method: "PIX", status: "paid" },
];

export default function MeuPlanoPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "billing">("overview");

  return (
    <div>
      <PageHeader
        title="Meu Plano"
        subtitle="Gerencie sua assinatura e pagamentos"
      />

      {/* Tabs */}
      <motion.div
        className="flex items-center gap-1 bg-white dark:bg-[#12121a] border border-border/50 dark:border-white/10 rounded-xl p-1 mb-6 w-fit"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {([
          { key: "overview", label: "Visão Geral" },
          { key: "plans", label: "Planos" },
          { key: "billing", label: "Histórico" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
              activeTab === tab.key
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Current Plan Card */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-violet-600 rounded-2xl p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="success" dot className="!bg-white/20 !text-white">Ativo</Badge>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">Plano {currentPlan.name}</h2>
                  <p className="text-white/60 text-sm mt-1">
                    <span className="text-white font-bold text-2xl">{currentPlan.price}</span>
                    <span className="text-white/50">/{currentPlan.period}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="!bg-white/15 !border-white/20 !text-white hover:!bg-white/25">
                    <HiOutlineArrowPath className="w-4 h-4" />
                    Alterar Plano
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Ativação</p>
                  <p className="text-sm font-bold text-white mt-0.5">{currentPlan.activatedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Expiração</p>
                  <p className="text-sm font-bold text-white mt-0.5">{currentPlan.expiresAt}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Método</p>
                  <p className="text-sm font-bold text-white mt-0.5">{currentPlan.method}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Próx. Cobrança</p>
                  <p className="text-sm font-bold text-white mt-0.5">{currentPlan.nextBilling}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage */}
            <motion.div
              className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-sm font-bold text-foreground mb-5">Uso do Plano</h3>
              <div className="space-y-5">
                {usageLimits.map((item) => {
                  const pct = Math.round((item.used / item.total) * 100);
                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                        <span className="text-xs font-bold text-foreground">
                          {item.unit ? `${item.used} ${item.unit}` : item.used} <span className="text-muted-foreground font-normal">/ {item.unit ? `${item.total} ${item.unit}` : item.total}</span>
                        </span>
                      </div>
                      <div className="h-2.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", item.color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{pct}% utilizado</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <h3 className="text-sm font-bold text-foreground mb-5">Recursos do Plano</h3>
              <div className="grid grid-cols-2 gap-3">
                {planFeatures.map((feat) => (
                  <div key={feat.label} className="flex items-center gap-3 p-3 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <feat.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{feat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{feat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={cn(
                "relative bg-white dark:bg-[#12121a] rounded-2xl border shadow-sm p-6 transition-all",
                plan.color,
                plan.current && "shadow-md"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="primary">Seu plano atual</Badge>
                </div>
              )}
              <div className="text-center mb-5 pt-2">
                <h3 className="text-lg font-extrabold text-foreground">{plan.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{plan.desc}</p>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
              </div>
              <div className="space-y-2.5 mb-6">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5">
                    <HiOutlineCheckCircle className={cn("w-4 h-4 shrink-0", plan.current ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs text-foreground">{feat}</span>
                  </div>
                ))}
              </div>
              {plan.current ? (
                <Button variant="secondary" size="md" className="w-full justify-center" disabled>
                  Plano Atual
                </Button>
              ) : (
                <Button variant={plan.name === "Enterprise" ? "primary" : "secondary"} size="md" className="w-full justify-center">
                  <HiOutlineArrowUpCircle className="w-4 h-4" />
                  {plan.name === "Enterprise" ? "Fazer Upgrade" : "Mudar Plano"}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <motion.div
          className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40 dark:border-white/8">
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Método</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((item) => (
                  <tr key={item.id} className="border-b border-border/20 dark:border-white/5 last:border-0 hover:bg-muted/20 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono font-bold text-primary">{item.id}</td>
                    <td className="px-5 py-3.5 text-xs text-foreground">{item.date}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-foreground">{item.amount}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.method}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="success" dot>Pago</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
