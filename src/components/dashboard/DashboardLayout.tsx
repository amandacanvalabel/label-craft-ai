"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "ADMIN" | "SUBSCRIBER";
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUBSCRIBER";
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const siteSettings = useSiteSettings();
  // O estúdio (editor v2) é full-screen e tem sua própria topbar — renderiza
  // sem o chrome do dashboard (Sidebar/Topbar/padding).
  const fullscreen = pathname?.startsWith("/dashboard/estudio-ia");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    const theme = stored || siteSettings.defaultTheme;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark));
  }, [siteSettings.defaultTheme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
            <span className="text-white font-bold text-sm">{siteSettings.siteName.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Estúdio full-screen: sem Sidebar/Topbar/padding (a auth acima já rodou).
  if (fullscreen) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f5f7fa] dark:bg-[#0a0a0f] transition-colors duration-300">
      <Sidebar
        role={role}
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />
      <Topbar user={user} sidebarExpanded={sidebarExpanded} />

      <motion.main
        className="pt-16 min-h-screen transition-all duration-300"
        animate={{ paddingLeft: sidebarExpanded ? 256 : 72 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="p-6">{children}</div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
