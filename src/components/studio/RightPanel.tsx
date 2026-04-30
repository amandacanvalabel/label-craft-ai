"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineDocumentText,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineChevronRight,
  HiOutlinePaperAirplane,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineCheck,
  HiOutlineExclamationCircle,
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

const FIELD_LABELS: Record<string, string> = {
  productName: "Nome do produto",
  brandName: "Marca",
  weight: "Conteúdo",
  ingredients: "Composição",
  directions: "Modo de uso",
  warnings: "Advertências",
};

const QUICK_PROMPTS = [
  "creme hidratante facial 50g",
  "shampoo cabelos oleosos 250ml",
  "protetor solar FPS 50+ 120ml",
  "sérum vitamina C 30ml",
];

interface Message {
  role: "user" | "ai" | "error";
  text: string;
  fields?: Record<string, string>;
  applied?: boolean;
}

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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Descreva o cosmético e eu gero a composição INCI, modo de uso e advertências ANVISA automaticamente.",
    },
  ]);
  const [generating, setGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  const handleSendPrompt = async (overridePrompt?: string) => {
    const text = (overridePrompt ?? prompt).trim();
    if (!text || generating) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setPrompt("");
    setGenerating(true);

    try {
      const res = await fetch("/api/ai/generate-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          currentFields: {
            productName: productFields.productName,
            brandName: productFields.brandName,
            weight: productFields.weight,
          },
        }),
      });

      const data = await res.json() as { message?: string; fields?: Record<string, string>; error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Erro ao gerar conteúdo");
      }

      const generatedFields = Object.fromEntries(
        Object.entries(data.fields ?? {}).filter(([, v]) => v?.trim())
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.message ?? "Conteúdo gerado!",
          fields: Object.keys(generatedFields).length > 0 ? generatedFields : undefined,
          applied: false,
        },
      ]);

      onGenerateWithAI(text);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "error",
          text: err instanceof Error ? err.message : "Erro ao conectar com a IA. Tente novamente.",
        },
      ]);
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyFields = (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg?.fields) return;
    Object.entries(msg.fields).forEach(([key, value]) => {
      if (value?.trim()) onFieldChange(key, value);
    });
    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, applied: true } : m))
    );
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
          {/* Tab bar */}
          <div className="flex items-center gap-0.5 px-3 pt-3 pb-2 pl-10 shrink-0">
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

          <div className="flex-1 overflow-hidden flex flex-col px-3 pb-3 min-h-0">
            <AnimatePresence mode="wait">

              {/* ── AI TAB ── */}
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full min-h-0"
                >
                  {/* ANVISA compliance bar */}
                  <div className="mb-2.5 p-2.5 rounded-xl bg-muted/30 dark:bg-white/[0.02] shrink-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Checklist ANVISA</span>
                      <span className={cn(
                        "text-[10px] font-bold",
                        compliancePct === 100 ? "text-emerald-500" : compliancePct > 50 ? "text-amber-500" : "text-red-500"
                      )}>
                        {compliancePct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full transition-all",
                          compliancePct === 100 ? "bg-emerald-500" : compliancePct > 50 ? "bg-amber-500" : "bg-red-500"
                        )}
                        animate={{ width: `${compliancePct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    {compliancePct < 100 && (
                      <p className="text-[9px] text-muted-foreground mt-1">
                        {cosmeticChecklist.length - filledFields.length} campo(s) faltando para conformidade
                      </p>
                    )}
                  </div>

                  {/* Quick prompts (only show if no user messages yet) */}
                  {messages.filter((m) => m.role === "user").length === 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5 shrink-0">
                      {QUICK_PROMPTS.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSendPrompt(q)}
                          disabled={generating}
                          className="px-2.5 py-1 rounded-lg text-[9px] font-semibold bg-primary/8 dark:bg-primary/12 text-primary border border-primary/15 hover:bg-primary/15 transition-all disabled:opacity-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 mb-2.5 min-h-0 pr-0.5">
                    {messages.map((msg, i) => (
                      <div key={i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                        <div className={cn(
                          "max-w-[90%] px-3 py-2 rounded-xl text-[11px] leading-relaxed",
                          msg.role === "user"
                            ? "bg-primary text-white rounded-br-sm"
                            : msg.role === "error"
                            ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-bl-sm"
                            : "bg-muted/40 dark:bg-white/[0.04] text-foreground rounded-bl-sm"
                        )}>
                          {msg.role === "error" && (
                            <HiOutlineExclamationCircle className="w-3.5 h-3.5 inline mr-1 mb-0.5" />
                          )}
                          {msg.text}
                        </div>

                        {/* Generated fields preview */}
                        {msg.role === "ai" && msg.fields && Object.keys(msg.fields).length > 0 && (
                          <div className="max-w-[90%] mt-1.5 w-full">
                            <div className="bg-emerald-50 dark:bg-emerald-500/8 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl p-2.5">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
                                Campos gerados
                              </p>
                              <div className="space-y-1">
                                {Object.entries(msg.fields).map(([key, value]) => (
                                  <div key={key} className="flex items-start gap-1.5">
                                    <HiOutlineCheck className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                    <div className="min-w-0">
                                      <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        {FIELD_LABELS[key] ?? key}:{" "}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground line-clamp-1">
                                        {value}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => handleApplyFields(i)}
                                disabled={msg.applied}
                                className={cn(
                                  "mt-2.5 w-full py-1.5 rounded-lg text-[10px] font-bold transition-all",
                                  msg.applied
                                    ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 cursor-default"
                                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 cursor-pointer"
                                )}
                              >
                                {msg.applied ? (
                                  <span className="flex items-center justify-center gap-1">
                                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                    Aplicado ao rótulo
                                  </span>
                                ) : (
                                  "Aplicar ao rótulo →"
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {generating && (
                      <div className="flex justify-start">
                        <div className="bg-muted/40 dark:bg-white/[0.04] px-3 py-2.5 rounded-xl rounded-bl-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="shrink-0">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendPrompt();
                          }
                        }}
                        placeholder="Ex: creme facial hidratante 50g com ácido hialurônico"
                        className="flex-1 px-3 py-2.5 text-[11px] bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                        rows={2}
                        disabled={generating}
                      />
                      <button
                        onClick={() => handleSendPrompt()}
                        disabled={!prompt.trim() || generating}
                        className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-sm shadow-primary/20"
                      >
                        <HiOutlinePaperAirplane className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
                      Powered by GPT-4o mini · Shift+Enter para nova linha
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ── FIELDS TAB ── */}
              {activeTab === "fields" && (
                <motion.div
                  key="fields"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-y-auto space-y-3 pr-0.5"
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
                    { key: "ingredients", label: "Composição (INCI)", placeholder: "Aqua, Glycerin, Parfum..." },
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

              {/* ── STYLE TAB ── */}
              {activeTab === "props" && (
                <motion.div
                  key="props"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-y-auto"
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
