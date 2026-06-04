"use client";

import { useRouter } from "next/navigation";
import { useStudioStore } from "../store/useStudioStore";

// Logo do editor. Clicar volta para a lista de modelos (nossa "tela inicial").
export default function BrandMark({ withLabel, id }: { withLabel?: boolean; id?: string }) {
  const router = useRouter();
  const dirty = useStudioStore((s) => s.dirty);

  const goHome = () => {
    if (dirty && !confirm("Você tem alterações não salvas. Sair mesmo assim?")) return;
    router.push("/dashboard/modelos-salvos");
  };

  return (
    <button className="brand brand-link" id={id} title="Voltar para os modelos" onClick={goHome}>
      <span className="mk" style={{ background: "transparent", padding: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.png" alt="CanvaLabel" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </span>
      {withLabel && (
        <span>
          CanvaLabel<small>Criação de rótulos</small>
        </span>
      )}
    </button>
  );
}
