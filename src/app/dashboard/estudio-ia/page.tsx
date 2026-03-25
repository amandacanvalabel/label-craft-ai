"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import StudioTopbar from "@/components/studio/StudioTopbar";
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

export default function EstudioIAPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [projectName, setProjectName] = useState("Novo Rótulo");
  const [saved, setSaved] = useState(true);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [layers, setLayers] = useState(defaultLayers);

  const [productFields, setProductFields] = useState({
    productName: "Suco de Laranja Natural",
    brandName: "FrutaBoa",
    weight: "1L",
    category: "Bebidas",
    ingredients: "Água, açúcar, suco concentrado, ácido cítrico, corante natural de betacaroteno, aromatizante natural.",
    allergens: "CONTÉM DERIVADOS DE LARANJA. PODE CONTER TRAÇOS DE LEITE.",
    expiry: "12 meses",
    registration: "1.2345.6789",
    sac: "0800 123 456",
  });

  useEffect(() => {
    if (editId) {
      setProjectName(`Editando RTL-${editId}`);
      setSaved(true);
    }
  }, [editId]);

  const handleFieldChange = (field: string, value: string) => {
    setProductFields((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  const handleExport = () => {
    // Placeholder
  };

  const handleSelectElement = (id: string | null) => {
    setSelectedElement(id);
    setSelectedLayer(id);
  };

  const handleToggleLayerVisibility = (id: string) => {
    setLayers(layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l));
    setSaved(false);
  };

  const handleToggleLayerLock = (id: string) => {
    setLayers(layers.map((l) => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  const handleApplyTemplate = (templateId: string) => {
    setSaved(false);
  };

  const handleGenerateWithAI = (prompt: string) => {
    setSaved(false);
  };

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-64px)]">
      <StudioTopbar
        projectName={projectName}
        onProjectNameChange={(name) => { setProjectName(name); setSaved(false); }}
        saved={saved}
        onSave={handleSave}
        onExport={handleExport}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftPanel
          collapsed={leftCollapsed}
          onToggle={() => setLeftCollapsed(!leftCollapsed)}
          layers={layers}
          onToggleLayerVisibility={handleToggleLayerVisibility}
          onToggleLayerLock={handleToggleLayerLock}
          onSelectLayer={(id) => { setSelectedLayer(id); setSelectedElement(id); }}
          selectedLayer={selectedLayer}
          onApplyTemplate={handleApplyTemplate}
        />

        <CanvasArea
          elements={[]}
          selectedElement={selectedElement}
          onSelectElement={handleSelectElement}
          labelPreview={{
            productName: productFields.productName,
            category: productFields.category,
            img: "🍊",
          }}
        />

        <RightPanel
          collapsed={rightCollapsed}
          onToggle={() => setRightCollapsed(!rightCollapsed)}
          selectedElement={selectedElement}
          productFields={productFields}
          onFieldChange={handleFieldChange}
          onGenerateWithAI={handleGenerateWithAI}
        />
      </div>
    </div>
  );
}
