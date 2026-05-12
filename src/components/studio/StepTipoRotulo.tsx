"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCube,
  HiOutlineDocumentDuplicate,
  HiOutlinePaintBrush,
  HiOutlineCubeTransparent,
  HiOutlineArrowUpTray,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface StepTipoRotuloProps {
  fields: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const TYPES = [
  {
    id: "sleeve",
    name: "Sleeve",
    description: "Envolve toda a embalagem (termo-encolhível). Ideal para potes e frascos cilíndricos.",
    icon: HiOutlineCube,
    needsSide: false,
  },
  {
    id: "adesivo",
    name: "Adesivo",
    description: "Etiqueta autoadesiva aplicada sobre a embalagem. Pode ser frente, verso ou ambos.",
    icon: HiOutlineDocumentDuplicate,
    needsSide: true,
  },
  {
    id: "serigrafia",
    name: "Serigrafia",
    description: "Impressão direto na embalagem. Maior durabilidade e acabamento premium.",
    icon: HiOutlinePaintBrush,
    needsSide: true,
  },
  {
    id: "in-mold",
    name: "In-mold",
    description: "Rótulo integrado durante a injeção do plástico. Para grandes volumes.",
    icon: HiOutlineCubeTransparent,
    needsSide: false,
  },
] as const;

const SIDES = [
  { id: "frente", label: "Só frente" },
  { id: "verso", label: "Só verso" },
  { id: "ambos", label: "Frente e verso" },
] as const;

const inputCls =
  "w-full px-3 py-2.5 text-sm bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";

export default function StepTipoRotulo({ fields, onFieldChange, onNext, onPrev }: StepTipoRotuloProps) {
  const moldInputRef = useRef<HTMLInputElement>(null);
  const labelType = fields.labelType ?? "";
  const labelSide = fields.labelSide ?? "";
  const labelWidth = fields.labelWidth ?? "";
  const labelHeight = fields.labelHeight ?? "";
  const labelMoldUrl = fields.labelMoldUrl ?? "";

  const currentType = TYPES.find((t) => t.id === labelType);
  const needsSide = currentType?.needsSide ?? false;

  const canAdvance =
    Boolean(labelType) &&
    Boolean(labelWidth.trim()) &&
    Boolean(labelHeight.trim()) &&
    (!needsSide || Boolean(labelSide));

  const handleMoldUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onFieldChange("labelMoldUrl", String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 overflow-auto flex items-start justify-center p-8">
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <HiOutlineCube className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Tipo de Rótulo</h1>
            <p className="text-sm text-muted-foreground">
              Defina como o rótulo será aplicado na embalagem e o tamanho da arte.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {TYPES.map((t) => {
            const Icon = t.icon;
            const selected = labelType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onFieldChange("labelType", t.id)}
                className={cn(
                  "text-left p-4 rounded-2xl border transition-all",
                  selected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border/40 dark:border-white/8 bg-white dark:bg-[#12121a] hover:border-primary/40"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center",
                      selected ? "bg-primary text-white" : "bg-muted/60 dark:bg-white/5 text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {selected && <HiOutlineCheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-1">{t.description}</p>
              </button>
            );
          })}
        </div>

        {labelType && (
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5 space-y-5">
            {needsSide && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-foreground">
                  Lado do Rótulo <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SIDES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onFieldChange("labelSide", s.id)}
                      className={cn(
                        "px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all",
                        labelSide === s.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/40 dark:border-white/8 bg-muted/30 dark:bg-white/[0.03] text-foreground hover:border-primary/40"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">
                  Largura (mm) <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  inputMode="decimal"
                  value={labelWidth}
                  onChange={(e) => onFieldChange("labelWidth", e.target.value)}
                  placeholder="Ex: 80"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">
                  Altura (mm) <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls}
                  inputMode="decimal"
                  value={labelHeight}
                  onChange={(e) => onFieldChange("labelHeight", e.target.value)}
                  placeholder="Ex: 120"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-foreground">
                Faca / Molde (PDF, SVG ou PNG)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => moldInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-dashed border-border/60 dark:border-white/10 bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/40 dark:hover:bg-white/5 transition-all"
                >
                  <HiOutlineArrowUpTray className="w-4 h-4" />
                  {labelMoldUrl ? "Trocar arquivo" : "Subir faca / molde"}
                </button>
                {labelMoldUrl && (
                  <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    Arquivo carregado
                  </span>
                )}
                {labelMoldUrl && (
                  <button
                    type="button"
                    onClick={() => onFieldChange("labelMoldUrl", "")}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Remover
                  </button>
                )}
              </div>
              <input
                ref={moldInputRef}
                type="file"
                accept=".pdf,.svg,image/*"
                onChange={handleMoldUpload}
                className="hidden"
              />
              <p className="text-[10px] text-muted-foreground">
                Se a gráfica tiver enviado uma faca, suba aqui para guiar a área útil do design.
              </p>
            </div>
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
            Próximo: Dados Obrigatórios
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
