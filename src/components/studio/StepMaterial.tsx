"use client";

import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineSwatch,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface StepMaterialProps {
  fields: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface MaterialDef {
  id: string;
  name: string;
  description: string;
  submaterials?: { id: string; name: string; children?: { id: string; name: string }[] }[];
}

const MATERIALS: MaterialDef[] = [
  {
    id: "bopp",
    name: "BOPP",
    description: "Polipropileno bi-orientado. Resistente à água, brilhante, ótimo custo-benefício.",
    submaterials: [
      { id: "branco", name: "Branco" },
      {
        id: "metalizado",
        name: "Metalizado",
        children: [
          { id: "metal", name: "Metal" },
          { id: "holografico", name: "Holográfico" },
        ],
      },
      { id: "transparente", name: "Transparente" },
    ],
  },
  {
    id: "vinil",
    name: "Vinil",
    description: "PVC adesivo de alta durabilidade. Resistência química superior.",
    submaterials: [
      {
        id: "branco",
        name: "Branco",
        children: [
          { id: "brilho", name: "Brilho" },
          { id: "fosco", name: "Fosco" },
        ],
      },
      { id: "holografico", name: "Holográfico" },
      {
        id: "transparente",
        name: "Transparente",
        children: [
          { id: "liso", name: "Liso" },
          { id: "jateado", name: "Jateado" },
        ],
      },
    ],
  },
  {
    id: "couche",
    name: "Couchê",
    description: "Papel adesivo couchê. Acabamento premium, ótimo para impressão de qualidade.",
    submaterials: [
      { id: "brilho", name: "Brilho" },
      { id: "fosco", name: "Fosco" },
    ],
  },
  {
    id: "gofrado",
    name: "Gofrado (textura)",
    description: "Papel texturizado com relevo. Visual artesanal e sofisticado.",
    submaterials: [
      { id: "aspire", name: "Aspire" },
      { id: "verniz-martele", name: "Verniz e Martelê" },
    ],
  },
];

const FINISHES = [
  { id: "verniz-localizado", name: "Verniz localizado", description: "Verniz aplicado em áreas específicas." },
  { id: "hot-stamping", name: "Hot stamping", description: "Aplicação metálica (dourado, prata, cobre)." },
  { id: "baixo-relevo", name: "Baixo relevo", description: "Pressão a frio gera relevo na superfície." },
];

export default function StepMaterial({ fields, onFieldChange, onNext, onPrev }: StepMaterialProps) {
  const printMaterial = fields.printMaterial ?? "";
  const printSubmaterial = fields.printSubmaterial ?? "";
  const printFinish = fields.printFinish ?? "";
  const finishExtras = fields.finishExtras ?? "";
  const finishExtrasList = finishExtras ? finishExtras.split(",").filter(Boolean) : [];

  const currentMat = MATERIALS.find((m) => m.id === printMaterial);
  const submaterials = currentMat?.submaterials ?? [];

  // sub format: "<sub>" or "<sub>:<child>"
  const [subId, childId] = printSubmaterial.split(":");
  const currentSub = submaterials.find((s) => s.id === subId);
  const subChildren = currentSub?.children ?? [];

  const toggleExtra = (id: string) => {
    const set = new Set(finishExtrasList);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onFieldChange("finishExtras", Array.from(set).join(","));
  };

  const canAdvance =
    Boolean(printMaterial) &&
    (submaterials.length === 0 || Boolean(subId)) &&
    (subChildren.length === 0 || Boolean(childId));

  return (
    <div className="flex-1 overflow-auto flex items-start justify-center p-8">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <HiOutlineSwatch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Material e Acabamento</h1>
            <p className="text-sm text-muted-foreground">
              Escolha o material de impressão e os acabamentos especiais.
            </p>
          </div>
        </div>

        {/* Material */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5 space-y-5 mb-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            1. Material para impressão
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MATERIALS.map((m) => {
              const selected = printMaterial === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onFieldChange("printMaterial", m.id);
                    onFieldChange("printSubmaterial", "");
                  }}
                  className={cn(
                    "text-left p-4 rounded-2xl border transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/40 dark:border-white/8 bg-muted/30 dark:bg-white/[0.03] hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-bold text-foreground">{m.name}</p>
                    {selected && <HiOutlineCheckCircle className="w-5 h-5 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">{m.description}</p>
                </button>
              );
            })}
          </div>

          {/* Submateriais */}
          {submaterials.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40 dark:border-white/8">
              <p className="text-[11px] font-bold text-foreground">
                Acabamento do {currentMat?.name} <span className="text-red-500">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {submaterials.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onFieldChange("printSubmaterial", s.id)}
                    className={cn(
                      "px-3 py-2 text-xs font-semibold rounded-xl border transition-all",
                      subId === s.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 dark:border-white/8 bg-muted/30 dark:bg-white/[0.03] text-foreground hover:border-primary/40"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              {subChildren.length > 0 && (
                <div className="space-y-2 pl-3 border-l-2 border-primary/30 mt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Subtipo de {currentSub?.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subChildren.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onFieldChange("printSubmaterial", `${subId}:${c.id}`)}
                        className={cn(
                          "px-3 py-2 text-xs font-semibold rounded-xl border transition-all",
                          childId === c.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/40 dark:border-white/8 bg-muted/30 dark:bg-white/[0.03] text-foreground hover:border-primary/40"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acabamentos extras */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5 space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="w-4 h-4 text-primary" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              2. Acabamentos extras (opcionais)
            </p>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Aplicados em locais específicos do design depois (na próxima etapa).
          </p>
          <div className="grid grid-cols-3 gap-3">
            {FINISHES.map((f) => {
              const selected = finishExtrasList.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleExtra(f.id)}
                  className={cn(
                    "text-left p-3 rounded-xl border transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border/40 dark:border-white/8 bg-muted/30 dark:bg-white/[0.03] hover:border-primary/40"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-foreground">{f.name}</p>
                    {selected && <HiOutlineCheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-snug">{f.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Verniz tipo */}
        {printFinish && (
          <div className="text-[10px] text-muted-foreground mb-3">
            Verniz selecionado: <strong>{printFinish}</strong>
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
            Próximo: Revisão
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
