"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineCheckBadge,
  HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface ProductFields {
  productName: string;
  brandName: string;
  weight: string;
  category: string;
  packaging: string;
  registration: string;
  sac: string;
  ingredients: string;
  allergens: string;
  expiry: string;
  [key: string]: string;
}

interface StepRevisaoProps {
  fields: ProductFields;
  labelImg: string;
  onNext: () => void;
  onPrev: () => void;
}

type ApprovalStatus = "pending" | "review" | "approved";

const checklist = [
  { id: "productName", label: "Nome do produto presente e legível" },
  { id: "brandName", label: "Marca identificada" },
  { id: "weight", label: "Peso/volume declarado" },
  { id: "ingredients", label: "Lista de ingredientes em ordem decrescente" },
  { id: "allergens", label: "Declaração de alérgenos em destaque" },
  { id: "nutrition", label: "Tabela nutricional presente" },
  { id: "expiry", label: "Prazo de validade informado" },
  { id: "registration", label: "Registro MS/SIF/MAPA" },
  { id: "sac", label: "SAC do fabricante" },
];

const statusStyle: Record<ApprovalStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pendente", color: "text-muted-foreground", bg: "bg-muted/50 dark:bg-white/5" },
  review: { label: "Em Revisão", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20" },
  approved: { label: "Aprovado", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20" },
};

export default function StepRevisao({ fields, labelImg, onNext, onPrev }: StepRevisaoProps) {
  const [status, setStatus] = useState<ApprovalStatus>("pending");
  const [notes, setNotes] = useState("");

  const checkItem = (id: string) => {
    if (id === "nutrition") return true; // filled in step 2
    return fields[id]?.trim().length > 0;
  };

  const passedCount = checklist.filter((c) => checkItem(c.id)).length;
  const allPassed = passedCount === checklist.length;
  const st = statusStyle[status];

  return (
    <div className="flex-1 overflow-auto flex items-start justify-center p-8">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <HiOutlineCheckBadge className="w-5 h-5 text-violet-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Revisão e Aprovação</h1>
            <p className="text-sm text-muted-foreground">Verifique a conformidade do rótulo antes de exportar</p>
          </div>
          <div className={cn("px-3 py-1.5 rounded-xl text-[11px] font-semibold", st.bg, st.color)}>
            {st.label}
          </div>
        </div>

        <div className="grid grid-cols-[260px_1fr] gap-6">
          {/* Preview */}
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-4 flex flex-col items-center gap-3 self-start">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider self-start">Preview</p>
            <div className="w-full aspect-[5/7] bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10 rounded-xl flex items-center justify-center">
              <span className="text-6xl">{labelImg}</span>
            </div>
            <div className="w-full space-y-0.5">
              <p className="text-xs font-bold text-foreground truncate">{fields.productName || "—"}</p>
              <p className="text-[10px] text-muted-foreground">{fields.brandName} · {fields.category}</p>
              <p className="text-[10px] text-muted-foreground">{fields.weight}</p>
            </div>
          </div>

          {/* Checklist + actions */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold text-foreground uppercase tracking-wider">Checklist ANVISA</p>
                <span className={cn(
                  "text-[11px] font-bold",
                  allPassed ? "text-emerald-500" : passedCount > checklist.length / 2 ? "text-amber-500" : "text-red-500"
                )}>
                  {passedCount}/{checklist.length} itens
                </span>
              </div>
              <div className="space-y-1.5">
                {checklist.map((item) => {
                  const ok = checkItem(item.id);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-lg",
                        ok ? "bg-emerald-50/50 dark:bg-emerald-500/5" : "bg-red-50/50 dark:bg-red-500/5"
                      )}
                    >
                      {ok
                        ? <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        : <HiOutlineXCircle className="w-4 h-4 text-red-500 shrink-0" />
                      }
                      <span className={cn("text-[11px]", ok ? "text-foreground" : "text-muted-foreground line-through")}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5">
              <label className="text-[11px] font-bold text-foreground flex items-center gap-2 mb-3">
                <HiOutlineChatBubbleBottomCenterText className="w-3.5 h-3.5" />
                Observações / Justificativas
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione comentários, ajustes necessários ou justificativas de aprovação..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Approval actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStatus("review")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all",
                  status === "review"
                    ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
                    : "bg-muted/30 dark:bg-white/[0.03] border-border/40 dark:border-white/8 text-muted-foreground hover:text-foreground"
                )}
              >
                <HiOutlineExclamationTriangle className="w-4 h-4" />
                Solicitar Revisão
              </button>
              <button
                onClick={() => allPassed && setStatus("approved")}
                disabled={!allPassed}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all",
                  status === "approved"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : allPassed
                    ? "bg-emerald-500 border-transparent text-white hover:bg-emerald-600"
                    : "bg-muted/30 border-border/40 text-muted-foreground opacity-40 cursor-not-allowed"
                )}
              >
                <HiOutlineCheckBadge className="w-4 h-4" />
                Aprovar Rótulo
              </button>
            </div>

            {!allPassed && (
              <p className="text-[10px] text-muted-foreground text-center">
                Preencha todos os itens do checklist antes de aprovar
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/40 dark:bg-white/5 hover:bg-muted/60 dark:hover:bg-white/10 rounded-xl transition-all"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Voltar ao Design
          </button>
          <button
            onClick={onNext}
            disabled={status !== "approved"}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próximo: Exportar
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
