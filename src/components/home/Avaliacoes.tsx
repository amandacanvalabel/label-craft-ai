"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiStar, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

const reviews = [
  {
    name: "Mariana Silva",
    role: "Produtora de Cosméticos",
    avatar: "MS",
    gradient: "from-rose-400 to-pink-500",
    rating: 5,
    text: "Economizei mais de R$ 3.000 que gastaria com designer. Meus rótulos ficaram impecáveis e em total conformidade com a ANVISA.",
    highlight: "R$ 3.000 economizados",
  },
  {
    name: "Carlos Mendes",
    role: "Dono de Cervejaria Artesanal",
    avatar: "CM",
    gradient: "from-amber-400 to-orange-500",
    rating: 5,
    text: "A validação automática é um diferencial incrível. Antes eu tinha medo de errar alguma norma, agora tenho segurança total.",
    highlight: "Segurança total",
  },
  {
    name: "Ana Beatriz",
    role: "Nutricionista e Empreendedora",
    avatar: "AB",
    gradient: "from-emerald-400 to-teal-500",
    rating: 5,
    text: "A geração de tabela nutricional com IA é perfeita. Em 2 minutos tenho tudo pronto, formatado e dentro das normas.",
    highlight: "2 minutos para criar",
  },
  {
    name: "Roberto Almeida",
    role: "Indústria Alimentícia",
    avatar: "RA",
    gradient: "from-blue-400 to-indigo-500",
    rating: 5,
    text: "Usamos o CanvaLabel para toda a nossa linha de produtos. A exportação em CMYK 300DPI vai direto para a gráfica sem nenhum ajuste.",
    highlight: "Direto para gráfica",
  },
  {
    name: "Juliana Costa",
    role: "Farmacêutica",
    avatar: "JC",
    gradient: "from-violet-400 to-purple-500",
    rating: 5,
    text: "Finalmente uma ferramenta que entende as regras da ANVISA para medicamentos e suplementos. Recomendo para todos do setor.",
    highlight: "Feito para farma",
  },
  {
    name: "Pedro Henrique",
    role: "E-commerce de Alimentos",
    avatar: "PH",
    gradient: "from-sky-400 to-blue-500",
    rating: 5,
    text: "Comecei com o plano Starter e já migrei pro Profissional. A IA gera designs incríveis que meus clientes amam.",
    highlight: "Clientes amam",
  },
];

const Avaliacoes = () => {
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
    scrollRef.current.scrollBy({
      left: direction === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  return (
    <section id="avaliacoes" className="relative py-28 overflow-hidden">
      <div className="blur-brush-blue -top-40 right-1/4 opacity-15" />
      <div className="blur-brush-cyan -bottom-40 left-1/3 opacity-20" />

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
              Avaliações
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              O que nossos clientes{" "}
              <span className="gradient-text">dizem</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Milhares de empreendedores já confiam no CanvaLabel para criar seus
              rótulos profissionais.
            </p>
          </div>

          {/* Navigation */}
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

        {/* Carousel */}
        <div className="relative -mx-6">
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          )}

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto px-6 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reviews.map((review, i) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="min-w-[340px] max-w-[340px] snap-start neo-card p-7 flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Quote mark */}
                <div className="text-5xl font-serif leading-none gradient-text opacity-30 mb-3 select-none">
                  &ldquo;
                </div>

                {/* Highlight badge */}
                <div className="mb-4">
                  <span className="inline-block text-[11px] font-bold text-primary bg-primary/8 px-3 py-1 rounded-full">
                    {review.highlight}
                  </span>
                </div>

                {/* Text */}
                <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                  {review.text}
                </p>

                {/* Stars */}
                <div className="flex gap-0.5 mt-5 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <HiStar key={j} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center shrink-0 shadow-md`}
                  >
                    <span className="text-xs font-bold text-white">
                      {review.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Avaliacoes;
