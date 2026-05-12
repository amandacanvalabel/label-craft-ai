"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineBuildingOffice2,
  HiOutlineBeaker,
  HiOutlineQrCode,
  HiOutlineLightBulb,
} from "react-icons/hi2";

interface StepDadosProps {
  fields: Record<string, string>;
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

function Section({ icon: Icon, title, subtitle, children, defaultOpen = true }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[13px] font-bold text-foreground">{title}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
        <span className={"text-muted-foreground transition-transform " + (open ? "rotate-180" : "")}>▾</span>
      </button>
      {open && <div className="p-5 pt-0 space-y-4">{children}</div>}
    </div>
  );
}

export default function StepDados({ fields, onFieldChange, onNext, onPrev }: StepDadosProps) {
  const g = (k: string) => fields[k] ?? "";
  const requiredFilled = [
    { key: "ingredients", label: "Composição/ingredientes", val: g("ingredients") },
    { key: "directions", label: "Modo de uso", val: g("directions") },
    { key: "warnings", label: "Advertências e restrições", val: g("warnings") },
    { key: "expiry", label: "Prazo de validade", val: g("expiry") },
    { key: "manufacturerName", label: "Fabricante (nome)", val: g("manufacturerName") },
    { key: "manufacturerCnpj", label: "CNPJ do fabricante", val: g("manufacturerCnpj") },
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

        <div className="space-y-4">
          <Section icon={HiOutlineBeaker} title="Uso, dicas e advertências" subtitle="Modo de uso, dicas e precauções que vão no verso do rótulo">
            <div className="space-y-1.5">
              <RequiredLabel filled={Boolean(g("directions").trim())}>Modo de Uso</RequiredLabel>
              <textarea
                value={g("directions")}
                onChange={(e) => onFieldChange("directions", e.target.value)}
                placeholder="Ex: Aplicar sobre a pele limpa e seca, massageando até completa absorção."
                rows={3}
                className={inputCls + " resize-none"}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <HiOutlineLightBulb className="w-3.5 h-3.5 text-amber-500" /> Dicas (opcional)
              </label>
              <textarea
                value={g("tips")}
                onChange={(e) => onFieldChange("tips", e.target.value)}
                placeholder="Ex: Para melhor resultado, aplicar com a pele úmida após o banho."
                rows={2}
                className={inputCls + " resize-none"}
              />
            </div>

            <div className="space-y-1.5">
              <RequiredLabel filled={Boolean(g("warnings").trim())}>Precauções / Advertências</RequiredLabel>
              <textarea
                value={g("warnings")}
                onChange={(e) => onFieldChange("warnings", e.target.value)}
                placeholder="Ex: Uso externo. Evite contato com os olhos. Manter fora do alcance de crianças."
                rows={3}
                className={inputCls + " resize-none"}
              />
            </div>
          </Section>

          <Section icon={HiOutlineBeaker} title="Ingredientes (INCI)" subtitle="Português e/ou inglês — ou link para QR-Code">
            <div className="space-y-1.5">
              <RequiredLabel filled={Boolean(g("ingredients").trim())}>Composição (resumo principal)</RequiredLabel>
              <textarea
                value={g("ingredients")}
                onChange={(e) => onFieldChange("ingredients", e.target.value)}
                placeholder="Ex: Aqua, Glycerin, Cetearyl Alcohol, Parfum, Phenoxyethanol..."
                rows={3}
                className={inputCls + " resize-none"}
              />
              <p className="text-[9px] text-muted-foreground">Use nomenclatura INCI quando disponível.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">Ingredientes em Português</label>
                <textarea
                  value={g("ingredientsPT")}
                  onChange={(e) => onFieldChange("ingredientsPT", e.target.value)}
                  placeholder="Versão em português (opcional)"
                  rows={3}
                  className={inputCls + " resize-none"}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">Ingredientes em Inglês</label>
                <textarea
                  value={g("ingredientsEN")}
                  onChange={(e) => onFieldChange("ingredientsEN", e.target.value)}
                  placeholder="English INCI (opcional)"
                  rows={3}
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <HiOutlineQrCode className="w-3.5 h-3.5 text-primary" /> Link para QR-Code (opcional)
              </label>
              <input
                value={g("ingredientsLink")}
                onChange={(e) => onFieldChange("ingredientsLink", e.target.value)}
                placeholder="https://meusite.com/produto/ingredientes.pdf"
                className={inputCls}
              />
              <p className="text-[9px] text-muted-foreground">
                Se informado, será gerado um QR-Code que aponta para esse link no rótulo.
              </p>
            </div>
          </Section>

          <Section icon={HiOutlineShieldCheck} title="Validade, lote e código de barras">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <RequiredLabel filled={Boolean(g("expiry").trim())}>Prazo de Validade</RequiredLabel>
                <input
                  value={g("expiry")}
                  onChange={(e) => onFieldChange("expiry", e.target.value)}
                  placeholder="Ex: 24 meses após fabricação"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">Lote</label>
                <input
                  value={g("batch")}
                  onChange={(e) => onFieldChange("batch", e.target.value)}
                  placeholder="Ex: L20260510"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground">Código de Barras (EAN-13)</label>
              <input
                value={g("barcode")}
                onChange={(e) => onFieldChange("barcode", e.target.value.replace(/\D/g, "").slice(0, 13))}
                placeholder="13 dígitos numéricos"
                inputMode="numeric"
                className={inputCls}
              />
              <p className="text-[9px] text-muted-foreground">
                O código de barras será gerado vetorialmente no rótulo final.
              </p>
            </div>
          </Section>

          <Section icon={HiOutlineBuildingOffice2} title="Fabricante" subtitle="Dados obrigatórios para a rotulagem ANVISA">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <RequiredLabel filled={Boolean(g("manufacturerName").trim())}>Nome da Indústria</RequiredLabel>
                <input
                  value={g("manufacturerName")}
                  onChange={(e) => onFieldChange("manufacturerName", e.target.value)}
                  placeholder="Razão social"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <RequiredLabel filled={Boolean(g("manufacturerCnpj").trim())}>CNPJ</RequiredLabel>
                <input
                  value={g("manufacturerCnpj")}
                  onChange={(e) => onFieldChange("manufacturerCnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">IE (se houver)</label>
                <input
                  value={g("manufacturerIe")}
                  onChange={(e) => onFieldChange("manufacturerIe", e.target.value)}
                  placeholder="Inscrição estadual"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">Químico Responsável (CRQ)</label>
                <input
                  value={g("manufacturerChemist")}
                  onChange={(e) => onFieldChange("manufacturerChemist", e.target.value)}
                  placeholder="Ex: CRQ-V 12345"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground">Endereço Completo</label>
              <input
                value={g("manufacturerAddress")}
                onChange={(e) => onFieldChange("manufacturerAddress", e.target.value)}
                placeholder="Rua, número, bairro, cidade, UF, CEP"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground">País / Indústria</label>
              <input
                value={g("manufacturerCountry")}
                onChange={(e) => onFieldChange("manufacturerCountry", e.target.value)}
                placeholder="Indústria Brasileira"
                className={inputCls}
              />
            </div>
          </Section>

          <Section icon={HiOutlineBuildingOffice2} title="Fornecedor Exclusivo (opcional)" subtitle="Use se o produto é distribuído por terceiros" defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">Nome</label>
                <input
                  value={g("supplierName")}
                  onChange={(e) => onFieldChange("supplierName", e.target.value)}
                  placeholder="Razão social"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">CNPJ</label>
                <input
                  value={g("supplierCnpj")}
                  onChange={(e) => onFieldChange("supplierCnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">IE (se houver)</label>
                <input
                  value={g("supplierIe")}
                  onChange={(e) => onFieldChange("supplierIe", e.target.value)}
                  placeholder="Inscrição estadual"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">Endereço</label>
                <input
                  value={g("supplierAddress")}
                  onChange={(e) => onFieldChange("supplierAddress", e.target.value)}
                  placeholder="Endereço completo"
                  className={inputCls}
                />
              </div>
            </div>
          </Section>
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
