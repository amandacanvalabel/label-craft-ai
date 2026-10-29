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
  HiOutlineTableCells,
  HiOutlineExclamationTriangle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

// Cada benefício responde a uma dor: `ganho` é o que a pessoa deixa de sofrer,
// `description` explica como a ferramenta entrega isso.
const benefits = [
  {
    icon: HiOutlineSparkles,
    title: "Layout pronto com IA",
    ganho: "Chega de começar do zero",
    description:
      "Descreva o produto em uma frase e receba o rótulo montado: layout, textos e estrutura, para alimentos ou cosméticos. Você só ajusta o que quiser.",
    color: "from-blue-500 to-cyan-400",
    bg: "bg-blue-50",
  },
  {
    icon: HiOutlineShieldCheck,
    title: "Revisor de normas da ANVISA",
    ganho: "Chega de descobrir o erro depois de imprimir",
    description:
      "32 regras da IN 75/2020, RDC 429/2020 e RDC 26/2015 conferidas antes de exportar: tamanho de letra, campos obrigatórios, advertências. Ele aponta exatamente o que falta.",
    color: "from-emerald-500 to-teal-400",
    bg: "bg-emerald-50",
  },
  {
    icon: HiOutlineTableCells,
    title: "Tabela nutricional em segundos",
    ganho: "Chega de planilha e arredondamento na mão",
    description:
      "Informe a receita ou os valores e a tabela sai no padrão do Anexo IX, com porção, %VD e arredondamento certos. Base TACO/USDA com mais de 1.000 alimentos.",
    color: "from-amber-500 to-orange-400",
    bg: "bg-amber-50",
  },
  {
    icon: HiOutlineExclamationTriangle,
    title: "Lupa “ALTO EM” e alérgenos",
    ganho: "Chega de dúvida sobre quando a lupa entra",
    description:
      "A ferramenta decide pelos seus números se o produto é alto em açúcar, sódio ou gordura saturada, e gera a lupa frontal, os alérgenos e o “contém glúten” no formato exigido.",
    color: "from-rose-500 to-pink-400",
    bg: "bg-rose-50",
  },
  {
    icon: HiOutlinePaintBrush,
    title: "Editor visual com modelos",
    ganho: "Chega de depender de designer",
    description:
      "Editor com camadas, tipografia e cores, no estilo que você já conhece. Modelos prontos para alimentos, bebidas e cosméticos, só trocar texto e imagem.",
    color: "from-violet-500 to-purple-400",
    bg: "bg-violet-50",
  },
  {
    icon: HiOutlineArrowDownTray,
    title: "PDF que a gráfica aceita",
    ganho: "Chega de arquivo voltando",
    description:
      "Exportação em 300 DPI, CMYK, com sangria de 3 mm e marcas de corte. O arquivo técnico sai pronto para imprimir, sem retrabalho.",
    color: "from-teal-500 to-emerald-400",
    bg: "bg-teal-50",
  },
  {
    icon: HiOutlineCube,
    title: "Prévia na embalagem",
    ganho: "Chega de surpresa no produto final",
    description:
      "Veja o rótulo aplicado no frasco, pote ou embalagem antes de mandar imprimir e corrija proporção e leitura com antecedência.",
    color: "from-sky-500 to-blue-400",
    bg: "bg-sky-50",
  },
  {
    icon: HiOutlineBolt,
    title: "Alimentos e cosméticos juntos",
    ganho: "Chega de duas ferramentas",
    description:
      "Tabela nutricional e lupa para alimentos; INCI, modo de uso e advertências para cosméticos. Cada categoria pede só os campos que a norma exige.",
    color: "from-indigo-500 to-blue-400",
    bg: "bg-indigo-50",
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
              O que muda no seu dia a dia
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Tudo o que você fazia na mão,{" "}
              <span className="gradient-text">resolvido em um só lugar</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Layout, tabela nutricional, lupa “ALTO EM”, alérgenos, revisão
              das normas e PDF pra gráfica. Arraste pro lado e veja cada
              problema que deixa de existir.
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
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">
                  {benefit.ganho}
                </p>
                <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {benefit.description}
                </p>
                <div className="mt-5 pt-4 border-t border-border/40">
                  <a
                    href="#planos"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Testar grátis →
                  </a>
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
