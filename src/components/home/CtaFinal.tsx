"use client";

import { motion } from "framer-motion";
import { HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineSparkles } from "react-icons/hi2";

/**
 * CtaFinal — último empurrão antes do rodapé.
 * Fala do custo de NÃO resolver (tempo parado, lote que volta) e leva pra
 * captura (#planos). O link pra IA fica discreto, como alternativa.
 */
const CtaFinal = () => {
  return (
    <section className="relative py-24 sm:py-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          className="relative overflow-hidden rounded-3xl gradient-primary text-white px-8 py-14 sm:px-16 sm:py-20 text-center shadow-2xl shadow-primary/30"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          {/* brilho de fundo */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 text-sm font-semibold bg-white/15 border border-white/25 px-4 py-1.5 rounded-full">
              <HiOutlineShieldCheck className="w-4 h-4" />
              Primeiro rótulo grátis · Sem cartão de crédito
            </span>

            <h2 className="mt-7 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
              Quanto está custando{" "}
              <span className="underline decoration-white/40 decoration-4 underline-offset-4">
                não ter
              </span>{" "}
              o rótulo certo?
            </h2>

            <p className="mt-6 text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
              Cada semana sem rótulo é um produto parado na prateleira. Cada erro
              é um lote que volta. Resolva isso hoje — em minutos, dentro da norma,
              e sem pagar um designer.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#planos"
                className="group inline-flex items-center gap-2 bg-white text-primary font-bold text-base rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Criar meu rótulo agora
                <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/canvalabel-alimentos.html"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-base px-6 py-4 rounded-full border border-white/30 hover:border-white/60 transition-all duration-300"
              >
                <HiOutlineSparkles className="w-5 h-5" />
                Prefere ver antes? Gere uma prévia com IA
              </a>
            </div>

            <p className="mt-6 text-sm text-white/70">
              Plano grátis com 2 rótulos · Pagos a partir de R$ 13/mês · Cancele quando quiser
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaFinal;
