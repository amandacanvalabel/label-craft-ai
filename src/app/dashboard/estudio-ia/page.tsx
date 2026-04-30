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

const defaultLayers = [
  { id: "product-image", name: "Imagem do Produto", type: "image", visible: true, locked: false },
  { id: "product-name", name: "Nome do Produto", type: "text", visible: true, locked: false },
  { id: "ingredients", name: "Ingredientes", type: "text", visible: true, locked: false },
  { id: "nutritional", name: "Tabela Nutricional", type: "table", visible: true, locked: false },
  { id: "anvisa", name: "Informações ANVISA", type: "text", visible: true, locked: false },
  { id: "allergens", name: "Alérgenos", type: "text", visible: true, locked: true },
];

const defaultNutrition = [
  { name: "Valor energético", value: "0", unit: "kcal", vd: "0" },
  { name: "Carboidratos", value: "0", unit: "g", vd: "0" },
  { name: "Açúcares totais", value: "0", unit: "g", vd: "—" },
  { name: "Açúcares adicionados", value: "0", unit: "g", vd: "0" },
  { name: "Proteínas", value: "0", unit: "g", vd: "0" },
  { name: "Gorduras totais", value: "0", unit: "g", vd: "0" },
  { name: "Gordura saturada", value: "0", unit: "g", vd: "0" },
  { name: "Gordura trans", value: "0", unit: "g", vd: "0" },
  { name: "Fibra alimentar", value: "0", unit: "g", vd: "0" },
  { name: "Sódio", value: "0", unit: "mg", vd: "0" },
];

const defaultFields = {
  productName: "",
  brandName: "",
  weight: "",
  category: "Bebidas",
  packaging: "",
  ingredients: "",
  allergens: "",
  expiry: "",
  registration: "",
  sac: "",
};

const categoryEmoji: Record<string, string> = {
  Bebidas: "🍊",
  Alimentos: "🥗",
  Suplementos: "💪",
  Cosméticos: "🧴",
  "Higiene Pessoal": "🫧",
  Limpeza: "🧹",
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
  const [nutritionData, setNutritionData] = useState(defaultNutrition);
  const [servingSize, setServingSize] = useState("200ml");
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
        if (cd.productFields) setProductFields(cd.productFields as typeof defaultFields);
        if (cd.nutritionData) setNutritionData(cd.nutritionData as typeof defaultNutrition);
        if (cd.servingSize) setServingSize(cd.servingSize as string);
        if (cd.layers) setLayers(cd.layers as typeof defaultLayers);
        if (cd.activeTemplate) setActiveTemplate(cd.activeTemplate as string);
        if (cd.activeAssets) setActiveAssets(cd.activeAssets as string[]);
        setCurrentStep(3);
        setSaved(true);
      })
      .catch(() => {});
  }, [editId]);

  const buildCanvasData = useCallback(() => ({
    productFields,
    nutritionData,
    servingSize,
    layers,
    activeTemplate,
    activeAssets,
    category: productFields.category,
    status: "draft" as const,
    description: productFields.productName,
    img: categoryEmoji[productFields.category] ?? "📋",
    aiModel: "Grok Vision",
  }), [productFields, nutritionData, servingSize, layers, activeTemplate, activeAssets]);

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

  const handleExport = useCallback(async (format: string, _channel: string, _resolution: string) => {
    const el = document.getElementById("label-canvas");
    if (!el) return;

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(el, {
      scale: format === "pdf" ? 3 : 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const filename = (projectName || "rotulo").replace(/\s+/g, "-").toLowerCase();

    if (format === "pdf") {
      const { jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${filename}.pdf`);
    } else {
      const link = document.createElement("a");
      link.download = `${filename}.${format === "svg" ? "png" : format}`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  }, [projectName]);

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
            allergens={productFields.allergens}
            expiry={productFields.expiry}
            nutritionData={nutritionData}
            servingSize={servingSize}
            onFieldChange={handleFieldChange}
            onNutritionChange={(d) => { setNutritionData(d); setSaved(false); }}
            onServingSizeChange={(v) => { setServingSize(v); setSaved(false); }}
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
                allergens: productFields.allergens,
                weight: productFields.weight,
                expiry: productFields.expiry,
                registration: productFields.registration,
                sac: productFields.sac,
              }}
              layers={layers}
              activeTemplate={activeTemplate}
              activeAssets={activeAssets}
              nutritionData={nutritionData}
              servingSize={servingSize}
            />
            <RightPanel
              collapsed={rightCollapsed}
              onToggle={() => setRightCollapsed(!rightCollapsed)}
              selectedElement={selectedElement}
              productFields={productFields}
              onFieldChange={handleFieldChange}
              onGenerateWithAI={() => setSaved(false)}
              nutritionData={nutritionData}
              onNutritionChange={(d) => { setNutritionData(d); setSaved(false); }}
              servingSize={servingSize}
              onServingSizeChange={(v) => { setServingSize(v); setSaved(false); }}
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
    </div>
  );
}
