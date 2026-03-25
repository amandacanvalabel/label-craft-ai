"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  delay?: number;
  sparkline?: number[];
}

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

const StatCard = ({ label, value, change, icon: Icon, iconColor = "text-primary bg-primary/10", delay = 0, sparkline }: StatCardProps) => {
  const isPositive = change !== undefined && change >= 0;
  const baseColor = iconColor.split(" ")[0]?.replace("text-", "") || "primary";

  return (
    <motion.div
      className="group relative bg-white dark:bg-[#12121a] rounded-2xl p-5 border border-border/40 dark:border-white/8 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl", iconColor.split(" ")[1]?.replace("/10", "/5") || "bg-primary/5")} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full",
              isPositive ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15" : "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/15"
            )}>
              {isPositive ? <HiArrowTrendingUp className="w-3 h-3" /> : <HiArrowTrendingDown className="w-3 h-3" />}
              {isPositive ? "+" : ""}{change}%
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
          </div>
          {sparkline && <MiniSparkline data={sparkline} color={`var(--color-${baseColor}, #2563eb)`} />}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
