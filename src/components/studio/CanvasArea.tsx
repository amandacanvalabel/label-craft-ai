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

interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape" | "table";
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content?: string;
}

interface CanvasAreaProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  labelPreview: {
    productName: string;
    category: string;
    img: string;
  };
}

const CanvasArea = ({ elements, selectedElement, onSelectElement, labelPreview }: CanvasAreaProps) => {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<"select" | "hand">("select");

  return (
    <div className="flex-1 flex flex-col bg-[#e8ecf1] dark:bg-[#0d0d14] overflow-hidden relative">
      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-8">
        <div
          className={cn(
            "relative bg-white dark:bg-[#fafafa] rounded-lg shadow-2xl transition-transform origin-center",
            showGrid && "bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"
          )}
          style={{
            width: 400,
            height: 560,
            transform: `scale(${zoom / 100})`,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onSelectElement(null);
          }}
        >
          {/* Label preview content */}
          <div className="absolute inset-0 p-6 flex flex-col text-[#1a1a1a]">
            {/* Top: Product image area */}
            <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 mb-4 relative overflow-hidden">
              <span className="text-7xl">{labelPreview.img || "📋"}</span>
              <div className="absolute top-3 right-3 text-[8px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                {labelPreview.category || "Produto"}
              </div>
            </div>

            {/* Product Name */}
            <div
              className={cn(
                "p-2 rounded-lg cursor-pointer transition-all mb-2",
                selectedElement === "product-name" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-blue-50/50"
              )}
              onClick={(e) => { e.stopPropagation(); onSelectElement("product-name"); }}
            >
              <h2 className="text-xl font-extrabold text-[#1a1a1a] leading-tight">
                {labelPreview.productName || "Nome do Produto"}
              </h2>
            </div>

            {/* Info blocks */}
            <div className="space-y-2">
              {/* Ingredients */}
              <div
                className={cn(
                  "p-2 rounded-lg cursor-pointer transition-all",
                  selectedElement === "ingredients" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-blue-50/50"
                )}
                onClick={(e) => { e.stopPropagation(); onSelectElement("ingredients"); }}
              >
                <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Ingredientes</p>
                <p className="text-[8px] text-gray-600 leading-relaxed">
                  Água, açúcar, suco concentrado, ácido cítrico, corante natural de betacaroteno, aromatizante natural.
                </p>
              </div>

              {/* Nutritional table */}
              <div
                className={cn(
                  "p-2 rounded-lg cursor-pointer transition-all",
                  selectedElement === "nutritional" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-blue-50/50"
                )}
                onClick={(e) => { e.stopPropagation(); onSelectElement("nutritional"); }}
              >
                <p className="text-[7px] font-bold uppercase tracking-wider text-gray-400 mb-1">Informação Nutricional</p>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-[7px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-1.5 py-0.5 font-bold text-gray-700">Porção 200ml</th>
                        <th className="text-right px-1.5 py-0.5 font-bold text-gray-500">%VD*</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Valor energético", "85 kcal", "4%"],
                        ["Carboidratos", "21g", "7%"],
                        ["Açúcares totais", "19g", "—"],
                        ["Proteínas", "0,8g", "1%"],
                        ["Sódio", "5mg", "0%"],
                      ].map(([name, val, vd]) => (
                        <tr key={name} className="border-t border-gray-100">
                          <td className="px-1.5 py-0.5 text-gray-600">{name} <span className="font-semibold text-gray-800">{val}</span></td>
                          <td className="text-right px-1.5 py-0.5 text-gray-400">{vd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ANVISA info */}
              <div
                className={cn(
                  "p-2 rounded-lg cursor-pointer transition-all",
                  selectedElement === "anvisa" ? "ring-2 ring-primary ring-offset-1" : "hover:bg-blue-50/50"
                )}
                onClick={(e) => { e.stopPropagation(); onSelectElement("anvisa"); }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[7px] font-bold text-gray-400">PESO LÍQ: 1L</p>
                    <p className="text-[7px] text-gray-400">Validade: 12 meses</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[6px] text-gray-400">Reg. MS: 1.2345.6789</p>
                    <p className="text-[6px] text-gray-400">SAC: 0800 123 456</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Allergens bar */}
            <div className="mt-auto pt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                <p className="text-[7px] font-bold text-amber-700">
                  ⚠️ ALÉRGICOS: CONTÉM DERIVADOS DE LARANJA. PODE CONTER TRAÇOS DE LEITE.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar */}
      <div className="h-10 bg-white dark:bg-[#12121a] border-t border-border/40 dark:border-white/8 flex items-center justify-between px-4 shrink-0">
        {/* Left: tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTool("select")}
            className={cn("w-7 h-7 rounded-md flex items-center justify-center text-xs transition-all", tool === "select" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5")}
            title="Selecionar"
          >
            <HiOutlineCursorArrowRays className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTool("hand")}
            className={cn("w-7 h-7 rounded-md flex items-center justify-center text-xs transition-all", tool === "hand" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5")}
            title="Mover"
          >
            <HiOutlineHandRaised className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: zoom */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(Math.max(25, zoom - 25))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all"
          >
            <HiOutlineMagnifyingGlassMinus className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-foreground w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 25))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all"
          >
            <HiOutlineMagnifyingGlassPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all"
            title="Resetar zoom"
          >
            <HiOutlineViewfinderCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: grid, undo/redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn("w-7 h-7 rounded-md flex items-center justify-center transition-all", showGrid ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5")}
            title="Grade"
          >
            <HiOutlineSquares2X2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-border/40 dark:bg-white/10 mx-1" />
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all" title="Desfazer">
            <HiOutlineArrowUturnLeft className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all" title="Refazer">
            <HiOutlineArrowUturnRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;
