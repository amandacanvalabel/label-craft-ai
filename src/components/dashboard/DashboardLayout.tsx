"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
            <span className="text-white font-bold text-sm">CL</span>
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
