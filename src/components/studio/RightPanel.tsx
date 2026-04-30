"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineTableCells,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineChevronRight,
  HiOutlinePaperAirplane,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface NutritionRow {
  name: string;
  value: string;
  unit: string;
  vd: string;
}

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
    allergens: string;
    expiry: string;
    registration: string;
    sac: string;
    [key: string]: string;
  };
  onFieldChange: (field: string, value: string) => void;
  onGenerateWithAI: (prompt: string) => void;
  nutritionData: NutritionRow[];
  onNutritionChange: (data: NutritionRow[]) => void;
  servingSize: string;
  onServingSizeChange: (v: string) => void;
}

const tabs = [
  { key: "ai", label: "IA", icon: HiOutlineSparkles },
  { key: "fields", label: "Campos", icon: HiOutlineDocumentText },
  { key: "nutrition", label: "Nutricional", icon: HiOutlineTableCells },
  { key: "props", label: "Estilo", icon: HiOutlineAdjustmentsHorizontal },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const anvisaChecklist = [
  { label: "Nome do produto", field: "productName" },
  { label: "Lista de ingredientes", field: "ingredients" },
  { label: "Informação nutricional", field: "" },
  { label: "Peso líquido", field: "weight" },
  { label: "Prazo de validade", field: "expiry" },
  { label: "Declaração de alérgenos", field: "allergens" },
  { label: "Registro/SAC", field: "registration" },
];


const RightPanel = ({
  collapsed,
  onToggle,
  selectedElement,
  productFields,
  onFieldChange,
  onGenerateWithAI,
  nutritionData,
  onNutritionChange,
  servingSize,
  onServingSizeChange,
}: RightPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("ai");
  const [prompt, setPrompt] = useState("");
  const [aiHistory, setAiHistory] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Olá! Sou seu assistente de criação de rótulos. Descreva o produto e eu gero o layout completo com tabela nutricional e informações ANVISA." },
  ]);
  const [generating, setGenerating] = useState(false);

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    setAiHistory([...aiHistory, { role: "user", text: prompt }]);
    setGenerating(true);
    setTimeout(() => {
      setAiHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: `Entendi! Gerando rótulo para "${prompt}". O layout já foi aplicado no canvas com tabela nutricional e informações obrigatórias da ANVISA. Você pode ajustar os campos no painel "Campos".`,
        },
      ]);
      setGenerating(false);
      onGenerateWithAI(prompt);
    }, 1500);
    setPrompt("");
  };

  const filledFields = anvisaChecklist.filter((item) => {
    if (!item.field) return true;
    return (productFields as Record<string, string>)[item.field]?.trim().length > 0;
  });
  const anvisaPct = Math.round((filledFields.length / anvisaChecklist.length) * 100);

  return (
    <motion.div
      className="h-full bg-white dark:bg-[#12121a] border-l border-border/40 dark:border-white/8 flex flex-col shrink-0 relative overflow-hidden"
      animate={{ width: collapsed ? 48 : 320 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Collapse toggle */}
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
          {/* Tabs */}
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <AnimatePresence mode="wait">
              {/* AI Tab */}
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full"
                >
                  {/* ANVISA compliance mini bar */}
                  <div className="mb-3 p-2.5 rounded-xl bg-muted/30 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Conformidade ANVISA</span>
                      <span className={cn("text-[10px] font-bold", anvisaPct === 100 ? "text-emerald-500" : anvisaPct > 50 ? "text-amber-500" : "text-red-500")}>{anvisaPct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", anvisaPct === 100 ? "bg-emerald-500" : anvisaPct > 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${anvisaPct}%` }} />
                    </div>
                  </div>

                  {/* Chat history */}
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

                  {/* Prompt input */}
                  <div className="mt-auto">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendPrompt(); } }}
                        placeholder="Descreva o produto... Ex: Suco de laranja natural 1L"
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
                    <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
                      Modelos: Grok Vision · DALL·E 3 · Leonardo AI
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Fields Tab */}
              {activeTab === "fields" && (
                <motion.div
                  key="fields"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <p className="text-[10px] text-muted-foreground mb-1">Campos obrigatórios ANVISA</p>

                  {/* ANVISA Checklist */}
                  <div className="space-y-1 mb-4 p-2.5 rounded-xl bg-muted/20 dark:bg-white/[0.02]">
                    {anvisaChecklist.map((item) => {
                      const filled = !item.field || (productFields as Record<string, string>)[item.field]?.trim().length > 0;
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

                  {/* Field inputs */}
                  {[
                    { key: "productName", label: "Nome do Produto", placeholder: "Ex: Suco de Laranja Natural" },
                    { key: "brandName", label: "Marca", placeholder: "Ex: FrutaBoa" },
                    { key: "weight", label: "Peso Líquido", placeholder: "Ex: 1L, 500g" },
                    { key: "category", label: "Categoria", placeholder: "Bebidas, Alimentos..." },
                  ].map((f) => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">{f.label}</label>
                      <input
                        value={(productFields as Record<string, string>)[f.key] || ""}
                        onChange={(e) => onFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground">Ingredientes</label>
                    <textarea
                      value={productFields.ingredients}
                      onChange={(e) => onFieldChange("ingredients", e.target.value)}
                      placeholder="Lista completa de ingredientes em ordem decrescente..."
                      rows={3}
                      className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground">Alérgenos</label>
                    <input
                      value={productFields.allergens}
                      onChange={(e) => onFieldChange("allergens", e.target.value)}
                      placeholder="CONTÉM: LEITE, SOJA..."
                      className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {[
                    { key: "expiry", label: "Prazo de Validade", placeholder: "Ex: 12 meses, 30 dias" },
                    { key: "registration", label: "Registro MS / SIF", placeholder: "Ex: 1.2345.6789" },
                    { key: "sac", label: "SAC", placeholder: "Ex: 0800 123 4567" },
                  ].map((f) => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] font-bold text-foreground">{f.label}</label>
                      <input
                        value={(productFields as Record<string, string>)[f.key] || ""}
                        onChange={(e) => onFieldChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Nutrition Tab */}
              {activeTab === "nutrition" && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-muted-foreground">Tabela de Informação Nutricional</p>
                    <button className="text-[9px] font-semibold text-primary hover:underline flex items-center gap-1">
                      <HiOutlineArrowPath className="w-3 h-3" />
                      Auto-gerar
                    </button>
                  </div>

                  <div className="space-y-1 mb-3">
                    <label className="text-[10px] font-bold text-foreground">Porção</label>
                    <input
                      value={servingSize}
                      onChange={(e) => onServingSizeChange(e.target.value)}
                      className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="border border-border/40 dark:border-white/8 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-[1fr_60px_40px_40px] gap-0 text-[9px] font-bold text-muted-foreground bg-muted/30 dark:bg-white/[0.03] px-2.5 py-1.5 uppercase tracking-wider">
                      <span>Nutriente</span>
                      <span className="text-center">Qtd</span>
                      <span className="text-center">Un</span>
                      <span className="text-center">%VD</span>
                    </div>
                    {nutritionData.map((item, i) => (
                      <div key={item.name} className="grid grid-cols-[1fr_60px_40px_40px] gap-0 items-center px-2.5 py-1.5 border-t border-border/20 dark:border-white/5">
                        <span className="text-[10px] text-foreground font-medium truncate">{item.name}</span>
                        <input
                          value={item.value}
                          onChange={(e) => {
                            const updated = [...nutritionData];
                            updated[i] = { ...item, value: e.target.value };
                            onNutritionChange(updated);
                          }}
                          className="text-center text-[10px] bg-transparent border-none outline-none text-foreground font-semibold w-full"
                        />
                        <span className="text-center text-[10px] text-muted-foreground">{item.unit}</span>
                        <input
                          value={item.vd}
                          onChange={(e) => {
                            const updated = [...nutritionData];
                            updated[i] = { ...item, vd: e.target.value };
                            onNutritionChange(updated);
                          }}
                          className="text-center text-[10px] bg-transparent border-none outline-none text-muted-foreground w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[8px] text-muted-foreground mt-2">*% Valores Diários com base em uma dieta de 2.000 kcal</p>
                </motion.div>
              )}

              {/* Properties Tab */}
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
                            <option>Roboto</option>
                            <option>Poppins</option>
                            <option>Open Sans</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground">Tamanho</label>
                            <input type="number" defaultValue={14} className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground">Peso</label>
                            <select className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                              <option>Regular</option>
                              <option>Medium</option>
                              <option>Semibold</option>
                              <option>Bold</option>
                              <option>Extrabold</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-foreground">Cor do texto</label>
                          <div className="flex items-center gap-2">
                            <input type="color" defaultValue="#1a1a1a" className="w-8 h-8 rounded-lg border border-border/40 cursor-pointer" />
                            <input defaultValue="#1a1a1a" className="flex-1 px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-foreground">Alinhamento</label>
                          <div className="flex gap-1">
                            {["Esq", "Centro", "Dir", "Just"].map((a) => (
                              <button key={a} className="flex-1 py-1.5 text-[10px] font-semibold rounded-lg bg-muted/30 dark:bg-white/[0.03] text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 hover:text-foreground transition-all">
                                {a}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-foreground">Cor de fundo</label>
                          <div className="flex items-center gap-2">
                            <input type="color" defaultValue="#ffffff" className="w-8 h-8 rounded-lg border border-border/40 cursor-pointer" />
                            <input defaultValue="#ffffff" className="flex-1 px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground">Borda (px)</label>
                            <input type="number" defaultValue={0} className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground">Raio (px)</label>
                            <input type="number" defaultValue={8} className="w-full px-2.5 py-2 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
