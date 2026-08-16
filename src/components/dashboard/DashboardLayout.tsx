"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AnnouncementBanner from "./AnnouncementBanner";
import SupportWidget from "./SupportWidget";
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
    const theme = stored || siteSettings.defaultTheme || "light";
    // O painel abre em modo CLARO por padrão (mais legível) e NÃO segue
    // automaticamente o tema escuro do sistema operacional. Só fica escuro se o
    // usuário escolher explicitamente "dark" no botão de tema (fica salvo).
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [siteSettings.defaultTheme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.png" alt={siteSettings.siteName} className="w-14 h-14 object-contain animate-pulse" />
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
    <div className="dash-root min-h-screen bg-[#f5f7fa] dark:bg-[#0a0a0f] transition-colors duration-300">
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
        <div className="p-6">
          {role === "SUBSCRIBER" && <AnnouncementBanner />}
          {children}
        </div>
      </motion.main>
      {role === "SUBSCRIBER" && <SupportWidget />}
    </div>
  );
};

export default DashboardLayout;
