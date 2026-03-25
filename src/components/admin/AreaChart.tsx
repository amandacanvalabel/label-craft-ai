"use client";

import { motion } from "framer-motion";

interface AreaChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const AreaChart = ({
  data,
  labels,
  height = 180,
  color = "#2563eb",
  gradientFrom = "rgba(37,99,235,0.3)",
  gradientTo = "rgba(37,99,235,0)",
}: AreaChartProps) => {
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const range = max - min || 1;
  const w = 100;
  const h = 100;
  const id = `area-${color.replace("#", "")}`;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * h,
  }));

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(" ");
  const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`;

  return (
    <div style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h + 10}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill={`url(#${id})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill="white"
            stroke={color}
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
          />
        ))}
      </svg>
      {labels && (
        <div className="flex justify-between mt-2 px-1">
          {labels.map((l) => (
            <span key={l} className="text-[9px] text-muted-foreground font-medium">{l}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AreaChart;
