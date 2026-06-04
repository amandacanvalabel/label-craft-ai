import StudioApp from "@/components/studio2/StudioApp";

// Editor v2 (CanvaLabel) — porte do canvalabel-parte3q-EDITOR.html.
// Substitui o estúdio anterior. O chrome do dashboard é ocultado para a rota
// do estúdio (ver DashboardLayout); a auth continua sendo feita lá.
export default async function EstudioIAPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <StudioApp modelId={id} />;
}
