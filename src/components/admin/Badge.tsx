"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default" | "primary";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
  error: "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400",
  info: "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
  primary: "bg-primary/10 text-primary",
  default: "bg-muted dark:bg-white/8 text-muted-foreground",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const Badge = ({ children, variant = "default", dot, className }: BadgeProps) => (
  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full", variantStyles[variant], className)}>
    {dot && <span className={cn("w-1.5 h-1.5 rounded-full", variant === "success" ? "bg-emerald-500" : variant === "error" ? "bg-red-500" : variant === "warning" ? "bg-amber-500" : "bg-current")} />}
    {children}
  </span>
);

export default Badge;
