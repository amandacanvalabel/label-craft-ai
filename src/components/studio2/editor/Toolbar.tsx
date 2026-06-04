"use client";

import { Fragment } from "react";
import { useStudioStore } from "../store/useStudioStore";
import { EDICONS } from "../data/edicons";
import { pickFile } from "../hooks/useFilePicker";
import type { ElementType } from "../types";

const TOOLS: { id: string; label: string; sep?: boolean }[] = [
  { id: "text", label: "Texto" },
  { id: "textCurve", label: "Texto em curva" },
  { id: "rect", label: "Caixa" },
  { id: "ellipse", label: "Elipse" },
  { id: "line", label: "Linha" },
  { id: "shapeGallery", label: "Formas" },
  { id: "image", label: "Imagem", sep: true },
  { id: "barcode", label: "Cód.Barras" },
  { id: "qr", label: "QR Code" },
];

// Porte de buildEditor() → toolbar de ferramentas (#edToolbar).
export default function Toolbar({ onOpenShapes }: { onOpenShapes: () => void }) {
  const edAdd = useStudioStore((s) => s.edAdd);

  const onClick = (id: string) => {
    if (id === "image") return pickFile((d) => edAdd("image", { src: d }));
    if (id === "shapeGallery") return onOpenShapes();
    edAdd(id as ElementType);
  };

  return (
    <div className="ed-tools" id="edToolbar">
      {TOOLS.map((t) => (
        <Fragment key={t.id}>
          {t.sep && <div className="tsep" />}
          <button className="ed-tool" onClick={() => onClick(t.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: EDICONS[t.id] || "" }} />
            <span>{t.label}</span>
          </button>
        </Fragment>
      ))}
    </div>
  );
}
