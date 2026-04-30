"use client";

import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

interface StepDadosProps {
  ingredients: string;
  warnings: string;
  directions: string;
  expiry: string;
  onFieldChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const inputCls = "w-full px-3 py-2.5 text-sm bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";

function RequiredLabel({ children, filled }: { children: React.ReactNode; filled: boolean }) {
  return (
    <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
      <span>{children} <span className="text-red-500">*</span></span>
      {filled && (
        <span className="flex items-center gap-1 text-emerald-500 text-[9px]">
          <HiOutlineCheckCircle className="w-3 h-3" />
          Preenchido
        </span>
      )}
    </label>
  );
}

export default function StepDados({
  ingredients,
  warnings,
  directions,
  expiry,
  onFieldChange,
  onNext,
  onPrev,
}: StepDadosProps) {
  const requiredFilled = [
    { key: "ingredients", label: "Composição/ingredientes", val: ingredients },
    { key: "directions", label: "Modo de uso", val: directions },
    { key: "warnings", label: "Advertências e restrições", val: warnings },
    { key: "expiry", label: "Prazo de validade", val: expiry },
  ];
  const missing = requiredFilled.filter((f) => !f.val.trim());
  const canAdvance = missing.length === 0;

  return (
    <div className="flex-1 overflow-auto flex items-start justify-center p-8">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <HiOutlineShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dados Obrigatórios</h1>
            <p className="text-sm text-muted-foreground">Campos de rotulagem para cosméticos regularizados na ANVISA</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-5">
          <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            O estúdio está configurado somente para cosméticos. Preencha composição, modo de uso,
            advertências e validade antes de avançar para o design.
          </p>
        </div>

        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5 space-y-5">
          <div className="space-y-1.5">
            <RequiredLabel filled={Boolean(ingredients.trim())}>Composição / Ingredientes</RequiredLabel>
            <textarea
              value={ingredients}
              onChange={(e) => onFieldChange("ingredients", e.target.value)}
              placeholder="Ex: Aqua, Glycerin, Cetearyl Alcohol, Parfum, Phenoxyethanol..."
              rows={4}
              className={inputCls + " resize-none"}
            />
            <p className="text-[9px] text-muted-foreground">Use nomenclatura INCI quando disponível.</p>
          </div>

          <div className="space-y-1.5">
            <RequiredLabel filled={Boolean(directions.trim())}>Modo de Uso</RequiredLabel>
            <textarea
              value={directions}
              onChange={(e) => onFieldChange("directions", e.target.value)}
              placeholder="Ex: Aplicar sobre a pele limpa e seca, massageando até completa absorção."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          <div className="space-y-1.5">
            <RequiredLabel filled={Boolean(warnings.trim())}>Advertências / Restrições</RequiredLabel>
            <textarea
              value={warnings}
              onChange={(e) => onFieldChange("warnings", e.target.value)}
              placeholder="Ex: Uso externo. Evite contato com os olhos. Manter fora do alcance de crianças."
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          <div className="space-y-1.5">
            <RequiredLabel filled={Boolean(expiry.trim())}>Prazo de Validade</RequiredLabel>
            <input
              value={expiry}
              onChange={(e) => onFieldChange("expiry", e.target.value)}
              placeholder="Ex: 24 meses após fabricação"
              className={inputCls}
            />
          </div>
        </div>

        {!canAdvance && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-600 dark:text-red-400">
              Preencha: {missing.map((f) => f.label).join(", ")}
            </p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/40 dark:bg-white/5 hover:bg-muted/60 dark:hover:bg-white/10 rounded-xl transition-all"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <button
            onClick={onNext}
            disabled={!canAdvance}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próximo: Design
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
