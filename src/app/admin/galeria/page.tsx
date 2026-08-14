"use client";

import { useEffect, useRef, useState } from "react";
import { HiOutlineCloudArrowUp, HiOutlineTrash, HiOutlinePhoto } from "react-icons/hi2";
import { motion } from "framer-motion";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/admin/FormField";
import { toast } from "sonner";

interface GalleryImage {
  url: string;
  pathname: string;
  uploadedAt: string;
}

export default function GaleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/gallery")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setImages(d.images); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error(`"${file.name}" passa de 2MB e foi ignorada`);
          continue;
        }
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/admin/gallery", { method: "POST", body: fd });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          toast.error(e.error || `Falha ao enviar "${file.name}"`);
        }
      }
      toast.success("Imagens atualizadas");
      load();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async (url: string) => {
    setDeleting(url);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        toast.error("Não foi possível remover");
        return;
      }
      toast.success("Imagem removida");
      setImages((prev) => prev.filter((i) => i.url !== url));
    } finally {
      setDeleting(null);
    }
  };

  const count = images.length;

  return (
    <div>
      <PageHeader
        title="Galeria da Landing"
        subtitle={loading ? "Carregando..." : `${count} ${count === 1 ? "imagem" : "imagens"} na galeria de exemplos`}
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <Button type="button" variant="primary" disabled={uploading} onClick={() => inputRef.current?.click()}>
              <HiOutlineCloudArrowUp className="w-4 h-4" />
              {uploading ? "Enviando..." : "Enviar imagens"}
            </Button>
          </>
        }
      />

      <p className="text-sm text-muted-foreground mb-6 -mt-4">
        Essas imagens aparecem na seção &quot;Exemplos de rótulos&quot; da página inicial.
        PNG, JPG ou WebP, até 2MB cada. Você pode enviar várias de uma vez. Passe o mouse
        sobre uma imagem para removê-la.
      </p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : count === 0 ? (
        <div className="border-2 border-dashed border-border/60 dark:border-white/15 rounded-2xl p-14 text-center">
          <HiOutlinePhoto className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhuma imagem ainda. Clique em &quot;Enviar imagens&quot; para adicionar exemplos de rótulos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <motion.div
              key={img.url}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-border/40 dark:border-white/10 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Exemplo de rótulo" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(img.url)}
                disabled={deleting === img.url}
                className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 disabled:opacity-100"
                title="Remover"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
