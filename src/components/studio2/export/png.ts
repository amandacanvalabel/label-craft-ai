"use client";

import type { StudioState } from "../types";
import { captureFace } from "./capture";

const DPI = 300;
const PX_PER_MM = DPI / 25.4;

function safeName(s: string) {
  return (s || "rotulo").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "rotulo";
}

// Exporta a face atual como PNG de alta resolução (300 DPI).
export async function exportPNG(state: StudioState, faceId?: string): Promise<string> {
  const face = faceId || state.editor.face;
  const canvas = await captureFace(state, face, PX_PER_MM, { finishes: false });
  const filename = `canvalabel_${safeName(state.editor.docname)}_${face}.png`;
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, "image/png");
  });
  return filename;
}
