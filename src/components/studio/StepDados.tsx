"use client";

import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

export interface NutritionRow {
  name: string;
  value: string;
  unit: string;
  vd: string;
}

interface StepDadosProps {
  ingredients: string;
  allergens: string;
  expiry: string;
  nutritionData: NutritionRow[];
  servingSize: string;
  onFieldChange: (field: string, value: string) => void;
  onNutritionChange: (data: NutritionRow[]) => void;
  onServingSizeChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const inputCls = "w-full px-3 py-2.5 text-sm bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function StepDados({
  ingredients,
  allergens,
  expiry,
  nutritionData,
  servingSize,
  onFieldChange,
  onNutritionChange,
  onServingSizeChange,
  onNext,
  onPrev,
}: StepDadosProps) {
  const requiredFilled = [
    { key: "ingredients", label: "Lista de ingredientes", val: ingredients },
    { key: "allergens", label: "Alérgenos", val: allergens },
    { key: "expiry", label: "Prazo de validade", val: expiry },
  ];
  const missing = requiredFilled.filter((f) => !f.val.trim());
  const hasNutrition = nutritionData.some((r) => r.value.trim() && r.value !== "0");
  const canAdvance = missing.length === 0 && hasNutrition;

  return (
    <div className="flex-1 overflow-auto flex items-start justify-center p-8">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <HiOutlineShieldCheck className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Dados Obrigatórios</h1>
            <p className="text-sm text-muted-foreground">Campos exigidos pela RDC 429/2020 e IN 75/2020 (ANVISA)</p>
          </div>
        </div>

        {/* ⚠️ Warning banner — ponto crítico do mapa */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-5">
          <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Todos os campos marcados com <strong>*</strong> são obrigatórios pela legislação brasileira de rotulagem.
            O rótulo não avançará para o design sem eles preenchidos.
          </p>
        </div>

        <div className="space-y-4">
          {/* Ingredientes + Alérgenos + Validade */}
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                <span>Lista de Ingredientes <span className="text-red-500">*</span></span>
                {ingredients.trim() && <span className="flex items-center gap-1 text-emerald-500 text-[9px]"><HiOutlineCheckCircle className="w-3 h-3" /> Preenchido</span>}
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => onFieldChange("ingredients", e.target.value)}
                placeholder="Liste em ordem decrescente. Ex: Água, açúcar, suco concentrado de laranja (30%), ácido cítrico, aromatizante natural."
                rows={4}
                className={inputCls + " resize-none"}
              />
              <p className="text-[9px] text-muted-foreground">RDC 429/2020 Art. 12 — ordem decrescente de quantidade</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                <span>Declaração de Alérgenos <span className="text-red-500">*</span></span>
                {allergens.trim() && <span className="flex items-center gap-1 text-emerald-500 text-[9px]"><HiOutlineCheckCircle className="w-3 h-3" /> Preenchido</span>}
              </label>
              <input
                value={allergens}
                onChange={(e) => onFieldChange("allergens", e.target.value.toUpperCase())}
                placeholder="Ex: CONTÉM DERIVADOS DE TRIGO E LEITE. PODE CONTER AMENDOIM."
                className={inputCls}
              />
              <p className="text-[9px] text-muted-foreground">IN 75/2020 — deve aparecer em destaque visual no rótulo</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                <span>Prazo de Validade <span className="text-red-500">*</span></span>
                {expiry.trim() && <span className="flex items-center gap-1 text-emerald-500 text-[9px]"><HiOutlineCheckCircle className="w-3 h-3" /> Preenchido</span>}
              </label>
              <input
                value={expiry}
                onChange={(e) => onFieldChange("expiry", e.target.value)}
                placeholder="Ex: 12 meses, 180 dias"
                className={inputCls}
              />
            </div>
          </div>

          {/* Tabela Nutricional */}
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[11px] font-bold text-foreground">
                Tabela de Informação Nutricional <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-muted-foreground">Porção:</span>
                  <input
                    value={servingSize}
                    onChange={(e) => onServingSizeChange(e.target.value)}
                    className="w-20 px-2 py-1 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button className="text-[9px] font-semibold text-primary hover:underline flex items-center gap-1">
                  <HiOutlineArrowPath className="w-3 h-3" />
                  Auto-preencher
                </button>
              </div>
            </div>

            <div className="border border-border/40 dark:border-white/8 rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_70px_38px_46px] text-[9px] font-bold text-muted-foreground bg-muted/30 dark:bg-white/[0.03] px-3 py-2 uppercase tracking-wider">
                <span>Nutriente</span>
                <span className="text-center">Quantidade</span>
                <span className="text-center">Un</span>
                <span className="text-center">%VD</span>
              </div>
              {nutritionData.map((row, i) => (
                <div key={row.name} className="grid grid-cols-[1fr_70px_38px_46px] items-center px-3 py-1.5 border-t border-border/20 dark:border-white/5">
                  <span className="text-[11px] text-foreground font-medium truncate pr-2">{row.name}</span>
                  <input
                    value={row.value}
                    onChange={(e) => {
                      const updated = [...nutritionData];
                      updated[i] = { ...row, value: e.target.value };
                      onNutritionChange(updated);
                    }}
                    className="text-center text-[11px] bg-muted/20 dark:bg-white/[0.02] border border-border/30 dark:border-white/5 rounded px-1 py-0.5 text-foreground font-semibold w-full focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <span className="text-center text-[10px] text-muted-foreground">{row.unit}</span>
                  <input
                    value={row.vd}
                    onChange={(e) => {
                      const updated = [...nutritionData];
                      updated[i] = { ...row, vd: e.target.value };
                      onNutritionChange(updated);
                    }}
                    className="text-center text-[11px] bg-transparent border-none outline-none text-muted-foreground w-full px-1"
                  />
                </div>
              ))}
            </div>
            <p className="text-[8px] text-muted-foreground mt-2">*%VD — Valores Diários com base em dieta de 2.000 kcal</p>
          </div>
        </div>

        {/* Gate de bloqueio — elemento vermelho do mapa */}
        {!canAdvance && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-600 dark:text-red-400">
              {missing.length > 0
                ? `Preencha: ${missing.map((f) => f.label).join(", ")}`
                : "Preencha ao menos um valor na tabela nutricional para avançar"}
            </p>
          </div>
        )}

        {/* Navegação */}
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
