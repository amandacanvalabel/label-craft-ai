"use client";

import { useState } from "react";
import {
  HiOutlineMagnifyingGlassMinus,
  HiOutlineMagnifyingGlassPlus,
  HiOutlineArrowUturnLeft,
  HiOutlineArrowUturnRight,
  HiOutlineSquares2X2,
  HiOutlineViewfinderCircle,
  HiOutlineCursorArrowRays,
  HiOutlineHandRaised,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
}

interface CanvasAreaProps {
  elements: unknown[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  labelPreview: {
    productName: string;
    brandName?: string;
    category: string;
    img: string;
    ingredients?: string;
    warnings?: string;
    directions?: string;
    weight?: string;
    expiry?: string;
    registration?: string;
    sac?: string;
  };
  layers: Layer[];
  activeTemplate: string | null;
  activeAssets: string[];
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

// Template color schemes — inline styles to avoid Tailwind purge
const TEMPLATE_STYLES: Record<string, {
  imgFrom: string; imgTo: string;
  accent: string; accentBg: string;
  headerBg: string; nameStyle: React.CSSProperties;
}> = {
  t1: { imgFrom: "#fff7ed", imgTo: "#fef3c7", accent: "#c2410c", accentBg: "#fed7aa", headerBg: "#fff7ed", nameStyle: { fontWeight: 800 } },
  t2: { imgFrom: "#fffbeb", imgTo: "#fefce8", accent: "#92400e", accentBg: "#fde68a", headerBg: "#fffbeb", nameStyle: { fontStyle: "italic", fontWeight: 700 } },
  t3: { imgFrom: "#eff6ff", imgTo: "#e0e7ff", accent: "#1d4ed8", accentBg: "#bfdbfe", headerBg: "#eff6ff", nameStyle: { fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.5px" } },
  t4: { imgFrom: "#fdf2f8", imgTo: "#fce7f3", accent: "#9d174d", accentBg: "#fbcfe8", headerBg: "#fdf2f8", nameStyle: { fontWeight: 600 } },
  t5: { imgFrom: "#f5f5f4", imgTo: "#e7e5e4", accent: "#44403c", accentBg: "#d6d3d1", headerBg: "#f5f5f4", nameStyle: { fontWeight: 700 } },
  t6: { imgFrom: "#ecfeff", imgTo: "#e0f2fe", accent: "#0e7490", accentBg: "#a5f3fc", headerBg: "#ecfeff", nameStyle: { fontWeight: 700 } },
  t7: { imgFrom: "#f0fdf4", imgTo: "#ecfccb", accent: "#166534", accentBg: "#bbf7d0", headerBg: "#f0fdf4", nameStyle: { fontWeight: 700 } },
  t8: { imgFrom: "#faf5ff", imgTo: "#f3e8ff", accent: "#6b21a8", accentBg: "#e9d5ff", headerBg: "#faf5ff", nameStyle: { fontWeight: 600 } },
  t9: { imgFrom: "#fff1f2", imgTo: "#fce7f3", accent: "#9f1239", accentBg: "#fecdd3", headerBg: "#fff1f2", nameStyle: { fontWeight: 700, fontStyle: "italic" } },
};

const DEFAULT_STYLE = {
  imgFrom: "#eff6ff", imgTo: "#f5f3ff",
  accent: "#4f46e5", accentBg: "#c7d2fe",
  headerBg: "#f9fafb", nameStyle: { fontWeight: 800 } as React.CSSProperties,
};

const ASSET_BADGES: Record<string, { emoji: string; short: string }> = {
  a1: { emoji: "🌿", short: "Natural" },
  a2: { emoji: "✅", short: "Dermato" },
  a3: { emoji: "🏛️", short: "ANVISA" },
  a4: { emoji: "🌱", short: "Vegano" },
  a5: { emoji: "🚫", short: "Sem Parabenos" },
  a6: { emoji: "✨", short: "Cruelty-free" },
  a7: { emoji: "♻️", short: "Reciclável" },
  a8: { emoji: "📊", short: "Cód. Barras" },
};

const CanvasArea = ({
  selectedElement,
  onSelectElement,
  labelPreview,
  layers,
  activeTemplate,
  activeAssets,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: CanvasAreaProps) => {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<"select" | "hand">("select");

  const style = (activeTemplate && TEMPLATE_STYLES[activeTemplate]) || DEFAULT_STYLE;

  const isVisible = (id: string) => layers.find((l) => l.id === id)?.visible !== false;
  const isLocked = (id: string) => layers.find((l) => l.id === id)?.locked === true;

  const handleClick = (id: string, e: React.MouseEvent) => {
    if (isLocked(id)) return;
    e.stopPropagation();
    onSelectElement(id);
  };

  const ringCls = (id: string) =>
    cn(
      "p-2 rounded-lg transition-all",
      isLocked(id) && "cursor-not-allowed opacity-70",
      !isLocked(id) && "cursor-pointer",
      selectedElement === id
        ? "ring-2 ring-primary ring-offset-1"
        : !isLocked(id) && "hover:bg-black/[0.03]"
    );

  return (
    <div className="flex-1 flex flex-col bg-[#e8ecf1] dark:bg-[#0d0d14] overflow-hidden relative">
      <div className="flex-1 flex items-center justify-center overflow-auto p-8">
        <div
          id="label-canvas"
          className={cn(
            "relative bg-white rounded-lg shadow-2xl transition-transform origin-center overflow-hidden",
            showGrid && "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"
          )}
          style={{ width: 400, height: 560, transform: `scale(${zoom / 100})` }}
          onClick={(e) => { if (e.target === e.currentTarget) onSelectElement(null); }}
        >
          <div className="absolute inset-0 p-5 flex flex-col text-[#1a1a1a]">

            {/* ── Image area (layer: product-image) ── */}
            {isVisible("product-image") && (
              <div
                className={cn(ringCls("product-image"), "flex-1 flex items-center justify-center rounded-xl mb-3 relative overflow-hidden !p-0")}
                style={{ background: `linear-gradient(135deg, ${style.imgFrom}, ${style.imgTo})` }}
                onClick={(e) => handleClick("product-image", e)}
              >
                <span className="text-7xl">{labelPreview.img || "📋"}</span>

                {/* Category badge */}
                <div
                  className="absolute top-2.5 right-2.5 text-[7px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: style.accent, backgroundColor: style.accentBg }}
                >
                  {labelPreview.category || "Produto"}
                </div>

                {/* Asset badges — bottom strip */}
                {activeAssets.length > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5">
                    {activeAssets.map((id) => {
                      const badge = ASSET_BADGES[id];
                      if (!badge) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold bg-white shadow-sm border border-white/60"
                          style={{ color: style.accent }}
                        >
                          <span style={{ fontSize: 13, lineHeight: 1 }}>{badge.emoji}</span>
                          <span>{badge.short}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isLocked("product-image") && (
                  <div className="absolute top-2.5 left-2.5 text-[7px] text-amber-500 bg-white/70 px-1.5 py-0.5 rounded-full">🔒</div>
                )}
              </div>
            )}

            {/* ── Product name (layer: product-name) ── */}
            {isVisible("product-name") && (
              <div className={cn(ringCls("product-name"), "mb-1.5")} onClick={(e) => handleClick("product-name", e)}>
                <h2 className="text-[18px] leading-tight text-[#1a1a1a]" style={style.nameStyle}>
                  {labelPreview.productName || "Nome do Produto"}
                </h2>
                {labelPreview.brandName && (
                  <p className="text-[9px] font-medium mt-0.5" style={{ color: style.accent }}>{labelPreview.brandName}</p>
                )}
              </div>
            )}

            {/* ── Info blocks ── */}
            <div className="space-y-1.5">

              {/* Ingredients (layer: ingredients) */}
              {isVisible("ingredients") && (
                <div className={ringCls("ingredients")} onClick={(e) => handleClick("ingredients", e)}>
                  <p className="text-[6px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Composição</p>
                  <p className="text-[7px] text-gray-600 leading-relaxed line-clamp-2">
                    {labelPreview.ingredients || "Composição não informada."}
                  </p>
                </div>
              )}

              {isVisible("directions") && (
                <div className={ringCls("directions")} onClick={(e) => handleClick("directions", e)}>
                  <p className="text-[6px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Modo de uso</p>
                  <p className="text-[7px] text-gray-600 leading-relaxed line-clamp-2">
                    {labelPreview.directions || "Modo de uso não informado."}
                  </p>
                </div>
              )}

              {/* ANVISA info (layer: anvisa) */}
              {isVisible("anvisa") && (
                <div className={ringCls("anvisa")} onClick={(e) => handleClick("anvisa", e)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[6px] font-bold text-gray-400">PESO LÍQ: {labelPreview.weight || "—"}</p>
                      <p className="text-[6px] text-gray-400">Validade: {labelPreview.expiry || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[5px] text-gray-400">ANVISA: {labelPreview.registration || "—"}</p>
                      <p className="text-[5px] text-gray-400">SAC: {labelPreview.sac || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isVisible("warnings") && (
              <div className="mt-auto pt-1.5">
                <div
                  className={cn(ringCls("warnings"), "!p-1.5 rounded-md border")}
                  style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
                  onClick={(e) => handleClick("warnings", e)}
                >
                  <p className="text-[6px] font-bold text-amber-700">
                    ATENÇÃO: {labelPreview.warnings || "Uso externo. Manter fora do alcance de crianças."}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="h-10 bg-white dark:bg-[#12121a] border-t border-border/40 dark:border-white/8 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-1">
          {(["select", "hand"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTool(t)}
              className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-all", tool === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5")}
            >
              {t === "select" ? <HiOutlineCursorArrowRays className="w-3.5 h-3.5" /> : <HiOutlineHandRaised className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all">
            <HiOutlineMagnifyingGlassMinus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-foreground w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all">
            <HiOutlineMagnifyingGlassPlus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setZoom(100)} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all">
            <HiOutlineViewfinderCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-all", showGrid ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5")}
          >
            <HiOutlineSquares2X2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border/40 dark:bg-white/10 mx-1" />
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Desfazer (Ctrl+Z)"
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all disabled:opacity-30"
          >
            <HiOutlineArrowUturnLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Refazer (Ctrl+Y)"
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all disabled:opacity-30"
          >
            <HiOutlineArrowUturnRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;
