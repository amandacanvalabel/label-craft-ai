"use client";

import { useState, useEffect } from "react";
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
  HiOutlinePhoto,
  HiOutlineCreditCard,
} from "react-icons/hi2";
import StatCard from "@/components/admin/StatCard";
import Badge from "@/components/admin/Badge";
import { cn } from "@/lib/utils";

interface RecentModel {
  id: string; name: string; category: string;
  img: string; status: string; createdAt: string;
}

interface ActivityItem {
  type: "model" | "payment";
  text: string;
  date: string;
}

interface DashData {
  name: string;
  stats: { labelsCreated: number; modelsSaved: number; planName: string; estimatedHoursSaved: number };
  recentModels: RecentModel[];
  activity: ActivityItem[];
  planName: string | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `há ${days}d`;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho", approved: "Aprovado", review: "Revisão",
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl bg-muted/50 dark:bg-white/5 animate-pulse", className)} />
);

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriber/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = data?.name?.split(" ")[0] ?? "…";
  const stats = data?.stats;
  const planName = data?.planName ?? "—";

  const statCards = [
    {
      label: "Rótulos Criados", icon: HiOutlineSparkles,
      iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
      value: loading ? "…" : String(stats?.labelsCreated ?? 0),
      sparkline: [1, 2, 2, 3, 4, 5, 6, 8, 10, 12, 14, stats?.labelsCreated ?? 0],
    },
    {
      label: "Modelos Salvos", icon: HiOutlineBookmarkSquare,
      iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15",
      value: loading ? "…" : String(stats?.modelsSaved ?? 0),
      sparkline: [1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, stats?.modelsSaved ?? 0],
    },
    {
      label: "Plano Atual", icon: HiOutlineRectangleGroup,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15",
      value: loading ? "…" : planName,
    },
    {
      label: "Tempo Economizado", icon: HiOutlineClock,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15",
      value: loading ? "…" : `${stats?.estimatedHoursSaved ?? 0}h`,
      sparkline: [1, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15, stats?.estimatedHoursSaved ?? 0],
    },
  ];

  const quickActions = [
    { label: "Criar Rótulo", desc: "Use a IA para gerar", icon: HiOutlinePlusCircle, href: "/dashboard/estudio-ia", color: "from-blue-500 to-blue-600" },
    { label: "Meus Modelos", desc: loading ? "…" : `${stats?.modelsSaved ?? 0} salvos`, icon: HiOutlineBookmarkSquare, href: "/dashboard/modelos-salvos", color: "from-violet-500 to-violet-600" },
    { label: "Meu Plano", desc: loading ? "…" : planName, icon: HiOutlineDocumentText, href: "/dashboard/meu-plano", color: "from-emerald-500 to-emerald-600" },
    { label: "Configurações", desc: "Perfil e preferências", icon: HiOutlineCog6Tooth, href: "/dashboard/configuracoes", color: "from-amber-500 to-amber-600" },
  ];

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {loading ? "Carregando…" : `Olá, ${firstName}! 👋`}
          </h1>
          <p className="text-white/70 mt-1.5 text-sm max-w-md">
            Bem-vindo ao seu painel do CanvaLabel. Crie rótulos profissionais com IA em minutos.
          </p>
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
        {statCards.map((stat, i) => (
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

        {/* Recent Models */}
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

          {loading ? (
            <div className="space-y-2.5">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : data?.recentModels.length ? (
            <div className="space-y-2.5">
              {data.recentModels.map((model, i) => (
                <motion.div
                  key={model.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/40 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.45 + i * 0.05 }}
                >
                  <div className="w-11 h-11 rounded-xl bg-muted/50 dark:bg-white/5 flex items-center justify-center text-xl shrink-0">
                    {model.img}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{model.name}</p>
                    <p className="text-[10px] text-muted-foreground">{model.category} · {timeAgo(model.createdAt)}</p>
                  </div>
                  <Badge variant={model.status === "approved" ? "success" : model.status === "review" ? "warning" : "default"} dot>
                    {STATUS_LABEL[model.status] ?? model.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <HiOutlinePhoto className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Nenhum rótulo criado ainda</p>
              <p className="text-xs text-muted-foreground mt-1">Crie seu primeiro rótulo no Estúdio IA</p>
              <Link href="/dashboard/estudio-ia"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <HiOutlinePlusCircle className="w-4 h-4" />
                Criar agora
              </Link>
            </div>
          )}
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
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : data?.activity.length ? (
              <div className="space-y-3">
                {data.activity.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      item.type === "model"
                        ? "text-violet-500 bg-violet-50 dark:bg-violet-500/15"
                        : "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15"
                    )}>
                      {item.type === "model"
                        ? <HiOutlineBookmarkSquare className="w-3.5 h-3.5" />
                        : <HiOutlineCreditCard className="w-3.5 h-3.5" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma atividade ainda</p>
            )}
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
              {/* Labels — real */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Rótulos criados</span>
                  <span className="text-xs font-bold text-foreground">
                    {loading ? "…" : stats?.labelsCreated ?? 0}
                  </span>
                </div>
                <div className="h-2 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((stats?.labelsCreated ?? 0) / 100) * 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </div>
              </div>

              {/* Placeholder rows */}
              {[
                { label: "Gerações de IA", color: "bg-violet-500" },
                { label: "Armazenamento", color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground italic">em breve</span>
                  </div>
                  <div className="h-2 bg-muted dark:bg-white/8 rounded-full" />
                </div>
              ))}
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
