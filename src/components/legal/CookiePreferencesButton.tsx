"use client";

import { useSyncExternalStore } from "react";
import { applyConsent, readConsent } from "./CookieConsent";

// Botões da página /cookies para mudar a escolha a qualquer momento.
export default function CookiePreferencesButton() {
  // Lê a escolha atual do localStorage e reage ao evento "cl-consent".
  const analytics = useSyncExternalStore(
    (cb) => {
      window.addEventListener("cl-consent", cb);
      return () => window.removeEventListener("cl-consent", cb);
    },
    () => readConsent()?.analytics ?? null,
    () => null,
  );
  const set = (v: boolean) => applyConsent(v);
  return (
    <div className="not-prose flex flex-wrap items-center gap-3 mt-2">
      <button
        type="button"
        onClick={() => set(true)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${analytics === true ? "gradient-primary text-white border-transparent" : "border-border hover:bg-muted/50"}`}
      >
        Permitir medição (Analytics)
      </button>
      <button
        type="button"
        onClick={() => set(false)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${analytics === false ? "bg-foreground text-white border-transparent" : "border-border hover:bg-muted/50"}`}
      >
        Só essenciais
      </button>
      <span className="text-xs text-muted-foreground">
        {analytics === null ? "Você ainda não escolheu." : analytics ? "Medição ativada." : "Apenas cookies essenciais."}
      </span>
    </div>
  );
}
