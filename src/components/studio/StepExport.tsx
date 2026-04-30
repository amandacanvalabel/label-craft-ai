"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowDownTray,
  HiOutlinePhoto,
  HiOutlineBookOpen,
  HiOutlineArchiveBox,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface StepExportProps {
  labelImg: string;
  productName: string;
  brandName: string;
  onPrev: () => void;
  onExport: (format: string, channel: string, resolution: string) => Promise<void>;
  onSaveToGallery: () => Promise<void>;
}

const formats = [
  { id: "pdf", label: "PDF", desc: "Ideal para impressão", Icon: HiOutlineBookOpen },
  { id: "png", label: "PNG", desc: "Alta qualidade digital", Icon: HiOutlinePhoto },
  { id: "jpg", label: "JPG", desc: "Arquivo leve", Icon: HiOutlinePhoto },
  { id: "webp", label: "WebP", desc: "Web e e-commerce", Icon: HiOutlinePhoto },
];

const channels = [
  { id: "print", label: "Embalagem Física", desc: "Arte para impressão gráfica" },
  { id: "digital", label: "Digital", desc: "Redes sociais e e-commerce" },
  { id: "both", label: "Ambos", desc: "Pacote completo" },
];

const resolutions = [
  { id: "72", label: "72 dpi", desc: "Web / telas" },
  { id: "300", label: "300 dpi", desc: "Impressão padrão" },
  { id: "600", label: "600 dpi", desc: "Alta qualidade" },
];

export default function StepExport({ labelImg, productName, brandName, onPrev, onExport, onSaveToGallery }: StepExportProps) {
  const [format, setFormat] = useState("pdf");
  const [channel, setChannel] = useState("both");
  const [resolution, setResolution] = useState("300");
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [gallerySaving, setGallerySaving] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport(format, channel, resolution);
      setExported(true);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveToGallery = async () => {
    setGallerySaving(true);
    try {
      await onSaveToGallery();
    } finally {
      setGallerySaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto flex items-start justify-center p-8">
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <HiOutlineArrowDownTray className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Exportar Arte Final</h1>
            <p className="text-sm text-muted-foreground">Escolha o formato e canal de destino para o rótulo</p>
          </div>
        </div>

        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* Preview */}
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-4 flex flex-col items-center gap-3 self-start">
            <div className="w-full aspect-[5/7] bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10 rounded-xl flex items-center justify-center">
              <span className="text-5xl">{labelImg}</span>
            </div>
            <div className="text-center w-full">
              <p className="text-xs font-bold text-foreground truncate">{productName || "—"}</p>
              <p className="text-[10px] text-muted-foreground">{brandName}</p>
            </div>
            {exported && (
              <div className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Exportado!</span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Format */}
            <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">Formato</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {formats.map(({ id, label, desc, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setFormat(id)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      format === id
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/30 dark:bg-white/[0.02] border-border/40 dark:border-white/8 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1.5" />
                    <p className="text-[11px] font-bold">{label}</p>
                    <p className="text-[9px] leading-tight mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel */}
            <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">Canal de Destino</p>
              <div className="space-y-2">
                {channels.map(({ id, label, desc }) => (
                  <button
                    key={id}
                    onClick={() => setChannel(id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                      channel === id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/20 dark:bg-white/[0.02] border-border/40 dark:border-white/8 hover:border-primary/20"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
                      channel === id ? "border-primary bg-primary" : "border-muted-foreground/40"
                    )}>
                      {channel === id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className={cn("text-[11px] font-semibold", channel === id ? "text-primary" : "text-foreground")}>{label}</p>
                      <p className="text-[9px] text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5">
              <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-3">Resolução</p>
              <div className="grid grid-cols-3 gap-2">
                {resolutions.map(({ id, label, desc }) => (
                  <button
                    key={id}
                    onClick={() => setResolution(id)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      resolution === id
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/30 dark:bg-white/[0.02] border-border/40 dark:border-white/8 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    )}
                  >
                    <p className="text-[13px] font-bold">{label}</p>
                    <p className="text-[9px] leading-tight mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveToGallery}
                disabled={gallerySaving}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/40 dark:bg-white/5 hover:bg-muted/60 dark:hover:bg-white/10 rounded-xl border border-border/40 dark:border-white/8 transition-all disabled:opacity-40"
              >
                <HiOutlineArchiveBox className="w-4 h-4" />
                {gallerySaving ? "Salvando..." : "Salvar na Galeria"}
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-60"
              >
                <HiOutlineArrowDownTray className={`w-4 h-4 ${exporting ? "animate-bounce" : ""}`} />
                {exporting ? "Gerando arquivo..." : `Exportar (${format.toUpperCase()} · ${resolution} dpi)`}
              </button>
            </div>
          </div>
        </div>

        <div className="flex mt-6">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted/40 dark:bg-white/5 hover:bg-muted/60 dark:hover:bg-white/10 rounded-xl transition-all"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Voltar à Revisão
          </button>
        </div>
      </motion.div>
    </div>
  );
}
