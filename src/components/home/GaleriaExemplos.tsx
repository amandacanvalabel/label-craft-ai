import type { GalleryImage } from "@/lib/gallery";

// Seção "Exemplos de rótulos" da landing page.
// As imagens são gerenciadas pelo admin (Galeria). Se não houver imagens,
// a seção não aparece.
export default function GaleriaExemplos({ images }: { images: GalleryImage[] }) {
  if (!images || images.length === 0) return null;

  return (
    <section id="galeria" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-muted/30" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide">Galeria</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-foreground">
            Exemplos de <span className="text-primary">rótulos</span> criados
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Veja alguns rótulos feitos no CanvaLabel.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {images.map((img) => (
            <div
              key={img.url}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-border/40 dark:border-white/10 shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt="Exemplo de rótulo criado no CanvaLabel"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
