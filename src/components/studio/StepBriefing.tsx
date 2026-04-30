"use client";

import { motion } from "framer-motion";
import { HiOutlineArrowRight, HiOutlineClipboardDocument } from "react-icons/hi2";

interface ProductFields {
  productName: string;
  brandName: string;
  weight: string;
  category: string;
  packaging: string;
  registration: string;
  sac: string;
  [key: string]: string;
}

interface StepBriefingProps {
  fields: ProductFields;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

const categories = ["Cosméticos"];
const packagings = ["Pote", "Frasco", "Bisnaga", "Pump", "Spray", "Roll-on", "Sachê", "Outro"];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";
const selectCls = inputCls + " appearance-none";

export default function StepBriefing({ fields, onChange, onNext }: StepBriefingProps) {
  const canAdvance = fields.productName.trim() && fields.brandName.trim() && fields.weight.trim() && fields.category.trim();

  return (
    <div className="flex-1 overflow-auto flex items-start justify-center p-8">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <HiOutlineClipboardDocument className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Briefing do Produto</h1>
            <p className="text-sm text-muted-foreground">Preencha as informações básicas antes de criar o rótulo</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-6 space-y-5">
          <Field label="Nome do Produto" required>
            <input
              className={inputCls}
              value={fields.productName}
              onChange={(e) => onChange("productName", e.target.value)}
              placeholder="Ex: Creme Hidratante Facial"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Marca" required>
              <input
                className={inputCls}
                value={fields.brandName}
                onChange={(e) => onChange("brandName", e.target.value)}
                placeholder="Ex: Dermaviva"
              />
            </Field>
            <Field label="Categoria" required>
              <select
                className={selectCls}
                value={fields.category}
                onChange={(e) => onChange("category", e.target.value)}
              >
                <option value="">Selecione...</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Peso / Volume Líquido" required>
              <input
                className={inputCls}
                value={fields.weight}
                onChange={(e) => onChange("weight", e.target.value)}
                placeholder="Ex: 50g, 120ml, 200ml"
              />
            </Field>
            <Field label="Tipo de Embalagem">
              <select
                className={selectCls}
                value={fields.packaging}
                onChange={(e) => onChange("packaging", e.target.value)}
              >
                <option value="">Selecione...</option>
                {packagings.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Processo ANVISA / Autorização">
              <input
                className={inputCls}
                value={fields.registration}
                onChange={(e) => onChange("registration", e.target.value)}
                placeholder="Ex: 25351.000000/2026-00"
              />
            </Field>
            <Field label="SAC">
              <input
                className={inputCls}
                value={fields.sac}
                onChange={(e) => onChange("sac", e.target.value)}
                placeholder="Ex: 0800 123 4567"
              />
            </Field>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onNext}
            disabled={!canAdvance}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próximo: Dados Obrigatórios
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
