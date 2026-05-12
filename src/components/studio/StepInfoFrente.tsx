"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlinePhoto,
  HiOutlineArrowUpTray,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface StepInfoFrenteProps {
  fields: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PRODUCT_TYPES = [
  "Shampoo",
  "Condicionador",
  "Máscara",
  "Leave-in",
  "Sérum",
  "Óleo capilar",
  "Creme facial",
  "Sabonete",
  "Protetor solar",
  "Perfume",
  "Outro",
];

const inputCls =
  "w-full px-3 py-2.5 text-sm bg-muted/30 dark:bg-white/[0.03] border border-border/40 dark:border-white/8 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20";

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function StepInfoFrente({ fields, onFieldChange, onNext, onPrev }: StepInfoFrenteProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const moodInputRef = useRef<HTMLInputElement>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string>("");
  const [aiPreviewUrl, setAiPreviewUrl] = useState<string>(fields.aiFrontUrl ?? "");

  const logoUrl = fields.logoUrl ?? "";
  const productType = fields.productType ?? "";
  const ativos = fields.ativos ?? "";
  const volumagem = fields.volumagem ?? fields.weight ?? "";
  const moodBoardRaw = fields.moodBoardUrls ?? "";
  const moodBoardUrls = moodBoardRaw ? moodBoardRaw.split("|").filter(Boolean) : [];

  const canAdvance = Boolean(productType.trim()) && Boolean(volumagem.trim());

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await fileToDataUrl(file);
    onFieldChange("logoUrl", url);
  };

  const handleMoodUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const urls = await Promise.all(files.map(fileToDataUrl));
    const all = [...moodBoardUrls, ...urls].slice(0, 8);
    onFieldChange("moodBoardUrls", all.join("|"));
    if (moodInputRef.current) moodInputRef.current.value = "";
  };

  const removeMood = (idx: number) => {
    const next = moodBoardUrls.filter((_, i) => i !== idx);
    onFieldChange("moodBoardUrls", next.join("|"));
  };

  const generateWithAI = async () => {
    if (!productType || !volumagem) {
      setGenError("Preencha pelo menos o tipo de produto e a volumagem antes de gerar.");
      return;
    }
    setGenerating(true);
    setGenError("");
    try {
      const moodKeywords = fields.moodKeywords ?? "elegante, moderno, premium";
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: fields.productName,
          brandName: fields.brandName,
          productType,
          ativos,
          volumagem,
          moodKeywords,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao gerar imagem");
      }
      const data = (await res.json()) as { imageBase64: string };
      setAiPreviewUrl(data.imageBase64);
      onFieldChange("aiFrontUrl", data.imageBase64);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setGenerating(false);
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
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <HiOutlinePhoto className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Informações da Frente</h1>
            <p className="text-sm text-muted-foreground">
              Dados que aparecerão na face vendedora do rótulo + referências para a IA gerar o layout.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 p-5 space-y-5">
          {/* Logotipo */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-foreground">
              Logotipo da Marca (PDF ou PNG em alta resolução)
            </label>
            <div className="flex items-center gap-3">
              {logoUrl && (
                <div className="relative w-20 h-20 rounded-xl border border-border/40 bg-white overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-dashed border-border/60 dark:border-white/10 bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/40 dark:hover:bg-white/5 transition-all"
              >
                <HiOutlineArrowUpTray className="w-4 h-4" />
                {logoUrl ? "Trocar logo" : "Subir logo"}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => onFieldChange("logoUrl", "")}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  Remover
                </button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept=".pdf,.svg,image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* O que é */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-foreground">
              O que é? <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onFieldChange("productType", t)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all",
                    productType === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 dark:border-white/8 bg-muted/30 dark:bg-white/[0.03] text-foreground hover:border-primary/40"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            {productType === "Outro" && (
              <input
                className={inputCls}
                placeholder="Digite o tipo de produto"
                onChange={(e) => onFieldChange("productType", e.target.value || "Outro")}
              />
            )}
          </div>

          {/* Ativos + Volumagem */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground">Ativos principais</label>
              <input
                className={inputCls}
                value={ativos}
                onChange={(e) => onFieldChange("ativos", e.target.value)}
                placeholder="Ex: Argan, Queratina, Vitamina E"
              />
              <p className="text-[9px] text-muted-foreground">
                Ingredientes-chave em destaque na frente (ex: &quot;com Argan e Queratina&quot;).
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-foreground">
                Volumagem <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                value={volumagem}
                onChange={(e) => {
                  onFieldChange("volumagem", e.target.value);
                  onFieldChange("weight", e.target.value);
                }}
                placeholder="Ex: 250ml, 100g"
              />
            </div>
          </div>

          {/* Mood board */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              <HiOutlineSparkles className="w-3.5 h-3.5 text-primary" />
              Imagens de referência (mood board para a IA)
            </label>
            <p className="text-[10px] text-muted-foreground">
              Anexe até 8 imagens com a estética que você quer que a IA siga ao gerar o rótulo (cores, tipografia, vibe da marca).
            </p>

            {moodBoardUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {moodBoardUrls.map((u, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border/40 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt={`Referência ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMood(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      aria-label="Remover"
                    >
                      <HiOutlineXMark className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {moodBoardUrls.length < 8 && (
              <button
                type="button"
                onClick={() => moodInputRef.current?.click()}
                className="w-full py-3 text-xs font-semibold rounded-xl border border-dashed border-border/60 dark:border-white/10 bg-muted/20 dark:bg-white/[0.02] hover:bg-muted/40 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <HiOutlineArrowUpTray className="w-4 h-4" />
                Adicionar imagens de referência ({moodBoardUrls.length}/8)
              </button>
            )}
            <input
              ref={moodInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleMoodUpload}
              className="hidden"
            />
          </div>

          {/* Mood keywords + Gerar com IA */}
          <div className="space-y-2 pt-3 border-t border-border/40 dark:border-white/8">
            <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              <HiOutlineSparkles className="w-3.5 h-3.5 text-primary" />
              Palavras-chave de estilo (opcional)
            </label>
            <input
              className={inputCls}
              value={fields.moodKeywords ?? ""}
              onChange={(e) => onFieldChange("moodKeywords", e.target.value)}
              placeholder="Ex: minimalista, dourado, premium, natural, fresco"
            />
            <p className="text-[10px] text-muted-foreground">
              Direcione o estilo visual que a IA deve seguir ao gerar o rótulo.
            </p>

            <button
              type="button"
              onClick={generateWithAI}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-fuchsia-500 hover:opacity-90 rounded-xl transition-all shadow-sm shadow-primary/20 disabled:opacity-60"
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gerando rótulo com IA…
                </>
              ) : (
                <>
                  <HiOutlineSparkles className="w-4 h-4" />
                  {aiPreviewUrl ? "Gerar nova versão" : "Gerar rótulo editável com IA"}
                </>
              )}
            </button>

            {genError && (
              <p className="text-[11px] text-red-500">{genError}</p>
            )}

            {aiPreviewUrl && (
              <div className="mt-3 rounded-xl overflow-hidden border border-border/40 bg-muted/30 flex items-center justify-center" style={{ aspectRatio: "2/3" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={aiPreviewUrl} alt="Rótulo gerado pela IA" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>

          {/* Resumo / próximo passo */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <HiOutlineCheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-foreground/80">
              No próximo passo você organiza o <strong>verso técnico</strong> com os dados ANVISA, e depois ajusta tudo no canvas de design.
            </p>
          </div>
        </div>

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
            Próximo: Verso técnico
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
