"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import StudioTopbar from "@/components/studio/StudioTopbar";
import StudioStepper from "@/components/studio/StudioStepper";
import StepBriefing from "@/components/studio/StepBriefing";
import StepDados from "@/components/studio/StepDados";
import StepRevisao from "@/components/studio/StepRevisao";
import StepExport from "@/components/studio/StepExport";
import LeftPanel from "@/components/studio/LeftPanel";
import CanvasArea from "@/components/studio/CanvasArea";
import RightPanel from "@/components/studio/RightPanel";
import { toast } from "sonner";

const defaultLayers = [
  { id: "product-image", name: "Imagem do Produto", type: "image", visible: true, locked: false },
  { id: "product-name", name: "Nome do Produto", type: "text", visible: true, locked: false },
  { id: "ingredients", name: "Composição", type: "text", visible: true, locked: false },
  { id: "directions", name: "Modo de Uso", type: "text", visible: true, locked: false },
  { id: "warnings", name: "Advertências", type: "text", visible: true, locked: true },
  { id: "anvisa", name: "Dados Regulatórios", type: "text", visible: true, locked: false },
];

const defaultFields = {
  productName: "",
  brandName: "",
  weight: "",
  category: "Cosméticos",
  packaging: "",
  ingredients: "",
  warnings: "",
  directions: "",
  expiry: "",
  registration: "",
  sac: "",
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
        if (cd.activeAssets) setActiveAssets(cd.activeAssets as string[]);
        setCurrentStep(3);
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
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, visible: !l.visible } : l));
    setSaved(false);
  };

  const handleToggleLayerLock = (id: string) => {
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, locked: !l.locked } : l));
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
        onExport={() => setCurrentStep(5)}
        advanceLabel={currentStep === 3 ? "Próximo: Revisão" : undefined}
        onAdvance={currentStep === 3 ? () => setCurrentStep(4) : undefined}
      />

      <StudioStepper currentStep={currentStep} onStepChange={setCurrentStep} />

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {currentStep === 1 && (
          <StepBriefing
            fields={productFields}
            onChange={handleFieldChange}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepDados
            ingredients={productFields.ingredients}
            warnings={productFields.warnings}
            directions={productFields.directions}
            expiry={productFields.expiry}
            onFieldChange={handleFieldChange}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
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
              onApplyTemplate={(id) => { setActiveTemplate(id); setSaved(false); }}
              activeAssets={activeAssets}
              onToggleAsset={(id) => {
                setActiveAssets((prev) =>
                  prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
                );
                setSaved(false);
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
                ingredients: productFields.ingredients,
                warnings: productFields.warnings,
                directions: productFields.directions,
                weight: productFields.weight,
                expiry: productFields.expiry,
                registration: productFields.registration,
                sac: productFields.sac,
              }}
              layers={layers}
              activeTemplate={activeTemplate}
              activeAssets={activeAssets}
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

        {currentStep === 4 && (
          <StepRevisao
            fields={productFields}
            labelImg={labelImg}
            onNext={() => setCurrentStep(5)}
            onPrev={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <StepExport
            labelImg={labelImg}
            productName={productFields.productName}
            brandName={productFields.brandName}
            onPrev={() => setCurrentStep(4)}
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
      />
    </div>
  );
}

function ExportLabelCanvas({
  fields,
  layers,
  activeAssets,
  labelImg,
}: {
  fields: typeof defaultFields;
  layers: typeof defaultLayers;
  activeAssets: string[];
  labelImg: string;
}) {
  const isVisible = (id: string) => layers.find((layer) => layer.id === id)?.visible !== false;
  const badges: Record<string, string> = {
    a1: "Natural",
    a2: "Dermato",
    a3: "ANVISA",
    a4: "Vegano",
    a5: "Sem Parabenos",
    a6: "Cruelty-free",
    a7: "Reciclável",
    a8: "Código Barras",
  };

  return (
    <div className="fixed left-[-10000px] top-0 pointer-events-none opacity-0" aria-hidden="true">
      <div id="label-canvas-export" className="relative bg-white rounded-lg overflow-hidden" style={{ width: 400, height: 560 }}>
        <div className="absolute inset-0 p-5 flex flex-col text-[#1a1a1a]">
          {isVisible("product-image") && (
            <div className="flex-1 flex items-center justify-center rounded-xl mb-3 relative overflow-hidden bg-gradient-to-br from-cyan-50 to-violet-50">
              <span className="text-7xl">{labelImg}</span>
              <div className="absolute top-2.5 right-2.5 text-[7px] font-bold px-2 py-0.5 rounded-full text-cyan-700 bg-cyan-100">
                Cosméticos
              </div>
              {activeAssets.length > 0 && (
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                  {activeAssets.map((id) => badges[id]).filter(Boolean).map((label) => (
                    <span key={label} className="px-1.5 py-0.5 rounded-full text-[6px] font-bold bg-white/85 text-cyan-700 shadow-sm">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {isVisible("product-name") && (
            <div className="p-2 rounded-lg mb-1.5">
              <h2 className="text-[18px] leading-tight text-[#1a1a1a] font-extrabold">
                {fields.productName || "Nome do Produto"}
              </h2>
              {fields.brandName && <p className="text-[9px] font-medium mt-0.5 text-cyan-700">{fields.brandName}</p>}
            </div>
          )}

          <div className="space-y-1.5">
            {isVisible("ingredients") && (
              <div className="p-2 rounded-lg">
                <p className="text-[6px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Composição</p>
                <p className="text-[7px] text-gray-600 leading-relaxed line-clamp-2">
                  {fields.ingredients || "Composição não informada."}
                </p>
              </div>
            )}

            {isVisible("directions") && (
              <div className="p-2 rounded-lg">
                <p className="text-[6px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Modo de uso</p>
                <p className="text-[7px] text-gray-600 leading-relaxed line-clamp-2">
                  {fields.directions || "Modo de uso não informado."}
                </p>
              </div>
            )}

            {isVisible("anvisa") && (
              <div className="p-2 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[6px] font-bold text-gray-400">CONTEÚDO: {fields.weight || "—"}</p>
                    <p className="text-[6px] text-gray-400">Validade: {fields.expiry || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[5px] text-gray-400">ANVISA: {fields.registration || "—"}</p>
                    <p className="text-[5px] text-gray-400">SAC: {fields.sac || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

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
