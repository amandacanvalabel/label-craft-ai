// /criar — funil "prévia com IA sem login".
// Substitui o funil que vivia em public/canvalabel-alimentos.html: agora a
// prévia é gerada aqui e, depois do login/cadastro, a pessoa cai no estúdio
// unificado (/dashboard/estudio-ia) com prompt e arte preservados.
import type { Metadata } from "next";
import CriarPrevia from "./CriarPrevia";

export const metadata: Metadata = {
  title: "Gere uma prévia do seu rótulo com IA | CanvaLabel",
  description:
    "Descreva seu alimento ou cosmético e veja em segundos como o rótulo pode ficar. Depois, finalize com tudo que a ANVISA exige.",
};

export default function CriarPage() {
  return <CriarPrevia />;
}
