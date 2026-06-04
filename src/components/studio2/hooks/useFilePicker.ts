"use client";

// Porte de pickFile/pickFiles + detectFileKind/humanSize do editor original.

export type FileKind = "svg" | "pdf" | "ai" | "eps" | "image" | "other";

export interface FileMeta {
  kind: FileKind;
  mime: string;
  size: number;
  sizeHuman: string;
}

export function detectFileKind(file: File): FileKind {
  const name = (file.name || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("image/svg") || name.endsWith(".svg")) return "svg";
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".ai")) return "ai";
  if (name.endsWith(".eps") || mime === "application/postscript") return "eps";
  if (mime.startsWith("image/")) return "image";
  return "other";
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(file);
  });
}

// Abre o seletor de arquivo único. cb recebe (dataUrl, name, meta).
export function pickFile(
  cb: (dataUrl: string, name: string, meta: FileMeta) => void,
  accept = "image/*,.pdf,.svg,.ai,.eps",
) {
  const inp = document.getElementById("fileInput") as HTMLInputElement | null;
  if (!inp) return;
  inp.accept = accept;
  inp.value = "";
  inp.onchange = async (e) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const kind = detectFileKind(f);
    const meta: FileMeta = { kind, mime: f.type, size: f.size, sizeHuman: humanSize(f.size) };
    const data = await readAsDataUrl(f);
    cb(data, f.name, meta);
  };
  inp.click();
}

// Abre o seletor de múltiplos arquivos. cb recebe dataUrl[].
export function pickFiles(cb: (dataUrls: string[]) => void, accept = "image/*") {
  const inp = document.getElementById("fileInputMulti") as HTMLInputElement | null;
  if (!inp) return;
  inp.accept = accept;
  inp.value = "";
  inp.onchange = async (e) => {
    const files = [...((e.target as HTMLInputElement).files || [])];
    if (!files.length) return;
    const arr = await Promise.all(files.map(readAsDataUrl));
    cb(arr);
  };
  inp.click();
}
