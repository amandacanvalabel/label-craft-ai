"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
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
  HiOutlineExclamationCircle,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import { Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

const PLAN_DURATION_DAYS: Record<string, number> = {
  MONTHLY: 30, QUARTERLY: 90, SEMIANNUAL: 180, ANNUAL: 365, LIFETIME: 0,
};

const PLAN_TYPE_LABEL: Record<string, string> = {
  MONTHLY: "mês", QUARTERLY: "trimestre", SEMIANNUAL: "semestre",
  ANNUAL: "ano", LIFETIME: "vitalício",
};

const STATUS_BADGE: Record<string, { variant: "success" | "warning" | "error" | "default"; label: string }> = {
  CONFIRMED: { variant: "success", label: "Pago" },
  PENDING: { variant: "warning", label: "Pendente" },
  CANCELLED: { variant: "error", label: "Cancelado" },
  REFUNDED: { variant: "default", label: "Reembolsado" },
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

interface CurrentPlan {
  id: string; name: string; type: string; price: number;
  promotionalPrice: number | null; benefits: string[];
  activatedAt: string; expiresAt: string | null;
  lastPaymentMethod: string | null;
}

interface AvailablePlan {
  id: string; name: string; type: string; price: number;
  promotionalPrice: number | null; benefits: string[]; description: string | null;
}

interface BillingEntry {
  id: string; date: string; amount: number;
  method: string; status: string; statusLabel: string; invoiceUrl: string | null;
}

interface PlanData {
  currentPlan: CurrentPlan | null;
  usage: { labelsCreated: number };
  billingHistory: BillingEntry[];
  availablePlans: AvailablePlan[];
}

const featureIcons = [
  HiOutlineDocumentText, HiOutlineSparkles, HiOutlineCloudArrowUp,
  HiOutlineBolt, HiOutlineShieldCheck, HiOutlineReceiptPercent,
];

// Skeleton card
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl bg-muted/50 dark:bg-white/5 animate-pulse", className)} />
);

export default function MeuPlanoPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "billing">("overview");
  const [data, setData] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscriber/plan")
      .then((r) => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((d) => setData(d))
      .catch(() => setError("Não foi possível carregar os dados do plano."))
      .finally(() => setLoading(false));
  }, []);

  const cp = data?.currentPlan ?? null;

  // Progress calculation
  const now = Date.now();
  const start = cp?.activatedAt ? new Date(cp.activatedAt).getTime() : now;
  const end = cp?.expiresAt ? new Date(cp.expiresAt).getTime() : now;
  const isLifetime = cp?.type === "LIFETIME" || !cp?.expiresAt;
  const totalMs = end - start || 1;
  const usedMs = now - start;
  const planPct = isLifetime ? 100 : Math.min(100, Math.max(0, Math.round((usedMs / totalMs) * 100)));
  const daysLeft = isLifetime ? null : Math.max(0, Math.ceil((end - now) / 86_400_000));
  const planDuration = cp ? (PLAN_DURATION_DAYS[cp.type] ?? 30) : 30;

  return (
    <div>
      <PageHeader title="Meu Plano" subtitle="Gerencie sua assinatura e pagamentos" />

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

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 mb-6">
          <HiOutlineExclamationCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* ── Overview Tab ── */}
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
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32 !bg-white/20" />
                  <Skeleton className="h-10 w-56 !bg-white/20" />
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 !bg-white/20" />)}
                  </div>
                </div>
              ) : cp ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="success" dot className="!bg-white/20 !text-white">Ativo</Badge>
                      </div>
                      <h2 className="text-3xl font-extrabold text-white">Plano {cp.name}</h2>
                      <p className="text-white/60 text-sm mt-1">
                        <span className="text-white font-bold text-2xl">{fmtCurrency(cp.promotionalPrice ?? cp.price)}</span>
                        <span className="text-white/50">/{PLAN_TYPE_LABEL[cp.type] ?? cp.type}</span>
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" className="!bg-white/15 !border-white/20 !text-white hover:!bg-white/25"
                      onClick={() => setActiveTab("plans")}>
                      <HiOutlineArrowPath className="w-4 h-4" />
                      Alterar Plano
                    </Button>
                  </div>

                  {/* Progress bar */}
                  {!isLifetime && (
                    <div className="mt-5 mb-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Ciclo do plano</span>
                        <span className="text-[11px] font-bold text-white">
                          {daysLeft === 0 ? "Expira hoje" : `${daysLeft} dias restantes`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-white/80"
                          initial={{ width: 0 }}
                          animate={{ width: `${planPct}%` }}
                          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-white/50">{planPct}% utilizado</span>
                        <span className="text-[9px] text-white/50">{planDuration} dias total</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Ativação</p>
                      <p className="text-sm font-bold text-white mt-0.5">{fmtDate(cp.activatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Expiração</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {isLifetime ? "∞ Vitalício" : cp.expiresAt ? fmtDate(cp.expiresAt) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Método</p>
                      <p className="text-sm font-bold text-white mt-0.5">{cp.lastPaymentMethod ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Próx. Renovação</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {isLifetime ? "—" : cp.expiresAt ? fmtDate(cp.expiresAt) : "—"}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white font-bold text-lg">Nenhum plano ativo</p>
                  <p className="text-white/60 text-sm mt-1">Escolha um plano para começar</p>
                  <Link href="/#planos">
                    <Button variant="secondary" size="sm" className="!bg-white/15 !border-white/20 !text-white hover:!bg-white/25 mt-4">
                      <HiOutlineArrowUpCircle className="w-4 h-4" />
                      Ver Planos
                    </Button>
                  </Link>
                </div>
              )}
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
              {loading ? (
                <div className="space-y-5">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Labels created — real data */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">Rótulos criados</span>
                      <span className="text-xs font-bold text-foreground">
                        {data?.usage.labelsCreated ?? 0}
                        <span className="text-muted-foreground font-normal"> salvos</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((data?.usage.labelsCreated ?? 0) / 100) * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{data?.usage.labelsCreated ?? 0} modelo(s) salvo(s)</p>
                  </div>

                  {/* Placeholder metrics */}
                  {[
                    { label: "Gerações de IA", note: "em breve", color: "bg-violet-500" },
                    { label: "Armazenamento", note: "em breve", color: "bg-emerald-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground italic">{item.note}</span>
                      </div>
                      <div className="h-2.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full w-0 rounded-full" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Monitoramento em desenvolvimento</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Plan features / benefits */}
            <motion.div
              className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <h3 className="text-sm font-bold text-foreground mb-5">Recursos do Plano</h3>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : cp?.benefits?.length ? (
                <div className="grid grid-cols-2 gap-3">
                  {cp.benefits.slice(0, 6).map((benefit, i) => {
                    const Icon = featureIcons[i % featureIcons.length];
                    return (
                      <div key={benefit} className="flex items-center gap-3 p-3 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-foreground leading-snug">{benefit}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">Sem plano ativo</p>
                  <p className="text-xs mt-1">Assine um plano para ver os recursos</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Plans Tab ── */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))
          ) : data?.availablePlans.length ? (
            data.availablePlans.map((plan, i) => {
              const isCurrent = plan.id === cp?.id;
              return (
                <motion.div
                  key={plan.id}
                  className={cn(
                    "relative bg-white dark:bg-[#12121a] rounded-2xl border shadow-sm p-6 transition-all",
                    isCurrent
                      ? "border-primary/50 ring-2 ring-primary/20 shadow-md"
                      : "border-border/40 dark:border-white/8"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="primary">Seu plano atual</Badge>
                    </div>
                  )}
                  <div className="text-center mb-5 pt-2">
                    <h3 className="text-lg font-extrabold text-foreground">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{plan.description}</p>
                    )}
                    <div className="mt-3">
                      {plan.promotionalPrice ? (
                        <>
                          <span className="text-sm text-muted-foreground line-through mr-2">{fmtCurrency(plan.price)}</span>
                          <span className="text-3xl font-extrabold text-foreground">{fmtCurrency(plan.promotionalPrice)}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-extrabold text-foreground">{fmtCurrency(plan.price)}</span>
                      )}
                      <span className="text-sm text-muted-foreground">/{PLAN_TYPE_LABEL[plan.type] ?? plan.type}</span>
                    </div>
                  </div>
                  <div className="space-y-2.5 mb-6">
                    {plan.benefits.map((b) => (
                      <div key={b} className="flex items-center gap-2.5">
                        <HiOutlineCheckCircle className={cn("w-4 h-4 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs text-foreground">{b}</span>
                      </div>
                    ))}
                  </div>
                  {isCurrent ? (
                    <Button variant="secondary" size="md" className="w-full justify-center" disabled>
                      Plano Atual
                    </Button>
                  ) : (
                    <Link href="/#planos" className="block">
                      <Button variant="primary" size="md" className="w-full justify-center">
                        <HiOutlineArrowUpCircle className="w-4 h-4" />
                        {cp ? (plan.price > cp.price ? "Fazer Upgrade" : "Mudar Plano") : "Assinar"}
                      </Button>
                    </Link>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-16 text-muted-foreground">
              <HiOutlineExclamationCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Nenhum plano disponível no momento.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Billing Tab ── */}
      {activeTab === "billing" && (
        <motion.div
          className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : data?.billingHistory.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 dark:border-white/8">
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Método</th>
                    <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {data.billingHistory.map((item) => {
                    const badge = STATUS_BADGE[item.status] ?? { variant: "default" as const, label: item.statusLabel };
                    return (
                      <tr key={item.id} className="border-b border-border/20 dark:border-white/5 last:border-0 hover:bg-muted/20 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 text-xs font-mono font-bold text-primary">{item.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-5 py-3.5 text-xs text-foreground">{fmtDate(item.date)}</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-foreground">{fmtCurrency(item.amount)}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{item.method}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={badge.variant} dot>{badge.label}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {item.invoiceUrl && (
                            <a
                              href={item.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                            >
                              Fatura
                              <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <HiOutlineCreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Nenhum pagamento registrado</p>
              <p className="text-xs mt-1">O histórico aparecerá após a primeira cobrança</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
