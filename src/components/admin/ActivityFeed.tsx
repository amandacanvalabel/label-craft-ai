"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
  color?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const ActivityFeed = ({ activities, maxItems = 6 }: ActivityFeedProps) => (
  <div className="space-y-1">
    {activities.slice(0, maxItems).map((act, i) => (
      <motion.div
        key={act.id}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 dark:hover:bg-white/[0.03] transition-colors group"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
      >
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm", act.color || "bg-primary/10 text-primary")}>
          {act.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{act.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{act.description}</p>
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">{act.time}</span>
      </motion.div>
    ))}
  </div>
);

export default ActivityFeed;
