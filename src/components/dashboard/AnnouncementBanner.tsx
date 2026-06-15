"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineXMark, HiOutlineMegaphone, HiOutlineSparkles, HiOutlineExclamationTriangle, HiOutlineCheckCircle } from "react-icons/hi2";

interface Announcement {
  id: string;
  title: string;
  message: string;
  variant: "INFO" | "SUCCESS" | "WARNING" | "PROMO";
  linkUrl: string | null;
  linkLabel: string | null;
}

const DISMISS_KEY = "cl_dismissed_announcements";

const styles: Record<Announcement["variant"], { bar: string; icon: React.ComponentType<{ className?: string }> }> = {
  INFO: { bar: "from-sky-500/10 to-blue-500/10 border-sky-500/20 text-sky-700 dark:text-sky-300", icon: HiOutlineMegaphone },
  SUCCESS: { bar: "from-emerald-500/10 to-green-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300", icon: HiOutlineCheckCircle },
  WARNING: { bar: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300", icon: HiOutlineExclamationTriangle },
  PROMO: { bar: "from-violet-500/10 to-fuchsia-500/10 border-violet-500/20 text-violet-700 dark:text-violet-300", icon: HiOutlineSparkles },
};

function loadDismissed(): string[] {
  try { return JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]"); } catch { return []; }
}

export default function AnnouncementBanner() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(loadDismissed());
    fetch("/api/announcements")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Announcement[]) => setItems(d))
      .catch(() => {});
  }, []);

  const dismiss = (id: string) => {
    const next = [...new Set([...dismissed, id])];
    setDismissed(next);
    try { localStorage.setItem(DISMISS_KEY, JSON.stringify(next)); } catch { /* empty */ }
  };

  const visible = items.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence initial={false}>
        {visible.map((a) => {
          const s = styles[a.variant] ?? styles.INFO;
          const Icon = s.icon;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-gradient-to-r ${s.bar}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug">{a.title}</p>
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{a.message}</p>
                {a.linkUrl && (
                  <a href={a.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1.5 text-xs font-semibold underline underline-offset-2">
                    {a.linkLabel || "Saiba mais"} →
                  </a>
                )}
              </div>
              <button onClick={() => dismiss(a.id)} aria-label="Dispensar aviso" className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <HiOutlineXMark className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
