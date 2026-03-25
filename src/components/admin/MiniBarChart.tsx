"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface MiniBarChartProps {
  data: BarData[];
  height?: number;
  className?: string;
}

const MiniBarChart = ({ data, height = 120, className }: MiniBarChartProps) => {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height }}>
      {data.map((bar, i) => {
        const h = max > 0 ? (bar.value / max) * 100 : 0;
        return (
          <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold text-foreground">{bar.value}</span>
            <motion.div
              className={cn("w-full rounded-t-lg min-h-[4px]", bar.color || "bg-primary")}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
            />
            <span className="text-[9px] text-muted-foreground font-medium">{bar.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MiniBarChart;
