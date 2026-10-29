// Handoff do funil anônimo (/criar) para o estúdio (/dashboard/estudio-ia).
//
// A pessoa descreve o produto e vê a prévia gerada pela IA SEM login. Para
// continuar (dados da ANVISA), ela entra ou cria a conta. Guardamos o que ela
// já fez no localStorage e o estúdio recupera na abertura, pra ninguém perder
// o prompt nem a arte depois do cadastro.
export interface Handoff {
  prompt: string;
  produto: "alimento" | "cosmetico";
  image: string | null; // data URL (png) da prévia
  ts: number;
}

export const HANDOFF_KEY = "canvalabel.handoff";
export const HANDOFF_TTL_MS = 1000 * 60 * 60 * 24 * 3; // 3 dias
// Destino único do funil: o estúdio lê ?handoff=1 e aplica o que foi salvo.
export const HANDOFF_DEST = "/dashboard/estudio-ia?handoff=1";

export function saveHandoff(h: Omit<Handoff, "ts">) {
  try {
    localStorage.setItem(HANDOFF_KEY, JSON.stringify({ ...h, ts: Date.now() }));
  } catch {
    // Imagem grande demais pro localStorage: salva ao menos prompt + produto.
    try {
      localStorage.setItem(HANDOFF_KEY, JSON.stringify({ ...h, image: null, ts: Date.now() }));
    } catch {
      /* sem storage */
    }
  }
}

export function readHandoff(): Handoff | null {
  try {
    const raw = localStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    const h = JSON.parse(raw) as Handoff;
    if (!h || typeof h.prompt !== "string") return null;
    if (Date.now() - (h.ts || 0) > HANDOFF_TTL_MS) {
      localStorage.removeItem(HANDOFF_KEY);
      return null;
    }
    return h;
  } catch {
    return null;
  }
}

export function clearHandoff() {
  try {
    localStorage.removeItem(HANDOFF_KEY);
  } catch {
    /* ignora */
  }
}
