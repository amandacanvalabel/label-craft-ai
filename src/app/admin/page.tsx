"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineUsers,
  HiOutlineBanknotes,
  HiOutlineSquares2X2,
  HiOutlineSparkles,
  HiOutlineArrowPath,
  HiOutlineCreditCard,
  HiOutlineUserPlus,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
  HiOutlineArrowTrendingUp,
  HiOutlineRectangleGroup,
  HiOutlineBookmarkSquare,
} from "react-icons/hi2";
import { motion } from "framer-motion";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import Badge from "@/components/admin/Badge";
import { Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

interface DashStats {
  subscribersAtivos: number;
  receitaMensal: number;
  rotulosCriados: number;
  usoDeIA: number;
}

interface PlanSummary {
  id: string;
  name: string;
  count: number;
  pct: number;
  revenue: number;
}

interface RecentSale {
  id: string;
  subscriberName: string;
  planName: string;
  method: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface TopSubscriber {
  id: string;
  name: string;
  planName: string;
  labelsCount: number;
  totalRevenue: number;
}

interface ActivityItem {
  id: string;
  type: "signup" | "payment" | "model";
  title: string;
  description: string;
  createdAt: string;
}

interface DashData {
  stats: DashStats;
  planSummary: PlanSummary[];
  recentSales: RecentSale[];
  topSubscribers: TopSubscriber[];
  activity: ActivityItem[];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function fmtCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

const PLAN_COLORS: Record<number, { color: string; bgLight: string; textColor: string }> = {
  0: { color: "bg-blue-500", bgLight: "bg-blue-50 dark:bg-blue-500/15", textColor: "text-blue-600 dark:text-blue-400" },
  1: { color: "bg-primary", bgLight: "bg-primary/10", textColor: "text-primary" },
  2: { color: "bg-violet-600", bgLight: "bg-violet-50 dark:bg-violet-500/15", textColor: "text-violet-600 dark:text-violet-400" },
  3: { color: "bg-amber-500", bgLight: "bg-amber-50 dark:bg-amber-500/15", textColor: "text-amber-600 dark:text-amber-400" },
};

function activityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "signup": return { icon: <HiOutlineUserPlus className="w-4 h-4" />, color: "bg-blue-50 dark:bg-blue-500/15 text-blue-500" };
    case "payment": return { icon: <HiOutlineCreditCard className="w-4 h-4" />, color: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-500" };
    case "model": return { icon: <HiOutlineBookmarkSquare className="w-4 h-4" />, color: "bg-amber-50 dark:bg-amber-500/15 text-amber-500" };
  }
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl bg-muted/50 dark:bg-white/5 animate-pulse", className)} />
);

export default function AdminPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const s = data?.stats;

  const statCards = [
    {
      label: "Assinantes Ativos",
      value: loading ? "…" : String(s?.subscribersAtivos ?? 0),
      icon: HiOutlineUsers,
      iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
      sparkline: [30, 35, 28, 42, 38, 50, 45, 52, 60, 58, 65, s?.subscribersAtivos ?? 0],
    },
    {
      label: "Receita Mensal",
      value: loading ? "…" : fmtCurrency(s?.receitaMensal ?? 0),
      icon: HiOutlineBanknotes,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15",
      sparkline: [60, 65, 58, 70, 75, 68, 80, 85, 78, 90, 88, s?.receitaMensal ?? 0],
    },
    {
      label: "Rótulos Criados",
      value: loading ? "…" : String(s?.rotulosCriados ?? 0),
      icon: HiOutlineSquares2X2,
      iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15",
      sparkline: [20, 25, 30, 28, 35, 40, 38, 45, 50, 55, 52, s?.rotulosCriados ?? 0],
    },
    {
      label: "Uso de IA",
      value: loading ? "…" : String(s?.usoDeIA ?? 0),
      icon: HiOutlineSparkles,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15",
      sparkline: [15, 20, 18, 25, 30, 28, 35, 32, 40, 38, 45, s?.usoDeIA ?? 0],
    },
  ];

  const activities = (data?.activity ?? []).map((item) => {
    const { icon, color } = activityIcon(item.type);
    return { id: item.id, icon, title: item.title, description: item.description, time: timeAgo(item.createdAt), color };
  });

  const todaySales = (data?.recentSales ?? []).filter((s) => {
    const diff = Date.now() - new Date(s.createdAt).getTime();
    return diff < 86_400_000;
  }).length;

  return (
    <div>
      <PageHeader
        title="Visão Geral"
        subtitle="Painel administrativo do CanvaLabel"
        actions={
          <Button variant="secondary" size="sm" onClick={load}>
            <HiOutlineArrowPath className={cn("w-4 h-4", loading && "animate-spin")} />
            Atualizar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.08} />
        ))}
      </div>

      {/* Plan Distribution + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Plan summary */}
        <motion.div
          className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineRectangleGroup className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Planos</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : data?.planSummary.length ? (
            <div className="space-y-3">
              {data.planSummary.map((p, i) => {
                const palette = PLAN_COLORS[i % 4];
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", palette.bgLight)}>
                      <span className={cn("text-xs font-extrabold", palette.textColor)}>{p.pct}%</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs font-bold text-foreground">{p.count}</p>
                      </div>
                      <div className="mt-1.5 h-1.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", palette.color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${p.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{fmtCurrency(p.revenue)}/total</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhum plano ativo</p>
          )}
        </motion.div>

        {/* Recent Sales */}
        <motion.div
          className="lg:col-span-2 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineBanknotes className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">Vendas Recentes</h3>
            </div>
            {!loading && <Badge variant="success" dot>{todaySales} hoje</Badge>}
          </div>
          {loading ? (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : data?.recentSales.length ? (
            <div className="space-y-2.5">
              {data.recentSales.map((sale, i) => (
                <motion.div
                  key={sale.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/40 dark:hover:bg-white/[0.04] transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                >
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {sale.subscriberName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{sale.subscriberName}</p>
                    <p className="text-[10px] text-muted-foreground">{sale.planName} · {sale.method}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">{fmtCurrency(sale.amount)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      {sale.status === "CONFIRMED" && <HiOutlineCheckCircle className="w-3 h-3 text-emerald-500" />}
                      {sale.status === "PENDING" && <HiOutlineCalendarDays className="w-3 h-3 text-amber-500" />}
                      {(sale.status === "CANCELLED" || sale.status === "REFUNDED") && <HiOutlineExclamationTriangle className="w-3 h-3 text-red-500" />}
                      <span className="text-[10px] text-muted-foreground">{timeAgo(sale.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">Nenhuma venda ainda</p>
          )}
        </motion.div>
      </div>

      {/* Activity Feed + Top Subscribers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <motion.div
          className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineArrowTrendingUp className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Atividade Recente</h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : activities.length ? (
            <ActivityFeed activities={activities} />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhuma atividade ainda</p>
          )}
        </motion.div>

        <motion.div
          className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineUsers className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">Top Assinantes</h3>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : data?.topSubscribers.length ? (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/40 dark:border-white/8">
                    <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assinante</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plano</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rótulos</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSubscribers.map((sub, i) => (
                    <tr key={sub.id} className="border-b border-border/20 dark:border-white/5 last:border-0 hover:bg-muted/20 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center">{i + 1}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                            {sub.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-xs font-semibold text-foreground">{sub.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="default">{sub.planName}</Badge>
                      </td>
                      <td className="px-5 py-3 text-xs font-semibold text-foreground">{sub.labelsCount}</td>
                      <td className="px-5 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">{fmtCurrency(sub.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhum assinante ainda</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
