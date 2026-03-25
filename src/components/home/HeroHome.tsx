"use client";

import { motion } from "framer-motion";
import { HiOutlineSparkles, HiOutlinePlay } from "react-icons/hi2";

const HeroHome = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
      {/* Background Effects */}
      <div className="absolute inset-0 pattern-dots opacity-40" />
      <div className="blur-brush-blue top-20 -left-40 opacity-60" />
      <div className="blur-brush-cyan bottom-20 -right-32 opacity-50" />
      <div className="blur-brush-blue top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 gradient-primary-soft text-primary text-sm font-semibold px-5 py-2 rounded-full border border-primary/10">
            <HiOutlineSparkles className="w-4 h-4" />
            Geração de rótulos com Inteligência Artificial
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Crie rótulos profissionais{" "}
          <span className="gradient-text">em minutos</span>, não em dias
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Em conformidade com as normas da ANVISA, pronto para impressão e com
          design que destaca seu produto na prateleira.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <a
            href="#planos"
            className="group relative inline-flex items-center gap-2 gradient-primary text-white font-semibold text-base rounded-full px-8 py-4 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
          >
            Começar Agora — Grátis
            <HiOutlineSparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </a>
          <button className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-base px-6 py-4 rounded-full border border-border hover:border-foreground/20 transition-all duration-300 neo-card">
            <HiOutlinePlay className="w-5 h-5" />
            Ver Demonstração
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-20 flex flex-wrap items-center justify-center gap-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          {[
            { value: "10k+", label: "Rótulos criados" },
            { value: "99%", label: "Em conformidade" },
            { value: "2min", label: "Tempo médio" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold gradient-text">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Animated Editor Preview */}
        <motion.div
          className="mt-20 relative mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="neo-card p-1.5 sm:p-2 overflow-hidden">
            <div className="rounded-xl bg-white border border-border/60 overflow-hidden">
              {/* Editor Top Bar */}
              <motion.div
                className="flex items-center justify-between px-4 py-2.5 bg-muted/60 border-b border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="h-5 w-px bg-border/60" />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Rótulo — Molho Artesanal.canva
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="px-2.5 py-1 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-600"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.5, duration: 0.3 }}
                  >
                    ANVISA ✓
                  </motion.div>
                  <div className="px-2.5 py-1 rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                    Salvo
                  </div>
                </div>
              </motion.div>

              <div className="flex" style={{ height: 380 }}>
                {/* Left Sidebar - Tools */}
                <motion.div
                  className="w-12 bg-muted/30 border-r border-border/40 flex flex-col items-center py-3 gap-2.5 shrink-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                >
                  {[
                    "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z",
                    "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5",
                    "M4 6h16M4 12h16M4 18h10",
                    "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
                    "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14",
                  ].map((path, i) => (
                    <motion.div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                        i === 0
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground/50 hover:bg-muted/60"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.08 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Canvas Area */}
                <div className="flex-1 bg-[#f8f9fb] relative overflow-hidden">
                  <div className="pattern-grid absolute inset-0 opacity-30" />

                  {/* Canvas - Label */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[280px] sm:w-[320px] h-[200px] sm:h-[220px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border border-border/30 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 1.4, duration: 0.6, type: "spring" }}
                  >
                    {/* Label Header */}
                    <motion.div
                      className="h-14 bg-gradient-to-r from-red-500 via-red-600 to-red-700 flex items-center px-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8, duration: 0.4 }}
                    >
                      <motion.span
                        className="text-white font-extrabold text-sm tracking-wide"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2, duration: 0.3 }}
                      >
                        MOLHO ARTESANAL
                      </motion.span>
                    </motion.div>

                    {/* Label Body */}
                    <div className="p-3 space-y-2">
                      <motion.div
                        className="flex justify-between items-start"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.2 }}
                      >
                        <div className="space-y-1">
                          <div className="h-2 w-24 bg-foreground/70 rounded-full" />
                          <div className="h-1.5 w-32 bg-muted-foreground/20 rounded-full" />
                          <div className="h-1.5 w-28 bg-muted-foreground/20 rounded-full" />
                        </div>
                        {/* Nutrition Table Mini */}
                        <motion.div
                          className="w-20 border border-foreground/20 rounded p-1 space-y-0.5"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 2.6, duration: 0.3 }}
                        >
                          <div className="text-[6px] font-bold text-foreground text-center border-b border-foreground/20 pb-0.5">
                            TABELA NUTRICIONAL
                          </div>
                          {[40, 32, 28, 24, 20].map((w, i) => (
                            <div key={i} className="flex justify-between">
                              <div className={`h-1 bg-foreground/30 rounded-full`} style={{ width: w }} />
                              <div className="h-1 w-3 bg-foreground/20 rounded-full" />
                            </div>
                          ))}
                        </motion.div>
                      </motion.div>

                      {/* Ingredients */}
                      <motion.div
                        className="space-y-0.5 mt-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.4 }}
                      >
                        <div className="h-1.5 w-16 bg-foreground/50 rounded-full" />
                        <div className="h-1 w-full bg-muted-foreground/15 rounded-full" />
                        <div className="h-1 w-4/5 bg-muted-foreground/15 rounded-full" />
                      </motion.div>

                      {/* Bottom bar */}
                      <motion.div
                        className="flex items-center justify-between pt-1.5 border-t border-border/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.8 }}
                      >
                        <div className="h-1 w-14 bg-muted-foreground/20 rounded-full" />
                        <div className="flex gap-1">
                          <div className="w-4 h-4 rounded bg-foreground/10" />
                          <div className="w-4 h-4 rounded bg-foreground/10" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Selection handles */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[286px] sm:w-[326px] h-[206px] sm:h-[226px] -translate-x-1/2 -translate-y-1/2 border-2 border-primary/60 rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0.6, 1] }}
                    transition={{ delay: 3, duration: 1 }}
                  >
                    {[
                      "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
                      "top-0 right-0 translate-x-1/2 -translate-y-1/2",
                      "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
                      "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
                    ].map((pos, i) => (
                      <div
                        key={i}
                        className={`absolute ${pos} w-2.5 h-2.5 bg-white border-2 border-primary rounded-sm`}
                      />
                    ))}
                  </motion.div>

                  {/* AI Sparkle Cursor */}
                  <motion.div
                    className="absolute z-20"
                    initial={{ opacity: 0, top: "30%", left: "25%" }}
                    animate={{
                      opacity: [0, 1, 1, 1, 0],
                      top: ["30%", "30%", "45%", "55%", "55%"],
                      left: ["25%", "35%", "55%", "65%", "65%"],
                    }}
                    transition={{ delay: 3.5, duration: 3, ease: "easeInOut" }}
                  >
                    <div className="w-5 h-5 gradient-primary rounded-full shadow-lg shadow-primary/40 flex items-center justify-center">
                      <HiOutlineSparkles className="w-3 h-3 text-white" />
                    </div>
                  </motion.div>
                </div>

                {/* Right Panel - Properties */}
                <motion.div
                  className="w-48 bg-white border-l border-border/40 p-3 space-y-4 shrink-0 hidden sm:block"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                >
                  {/* Layers */}
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Camadas
                    </div>
                    {[
                      { name: "Header", color: "bg-red-400", active: true },
                      { name: "Produto", color: "bg-blue-400", active: false },
                      { name: "Tabela Nutricional", color: "bg-emerald-400", active: false },
                      { name: "Ingredientes", color: "bg-amber-400", active: false },
                      { name: "Código de Barras", color: "bg-violet-400", active: false },
                    ].map((layer, i) => (
                      <motion.div
                        key={layer.name}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] mb-1 transition-colors ${
                          layer.active
                            ? "bg-primary/8 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted/50"
                        }`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.6 + i * 0.1 }}
                      >
                        <div className={`w-2 h-2 rounded-sm ${layer.color}`} />
                        {layer.name}
                      </motion.div>
                    ))}
                  </div>

                  {/* Properties */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2 }}
                  >
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Propriedades
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Largura", value: "80mm" },
                        { label: "Altura", value: "50mm" },
                        { label: "DPI", value: "300" },
                      ].map((prop) => (
                        <div key={prop.label} className="flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground">
                            {prop.label}
                          </span>
                          <span className="text-[10px] font-mono font-semibold bg-muted/60 px-1.5 py-0.5 rounded text-foreground">
                            {prop.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* AI Status */}
                  <motion.div
                    className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-2.5 border border-primary/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <HiOutlineSparkles className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary">
                        IA Ativa
                      </span>
                    </div>
                    <motion.div
                      className="h-1.5 bg-muted rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 3.2 }}
                    >
                      <motion.div
                        className="h-full gradient-primary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 3.4, duration: 2, ease: "easeOut" }}
                      />
                    </motion.div>
                    <motion.span
                      className="text-[9px] text-primary/70 mt-1 block"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 5.5 }}
                    >
                      Rótulo gerado com sucesso
                    </motion.span>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
          {/* Glow effect behind */}
          <div className="absolute -inset-4 -z-10 gradient-primary opacity-10 blur-3xl rounded-3xl" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroHome;
