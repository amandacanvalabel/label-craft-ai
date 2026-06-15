import { prisma } from "./prisma";

// Equipe / colaboração é recurso do plano Profissional.
export async function isPro(subscriberId: string): Promise<boolean> {
  const s = await prisma.subscriber.findUnique({
    where: { id: subscriberId },
    select: { plan: { select: { name: true } } },
  });
  const n = (s?.plan?.name ?? "").toLowerCase();
  return n.includes("pro") || n.includes("profis");
}

// IDs dos donos cujas equipes este assinante participa como membro ATIVO.
export async function activeOwnerIdsFor(subscriberId: string): Promise<string[]> {
  const rows = await prisma.teamMember.findMany({
    where: { memberId: subscriberId, status: "ACTIVE" },
    select: { ownerId: true },
  });
  return rows.map((r) => r.ownerId);
}

// Pode o assinante acessar (abrir/editar) um modelo? Dono OU membro ativo do dono.
export async function canAccessModel(subscriberId: string, modelId: string): Promise<boolean> {
  const model = await prisma.subscriberModel.findUnique({
    where: { id: modelId },
    select: { subscriberId: true },
  });
  if (!model) return false;
  if (model.subscriberId === subscriberId) return true;
  const owners = await activeOwnerIdsFor(subscriberId);
  return owners.includes(model.subscriberId);
}
