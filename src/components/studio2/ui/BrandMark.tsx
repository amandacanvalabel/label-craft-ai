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
      <span className="mk">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M7 10h6M7 14h4" />
        </svg>
      </span>
      {withLabel && (
        <span>
          CanvaLabel<small>Criação de rótulos</small>
        </span>
      )}
    </button>
  );
}
