// src/app/page.tsx
// Homepage do CanvaLabel — landing de CAPTURA.
//
// Narrativa da página (de cima pra baixo):
//   Hero (dor → promessa) → Dores resolvidas → Benefícios → Calculadora da
//   lupa (prova interativa) → Como funciona → Galeria → Planos (a captura) →
//   Avaliações → FAQ (objeções) → Checklist (lead p/ quem não assina hoje) →
//   CTA final → Rodapé. Barra fixa de CTA no celular.
//
// A versão "IA logo de cara" (LandingV2) não converteu bem; a ferramenta de IA
// continua acessível como alternativa discreta no CTA final.
// Preserva modo manutenção, JSON-LD (SEO) e o tracking de pageview.
import Header from "@/components/home/Header";
import HeroHome from "@/components/home/HeroHome";
import Dores from "@/components/home/Dores";
import BeneficiosCarrousel from "@/components/home/BeneficiosCarrousel";
import LupaCalculadora from "@/components/home/LupaCalculadora";
import DemonstrationCentral from "@/components/home/DemonstrationCentral";
import GaleriaExemplos from "@/components/home/GaleriaExemplos";
import Planos from "@/components/home/Planos";
import Avaliacoes from "@/components/home/Avaliacoes";
import Faq from "@/components/home/Faq";
import ChecklistLead from "@/components/home/ChecklistLead";
import StickyCta from "@/components/home/StickyCta";
import CtaFinal from "@/components/home/CtaFinal";
import Footer from "@/components/home/Footer";
import JsonLd from "@/components/home/JsonLd";
import TrackPageView from "@/components/home/TrackPageView";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";
import { getGalleryImages } from "@/lib/gallery";

const HomePage = async () => {
  const [settings, session, galleryImages] = await Promise.all([
    getSiteSettings(),
    getSession(),
    getGalleryImages(),
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
      <Header />
      <HeroHome />
      <Dores />
      <BeneficiosCarrousel />
      <LupaCalculadora />
      <DemonstrationCentral />
      <GaleriaExemplos images={galleryImages} />
      <Planos />
      <Avaliacoes />
      <Faq />
      <ChecklistLead />
      <CtaFinal />
      <Footer />
      <StickyCta />
    </>
  );
};

export default HomePage;
