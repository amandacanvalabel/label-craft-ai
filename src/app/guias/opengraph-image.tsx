import { ogCard, OG_SIZE } from "@/components/guias/ogCard";

export const alt = "Guias de rotulagem ANVISA para alimentos e cosméticos";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    etiqueta: "Guias gratuitos",
    titulo: "Rotulagem ANVISA para alimentos e cosméticos, sem complicação",
    rodape: "RDC 727/2022 · RDC 429/2020 · RDC 907/2024",
  });
}
