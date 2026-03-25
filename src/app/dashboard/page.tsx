"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineBookmarkSquare,
  HiOutlineRectangleGroup,
  HiOutlineClock,
  HiOutlineArrowRight,
  HiOutlinePlusCircle,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineCheckCircle,
  HiOutlineArrowTrendingUp,
  HiOutlineBolt,
  HiOutlinePhoto,
} from "react-icons/hi2";
import StatCard from "@/components/admin/StatCard";
import Badge from "@/components/admin/Badge";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Rótulos Criados", value: "24", change: 33, icon: HiOutlineSparkles, iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15", sparkline: [3, 5, 4, 7, 6, 8, 10, 9, 12, 11, 14, 16] },
  { label: "Modelos Salvos", value: "12", change: 20, icon: HiOutlineBookmarkSquare, iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15", sparkline: [2, 3, 3, 4, 5, 5, 6, 7, 8, 9, 10, 12] },
  { label: "Plano Atual", value: "Profissional", icon: HiOutlineRectangleGroup, iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15" },
  { label: "Tempo Economizado", value: "18h", change: 45, icon: HiOutlineClock, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15", sparkline: [1, 2, 2, 3, 4, 5, 6, 8, 10, 12, 15, 18] },
];

const recentLabels = [
  { id: 1, name: "Suco de Laranja Natural", category: "Bebidas", date: "há 2h", status: "Aprovado", img: "🍊" },
  { id: 2, name: "Mel Orgânico Silvestre", category: "Alimentos", date: "há 5h", status: "Aprovado", img: "🍯" },
  { id: 3, name: "Proteína Whey Isolada", category: "Suplementos", date: "há 1d", status: "Pendente", img: "💪" },
  { id: 4, name: "Creme Hidratante Facial", category: "Cosméticos", date: "há 2d", status: "Aprovado", img: "🧴" },
];

const quickActions = [
  { label: "Criar Rótulo", desc: "Use a IA para gerar", icon: HiOutlinePlusCircle, href: "/dashboard/estudio-ia", color: "from-blue-500 to-blue-600" },
  { label: "Meus Modelos", desc: "12 modelos salvos", icon: HiOutlineBookmarkSquare, href: "/dashboard/modelos-salvos", color: "from-violet-500 to-violet-600" },
  { label: "Meu Plano", desc: "Profissional ativo", icon: HiOutlineDocumentText, href: "/dashboard/meu-plano", color: "from-emerald-500 to-emerald-600" },
  { label: "Configurações", desc: "Perfil e preferências", icon: HiOutlineCog6Tooth, href: "/dashboard/configuracoes", color: "from-amber-500 to-amber-600" },
];

const activityItems = [
  { icon: HiOutlineSparkles, text: "Rótulo \"Suco de Laranja Natural\" criado com IA", time: "há 2h", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/15" },
  { icon: HiOutlineCheckCircle, text: "Rótulo \"Mel Orgânico\" aprovado pela validação ANVISA", time: "há 5h", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15" },
  { icon: HiOutlinePhoto, text: "Modelo \"Proteína Whey\" salvo na galeria", time: "há 1d", color: "text-violet-500 bg-violet-50 dark:bg-violet-500/15" },
  { icon: HiOutlineArrowTrendingUp, text: "Plano atualizado de Starter para Profissional", time: "há 3d", color: "text-amber-500 bg-amber-50 dark:bg-amber-500/15" },
  { icon: HiOutlineBolt, text: "Geração automática de tabela nutricional", time: "há 5d", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/15" },
];

const usageLimits = [
  { label: "Rótulos/mês", used: 24, total: 100, color: "bg-blue-500" },
  { label: "Gerações IA", used: 48, total: 200, color: "bg-violet-500" },
  { label: "Armazenamento", used: 1.2, total: 5, color: "bg-emerald-500", unit: "GB" },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Welcome Banner */}
      <motion.div
        className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-violet-600 rounded-2xl p-6 sm:p-8 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white blur-2xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Olá, Maria! 👋</h1>
          <p className="text-white/70 mt-1.5 text-sm max-w-md">Bem-vinda ao seu painel do CanvaLabel. Crie rótulos profissionais com IA em minutos.</p>
          <Link
            href="/dashboard/estudio-ia"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl text-white text-sm font-semibold transition-all border border-white/20"
          >
            <HiOutlineSparkles className="w-4 h-4" />
            Criar Novo Rótulo
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.08} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
          >
            <Link
              href={action.href}
              className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", action.color)}>
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{action.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Labels + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Recent Labels */}
        <motion.div
          className="lg:col-span-2 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">Rótulos Recentes</h3>
            <Link href="/dashboard/modelos-salvos" className="text-[11px] font-semibold text-primary hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentLabels.map((label, i) => (
              <motion.div
                key={label.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/40 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.45 + i * 0.05 }}
              >
                <div className="w-11 h-11 rounded-xl bg-muted/50 dark:bg-white/5 flex items-center justify-center text-xl shrink-0">
                  {label.img}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{label.name}</p>
                  <p className="text-[10px] text-muted-foreground">{label.category} · {label.date}</p>
                </div>
                <Badge variant={label.status === "Aprovado" ? "success" : "warning"} dot>
                  {label.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity + Usage */}
        <div className="space-y-5">
          {/* Activity Feed */}
          <motion.div
            className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <h3 className="text-sm font-bold text-foreground mb-4">Atividade Recente</h3>
            <div className="space-y-3">
              {activityItems.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", item.color)}>
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Usage Limits */}
          <motion.div
            className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <h3 className="text-sm font-bold text-foreground mb-4">Uso do Plano</h3>
            <div className="space-y-4">
              {usageLimits.map((item) => {
                const pct = Math.round((item.used / item.total) * 100);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-bold text-foreground">
                        {item.unit ? `${item.used} ${item.unit}` : item.used}/{item.unit ? `${item.total} ${item.unit}` : item.total}
                      </span>
                    </div>
                    <div className="h-2 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", item.color, pct > 80 && "bg-amber-500", pct > 95 && "bg-red-500")}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href="/dashboard/meu-plano"
              className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
            >
              Ver detalhes do plano
              <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
