"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import {
  HiOutlineSquares2X2,
  HiOutlineBanknotes,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineCpuChip,
  HiOutlineChartBarSquare,
  HiOutlineCog6Tooth,
  HiOutlineSparkles,
  HiOutlineBookmarkSquare,
  HiOutlineRectangleGroup,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SUBSCRIBER";
}

interface PlanInfo {
  planName: string;
  planType: string;
  activatedAt: string | null;
  expiresAt: string | null;
}

const navLinks = [
  { label: "Benefícios", href: "#beneficios" },
  { label: "Demonstração", href: "#demonstracao" },
  { label: "Planos", href: "#planos" },
  { label: "Avaliações", href: "#avaliacoes" },
];

const adminItems = [
  { label: "Visão Geral", href: "/admin", icon: HiOutlineSquares2X2 },
  { label: "Vendas", href: "/admin/vendas", icon: HiOutlineBanknotes },
  { label: "Assinantes", href: "/admin/assinantes", icon: HiOutlineUsers },
  { label: "Planos", href: "/admin/planos", icon: HiOutlineCreditCard },
  { label: "Modelos IA", href: "/admin/modelos-ia", icon: HiOutlineCpuChip },
  { label: "Relatórios", href: "/admin/relatorios", icon: HiOutlineChartBarSquare },
  { label: "Configurações", href: "/admin/configuracoes", icon: HiOutlineCog6Tooth },
];

const subscriberItems = [
  { label: "Visão Geral", href: "/dashboard", icon: HiOutlineSquares2X2 },
  { label: "Estúdio IA", href: "/dashboard/estudio-ia", icon: HiOutlineSparkles },
  { label: "Modelos Salvos", href: "/dashboard/modelos-salvos", icon: HiOutlineBookmarkSquare },
  { label: "Meu Plano", href: "/dashboard/meu-plano", icon: HiOutlineRectangleGroup },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: HiOutlineCog6Tooth },
];

const PLAN_TYPE_LABEL: Record<string, string> = {
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
  LIFETIME: "Vitalício",
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
}

const renderTime = Date.now();

function PlanSection({ planInfo, visible }: { planInfo: PlanInfo | null; visible: boolean }) {
  const [barWidth, setBarWidth] = useState(0);

  const hasPlan = !!planInfo;
  const isLifetime = hasPlan && (planInfo.planType === "LIFETIME" || !planInfo.expiresAt);
  const now = renderTime;
  const start = planInfo?.activatedAt ? new Date(planInfo.activatedAt).getTime() : now;
  const end = planInfo?.expiresAt ? new Date(planInfo.expiresAt).getTime() : now;
  const total = end - start || 1;
  const elapsed = now - start;
  const pct = !hasPlan ? 0 : isLifetime ? 100 : Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  const daysLeft = (!hasPlan || isLifetime) ? null : Math.max(0, Math.ceil((end - now) / 86_400_000));

  const barColor =
    !hasPlan
      ? "from-muted to-muted"
      : isLifetime
      ? "from-emerald-400 to-emerald-500"
      : pct >= 80
      ? "from-red-400 to-red-500"
      : pct >= 50
      ? "from-amber-400 to-amber-500"
      : "from-emerald-400 to-emerald-500";

  const statusColor =
    isLifetime ? "text-emerald-500"
    : pct >= 80 ? "text-red-500"
    : pct >= 50 ? "text-amber-500"
    : "text-emerald-500";

  useEffect(() => {
    const target = visible && hasPlan ? (isLifetime ? 100 : pct) : 0;
    const t = setTimeout(() => setBarWidth(target), 80);
    return () => clearTimeout(t);
  }, [visible, pct, isLifetime, hasPlan]);

  if (!hasPlan) {
    return (
      <div className="px-4 py-3 border-b border-border/40 dark:border-white/8">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plano</span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Sem plano</span>
        </div>
        <div className="relative h-1.5 bg-muted/60 dark:bg-white/8 rounded-full overflow-hidden mb-2">
          <div className="absolute left-0 top-0 h-full w-0 rounded-full bg-muted" />
        </div>
        <Link
          href="/dashboard/meu-plano"
          className="block w-full text-center text-[10px] font-semibold text-primary bg-primary/8 hover:bg-primary/15 rounded-lg py-1.5 transition-colors"
        >
          Ver planos disponíveis →
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-border/40 dark:border-white/8">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plano ativo</span>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
          {PLAN_TYPE_LABEL[planInfo.planType] ?? planInfo.planType}
        </span>
      </div>

      <p className="text-[13px] font-bold text-foreground mb-2.5 leading-none">{planInfo.planName}</p>

      <div className="relative h-2 bg-muted/60 dark:bg-white/8 rounded-full overflow-hidden mb-2">
        <div
          className={cn("absolute left-0 top-0 h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", barColor)}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {isLifetime ? (
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">
            Desde {planInfo.activatedAt ? fmtDate(planInfo.activatedAt) : "—"}
          </span>
          <div className="flex items-center gap-1 text-emerald-500">
            <span className="text-[11px] font-bold leading-none">∞</span>
            <span className="text-[9px] font-bold">Vitalício</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-muted-foreground">
            {planInfo.activatedAt ? fmtDate(planInfo.activatedAt) : "—"}
            {" → "}
            {planInfo.expiresAt ? fmtDate(planInfo.expiresAt) : "—"}
          </span>
          <span className={cn("text-[9px] font-bold", statusColor)}>
            {daysLeft === 0 ? "Expira hoje" : `${daysLeft}d restantes`}
          </span>
        </div>
      )}
    </div>
  );
}

const Header = () => {
  const router = useRouter();
  const siteSettings = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) setUser(data.user);
        if (data?.planInfo) setPlanInfo(data.planInfo);
        if (data?.avatar) setAvatarUrl(data.avatar);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setPlanInfo(null);
    setAvatarUrl(null);
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  const menuItems = user?.role === "ADMIN" ? adminItems : subscriberItems;
  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-strong shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {siteSettings.logoHeaderUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={siteSettings.logoHeaderUrl} alt={siteSettings.siteName} className="w-8 h-8 rounded-lg object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {siteSettings.siteName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-lg font-bold tracking-tight text-foreground">
            {siteSettings.siteName}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-border/50 hover:border-border hover:bg-muted/40 transition-all"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{initials}</span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-[12px] font-semibold text-foreground leading-none">{user.name.split(" ")[0]}</p>
                  <p className={cn(
                    "text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5",
                    user.role === "ADMIN" ? "text-primary" : "text-emerald-500"
                  )}>
                    {user.role === "ADMIN" ? "Admin" : "Assinante"}
                  </p>
                </div>
                <HiOutlineChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3.5 border-b border-border/40 dark:border-white/8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gradient-primary flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{initials}</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <span className={cn(
                        "shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                        user.role === "ADMIN"
                          ? "bg-primary/10 text-primary"
                          : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      )}>
                        {user.role === "ADMIN" ? "Admin" : "Assinante"}
                      </span>
                    </div>
                  </div>

                  {/* Plan block — subscribers only */}
                  {user.role === "SUBSCRIBER" && (
                    <PlanSection planInfo={planInfo} visible={dropdownOpen} />
                  )}

                  {/* Nav items */}
                  <div className="py-1.5">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-border/40 dark:border-white/8 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-4 h-4 shrink-0" />
                      Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                Entrar
              </Link>
              <a
                href="#planos"
                className="text-sm font-semibold text-primary-foreground gradient-primary rounded-full px-6 py-2.5 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Assinar Plano
              </a>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Menu"
        >
          {mobileOpen ? <HiX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-border/50 px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}

          {user ? (
            <div className="pt-4 border-t border-border/50 space-y-1">
              {/* User info */}
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{initials}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                  <p className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    user.role === "ADMIN" ? "text-primary" : "text-emerald-500"
                  )}>
                    {user.role === "ADMIN" ? "Administrador" : "Assinante"}
                  </p>
                </div>
              </div>

              {/* Plan block — subscribers only */}
              {user.role === "SUBSCRIBER" && (
                <div className="rounded-xl border border-border/40 dark:border-white/8 overflow-hidden mb-2">
                  <PlanSection planInfo={planInfo} visible={mobileOpen} />
                </div>
              )}

              {/* Nav items */}
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ))}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-2 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors mt-1"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4 shrink-0" />
                Sair da conta
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-center text-foreground py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
              >
                Entrar
              </Link>
              <a
                href="#planos"
                className="text-sm font-semibold text-center text-primary-foreground gradient-primary rounded-xl py-2.5"
              >
                Assinar Plano
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
