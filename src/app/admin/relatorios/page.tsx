"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineEye,
  HiOutlineCursorArrowRays,
  HiOutlineUsers,
  HiOutlineBanknotes,
  HiOutlineArrowPath,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { motion } from "framer-motion";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import ChartCard from "@/components/admin/ChartCard";
import AreaChart from "@/components/admin/AreaChart";
import MiniBarChart from "@/components/admin/MiniBarChart";
import DonutChart from "@/components/admin/DonutChart";
import { Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

type Period = "7d" | "30d" | "90d" | "12m";
type ChartTab = "views" | "subscribers" | "revenue";

interface TimelinePoint { label: string; views?: number; clicks?: number; count?: number; amount?: number }
interface SalesByPlan  { name: string; count: number; revenue: number }
interface SalesByMethod { method: string; color: string; count: number; amount: number }

interface ReportData {
  stats: {
    viewsThisMonth: number;
    clicksThisMonth: number;
    newSubscribersThisMonth: number;
    conversionPct: number;
    revenueThisMonth: number;
  };
  trafficTimeline: TimelinePoint[];
  subscribersTimeline: TimelinePoint[];
  revenueTimeline: TimelinePoint[];
  salesByPlan: SalesByPlan[];
  salesByMethod: SalesByMethod[];
}

function fmtCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

const PLAN_BAR_COLORS = ["bg-blue-500", "bg-primary", "bg-violet-600", "bg-amber-500", "bg-emerald-500"];

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl bg-muted/50 dark:bg-white/5 animate-pulse", className)} />
);

export default function RelatoriosPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");
  const [chartTab, setChartTab] = useState<ChartTab>("views");

  const load = (p: Period) => {
    setLoading(true);
    fetch(`/api/admin/reports?period=${p}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(period); }, [period]);

  const s = data?.stats;

  const statCards = [
    {
      label: "Visualizações (Mês)",
      value: loading ? "…" : (s?.viewsThisMonth ?? 0).toLocaleString("pt-BR"),
      icon: HiOutlineEye,
      iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
      sparkline: data?.trafficTimeline.slice(-12).map((t) => t.views ?? 0),
    },
    {
      label: "Cliques (Mês)",
      value: loading ? "…" : (s?.clicksThisMonth ?? 0).toLocaleString("pt-BR"),
      icon: HiOutlineCursorArrowRays,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15",
      sparkline: data?.trafficTimeline.slice(-12).map((t) => t.clicks ?? 0),
    },
    {
      label: "Novos Assinantes (Mês)",
      value: loading ? "…" : String(s?.newSubscribersThisMonth ?? 0),
      icon: HiOutlineUsers,
      iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15",
      sparkline: data?.subscribersTimeline.slice(-12).map((t) => t.count ?? 0),
    },
    {
      label: "Receita (Mês)",
      value: loading ? "…" : fmtCurrency(s?.revenueThisMonth ?? 0),
      icon: HiOutlineBanknotes,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15",
      sparkline: data?.revenueTimeline.slice(-12).map((t) => t.amount ?? 0),
    },
  ];

  // Active area chart data
  const activeTimeline = chartTab === "views"
    ? { data: data?.trafficTimeline.map((t) => t.views ?? 0) ?? [], labels: data?.trafficTimeline.map((t) => t.label) ?? [] }
    : chartTab === "subscribers"
    ? { data: data?.subscribersTimeline.map((t) => t.count ?? 0) ?? [], labels: data?.subscribersTimeline.map((t) => t.label) ?? [] }
    : { data: data?.revenueTimeline.map((t) => t.amount ?? 0) ?? [], labels: data?.revenueTimeline.map((t) => t.label) ?? [] };

  const chartTabColor = chartTab === "views" ? "#2563eb" : chartTab === "subscribers" ? "#8b5cf6" : "#f59e0b";
  const chartTabGradient = chartTab === "views"
    ? { from: "rgba(37,99,235,0.25)", to: "rgba(37,99,235,0)" }
    : chartTab === "subscribers"
    ? { from: "rgba(139,92,246,0.25)", to: "rgba(139,92,246,0)" }
    : { from: "rgba(245,158,11,0.25)", to: "rgba(245,158,11,0)" };

  // Donut for methods
  const methodDonut = (data?.salesByMethod ?? []).map((m) => ({
    label: m.method,
    value: m.count,
    color: m.color,
  }));

  const totalMethodSales = methodDonut.reduce((a, m) => a + m.value, 0);

  // Mini bar for plans
  const planBars = (data?.salesByPlan ?? []).map((p, i) => ({
    label: p.name,
    value: p.count,
    color: PLAN_BAR_COLORS[i % PLAN_BAR_COLORS.length],
  }));

  const totalPlanSales = planBars.reduce((a, b) => a + b.value, 0);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Análises de tráfego, conversões e performance"
        actions={
          <Button variant="secondary" size="sm" onClick={() => load(period)}>
            <HiOutlineArrowPath className={cn("w-4 h-4", loading && "animate-spin")} />
            Atualizar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, i) => <StatCard key={stat.label} {...stat} delay={i * 0.08} />)}
      </div>

      {/* Main chart */}
      <ChartCard
        title="Evolução no Período"
        subtitle="Dados reais acumulados por dia/semana/mês"
        className="mt-6"
        delay={0.2}
        actions={
          <div className="flex items-center gap-2">
            {/* Tab selector */}
            <div className="hidden sm:flex items-center gap-1 bg-muted/50 dark:bg-white/5 rounded-xl p-1">
              {([
                { key: "views",       label: "Visualizações" },
                { key: "subscribers", label: "Assinantes"     },
                { key: "revenue",     label: "Receita"        },
              ] as { key: ChartTab; label: string }[]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setChartTab(t.key)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                    chartTab === t.key
                      ? "bg-white dark:bg-white/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {/* Period selector */}
            <div className="flex items-center gap-1 bg-muted/50 dark:bg-white/5 rounded-xl p-1">
              {(["7d", "30d", "90d", "12m"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                    period === p
                      ? "bg-white dark:bg-white/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {loading ? (
          <Skeleton className="h-[220px]" />
        ) : activeTimeline.data.every((v) => v === 0) ? (
          <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <HiOutlineSparkles className="w-8 h-8 opacity-30" />
            <p className="text-sm font-medium">Sem dados neste período</p>
            <p className="text-xs opacity-60">As visualizações da home são registradas automaticamente</p>
          </div>
        ) : (
          <AreaChart
            data={activeTimeline.data}
            labels={activeTimeline.labels}
            height={220}
            color={chartTabColor}
            gradientFrom={chartTabGradient.from}
            gradientTo={chartTabGradient.to}
          />
        )}
      </ChartCard>

      {/* Row 2 — Vendas por Plano | Por Método | Conversão */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Vendas por Plano */}
        <ChartCard title="Vendas por Plano" subtitle="Assinaturas confirmadas este mês" delay={0.3}>
          {loading ? (
            <Skeleton className="h-32" />
          ) : planBars.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhuma venda este mês</p>
          ) : (
            <>
              <MiniBarChart data={planBars} height={130} />
              <div className="mt-3 pt-3 border-t border-border/30 dark:border-white/5 text-center">
                <p className="text-2xl font-extrabold text-foreground">{totalPlanSales}</p>
                <p className="text-[10px] text-muted-foreground">novas assinaturas</p>
              </div>
            </>
          )}
        </ChartCard>

        {/* Por Método */}
        <ChartCard title="Método de Pagamento" subtitle="Confirmados este mês" delay={0.35}>
          {loading ? (
            <Skeleton className="h-32" />
          ) : methodDonut.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhum pagamento este mês</p>
          ) : (
            <div className="flex items-center justify-center pt-2">
              <DonutChart
                data={methodDonut}
                centerValue={String(totalMethodSales)}
                centerLabel="vendas"
                size={130}
              />
            </div>
          )}
        </ChartCard>

        {/* Receita por Plano */}
        <ChartCard title="Receita por Plano" subtitle="Total confirmado este mês" delay={0.4}>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (data?.salesByPlan ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhuma receita este mês</p>
          ) : (
            <div className="space-y-3 pt-1">
              {data!.salesByPlan.map((p, i) => {
                const maxRev = Math.max(...data!.salesByPlan.map((x) => x.revenue));
                return (
                  <div key={p.name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-foreground">{p.name}</span>
                      <span className="font-bold text-foreground">{fmtCurrency(p.revenue)}</span>
                    </div>
                    <div className="h-2 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", PLAN_BAR_COLORS[i % PLAN_BAR_COLORS.length])}
                        initial={{ width: 0 }}
                        animate={{ width: `${maxRev > 0 ? (p.revenue / maxRev) * 100 : 0}%` }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-border/30 dark:border-white/5 flex justify-between text-xs">
                <span className="text-muted-foreground">Total</span>
                <span className="font-extrabold text-foreground">
                  {fmtCurrency(data!.salesByPlan.reduce((a, p) => a + p.revenue, 0))}
                </span>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 3 — Fontes de tráfego e dispositivos (em breve) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {[
          { title: "Fontes de Tráfego", subtitle: "De onde vêm os visitantes" },
          { title: "Dispositivos & Bounce Rate", subtitle: "Desktop, mobile e tempo na página" },
        ].map((card, i) => (
          <ChartCard key={card.title} title={card.title} subtitle={card.subtitle} delay={0.45 + i * 0.05}>
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <HiOutlineSparkles className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">Em breve</p>
              <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
                Requer integração com provedor de analytics (ex: Plausible, Umami ou GA4).
              </p>
            </div>
          </ChartCard>
        ))}
      </div>
    </div>
  );
}
