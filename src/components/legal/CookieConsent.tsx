"use client";

// Aviso de cookies (LGPD). Cookies essenciais sempre valem; o Google Analytics
// só liga depois do "Aceitar" (Consent Mode: começa negado no layout e aqui
// vira "granted"). A escolha fica em localStorage por 12 meses.
import { useEffect, useState } from "react";
import Link from "next/link";

export const CONSENT_KEY = "cl_cookie_consent";
const TTL = 365 * 86_400_000;

interface Consent {
  analytics: boolean;
  ts: number;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (!c || typeof c.analytics !== "boolean" || Date.now() - (c.ts || 0) > TTL) return null;
    return c;
  } catch {
    return null;
  }
}

export function applyConsent(analytics: boolean) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ analytics, ts: Date.now() }));
  } catch {
    /* sem storage */
  }
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
  window.dispatchEvent(new CustomEvent("cl-consent", { detail: { analytics } }));
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (c) {
      if (c.analytics) applyConsent(true);
    } else {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
    const reopen = () => setVisible(true);
    window.addEventListener("cl-open-consent", reopen);
    return () => window.removeEventListener("cl-open-consent", reopen);
  }, []);

  if (!visible) return null;

  const choose = (analytics: boolean) => {
    applyConsent(analytics);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-[90] p-4 sm:p-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl bg-white shadow-2xl border border-border/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 text-sm text-foreground/90">
          <p className="font-semibold">Cookies no CanvaLabel</p>
          <p className="text-muted-foreground text-[13px] mt-1 leading-relaxed">
            Usamos cookies essenciais para a plataforma funcionar e, se você permitir, o Google Analytics para entender como o
            site é usado. Sem publicidade. Saiba mais na{" "}
            <Link href="/cookies" className="underline hover:text-foreground">Política de Cookies</Link> e na{" "}
            <Link href="/privacidade" className="underline hover:text-foreground">Política de Privacidade</Link>.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => choose(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-muted/50 transition-colors"
          >
            Só essenciais
          </button>
          <button
            onClick={() => choose(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold gradient-primary text-white shadow-md hover:-translate-y-0.5 transition-all"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
