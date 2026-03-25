"use client";

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
  HiOutlineArrowTrendingDown,
  HiOutlineRectangleGroup,
} from "react-icons/hi2";
import { motion } from "framer-motion";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import Badge from "@/components/admin/Badge";
import { Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Assinantes Ativos",
    value: "1.248",
    change: 12,
    icon: HiOutlineUsers,
    iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
    sparkline: [30, 35, 28, 42, 38, 50, 45, 52, 60, 58, 65, 70],
  },
  {
    label: "Receita Mensal",
    value: "R$ 98.450",
    change: 8,
    icon: HiOutlineBanknotes,
    iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15",
    sparkline: [60, 65, 58, 70, 75, 68, 80, 85, 78, 90, 88, 95],
  },
  {
    label: "Rótulos Criados",
    value: "15.832",
    change: 23,
    icon: HiOutlineSquares2X2,
    iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15",
    sparkline: [20, 25, 30, 28, 35, 40, 38, 45, 50, 55, 52, 60],
  },
  {
    label: "Uso de IA",
    value: "8.429",
    change: 18,
    icon: HiOutlineSparkles,
    iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15",
    sparkline: [15, 20, 18, 25, 30, 28, 35, 32, 40, 38, 45, 42],
  },
];

const activities = [
  { id: "1", icon: <HiOutlineUserPlus className="w-4 h-4" />, title: "Novo assinante", description: "Maria Silva assinou o plano Profissional", time: "2min", color: "bg-blue-50 dark:bg-blue-500/15 text-blue-500" },
  { id: "2", icon: <HiOutlineCreditCard className="w-4 h-4" />, title: "Pagamento confirmado", description: "PIX de R$ 79,90 — João Mendes", time: "8min", color: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-500" },
  { id: "3", icon: <HiOutlineSparkles className="w-4 h-4" />, title: "Geração de rótulo", description: "Carlos Oliveira gerou 3 rótulos com IA", time: "15min", color: "bg-amber-50 dark:bg-amber-500/15 text-amber-500" },
  { id: "4", icon: <HiOutlineCheckCircle className="w-4 h-4" />, title: "Plano atualizado", description: "Ana Costa migrou de Starter para Profissional", time: "32min", color: "bg-violet-50 dark:bg-violet-500/15 text-violet-500" },
  { id: "5", icon: <HiOutlineExclamationTriangle className="w-4 h-4" />, title: "Pagamento pendente", description: "Boleto de R$ 49,90 vence hoje — Pedro Lima", time: "1h", color: "bg-red-50 dark:bg-red-500/15 text-red-500" },
  { id: "6", icon: <HiOutlineCalendarDays className="w-4 h-4" />, title: "Plano expirando", description: "5 assinantes com plano expirando esta semana", time: "2h", color: "bg-amber-50 dark:bg-amber-500/15 text-amber-500" },
];

const topSubscribers = [
  { name: "Maria Silva", plan: "Profissional", labels: 142, revenue: "R$ 959,40" },
  { name: "Carlos Oliveira", plan: "Enterprise", labels: 98, revenue: "R$ 2.399,40" },
  { name: "Ana Costa", plan: "Profissional", labels: 87, revenue: "R$ 959,40" },
  { name: "João Mendes", plan: "Starter", labels: 65, revenue: "R$ 478,80" },
  { name: "Paula Santos", plan: "Profissional", labels: 54, revenue: "R$ 959,40" },
];

const planSummary = [
  { name: "Starter", count: 420, pct: 34, revenue: "R$ 16.758", color: "bg-blue-500", bgLight: "bg-blue-50 dark:bg-blue-500/15", textColor: "text-blue-600 dark:text-blue-400" },
  { name: "Profissional", count: 650, pct: 52, revenue: "R$ 51.935", color: "bg-primary", bgLight: "bg-primary/10", textColor: "text-primary" },
  { name: "Enterprise", count: 178, pct: 14, revenue: "R$ 44.482", color: "bg-violet-600", bgLight: "bg-violet-50 dark:bg-violet-500/15", textColor: "text-violet-600 dark:text-violet-400" },
];

const recentSales = [
  { name: "Maria Silva", plan: "Profissional", method: "PIX", amount: "R$ 79,90", time: "2min", status: "success" as const },
  { name: "Carlos Oliveira", plan: "Enterprise", method: "Cartão", amount: "R$ 199,90", time: "8min", status: "success" as const },
  { name: "João Mendes", plan: "Profissional", method: "Boleto", amount: "R$ 79,90", time: "25min", status: "pending" as const },
  { name: "Ana Costa", plan: "Starter", method: "PIX", amount: "R$ 39,90", time: "1h", status: "success" as const },
  { name: "Beatriz Lima", plan: "Starter", method: "PIX", amount: "R$ 39,90", time: "2h", status: "error" as const },
];

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Visão Geral"
        subtitle="Painel administrativo do CanvaLabel"
        actions={
          <Button variant="secondary" size="sm">
            <HiOutlineArrowPath className="w-4 h-4" />
            Atualizar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.08} />
        ))}
      </div>

      {/* Plan Distribution + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Plan summary cards */}
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
          <div className="space-y-3">
            {planSummary.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", p.bgLight)}>
                  <span className={cn("text-xs font-extrabold", p.textColor)}>{p.pct}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs font-bold text-foreground">{p.count}</p>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", p.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{p.revenue}/mês</p>
                </div>
              </div>
            ))}
          </div>
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
            <Badge variant="success" dot>5 hoje</Badge>
          </div>
          <div className="space-y-2.5">
            {recentSales.map((sale, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/40 dark:hover:bg-white/[0.04] transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              >
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {sale.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{sale.name}</p>
                  <p className="text-[10px] text-muted-foreground">{sale.plan} · {sale.method}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{sale.amount}</p>
                  <div className="flex items-center gap-1 justify-end">
                    {sale.status === "success" && <HiOutlineCheckCircle className="w-3 h-3 text-emerald-500" />}
                    {sale.status === "pending" && <HiOutlineCalendarDays className="w-3 h-3 text-amber-500" />}
                    {sale.status === "error" && <HiOutlineExclamationTriangle className="w-3 h-3 text-red-500" />}
                    <span className="text-[10px] text-muted-foreground">{sale.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
          <ActivityFeed activities={activities} />
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
                {topSubscribers.map((sub, i) => (
                  <tr key={sub.name} className="border-b border-border/20 dark:border-white/5 last:border-0 hover:bg-muted/20 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center">{i + 1}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                          {sub.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="text-xs font-semibold text-foreground">{sub.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={sub.plan === "Enterprise" ? "primary" : sub.plan === "Profissional" ? "info" : "default"}>
                        {sub.plan}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs font-semibold text-foreground">{sub.labels}</td>
                    <td className="px-5 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">{sub.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
