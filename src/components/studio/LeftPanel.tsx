"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineRectangleGroup,
  HiOutlineSquare3Stack3D,
  HiOutlinePhoto,
  HiOutlineChevronLeft,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  img: string;
}

interface LeftPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  layers: Layer[];
  onToggleLayerVisibility: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
  onSelectLayer: (id: string) => void;
  selectedLayer: string | null;
  activeTemplate: string | null;
  onApplyTemplate: (id: string) => void;
  activeAssets: string[];
  onToggleAsset: (id: string) => void;
}

const templates: Template[] = [
  { id: "t4", name: "Creme Facial", category: "Cosméticos", img: "🧴" },
  { id: "t8", name: "Sabonete", category: "Cosméticos", img: "🫧" },
  { id: "t1", name: "Sérum Premium", category: "Cosméticos", img: "💧" },
  { id: "t2", name: "Shampoo", category: "Cosméticos", img: "🧴" },
  { id: "t3", name: "Perfume", category: "Cosméticos", img: "✨" },
  { id: "t5", name: "Protetor Solar", category: "Cosméticos", img: "☀️" },
];

const assets = [
  { id: "a1", name: "Natural", img: "🌿" },
  { id: "a2", name: "Dermatologicamente Testado", img: "✅" },
  { id: "a3", name: "Selo ANVISA", img: "🏛️" },
  { id: "a4", name: "Selo Vegano", img: "🌱" },
  { id: "a5", name: "Sem Parabenos", img: "🚫" },
  { id: "a6", name: "Cruelty-free", img: "✨" },
  { id: "a7", name: "Reciclável", img: "♻️" },
  { id: "a8", name: "Código Barras", img: "📊" },
];

const tabs = [
  { key: "templates", label: "Templates", icon: HiOutlineRectangleGroup },
  { key: "layers", label: "Camadas", icon: HiOutlineSquare3Stack3D },
  { key: "assets", label: "Assets", icon: HiOutlinePhoto },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const LeftPanel = ({
  collapsed,
  onToggle,
  layers,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onSelectLayer,
  selectedLayer,
  activeTemplate,
  onApplyTemplate,
  activeAssets,
  onToggleAsset,
}: LeftPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("templates");
  const [templateFilter, setTemplateFilter] = useState("Todos");
  const templateCategories = ["Todos", "Cosméticos"];

  const filteredTemplates = templateFilter === "Todos"
    ? templates
    : templates.filter((t) => t.category === templateFilter);

  return (
    <motion.div
      className="h-full bg-white dark:bg-[#12121a] border-r border-border/40 dark:border-white/8 flex flex-col shrink-0 relative overflow-hidden"
      animate={{ width: collapsed ? 48 : 280 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute top-3 right-2 z-10 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all"
      >
        <HiOutlineChevronLeft className={cn("w-3.5 h-3.5 transition-transform", collapsed && "rotate-180")} />
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
          <div className="flex items-center gap-0.5 px-3 pt-3 pb-2">
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
              {/* Templates */}
              {activeTab === "templates" && (
                <motion.div
                  key="templates"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex flex-wrap gap-1 mb-3">
                    {templateCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTemplateFilter(cat)}
                        className={cn(
                          "px-2 py-1 text-[9px] font-semibold rounded-md transition-all",
                          templateFilter === cat
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredTemplates.map((t) => {
                      const isActive = activeTemplate === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => onApplyTemplate(t.id)}
                          className={cn(
                            "group p-3 rounded-xl border transition-all text-center",
                            isActive
                              ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                              : "bg-muted/30 dark:bg-white/[0.02] hover:bg-muted/60 dark:hover:bg-white/[0.05] border-transparent hover:border-primary/20"
                          )}
                        >
                          <div className="text-2xl mb-1.5">{t.img}</div>
                          <p className={cn("text-[10px] font-semibold truncate", isActive ? "text-primary" : "text-foreground")}>{t.name}</p>
                          <p className="text-[8px] text-muted-foreground">{t.category}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Layers */}
              {activeTab === "layers" && (
                <motion.div
                  key="layers"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => onSelectLayer(layer.id)}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all group",
                        selectedLayer === layer.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/40 dark:hover:bg-white/[0.03] border border-transparent"
                      )}
                    >
                      <div className="w-6 h-6 rounded bg-muted/50 dark:bg-white/5 flex items-center justify-center text-[10px] shrink-0">
                        {layer.type === "text" ? "T" : layer.type === "image" ? "🖼" : layer.type === "table" ? "▦" : "■"}
                      </div>
                      <span className="text-[11px] font-medium text-foreground flex-1 truncate">{layer.name}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleLayerVisibility(layer.id); }}
                          className={cn("w-5 h-5 rounded flex items-center justify-center transition-all", layer.visible ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/40")}
                        >
                          {layer.visible ? <HiOutlineEye className="w-3 h-3" /> : <HiOutlineEyeSlash className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleLayerLock(layer.id); }}
                          className={cn("w-5 h-5 rounded flex items-center justify-center transition-all", layer.locked ? "text-amber-500" : "text-muted-foreground hover:text-foreground")}
                        >
                          <HiOutlineLockClosed className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Assets */}
              {activeTab === "assets" && (
                <motion.div
                  key="assets"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-[10px] text-muted-foreground mb-2">Clique para adicionar/remover do canvas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {assets.map((a) => {
                      const isActive = activeAssets.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => onToggleAsset(a.id)}
                          className={cn(
                            "group p-3 rounded-xl border transition-all text-center relative",
                            isActive
                              ? "bg-primary/10 border-primary/40 ring-1 ring-primary/30"
                              : "bg-muted/30 dark:bg-white/[0.02] hover:bg-muted/60 dark:hover:bg-white/[0.05] border-transparent hover:border-primary/20"
                          )}
                        >
                          {isActive && (
                            <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-[7px] text-white font-bold">✓</span>
                            </div>
                          )}
                          <div className="text-xl mb-1">{a.img}</div>
                          <p className={cn("text-[9px] font-medium", isActive ? "text-primary" : "text-foreground")}>{a.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LeftPanel;
