"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Renderiza um QR-Code como SVG vetorial inline.
 * Ideal para impressão em alta resolução (próprio para rótulos).
 */
export default function QrCodeSvg({ value, size = 80, className }: QrCodeSvgProps) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    if (!value) {
      setSvg("");
      return;
    }
    QRCode.toString(value, { type: "svg", margin: 0, width: size, errorCorrectionLevel: "M" })
      .then(setSvg)
      .catch(() => setSvg(""));
  }, [value, size]);

  if (!svg) return null;
  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      aria-label={`QR-Code para ${value}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
