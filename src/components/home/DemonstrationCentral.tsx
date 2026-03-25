"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlinePaintBrush,
  HiOutlineShieldCheck,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";

const steps = [
  {
    id: 1,
    icon: HiOutlineSparkles,
    title: "Descreva seu produto",
    description:
      "Informe o nicho, nome do produto e ingredientes. Nossa IA faz o resto.",
    visual: {
      label: "Molho de Tomate Artesanal",
      elements: ["Nome do produto", "Ingredientes", "Peso líquido: 350g"],
      color: "from-blue-500 to-cyan-400",
    },
  },
  {
    id: 2,
    icon: HiOutlinePaintBrush,
    title: "Personalize o design",
    description:
      "Use o editor visual para ajustar cores, fontes, imagens e layout do rótulo.",
    visual: {
      label: "Editor Visual",
      elements: ["Camadas", "Tipografia", "Paleta de cores"],
      color: "from-violet-500 to-purple-400",
    },
  },
  {
    id: 3,
    icon: HiOutlineShieldCheck,
    title: "Validação ANVISA",
    description:
      "O sistema verifica automaticamente a conformidade com todas as normas obrigatórias.",
    visual: {
      label: "Conformidade",
      elements: ["Tabela nutricional ✓", "Alergênicos ✓", "Rotulagem frontal ✓"],
      color: "from-emerald-500 to-teal-400",
    },
  },
  {
    id: 4,
    icon: HiOutlineArrowDownTray,
    title: "Exporte e imprima",
    description:
      "Baixe em alta resolução com perfil CMYK, pronto para enviar à gráfica.",
    visual: {
      label: "Exportação",
      elements: ["PDF 300 DPI", "CMYK pronto", "Sangria inclusa"],
      color: "from-amber-500 to-orange-400",
    },
  },
];

const DemonstrationCentral = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="demonstracao" className="relative py-28 overflow-hidden">
      <div className="blur-brush-blue top-0 left-1/4 opacity-20" />
      <div className="blur-brush-cyan bottom-0 right-1/4 opacity-15" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            Como funciona
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Do zero ao rótulo perfeito em{" "}
            <span className="gradient-text">4 passos</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Um fluxo simplificado para que qualquer pessoa crie rótulos
            profissionais sem experiência em design.
          </p>
        </motion.div>

        {/* Interactive Demo */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps List */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;

              return (
                <motion.button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "neo-card shadow-lg border-l-4 border-l-primary"
                      : "hover:bg-muted/50 border-l-4 border-l-transparent"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive
                          ? "gradient-primary text-white shadow-lg shadow-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary">
                          {String(step.id).padStart(2, "0")}
                        </span>
                        <h3
                          className={`font-bold transition-colors ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.title}
                        </h3>
                      </div>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm text-muted-foreground mt-2 leading-relaxed"
                          >
                            {step.description}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Visual Preview */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="neo-card p-8 min-h-[420px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="pattern-grid absolute inset-0 opacity-40" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative z-10 w-full max-w-sm"
                >
                  {/* Step Visual Card */}
                  <div className="glass rounded-2xl p-6 space-y-5">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${steps[activeStep].visual.color} flex items-center justify-center shadow-lg mx-auto`}
                    >
                      {(() => {
                        const StepIcon = steps[activeStep].icon;
                        return <StepIcon className="w-7 h-7 text-white" />;
                      })()}
                    </div>

                    <h4 className="text-center font-bold text-lg">
                      {steps[activeStep].visual.label}
                    </h4>

                    <div className="space-y-3">
                      {steps[activeStep].visual.elements.map((el, i) => (
                        <motion.div
                          key={el}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-center gap-3 bg-muted/80 rounded-xl px-4 py-3"
                        >
                          <div className="w-2 h-2 rounded-full gradient-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground">
                            {el}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex items-center gap-2 mt-8 relative z-10">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeStep
                        ? "w-8 gradient-primary"
                        : "w-2 bg-border hover:bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Glow */}
            <div className="absolute -inset-6 -z-10 gradient-primary opacity-5 blur-3xl rounded-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DemonstrationCentral;
