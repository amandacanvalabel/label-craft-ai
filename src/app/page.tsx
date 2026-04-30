import Header from "@/components/home/Header";
import HeroHome from "@/components/home/HeroHome";
import BeneficiosCarrousel from "@/components/home/BeneficiosCarrousel";
import DemonstrationCentral from "@/components/home/DemonstrationCentral";
import Planos from "@/components/home/Planos";
import Avaliacoes from "@/components/home/Avaliacoes";
import Footer from "@/components/home/Footer";
import TrackPageView from "@/components/home/TrackPageView";

const HomePage = () => {
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
