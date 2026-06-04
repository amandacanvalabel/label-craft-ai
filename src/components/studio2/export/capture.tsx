"use client";

import { createRoot } from "react-dom/client";
import type { StudioState } from "../types";
import ElementView from "../editor/ElementView";
import { ensureFontLoaded } from "../data/fonts";

// Renderiza uma face do rótulo num container off-screen (React, reaproveitando
// ElementView) e captura com html2canvas-pro. Garante WYSIWYG com o editor.
export async function captureFace(
  state: StudioState,
  faceId: string,
  pxPerMm: number,
  opts: { finishes?: boolean } = {},
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas-pro")).default;
  const L = state.editor.label;
  const els = state.editor.faces[faceId] || [];

  // Pré-carrega as fontes usadas para não capturar com fallback.
  els.forEach((el) => el.font && ensureFontLoaded(el.font));

  const host = document.createElement("div");
  host.className = "studio2 theme-light";
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${L.w * pxPerMm}px;height:${L.h * pxPerMm}px;`;
  const inner = document.createElement("div");
  inner.style.cssText = `position:relative;width:${L.w * pxPerMm}px;height:${L.h * pxPerMm}px;background:${L.bg || "#ffffff"};overflow:hidden;`;
  host.appendChild(inner);
  document.body.appendChild(host);

  const root = createRoot(inner);
  root.render(
    <>
      {els.map((el) => (
        <ElementView key={el.id} el={el} ppm={pxPerMm} selected={false} finish={opts.finishes ? state.finishes[el.id] : undefined} />
      ))}
    </>,
  );

  // Aguarda layout + fontes.
  await new Promise((r) => setTimeout(r, 120));

  const canvas = await html2canvas(inner, { scale: 1, backgroundColor: L.bg || "#ffffff", useCORS: true, allowTaint: true, logging: false });

  root.unmount();
  host.remove();
  return canvas;
}
