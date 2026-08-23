// src/app/page.tsx
// Homepage do CanvaLabel — nova landing (design do Claude Design) nativa em React,
// preservando modo manutenção, JSON-LD (SEO) e o tracking de pageview.
import JsonLd from "@/components/home/JsonLd";
import TrackPageView from "@/components/home/TrackPageView";
import LandingV2 from "@/components/home/LandingV2";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";

const HomePage = async () => {
  const [settings, session] = await Promise.all([
    getSiteSettings(),
    getSession(),
  ]);
  const canBypassMaintenance = session?.role === "ADMIN";

  if (settings.maintenanceMode && !canBypassMaintenance) {
    return (
      <main className="min-h-screen bg-[#f5f7fa] dark:bg-[#0a0a0f] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">{settings.siteName.slice(0, 2).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Site em manutenção</h1>
          <p className="text-sm text-muted-foreground">
            Estamos atualizando {settings.siteName}. Tente novamente em instantes.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <JsonLd />
      <TrackPageView />
      <LandingV2 />
    </>
  );
};

export default HomePage;
