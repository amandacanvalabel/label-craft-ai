"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineBell,
  HiOutlineArrowsPointingOut,
  HiOutlineArrowsPointingIn,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineLanguage,
  HiOutlineUser,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
  HiOutlineCalendarDays,
  HiOutlineCreditCard,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TopbarProps {
  user: { name: string; email: string; role: string };
  sidebarExpanded: boolean;
}

// Dropdown wrapper
const DropdownWrapper = ({
  children,
  isOpen,
  onClose,
  align = "right",
  width = "w-80",
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  align?: "left" | "right";
  width?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              "absolute top-full mt-2 rounded-2xl shadow-xl border overflow-hidden z-50",
              "bg-white dark:bg-[#1a1a24] border-border/50 dark:border-white/10",
              width,
              align === "right" ? "right-0" : "left-0"
            )}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Icon button
const TopbarButton = ({
  icon: Icon,
  active,
  badge,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    <Icon className="w-5 h-5" />
    {badge && badge > 0 ? (
      <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
        {badge > 9 ? "9+" : badge}
      </span>
    ) : null}
  </button>
);

interface PlanInfo {
  planName: string;
  planType: string;
  activatedAt: string | null;
  expiresAt: string | null;
}

const PLAN_TYPE_LABEL: Record<string, string> = {
  MONTHLY: "Mensal", QUARTERLY: "Trimestral", SEMIANNUAL: "Semestral",
  ANNUAL: "Anual", LIFETIME: "Vitalício",
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

const SubscriberPlanInfo = ({ planInfo }: { planInfo: PlanInfo | null }) => {
  const [barWidth, setBarWidth] = useState(0);

  const hasPlan = !!planInfo;
  const isLifetime = hasPlan && (planInfo.planType === "LIFETIME" || !planInfo.expiresAt);
  const now = Date.now();
  const start = planInfo?.activatedAt ? new Date(planInfo.activatedAt).getTime() : now;
  const end = planInfo?.expiresAt ? new Date(planInfo.expiresAt).getTime() : now;
  const total = end - start || 1;
  const pct = !hasPlan ? 0 : isLifetime ? 100 : Math.min(100, Math.max(0, Math.round(((now - start) / total) * 100)));
  const daysLeft = (!hasPlan || isLifetime) ? null : Math.max(0, Math.ceil((end - now) / 86_400_000));

  const barColor = !hasPlan ? "bg-muted" : pct >= 80 ? "bg-red-500" : pct >= 50 ? "bg-amber-500" : "bg-emerald-500";

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(hasPlan ? (isLifetime ? 100 : pct) : 0), 150);
    return () => clearTimeout(t);
  }, [hasPlan, isLifetime, pct]);

  if (!hasPlan) {
    return (
      <div className="p-4 border-t border-border/40 dark:border-white/8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-foreground">Plano</span>
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Sem plano</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted dark:bg-white/8 mb-3" />
        <Link
          href="/dashboard/meu-plano"
          className="block w-full text-center text-[11px] font-semibold text-primary bg-primary/8 hover:bg-primary/15 rounded-lg py-1.5 transition-colors"
        >
          Ver planos disponíveis →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-border/40 dark:border-white/8 space-y-3">
      {/* Plan name row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
            <HiOutlineSparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-xs font-bold text-foreground">{planInfo.planName}</span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          {PLAN_TYPE_LABEL[planInfo.planType] ?? planInfo.planType}
        </span>
      </div>

      {/* Progress bar */}
      {!isLifetime && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">Ciclo do plano</span>
            <span className="text-[10px] font-bold text-foreground">
              {daysLeft === 0 ? "Expira hoje" : `${daysLeft}d restantes`}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted dark:bg-white/8 overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full transition-all duration-700", barColor)}
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-muted-foreground">{pct}% utilizado</span>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/50 dark:bg-white/5 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <HiOutlineCalendarDays className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Ativação</span>
          </div>
          <p className="text-[11px] font-bold text-foreground">
            {planInfo.activatedAt ? fmtDate(planInfo.activatedAt) : "—"}
          </p>
        </div>
        <div className="bg-muted/50 dark:bg-white/5 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <HiOutlineCalendarDays className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Expiração</span>
          </div>
          <p className="text-[11px] font-bold text-foreground">
            {isLifetime ? "∞ Vitalício" : planInfo.expiresAt ? fmtDate(planInfo.expiresAt) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

const Topbar = ({ user, sidebarExpanded }: TopbarProps) => {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLang, setCurrentLang] = useState("pt-BR");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (stored === "system" && prefersDark) || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Load avatar + plan info from /api/auth/me (single request)
  useEffect(() => {
    if (user.role !== "SUBSCRIBER") return;
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.avatar) setAvatarUrl(data.avatar);
        if (data?.planInfo) setPlanInfo(data.planInfo);
      })
      .catch(() => {});
  }, [user.role]);

  const toggle = useCallback(
    (name: string) => setOpenDropdown((prev) => (prev === name ? null : name)),
    []
  );
  const close = useCallback(() => setOpenDropdown(null), []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast.success(next ? "Modo escuro ativado" : "Modo claro ativado");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Até logo!");
    router.push("/login");
  };

  const notifications = [
    { id: 1, title: "Novo assinante", desc: "João Silva assinou o plano Profissional", time: "2min", unread: true },
    { id: 2, title: "Pagamento confirmado", desc: "PIX de R$ 79,90 confirmado", time: "15min", unread: true },
    { id: 3, title: "Relatório pronto", desc: "Relatório mensal de março disponível", time: "1h", unread: false },
    { id: 4, title: "Modelo salvo", desc: "Rótulo 'Molho Artesanal' salvo com sucesso", time: "3h", unread: false },
  ];

  const languages = [
    { code: "pt-BR", label: "Português (BR)", flag: "🇧🇷" },
    { code: "en-US", label: "English (US)", flag: "🇺🇸" },
    { code: "es-ES", label: "Español", flag: "🇪🇸" },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-border/40 dark:border-white/8 z-30 flex items-center justify-between px-6 transition-all duration-300"
      style={{ left: sidebarExpanded ? 256 : 72 }}
    >
      {/* Left - Page title area */}
      <div />

      {/* Right - Actions */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <TopbarButton
            icon={HiOutlineBell}
            active={openDropdown === "notifications"}
            badge={unreadCount}
            onClick={() => toggle("notifications")}
          />
          <DropdownWrapper isOpen={openDropdown === "notifications"} onClose={close} width="w-96">
            <div className="p-4 border-b border-border/40 dark:border-white/8">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Notificações</h3>
                <span className="text-[11px] font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                  {unreadCount} novas
                </span>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "flex gap-3 px-4 py-3.5 hover:bg-muted/40 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-border/20 dark:border-white/5 last:border-0",
                    notif.unread && "bg-primary/[0.03] dark:bg-primary/[0.06]"
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      notif.unread ? "bg-primary" : "bg-transparent"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {notif.desc}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {notif.time}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border/40 dark:border-white/8">
              <button className="w-full text-center text-xs font-semibold text-primary hover:underline">
                Ver todas as notificações
              </button>
            </div>
          </DropdownWrapper>
        </div>

        {/* Fullscreen */}
        <TopbarButton
          icon={isFullscreen ? HiOutlineArrowsPointingIn : HiOutlineArrowsPointingOut}
          onClick={toggleFullscreen}
        />

        {/* Dark/Light */}
        <TopbarButton
          icon={isDark ? HiOutlineSun : HiOutlineMoon}
          active={isDark}
          onClick={toggleDark}
        />

        {/* Language */}
        <div className="relative">
          <TopbarButton
            icon={HiOutlineLanguage}
            active={openDropdown === "lang"}
            onClick={() => toggle("lang")}
          />
          <DropdownWrapper isOpen={openDropdown === "lang"} onClose={close} width="w-56">
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang(lang.code);
                    close();
                    toast.success(`Idioma alterado para ${lang.label}`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left",
                    currentLang === lang.code
                      ? "bg-primary/8 text-primary font-semibold"
                      : "text-foreground hover:bg-muted/60 dark:hover:bg-white/5"
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {currentLang === lang.code && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </DropdownWrapper>
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-border/50 dark:bg-white/10 mx-1.5" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => toggle("profile")}
            className={cn(
              "flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-xl transition-all duration-200",
              openDropdown === "profile"
                ? "bg-primary/8"
                : "hover:bg-muted/60 dark:hover:bg-white/5"
            )}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{initials}</span>
                </div>
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {user.name}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {user.role === "ADMIN" ? "Administrador" : "Assinante"}
              </p>
            </div>
          </button>

          <DropdownWrapper
            isOpen={openDropdown === "profile"}
            onClose={close}
            width={user.role === "SUBSCRIBER" ? "w-80" : "w-72"}
          >
            {/* Profile header */}
            <div className="p-4 border-b border-border/40 dark:border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md shadow-primary/20 shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center">
                      <span className="text-white font-bold">{initials}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <span
                    className={cn(
                      "inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                      user.role === "ADMIN"
                        ? "bg-primary/10 text-primary"
                        : "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {user.role === "ADMIN" ? "Admin" : "Assinante"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscriber plan info */}
            {user.role === "SUBSCRIBER" && <SubscriberPlanInfo planInfo={planInfo} />}

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={() => {
                  close();
                  router.push(
                    user.role === "ADMIN"
                      ? "/admin/configuracoes"
                      : "/dashboard/configuracoes"
                  );
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-colors"
              >
                <HiOutlineUser className="w-4 h-4 text-muted-foreground" />
                Meu Perfil
              </button>
              <button
                onClick={() => {
                  close();
                  router.push(
                    user.role === "ADMIN"
                      ? "/admin/configuracoes"
                      : "/dashboard/configuracoes"
                  );
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-colors"
              >
                <HiOutlineCog6Tooth className="w-4 h-4 text-muted-foreground" />
                Configurações
              </button>
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-border/40 dark:border-white/8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                Sair
              </button>
            </div>
          </DropdownWrapper>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
