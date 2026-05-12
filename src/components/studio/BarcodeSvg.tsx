"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeSvgProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  className?: string;
}

/**
 * Renderiza um código de barras EAN-13 (ou similar) como SVG vetorial,
 * pronto para impressão em alta resolução.
 *
 * Aceita 12 dígitos (calcula o dígito verificador) ou 13 dígitos já completos.
 * Se o valor não bater com EAN-13, faz fallback para CODE128.
 */
export default function BarcodeSvg({
  value,
  width = 2,
  height = 50,
  displayValue = true,
  className,
}: BarcodeSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    const numeric = value.replace(/\D/g, "");
    const isEan13 = numeric.length === 12 || numeric.length === 13;

    try {
      JsBarcode(svgRef.current, isEan13 ? numeric : value, {
        format: isEan13 ? "EAN13" : "CODE128",
        width,
        height,
        displayValue,
        font: "monospace",
        fontSize: 14,
        margin: 4,
      });
    } catch {
      // Valor inválido — limpa o SVG
      if (svgRef.current) svgRef.current.innerHTML = "";
    }
  }, [value, width, height, displayValue]);

  if (!value) return null;
  return <svg ref={svgRef} className={className} aria-label={`Código de barras ${value}`} />;
}
