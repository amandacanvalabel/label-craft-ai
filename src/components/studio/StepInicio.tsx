"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineCamera,
  HiOutlineHandRaised,
  HiOutlineSparkles,
  HiOutlineArrowUpTray,
  HiOutlineXCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface StepInicioProps {
  fields: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
  onNext: () => void;
}

interface ScanResult {
  packaging?: string;
  shape?: string;
  volumeEstimate?: string;
  material?: string;
  suggestedLabelType?: string;
  suggestedLabelSide?: string;
  productCategory?: string;
  notes?: string;
}

export default function StepInicio({ fields, onFieldChange, onNext }: StepInicioProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"choose" | "scan">("choose");
  const [scanUrl, setScanUrl] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string>("");

  const category = fields.category || "Cosméticos";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result ?? ""));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    setScanUrl(dataUrl);
    setScanResult(null);
    setScanError("");
  };

  const triggerScan = async () => {
    if (!scanUrl) return;
    setScanning(true);
    setScanError("");
    try {
      const res = await fetch("/api/ai/scan-frasco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: scanUrl }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao escanear");
      }
      const data = (await res.json()) as ScanResult;
      setScanResult(data);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setScanning(false);
    }
  };

  const applyScan = () => {
    if (!scanResult) return;
    if (scanResult.packaging) onFieldChange("packaging", scanResult.packaging);
    if (scanResult.volumeEstimate) onFieldChange("weight", scanResult.volumeEstimate);
    if (scanResult.suggestedLabelType) onFieldChange("labelType", scanResult.suggestedLabelType);
    if (scanResult.suggestedLabelSide) onFieldChange("labelSide", scanResult.suggestedLabelSide);
    if (scanResult.productCategory) onFieldChange("category", scanResult.productCategory);
    onNext();
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
            <HiOutlineSparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Vamos começar</h1>
            <p className="text-sm text-muted-foreground">
              Como podemos ajudar a criar o seu rótulo hoje?
            </p>
          </div>
        </div>

        {/* Categoria */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5 mb-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Tipo de Produto
          </p>
          <div className="flex flex-wrap gap-2">
            {["Cosméticos", "Higiene", "Capilar", "Perfumaria"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onFieldChange("category", c)}
                className={cn(
                  "px-4 py-2 text-xs font-semibold rounded-xl border transition-all",
                  category === c
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 dark:border-white/8 bg-muted/30 dark:bg-white/[0.03] text-foreground hover:border-primary/40"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {mode === "choose" && (
          <div className="grid grid-cols-2 gap-4 mb-5">
            <button
              type="button"
              onClick={onNext}
              className="text-left p-5 rounded-2xl border border-border/40 dark:border-white/8 bg-white dark:bg-[#12121a] hover:border-primary/40 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <HiOutlineHandRaised className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">Já sei meu rótulo</p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Pular para o briefing manualmente — você preenche tudo passo-a-passo.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode("scan")}
              className="text-left p-5 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-3">
                <HiOutlineCamera className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-foreground mb-1">
                Não sei — escanear meu frasco
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Suba uma foto da embalagem e nossa IA sugere o tipo de rótulo e formato.
              </p>
            </button>
          </div>
        )}

        {mode === "scan" && (
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5 space-y-4 mb-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">Escaneamento do frasco</p>
              <button
                type="button"
                onClick={() => { setMode("choose"); setScanUrl(""); setScanResult(null); setScanError(""); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Voltar
              </button>
            </div>

            {!scanUrl && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-12 rounded-xl border border-dashed border-border/60 dark:border-white/10 bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/40 dark:hover:bg-white/5 transition-all flex flex-col items-center gap-2"
              >
                <HiOutlineArrowUpTray className="w-6 h-6 text-primary" />
                <p className="text-sm font-semibold text-foreground">Subir foto do frasco</p>
                <p className="text-[10px] text-muted-foreground">PNG, JPG ou WEBP</p>
              </button>
            )}

            {scanUrl && (
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square rounded-xl bg-muted/30 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={scanUrl} alt="Frasco" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="space-y-2">
                  {!scanResult && !scanning && (
                    <>
                      <button
                        type="button"
                        onClick={triggerScan}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all"
                      >
                        <HiOutlineSparkles className="w-4 h-4" />
                        Identificar com IA
                      </button>
                      <button
                        type="button"
                        onClick={() => { setScanUrl(""); }}
                        className="w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Trocar imagem
                      </button>
                    </>
                  )}

                  {scanning && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                      <div className="w-6 h-6 mx-auto mb-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[11px] text-muted-foreground">Analisando a embalagem…</p>
                    </div>
                  )}

                  {scanError && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex gap-2">
                      <HiOutlineXCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-red-600 dark:text-red-400">{scanError}</p>
                    </div>
                  )}

                  {scanResult && (
                    <div className="space-y-2 text-[11px]">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex gap-2">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          Embalagem identificada
                        </p>
                      </div>
                      <ul className="space-y-1 text-foreground/80">
                        {scanResult.packaging && (
                          <li>
                            <strong>Embalagem:</strong> {scanResult.packaging} ({scanResult.shape})
                          </li>
                        )}
                        {scanResult.volumeEstimate && (
                          <li>
                            <strong>Volume:</strong> {scanResult.volumeEstimate}
                          </li>
                        )}
                        {scanResult.material && (
                          <li>
                            <strong>Material:</strong> {scanResult.material}
                          </li>
                        )}
                        {scanResult.suggestedLabelType && (
                          <li>
                            <strong>Rótulo sugerido:</strong> {scanResult.suggestedLabelType}
                            {scanResult.suggestedLabelSide ? ` (${scanResult.suggestedLabelSide})` : ""}
                          </li>
                        )}
                        {scanResult.notes && (
                          <li className="text-muted-foreground italic">{scanResult.notes}</li>
                        )}
                      </ul>
                      <button
                        type="button"
                        onClick={applyScan}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all mt-2"
                      >
                        Usar essas sugestões
                        <HiOutlineArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm shadow-primary/20"
          >
            Avançar para o Briefing
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
