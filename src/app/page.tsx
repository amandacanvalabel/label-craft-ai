import Header from "@/components/home/Header";
import HeroHome from "@/components/home/HeroHome";
import BeneficiosCarrousel from "@/components/home/BeneficiosCarrousel";
import DemonstrationCentral from "@/components/home/DemonstrationCentral";
import Planos from "@/components/home/Planos";
import Avaliacoes from "@/components/home/Avaliacoes";
import Footer from "@/components/home/Footer";
import TrackPageView from "@/components/home/TrackPageView";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";

const HomePage = async () => {
  const [settings, session] = await Promise.all([getSiteSettings(), getSession()]);
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
      <TrackPageView />
      <Header />
      <HeroHome />
      <BeneficiosCarrousel />
      <DemonstrationCentral />
      <Planos />
      <Avaliacoes />
      <Footer />
    </>
  );
};

export default HomePage;
