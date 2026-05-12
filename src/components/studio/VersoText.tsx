"use client";

import BarcodeSvg from "./BarcodeSvg";
import QrCodeSvg from "./QrCodeSvg";

interface VersoFields {
  productName?: string;
  introduction?: string;
  directions?: string;
  tips?: string;
  warnings?: string;
  ingredientsPT?: string;
  ingredientsEN?: string;
  ingredientsLink?: string;
  manufacturerName?: string;
  manufacturerCnpj?: string;
  manufacturerIe?: string;
  manufacturerAddress?: string;
  manufacturerChemist?: string;
  manufacturerCountry?: string;
  supplierName?: string;
  supplierCnpj?: string;
  supplierIe?: string;
  supplierAddress?: string;
  sac?: string;
  barcode?: string;
  expiry?: string;
  batch?: string;
  registration?: string;
}

interface VersoTextProps {
  fields: VersoFields;
  layerVisible?: (id: string) => boolean;
  baseFontSize?: number;
  className?: string;
  onSectionClick?: (sectionId: string, e: React.MouseEvent) => void;
  ringCls?: (sectionId: string) => string;
}

/**
 * Renderiza o verso do rótulo como **parágrafos diagramados** conforme
 * mapa V2: cada bloco vira um parágrafo único com labels em negrito.
 */
export default function VersoText({
  fields,
  layerVisible = () => true,
  baseFontSize = 7,
  className,
  onSectionClick,
  ringCls = () => "",
}: VersoTextProps) {
  const f = fields;
  const fs = `${baseFontSize}px`;

  const showIntro = layerVisible("introduction") && (f.introduction || f.directions || f.tips);
  const showIngr = layerVisible("ingredients") && (f.ingredientsPT || f.ingredientsEN);
  const showFab = layerVisible("manufacturer") && (f.manufacturerName || f.manufacturerCnpj);
  const showSup = layerVisible("supplier") && f.supplierName;
  const showSac = layerVisible("sac") && f.sac;
  const showVal = layerVisible("anvisa");
  const showBarcode = layerVisible("barcode") && f.barcode;

  const clickHandler = (id: string) => (e: React.MouseEvent) => onSectionClick?.(id, e);

  return (
    <div className={className} style={{ fontSize: fs, lineHeight: 1.5, color: "#374151" }}>
      {/* 1º parágrafo: Introdução + Modo de uso + Dicas + Precauções */}
      {showIntro && (
        <p
          onClick={clickHandler("introduction")}
          className={ringCls("introduction")}
          style={{ marginBottom: 6 }}
        >
          {f.productName && <strong>{f.productName.toUpperCase()} — </strong>}
          {f.introduction}{" "}
          {f.directions && (
            <>
              <strong>MODO DE USO:</strong> {f.directions}{" "}
            </>
          )}
          {f.tips && (
            <>
              <strong>DICAS:</strong> {f.tips}
            </>
          )}
        </p>
      )}

      {/* 2º parágrafo: Ingredientes (PT + EN) com QR-Code opcional */}
      {showIngr && (
        <div
          onClick={clickHandler("ingredients")}
          className={ringCls("ingredients")}
          style={{ marginBottom: 6, display: "flex", gap: 6, alignItems: "flex-start" }}
        >
          <p style={{ flex: 1, margin: 0 }}>
            {f.ingredientsPT && (
              <>
                <strong>COMPOSIÇÃO:</strong> {f.ingredientsPT}
              </>
            )}
            {f.ingredientsEN && (
              <>
                {f.ingredientsPT ? " · " : ""}
                <em>{f.ingredientsEN}</em>
              </>
            )}
          </p>
          {f.ingredientsLink && (
            <div style={{ flexShrink: 0 }}>
              <QrCodeSvg value={f.ingredientsLink} size={baseFontSize * 6} />
            </div>
          )}
        </div>
      )}

      {/* 3º parágrafo: Fabricado por + Fornecedor exclusivo */}
      {(showFab || showSup) && (
        <p
          onClick={clickHandler("manufacturer")}
          className={ringCls("manufacturer")}
          style={{ marginBottom: 6 }}
        >
          {showFab && (
            <>
              <strong>FABRICADO POR:</strong> {f.manufacturerName}
              {f.manufacturerCnpj && ` — CNPJ ${f.manufacturerCnpj}`}
              {f.manufacturerIe && ` / IE ${f.manufacturerIe}`}
              {f.manufacturerAddress && ` — ${f.manufacturerAddress}`}
              {f.manufacturerChemist && ` — Quím. Resp.: CRQ-V ${f.manufacturerChemist}`}
              {f.registration && ` — Processo ANVISA ${f.registration}`}.{" "}
              <strong>{(f.manufacturerCountry || "Indústria Brasileira").toUpperCase()}.</strong>
            </>
          )}
          {showSup && (
            <>
              {" "}
              <strong>FORNECEDOR EXCLUSIVO:</strong> {f.supplierName}
              {f.supplierCnpj && ` — CNPJ ${f.supplierCnpj}`}
              {f.supplierIe && ` / IE ${f.supplierIe}`}
              {f.supplierAddress && ` — ${f.supplierAddress}`}.
            </>
          )}
        </p>
      )}

      {/* SAC */}
      {showSac && (
        <p
          onClick={clickHandler("sac")}
          className={ringCls("sac")}
          style={{ marginBottom: 6 }}
        >
          <strong>SAC:</strong> {f.sac}
        </p>
      )}

      {/* Validade + Lote */}
      {showVal && (
        <p
          onClick={clickHandler("anvisa")}
          className={ringCls("anvisa")}
          style={{ marginBottom: 6 }}
        >
          <strong>VALIDADE E LOTE:</strong> {f.expiry || "VIDE EMBALAGEM"}
          {f.batch && f.batch !== f.expiry && ` — ${f.batch}`}
        </p>
      )}

      {/* Barcode */}
      {showBarcode && (
        <div
          onClick={clickHandler("barcode")}
          className={ringCls("barcode")}
          style={{ marginTop: 4 }}
        >
          <BarcodeSvg value={f.barcode!} width={1} height={baseFontSize * 4} displayValue={true} />
        </div>
      )}
    </div>
  );
}
