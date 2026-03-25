"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlinePaintBrush,
  HiOutlineBolt,
  HiOutlineArrowDownTray,
  HiOutlineCube,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

const benefits = [
  {
    icon: HiOutlineSparkles,
    title: "IA Generativa",
    description:
      "Gere rótulos completos com inteligência artificial. Textos, tabelas nutricionais e layouts em segundos.",
    color: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Conformidade ANVISA",
    description:
      "Validação automática em tempo real. Todos os elementos obrigatórios verificados antes da exportação.",
    color: "from-emerald-500 to-teal-400",
    bg: "bg-emerald-50",
  },
  {
    icon: HiOutlinePaintBrush,
    title: "Editor Profissional",
    description:
      "Editor visual completo tipo Canva com ferramentas avançadas de design, camadas e tipografia.",
    color: "from-violet-500 to-purple-400",
    bg: "bg-violet-50",
  },
  {
    icon: HiOutlineBolt,
    title: "Templates Prontos",
    description:
      "Centenas de modelos editáveis para alimentos, bebidas, cosméticos, farmacêuticos e mais.",
    color: "from-amber-500 to-orange-400",
    bg: "bg-amber-50",
  },
  {
    icon: HiOutlineArrowDownTray,
    title: "Exportação HD",
    description:
      "Exporte em alta resolução (300 DPI) com perfil CMYK pronto para enviar direto para a gráfica.",
    color: "from-rose-500 to-pink-400",
    bg: "bg-rose-50",
  },
  {
    icon: HiOutlineCube,
    title: "Mockup 3D",
    description:
      "Visualize seu rótulo aplicado no produto em 3D antes de imprimir. Impressione seus clientes.",
    color: "from-sky-500 to-blue-400",
    bg: "bg-sky-50",
  },
];

const BeneficiosCarrousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 340;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section id="beneficios" className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/50" />
      <div className="blur-brush-cyan -top-40 -right-40 opacity-30" />
      <div className="blur-brush-blue -bottom-40 -left-40 opacity-20" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Benefícios
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Tudo que você precisa em{" "}
              <span className="gradient-text">um só lugar</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Da criação à impressão, nossa plataforma cuida de cada etapa do
              processo de rotulagem.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Netflix-style Carousel */}
        <div className="relative -mx-6">
          {/* Fade edges */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-muted/80 to-transparent z-10 pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-muted/80 to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto scrollbar-hide px-6 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group min-w-[310px] max-w-[310px] snap-start neo-card p-7 transition-all duration-300 cursor-default hover:shadow-xl hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full ${benefit.bg} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <span className="text-xs font-bold text-foreground/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {benefit.description}
                </p>
                <div className="mt-5 pt-4 border-t border-border/40">
                  <span className="text-xs font-semibold text-primary group-hover:underline cursor-pointer">
                    Saiba mais →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeneficiosCarrousel;
