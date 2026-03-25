"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminItems: SidebarItem[] = [
  { label: "Visão Geral", href: "/admin", icon: HiOutlineSquares2X2 },
  { label: "Vendas", href: "/admin/vendas", icon: HiOutlineBanknotes },
  { label: "Assinantes", href: "/admin/assinantes", icon: HiOutlineUsers },
  { label: "Planos", href: "/admin/planos", icon: HiOutlineCreditCard },
  { label: "Modelos IA", href: "/admin/modelos-ia", icon: HiOutlineCpuChip },
  { label: "Relatórios", href: "/admin/relatorios", icon: HiOutlineChartBarSquare },
  { label: "Configurações", href: "/admin/configuracoes", icon: HiOutlineCog6Tooth },
];

const subscriberItems: SidebarItem[] = [
  { label: "Visão Geral", href: "/dashboard", icon: HiOutlineSquares2X2 },
  { label: "Estúdio IA", href: "/dashboard/estudio-ia", icon: HiOutlineSparkles },
  { label: "Modelos Salvos", href: "/dashboard/modelos-salvos", icon: HiOutlineBookmarkSquare },
  { label: "Meu Plano", href: "/dashboard/meu-plano", icon: HiOutlineRectangleGroup },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: HiOutlineCog6Tooth },
];

interface SidebarProps {
  role: "ADMIN" | "SUBSCRIBER";
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const Sidebar = ({ role, expanded, onExpandedChange }: SidebarProps) => {
  const pathname = usePathname();
  const items = role === "ADMIN" ? adminItems : subscriberItems;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-white dark:bg-[#0a0a0f] border-r border-border/50 dark:border-white/8 z-40 flex flex-col shadow-sm"
      animate={{ width: expanded ? 256 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={() => onExpandedChange(false)}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border/40 dark:border-white/8 shrink-0">
        <Link href={role === "ADMIN" ? "/admin" : "/dashboard"} className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Canva<span className="gradient-text">Label</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {items.map((item) => {
          const isActive =
            item.href === pathname ||
            (item.href !== (role === "ADMIN" ? "/admin" : "/dashboard") &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-primary/8 rounded-xl"
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              {/* Hover background */}
              {!isActive && hoveredItem === item.href && (
                <motion.div
                  className="absolute inset-0 bg-muted/60 dark:bg-white/5 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0 relative z-10 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />

              <AnimatePresence>
                {expanded && (
                  <motion.span
                    className="relative z-10 whitespace-nowrap"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip when collapsed */}
              {!expanded && hoveredItem === item.href && (
                <motion.div
className="absolute left-full ml-3 px-3 py-1.5 bg-foreground dark:bg-white text-white dark:text-[#0a0a0f] text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                >
                  {item.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-foreground dark:bg-white rotate-45" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Role badge at bottom */}
      <div className="p-3 border-t border-border/40 dark:border-white/8 shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
            role === "ADMIN" ? "bg-primary/5" : "bg-emerald-50"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              role === "ADMIN" ? "bg-primary" : "bg-emerald-500"
            )}
          />
          <AnimatePresence>
            {expanded && (
              <motion.span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider whitespace-nowrap",
                  role === "ADMIN" ? "text-primary" : "text-emerald-600"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {role === "ADMIN" ? "Administrador" : "Assinante"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
