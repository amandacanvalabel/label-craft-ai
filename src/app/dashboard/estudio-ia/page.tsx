"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import StudioTopbar from "@/components/studio/StudioTopbar";
import StudioStepper from "@/components/studio/StudioStepper";
import StepInicio from "@/components/studio/StepInicio";
import StepBriefing from "@/components/studio/StepBriefing";
import StepTipoRotulo from "@/components/studio/StepTipoRotulo";
import StepInfoFrente from "@/components/studio/StepInfoFrente";
import StepDados from "@/components/studio/StepDados";
import StepMaterial from "@/components/studio/StepMaterial";
import StepRevisao from "@/components/studio/StepRevisao";
import StepExport from "@/components/studio/StepExport";
import LeftPanel from "@/components/studio/LeftPanel";
import CanvasArea from "@/components/studio/CanvasArea";
import RightPanel from "@/components/studio/RightPanel";
import VersoText from "@/components/studio/VersoText";
import { toast } from "sonner";

const defaultLayers = [
  { id: "product-image", name: "Imagem do Produto", type: "image", visible: true, locked: false },
  { id: "product-name", name: "Nome do Produto", type: "text", visible: true, locked: false },
  { id: "introduction", name: "Introdução", type: "text", visible: true, locked: false },
  { id: "directions", name: "Modo de Uso", type: "text", visible: true, locked: false },
  { id: "tips", name: "Dicas", type: "text", visible: true, locked: false },
  { id: "warnings", name: "Precauções / Advertências", type: "text", visible: true, locked: true },
  { id: "ingredients", name: "Ingredientes (PT / EN)", type: "text", visible: true, locked: false },
  { id: "manufacturer", name: "Fabricante", type: "text", visible: true, locked: false },
  { id: "supplier", name: "Fornecedor Exclusivo", type: "text", visible: false, locked: false },
  { id: "anvisa", name: "Dados Regulatórios", type: "text", visible: true, locked: false },
  { id: "sac", name: "SAC", type: "text", visible: true, locked: false },
  { id: "barcode", name: "Código de Barras", type: "image", visible: true, locked: false },
];

const defaultFields = {
  // Briefing
  productName: "",
  brandName: "",
  weight: "",
  category: "Cosméticos",
  packaging: "",
  introduction: "",
  // Tipo de rótulo
  labelType: "",
  labelSide: "",
  labelWidth: "",
  labelHeight: "",
  labelMoldUrl: "",
  // Conteúdo regulatório
  ingredients: "",
  ingredientsEN: "",
  ingredientsPT: "",
  ingredientsLink: "",
  warnings: "",
  directions: "",
  tips: "",
  expiry: "VIDE EMBALAGEM",
  batch: "VIDE EMBALAGEM",
  registration: "100000",
  sac: "",
  barcode: "",
  // Informações da frente (FASE 4)
  logoUrl: "",
  productType: "",
  ativos: "",
  volumagem: "",
  moodBoardUrls: "",
  moodKeywords: "",
  aiFrontUrl: "",
  // Customização extra (FASE 4)
  customSealUrls: "",
  // Material e acabamento (FASE 5)
  printMaterial: "",
  printSubmaterial: "",
  printFinish: "",
  finishExtras: "",
  // Fabricante
  manufacturerName: "",
  manufacturerCnpj: "",
  manufacturerIe: "",
  manufacturerAddress: "",
  manufacturerChemist: "",
  manufacturerCountry: "Indústria Brasileira",
  // Fornecedor exclusivo (opcional)
  supplierName: "",
  supplierCnpj: "",
  supplierIe: "",
  supplierAddress: "",
};

const categoryEmoji: Record<string, string> = {
  Cosméticos: "🧴",
};

export default function EstudioIAPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState(1);
  const [modelId, setModelId] = useState<string | null>(editId);
  const [projectName, setProjectName] = useState("Novo Rótulo");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [layers, setLayers] = useState(defaultLayers);
  const [productFields, setProductFields] = useState(defaultFields);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [activeAssets, setActiveAssets] = useState<string[]>([]);

  // ── Undo / Redo ──
  type Snapshot = {
    productFields: typeof defaultFields;
    layers: typeof defaultLayers;
    activeTemplate: string | null;
    activeAssets: string[];
  };
  const MAX_HISTORY = 30;
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [redoStack, setRedoStack] = useState<Snapshot[]>([]);

  // refs for use inside callbacks without stale closures
  const snapshotRef = useRef<Snapshot>({ productFields: defaultFields, layers: defaultLayers, activeTemplate: null, activeAssets: [] });
  useEffect(() => {
    snapshotRef.current = { productFields, layers, activeTemplate, activeAssets };
  }, [productFields, layers, activeTemplate, activeAssets]);

  const pushSnapshot = useCallback(() => {
    const snap = { ...snapshotRef.current };
    setUndoStack(prev => [...prev.slice(-(MAX_HISTORY - 1)), snap]);
    setRedoStack([]);
  }, []);

  const applySnapshot = useCallback((snap: Snapshot) => {
    setProductFields(snap.productFields);
    setLayers(snap.layers);
    setActiveTemplate(snap.activeTemplate);
    setActiveAssets(snap.activeAssets);
    setSaved(false);
  }, []);

  const undo = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const current = { ...snapshotRef.current };
      const target = prev[prev.length - 1];
      setRedoStack(r => [...r.slice(-19), current]);
      applySnapshot(target);
      return prev.slice(0, -1);
    });
  }, [applySnapshot]);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const current = { ...snapshotRef.current };
      const target = prev[prev.length - 1];
      setUndoStack(u => [...u.slice(-19), current]);
      applySnapshot(target);
      return prev.slice(0, -1);
    });
  }, [applySnapshot]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // Load existing model when editId is present
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/models/${editId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const cd = (data.canvasData ?? {}) as Record<string, unknown>;
        setProjectName(data.name ?? `Rótulo #${editId.slice(0, 6)}`);
        setModelId(data.id);
        if (cd.productFields) {
          const loaded = cd.productFields as Record<string, string>;
          setProductFields({
            ...defaultFields,
            ...loaded,
            category: "Cosméticos",
            warnings: loaded.warnings ?? "",
          });
        }
        if (cd.layers) {
          const loadedLayers = cd.layers as typeof defaultLayers;
          const allowedLayerIds = new Set(defaultLayers.map((layer) => layer.id));
          setLayers(loadedLayers.filter((layer) => allowedLayerIds.has(layer.id)));
        }
        if (cd.activeTemplate) setActiveTemplate(cd.activeTemplate as string);
        if (Array.isArray(cd.activeAssets)) setActiveAssets(cd.activeAssets as string[]);
        setCurrentStep(6);
        setSaved(true);
      })
      .catch(() => {});
  }, [editId]);

  const buildCanvasData = useCallback(() => ({
    productFields,
    layers,
    activeTemplate,
    activeAssets,
    category: "Cosméticos",
    status: "draft" as const,
    description: productFields.productName,
    img: categoryEmoji[productFields.category] ?? "📋",
    aiModel: "Grok Vision",
  }), [productFields, layers, activeTemplate, activeAssets]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const canvasData = buildCanvasData();
      const body = { name: projectName || "Rótulo sem nome", canvasData };

      let id = modelId;
      if (id) {
        await fetch(`/api/models/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        const res = await fetch("/api/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const created = await res.json();
          id = created.id;
          setModelId(created.id);
        }
      }
      setSaved(true);
    } catch {
      // keep saved=false so user knows it failed
    } finally {
      setSaving(false);
    }
  }, [saving, modelId, projectName, buildCanvasData]);

  const handleExport = useCallback(async (format: string, _channel: string, resolution: string) => {
    const el = document.getElementById("label-canvas-export") || document.getElementById("label-canvas");
    if (!el) throw new Error("Canvas de exportação não encontrado.");

    const originalTransform = el.style.transform;
    el.style.transform = "none";

    try {
      const html2canvas = (await import("html2canvas")).default;
      const dpi = Number(resolution) || 300;
      const scale = Math.max(1, dpi / 96);
      const canvas = await html2canvas(el, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const filename = (projectName || productFields.productName || "rotulo-cosmetico")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();

      if (format === "pdf") {
        const { jsPDF } = await import("jspdf");
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = 50;
        const pdfHeight = 70;
        const pdf = new jsPDF({ unit: "mm", format: [pdfWidth, pdfHeight], orientation: "portrait", compress: true });
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${filename}.pdf`);
        return;
      }

      const mime = format === "jpg" || format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      const extension = format === "jpeg" ? "jpg" : format;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, mime === "image/png" ? undefined : 0.95));
      if (!blob) throw new Error("Não foi possível gerar o arquivo.");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${filename}.${extension}`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao exportar arte final");
      throw error;
    } finally {
      el.style.transform = originalTransform;
    }
  }, [productFields.productName, projectName]);

  const handleFieldChange = (field: string, value: string) => {
    setProductFields((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSelectElement = (id: string | null) => {
    setSelectedElement(id);
    setSelectedLayer(id);
  };

  const handleToggleLayerVisibility = (id: string) => {
    pushSnapshot();
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, visible: !l.visible } : l));
    setSaved(false);
  };

  const handleToggleLayerLock = (id: string) => {
    pushSnapshot();
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, locked: !l.locked } : l));
    setSaved(false);
  };

  const labelImg = categoryEmoji[productFields.category] ?? "📋";

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-64px)]">
      <StudioTopbar
        projectName={projectName}
        onProjectNameChange={(name) => { setProjectName(name); setSaved(false); }}
        saved={saved}
        saving={saving}
        onSave={handleSave}
        onExport={() => setCurrentStep(9)}
        advanceLabel={currentStep === 6 ? "Próximo: Material" : undefined}
        onAdvance={currentStep === 6 ? () => setCurrentStep(7) : undefined}
      />

      <StudioStepper currentStep={currentStep} onStepChange={setCurrentStep} />

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {currentStep === 1 && (
          <StepInicio
            fields={productFields}
            onFieldChange={handleFieldChange}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepBriefing
            fields={productFields}
            onChange={handleFieldChange}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepTipoRotulo
            fields={productFields}
            onFieldChange={handleFieldChange}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <StepInfoFrente
            fields={productFields}
            onFieldChange={handleFieldChange}
            onNext={() => setCurrentStep(5)}
            onPrev={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <StepDados
            fields={productFields}
            onFieldChange={handleFieldChange}
            onNext={() => setCurrentStep(6)}
            onPrev={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 6 && (
          <div className="flex flex-1 overflow-hidden">
            <LeftPanel
              collapsed={leftCollapsed}
              onToggle={() => setLeftCollapsed(!leftCollapsed)}
              layers={layers}
              onToggleLayerVisibility={handleToggleLayerVisibility}
              onToggleLayerLock={handleToggleLayerLock}
              onSelectLayer={(id) => { setSelectedLayer(id); setSelectedElement(id); }}
              selectedLayer={selectedLayer}
              activeTemplate={activeTemplate}
              onApplyTemplate={(id) => { pushSnapshot(); setActiveTemplate(id); setSaved(false); }}
              activeAssets={activeAssets}
              onToggleAsset={(id) => {
                pushSnapshot();
                setActiveAssets((prev) =>
                  prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
                );
                setSaved(false);
              }}
              customSealUrls={productFields.customSealUrls}
              onAddCustomSeal={(dataUrl) => {
                pushSnapshot();
                const cur = (productFields.customSealUrls ?? "").split("|").filter(Boolean);
                const next = [...cur, dataUrl].join("|");
                handleFieldChange("customSealUrls", next);
              }}
              onRemoveCustomSeal={(idx) => {
                pushSnapshot();
                const cur = (productFields.customSealUrls ?? "").split("|").filter(Boolean);
                const next = cur.filter((_, i) => i !== idx).join("|");
                handleFieldChange("customSealUrls", next);
                // limpa ativos que referenciam esse índice ou maior
                setActiveAssets((prev) =>
                  prev
                    .filter((id) => id !== `custom-${idx}`)
                    .map((id) => {
                      if (!id.startsWith("custom-")) return id;
                      const i = Number(id.replace("custom-", ""));
                      return i > idx ? `custom-${i - 1}` : id;
                    })
                );
              }}
            />
            <CanvasArea
              elements={[]}
              selectedElement={selectedElement}
              onSelectElement={handleSelectElement}
              labelPreview={{
                productName: productFields.productName,
                brandName: productFields.brandName,
                category: productFields.category,
                img: labelImg,
                introduction: productFields.introduction,
                tips: productFields.tips,
                ingredients: productFields.ingredients,
                ingredientsPT: productFields.ingredientsPT,
                ingredientsEN: productFields.ingredientsEN,
                ingredientsLink: productFields.ingredientsLink,
                warnings: productFields.warnings,
                directions: productFields.directions,
                weight: productFields.weight,
                expiry: productFields.expiry,
                batch: productFields.batch,
                registration: productFields.registration,
                sac: productFields.sac,
                barcode: productFields.barcode,
                manufacturerName: productFields.manufacturerName,
                manufacturerCnpj: productFields.manufacturerCnpj,
                manufacturerIe: productFields.manufacturerIe,
                manufacturerAddress: productFields.manufacturerAddress,
                manufacturerChemist: productFields.manufacturerChemist,
                manufacturerCountry: productFields.manufacturerCountry,
                aiFrontUrl: productFields.aiFrontUrl,
                logoUrl: productFields.logoUrl,
                supplierName: productFields.supplierName,
                supplierCnpj: productFields.supplierCnpj,
                supplierIe: productFields.supplierIe,
                supplierAddress: productFields.supplierAddress,
              }}
              layers={layers}
              activeTemplate={activeTemplate}
              activeAssets={activeAssets}
              customSealUrls={productFields.customSealUrls}
              onUndo={undo}
              onRedo={redo}
              canUndo={undoStack.length > 0}
              canRedo={redoStack.length > 0}
            />
            <RightPanel
              collapsed={rightCollapsed}
              onToggle={() => setRightCollapsed(!rightCollapsed)}
              selectedElement={selectedElement}
              productFields={productFields}
              onFieldChange={handleFieldChange}
              onGenerateWithAI={() => setSaved(false)}
            />
          </div>
        )}

        {currentStep === 7 && (
          <StepMaterial
            fields={productFields}
            onFieldChange={handleFieldChange}
            onNext={() => setCurrentStep(8)}
            onPrev={() => setCurrentStep(6)}
          />
        )}

        {currentStep === 8 && (
          <StepRevisao
            fields={productFields}
            labelImg={labelImg}
            onNext={() => setCurrentStep(9)}
            onPrev={() => setCurrentStep(7)}
          />
        )}

        {currentStep === 9 && (
          <StepExport
            labelImg={labelImg}
            productName={productFields.productName}
            brandName={productFields.brandName}
            aiFrontUrl={productFields.aiFrontUrl}
            labelType={productFields.labelType}
            onPrev={() => setCurrentStep(8)}
            onExport={handleExport}
            onSaveToGallery={handleSave}
          />
        )}
      </div>
      <ExportLabelCanvas
        fields={productFields}
        layers={layers}
        activeAssets={activeAssets}
        labelImg={labelImg}
        activeTemplate={activeTemplate}
      />
    </div>
  );
}

const EXPORT_TEMPLATE_STYLES: Record<string, { imgFrom: string; imgTo: string; accent: string; accentBg: string }> = {
  t1: { imgFrom: "#fff7ed", imgTo: "#fef3c7", accent: "#c2410c", accentBg: "#fed7aa" },
  t2: { imgFrom: "#fffbeb", imgTo: "#fefce8", accent: "#92400e", accentBg: "#fde68a" },
  t3: { imgFrom: "#eff6ff", imgTo: "#e0e7ff", accent: "#1d4ed8", accentBg: "#bfdbfe" },
  t4: { imgFrom: "#fdf2f8", imgTo: "#fce7f3", accent: "#9d174d", accentBg: "#fbcfe8" },
  t5: { imgFrom: "#f5f5f4", imgTo: "#e7e5e4", accent: "#44403c", accentBg: "#d6d3d1" },
  t6: { imgFrom: "#ecfeff", imgTo: "#e0f2fe", accent: "#0e7490", accentBg: "#a5f3fc" },
  t7: { imgFrom: "#f0fdf4", imgTo: "#ecfccb", accent: "#166534", accentBg: "#bbf7d0" },
  t8: { imgFrom: "#faf5ff", imgTo: "#f3e8ff", accent: "#6b21a8", accentBg: "#e9d5ff" },
  t9: { imgFrom: "#fff1f2", imgTo: "#fce7f3", accent: "#9f1239", accentBg: "#fecdd3" },
};
const EXPORT_DEFAULT_STYLE = { imgFrom: "#eff6ff", imgTo: "#f5f3ff", accent: "#4f46e5", accentBg: "#c7d2fe" };

const EXPORT_ASSET_BADGES: Record<string, { emoji: string; short: string }> = {
  vegano: { emoji: "🌱", short: "Vegano" },
  "cruelty-free": { emoji: "🐰", short: "Cruelty-free" },
  natural: { emoji: "🌿", short: "Natural" },
  dermato: { emoji: "✅", short: "Dermato" },
  "sem-parabenos": { emoji: "🚫", short: "S/ Parabenos" },
  anvisa: { emoji: "🏛️", short: "ANVISA" },
  reciclavel: { emoji: "♻️", short: "Reciclável" },
  reciclo: { emoji: "🔄", short: "Reciclo" },
  "mat-pet": { emoji: "♳", short: "PET" },
  "mat-pead": { emoji: "♴", short: "PEAD" },
  "mat-pvc": { emoji: "♵", short: "PVC" },
  "mat-pebd": { emoji: "♶", short: "PEBD" },
  "mat-pp": { emoji: "♷", short: "PP" },
  "mat-ps": { emoji: "♸", short: "PS" },
  "mat-outros": { emoji: "♹", short: "Outros" },
  "pao-1": { emoji: "🕓", short: "PAO 1M" },
  "pao-2": { emoji: "🕓", short: "PAO 2M" },
  "pao-3": { emoji: "🕓", short: "PAO 3M" },
  "pao-4": { emoji: "🕓", short: "PAO 4M" },
  "pao-5": { emoji: "🕓", short: "PAO 5M" },
  "pao-6": { emoji: "🕓", short: "PAO 6M" },
  "pao-7": { emoji: "🕓", short: "PAO 7M" },
  "pao-8": { emoji: "🕓", short: "PAO 8M" },
  "pao-9": { emoji: "🕓", short: "PAO 9M" },
  "pao-10": { emoji: "🕓", short: "PAO 10M" },
  "pao-11": { emoji: "🕓", short: "PAO 11M" },
  "pao-12": { emoji: "🕓", short: "PAO 12M" },
  "pao-24": { emoji: "🕓", short: "PAO 24M" },
  "pao-36": { emoji: "🕓", short: "PAO 36M" },
};

function ExportLabelCanvas({
  fields,
  layers,
  activeAssets,
  labelImg,
  activeTemplate,
}: {
  fields: typeof defaultFields;
  layers: typeof defaultLayers;
  activeAssets: string[];
  labelImg: string;
  activeTemplate: string | null;
}) {
  const isVisible = (id: string) => layers.find((layer) => layer.id === id)?.visible !== false;
  const style = (activeTemplate && EXPORT_TEMPLATE_STYLES[activeTemplate]) || EXPORT_DEFAULT_STYLE;

  return (
    <div className="fixed left-[-10000px] top-0 pointer-events-none opacity-0" aria-hidden="true">
      <div id="label-canvas-export" className="relative bg-white rounded-lg overflow-hidden" style={{ width: 400, height: 560 }}>
        <div className="absolute inset-0 p-5 flex flex-col text-[#1a1a1a]">
          {isVisible("product-image") && (
            <div className="flex-1 flex items-center justify-center rounded-xl mb-3 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${style.imgFrom}, ${style.imgTo})` }}>
              <span className="text-7xl">{labelImg}</span>
              <div className="absolute top-2.5 right-2.5 text-[7px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: style.accent, backgroundColor: style.accentBg }}>
                Cosméticos
              </div>
              {activeAssets.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5">
                  {activeAssets.map((id) => {
                    if (id.startsWith("custom-")) {
                      const idx = Number(id.replace("custom-", ""));
                      const urls = (fields.customSealUrls ?? "").split("|").filter(Boolean);
                      const url = urls[idx];
                      if (!url) return null;
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={id}
                          src={url}
                          alt={`Selo ${idx + 1}`}
                          className="h-6 w-6 rounded-full bg-white shadow-sm border border-white/60 object-contain p-0.5"
                        />
                      );
                    }
                    const badge = EXPORT_ASSET_BADGES[id];
                    if (!badge) return null;
                    return (
                      <div key={id}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-bold bg-white shadow-sm"
                        style={{ color: style.accent }}>
                        <span style={{ fontSize: 10 }}>{badge.emoji}</span>
                        <span>{badge.short}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {isVisible("product-name") && (
            <div className="p-2 rounded-lg mb-1.5">
              <h2 className="text-[18px] leading-tight text-[#1a1a1a] font-extrabold">
                {fields.productName || "Nome do Produto"}
              </h2>
              {fields.brandName && <p className="text-[9px] font-medium mt-0.5" style={{ color: style.accent }}>{fields.brandName}</p>}
            </div>
          )}

          <VersoText
            fields={fields}
            layerVisible={isVisible}
            baseFontSize={6}
            className="space-y-1 px-1"
          />

          {isVisible("warnings") && (
            <div className="mt-auto pt-1.5">
              <div className="p-1.5 rounded-md border bg-amber-50 border-amber-200">
                <p className="text-[6px] font-bold text-amber-700">
                  ATENÇÃO: {fields.warnings || "Uso externo. Manter fora do alcance de crianças."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
