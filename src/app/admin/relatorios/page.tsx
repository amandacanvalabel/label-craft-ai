"use client";

import { useState } from "react";
import {
  HiOutlineEye,
  HiOutlineCursorArrowRays,
  HiOutlineUsers,
  HiOutlineBanknotes,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineGlobeAlt,
  HiOutlineDevicePhoneMobile,
  HiOutlineComputerDesktop,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import ChartCard from "@/components/admin/ChartCard";
import AreaChart from "@/components/admin/AreaChart";
import MiniBarChart from "@/components/admin/MiniBarChart";
import DonutChart from "@/components/admin/DonutChart";
import { Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const stats = [
  { label: "Visualizações (Mês)", value: "45.280", change: 22, icon: HiOutlineEye, iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15", sparkline: [3200, 3800, 4100, 3900, 4500, 5200, 4800, 5500, 6000, 5800, 6500, 7200] },
  { label: "Cliques (Mês)", value: "12.450", change: 15, icon: HiOutlineCursorArrowRays, iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15", sparkline: [800, 950, 1100, 1050, 1200, 1400, 1350, 1500, 1600, 1550, 1700, 1800] },
  { label: "Novos Assinantes (Mês)", value: "86", change: 12, icon: HiOutlineUsers, iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15", sparkline: [5, 8, 6, 9, 12, 10, 14, 11, 13, 15, 12, 16] },
  { label: "Conversão", value: "0.69%", change: 8, icon: HiOutlineBanknotes, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15", sparkline: [0.4, 0.45, 0.5, 0.48, 0.55, 0.6, 0.58, 0.65, 0.62, 0.68, 0.65, 0.69] },
];

type Period = "7d" | "30d" | "90d" | "12m";

const viewsData: Record<Period, { data: number[]; labels: string[] }> = {
  "7d": { data: [5200, 6100, 5800, 7200, 6500, 4200, 3800], labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] },
  "30d": { data: [1200, 1400, 1100, 1600, 1800, 1500, 2000, 2200, 1900, 2400, 2100, 2600, 2800, 2500, 3000, 2700, 3200, 3400, 3100, 3600, 3300, 3800, 4000, 3700, 4200, 3900, 4500, 4800, 4400, 5000], labels: ["01", "05", "10", "15", "20", "25", "30"] },
  "90d": { data: [28000, 32000, 35000, 30000, 38000, 42000, 40000, 45000, 48000, 44000, 50000, 52000], labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] },
  "12m": { data: [18000, 22000, 28000, 32000, 35000, 38000, 42000, 40000, 45000, 48000, 50000, 52000], labels: ["Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar"] },
};

const clicksBySection = [
  { label: "Header CTA", value: 3200, color: "bg-blue-500" },
  { label: "Planos", value: 4800, color: "bg-emerald-500" },
  { label: "Demo", value: 1850, color: "bg-violet-500" },
  { label: "Footer", value: 1200, color: "bg-amber-500" },
  { label: "Login", value: 1400, color: "bg-red-400" },
];

const deviceDistribution = [
  { label: "Desktop", value: 58, color: "#2563eb" },
  { label: "Mobile", value: 35, color: "#10b981" },
  { label: "Tablet", value: 7, color: "#f59e0b" },
];

const salesByPlanMonthly = [
  { label: "Starter", value: 22, color: "bg-blue-400" },
  { label: "Pro", value: 48, color: "bg-blue-600" },
  { label: "Enter.", value: 16, color: "bg-violet-600" },
];

const topPages = [
  { page: "/", views: 18420, bounce: "32%", avgTime: "2m 45s" },
  { page: "/#planos", views: 12300, bounce: "18%", avgTime: "4m 12s" },
  { page: "/login", views: 8450, bounce: "45%", avgTime: "1m 30s" },
  { page: "/#beneficios", views: 6200, bounce: "28%", avgTime: "3m 05s" },
  { page: "/#avaliacoes", views: 4800, bounce: "22%", avgTime: "2m 18s" },
  { page: "/#demo", views: 3900, bounce: "25%", avgTime: "3m 42s" },
];

const trafficSources = [
  { source: "Google (Orgânico)", visits: 18500, pct: 41 },
  { source: "Direto", visits: 12200, pct: 27 },
  { source: "Instagram", visits: 6800, pct: 15 },
  { source: "Facebook", visits: 4500, pct: 10 },
  { source: "Outros", visits: 3280, pct: 7 },
];

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<Period>("30d");

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Análises de tráfego, conversões e performance"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <HiOutlineArrowDownTray className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => <StatCard key={stat.label} {...stat} delay={i * 0.08} />)}
      </div>

      {/* Views Chart */}
      <ChartCard
        title="Visualizações"
        subtitle="Tráfego na home page"
        className="mt-6"
        delay={0.2}
        actions={
          <div className="flex items-center gap-1 bg-muted/50 dark:bg-white/5 rounded-xl p-1">
            {(["7d", "30d", "90d", "12m"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                  period === p ? "bg-white dark:bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        }
      >
        <AreaChart data={viewsData[period].data} labels={viewsData[period].labels} height={220} />
      </ChartCard>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <ChartCard title="Cliques por Seção" subtitle="Onde os usuários clicam" delay={0.3}>
          <div className="space-y-3">
            {clicksBySection.map((s, i) => {
              const maxVal = Math.max(...clicksBySection.map((c) => c.value));
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-medium text-foreground">{s.label}</span>
                    <span className="font-bold text-foreground">{s.value.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="h-2 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", s.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.value / maxVal) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Dispositivos" subtitle="Distribuição de acesso" delay={0.35}>
          <div className="flex items-center justify-center pt-2">
            <DonutChart data={deviceDistribution} centerValue="45k" centerLabel="visitas" size={130} />
          </div>
        </ChartCard>

        <ChartCard title="Vendas por Plano" subtitle="Assinaturas este mês" delay={0.4}>
          <MiniBarChart data={salesByPlanMonthly} height={130} />
          <div className="mt-3 pt-3 border-t border-border/30 dark:border-white/5 text-center">
            <p className="text-2xl font-extrabold text-foreground">86</p>
            <p className="text-[10px] text-muted-foreground">novas assinaturas</p>
          </div>
        </ChartCard>
      </div>

      {/* Row 3 — Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <ChartCard title="Páginas Mais Visitadas" subtitle="Ranking de visualizações" delay={0.45}>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40 dark:border-white/8">
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Página</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Views</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bounce</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tempo</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p) => (
                  <tr key={p.page} className="border-b border-border/20 dark:border-white/5 last:border-0">
                    <td className="px-5 py-2.5 text-xs font-mono font-semibold text-primary">{p.page}</td>
                    <td className="px-5 py-2.5 text-xs font-bold text-foreground">{p.views.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-2.5 text-xs text-muted-foreground">{p.bounce}</td>
                    <td className="px-5 py-2.5 text-xs text-muted-foreground">{p.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard title="Fontes de Tráfego" subtitle="De onde vêm os visitantes" delay={0.5}>
          <div className="space-y-3">
            {trafficSources.map((s, i) => (
              <motion.div
                key={s.source}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-foreground truncate">{s.source}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">{s.visits.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="h-1.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full progress-gradient"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.5 + i * 0.08 }}
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground w-8 text-right">{s.pct}%</span>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
