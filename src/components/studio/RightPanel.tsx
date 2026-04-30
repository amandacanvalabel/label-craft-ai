"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineChevronRight,
  HiOutlinePaperAirplane,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  selectedElement: string | null;
  productFields: {
    productName: string;
    brandName: string;
    weight: string;
    category: string;
    ingredients: string;
    warnings: string;
    directions: string;
    expiry: string;
    registration: string;
    sac: string;
    [key: string]: string;
  };
  onFieldChange: (field: string, value: string) => void;
  onGenerateWithAI: (prompt: string) => void;
}

const tabs = [
  { key: "ai", label: "IA", icon: HiOutlineSparkles },
  { key: "fields", label: "Campos", icon: HiOutlineDocumentText },
  { key: "props", label: "Estilo", icon: HiOutlineAdjustmentsHorizontal },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const cosmeticChecklist = [
  { label: "Nome do produto", field: "productName" },
  { label: "Marca", field: "brandName" },
  { label: "Conteúdo líquido", field: "weight" },
  { label: "Composição", field: "ingredients" },
  { label: "Modo de uso", field: "directions" },
  { label: "Advertências", field: "warnings" },
  { label: "Validade", field: "expiry" },
  { label: "Processo ANVISA / SAC", field: "registration" },
];

const RightPanel = ({
  collapsed,
  onToggle,
  selectedElement,
  productFields,
  onFieldChange,
  onGenerateWithAI,
}: RightPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("ai");
  const [prompt, setPrompt] = useState("");
  const [aiHistory, setAiHistory] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Descreva o cosmético e eu ajudo a montar o rótulo com composição, modo de uso, advertências e dados regulatórios." },
  ]);
  const [generating, setGenerating] = useState(false);

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    const currentPrompt = prompt;
    setAiHistory((prev) => [...prev, { role: "user", text: currentPrompt }]);
    setGenerating(true);
    setTimeout(() => {
      setAiHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Rótulo cosmético preparado para "${currentPrompt}". Revise composição, modo de uso, advertências e dados ANVISA antes de exportar.`,
        },
      ]);
      setGenerating(false);
      onGenerateWithAI(currentPrompt);
    }, 900);
    setPrompt("");
  };

  const filledFields = cosmeticChecklist.filter((item) => productFields[item.field]?.trim().length > 0);
  const compliancePct = Math.round((filledFields.length / cosmeticChecklist.length) * 100);

  return (
    <motion.div
      className="h-full bg-white dark:bg-[#12121a] border-l border-border/40 dark:border-white/8 flex flex-col shrink-0 relative overflow-hidden"
      animate={{ width: collapsed ? 48 : 320 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      <button
        onClick={onToggle}
        className="absolute top-3 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all"
      >
        <HiOutlineChevronRight className={cn("w-3.5 h-3.5 transition-transform", collapsed && "rotate-180")} />
      </button>

      {collapsed ? (
        <div className="flex flex-col items-center gap-1 pt-12 px-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); onToggle(); }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 hover:text-foreground transition-all"
              title={tab.label}
            >
              <tab.icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-0.5 px-3 pt-3 pb-2 pl-10">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all",
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5"
                )}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <AnimatePresence mode="wait">
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-3 p-2.5 rounded-xl bg-muted/30 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Checklist cosmético</span>
                      <span className={cn("text-[10px] font-bold", compliancePct === 100 ? "text-emerald-500" : compliancePct > 50 ? "text-amber-500" : "text-red-500")}>{compliancePct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", compliancePct === 100 ? "bg-emerald-500" : compliancePct > 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${compliancePct}%` }} />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5 mb-3 max-h-[300px] overflow-y-auto">
                    {aiHistory.map((msg, i) => (
                      <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed",
                          msg.role === "user"
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-muted/40 dark:bg-white/[0.04] text-foreground rounded-bl-sm"
                        )}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {generating && (
                      <div className="flex justify-start">
                        <div className="bg-muted/40 dark:bg-white/[0.04] px-3 py-2 rounded-xl rounded-bl-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendPrompt(); } }}
                        placeholder="Ex: creme facial hidratante 50g com ácido hialurônico"
                        className="flex-1 px-3 py-2.5 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        rows={2}
                      />
                      <button
                        onClick={handleSendPrompt}
                        disabled={!prompt.trim() || generating}
                        className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-sm shadow-primary/20"
                      >
                        <HiOutlinePaperAirplane className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "fields" && (
                <motion.div
                  key="fields"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <p className="text-[10px] text-muted-foreground mb-1">Campos de cosmético</p>

                  <div className="space-y-1 mb-4 p-2.5 rounded-xl bg-muted/20 dark:bg-white/[0.02]">
                    {cosmeticChecklist.map((item) => {
                      const filled = productFields[item.field]?.trim().length > 0;
                      return (
                        <div key={item.label} className="flex items-center gap-2 py-0.5">
                          {filled ? (
                            <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <HiOutlineExclamationTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          )}
                          <span className={cn("text-[10px]", filled ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {[
                    { key: "productName", label: "Nome do Produto", placeholder: "Ex: Creme Hidratante Facial" },
                    { key: "brandName", label: "Marca", placeholder: "Ex: Dermaviva" },
                    { key: "weight", label: "Conteúdo Líquido", placeholder: "Ex: 50g, 120ml" },
                    { key: "category", label: "Categoria", placeholder: "Cosméticos" },
                  ].map((f) => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">{f.label}</label>
                      <input
                        value={productFields[f.key] || ""}
                        onChange={(e) => onFieldChange(f.key, f.key === "category" ? "Cosméticos" : e.target.value)}
                        placeholder={f.placeholder}
                        disabled={f.key === "category"}
                        className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-70"
                      />
                    </div>
                  ))}

                  {[
                    { key: "ingredients", label: "Composição", placeholder: "Aqua, Glycerin, Parfum..." },
                    { key: "directions", label: "Modo de Uso", placeholder: "Aplicar sobre a pele limpa..." },
                    { key: "warnings", label: "Advertências", placeholder: "Uso externo. Evite contato com os olhos..." },
                  ].map((f) => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">{f.label}</label>
                      <textarea
                        value={productFields[f.key] || ""}
                        onChange={(e) => onFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        rows={3}
                        className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  ))}

                  {[
                    { key: "expiry", label: "Prazo de Validade", placeholder: "Ex: 24 meses" },
                    { key: "registration", label: "Processo ANVISA", placeholder: "Ex: 25351.000000/2026-00" },
                    { key: "sac", label: "SAC", placeholder: "Ex: 0800 123 4567" },
                  ].map((f) => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">{f.label}</label>
                      <input
                        value={productFields[f.key] || ""}
                        onChange={(e) => onFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "props" && (
                <motion.div
                  key="props"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedElement ? (
                    <div className="space-y-4">
                      <div className="p-2.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
                        <p className="text-[10px] font-bold text-primary">Editando: {selectedElement}</p>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-foreground">Fonte</label>
                          <select className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                            <option>Plus Jakarta Sans</option>
                            <option>Inter</option>
                            <option>Poppins</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-foreground">Cor do texto</label>
                          <div className="flex items-center gap-2">
                            <input type="color" defaultValue="#1a1a1a" className="w-8 h-8 rounded-lg border border-border/40 cursor-pointer" />
                            <input defaultValue="#1a1a1a" className="flex-1 px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <HiOutlineAdjustmentsHorizontal className="w-8 h-8 text-muted-foreground/30 mb-2" />
                      <p className="text-[11px] font-medium text-muted-foreground">Selecione um elemento</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Clique em um item no canvas para editar</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default RightPanel;
