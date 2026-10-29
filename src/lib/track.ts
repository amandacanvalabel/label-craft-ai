// Eventos de funil para o Google Analytics (gtag já é carregado no layout).
// Uso: track("cta_click", { local: "hero" }). Nunca quebra a página se o GA
// não carregou (bloqueador de anúncios, por exemplo).
export type TrackParams = Record<string, string | number | boolean | undefined>;

export function track(event: string, params: TrackParams = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };
  try {
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params);
    } else {
      (w.dataLayer = w.dataLayer || []).push({ event, ...params });
    }
  } catch {
    /* silencioso */
  }
}
