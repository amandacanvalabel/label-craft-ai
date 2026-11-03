"use client";

// Botões "Continuar com Google / Facebook". Só aparecem os provedores que
// estão configurados no servidor (/api/auth/providers). Sem nenhum, não
// renderiza nada — nem o divisor.
import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/track";

export const GoogleMark = () => (
  <svg viewBox="0 0 48 48" className="w-[18px] h-[18px]" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export const FacebookMark = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden>
    <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
  </svg>
);

interface Providers { google: boolean; facebook: boolean }

export default function SocialLogin({
  next,
  local,
  dividerText = "ou com e-mail",
}: {
  next?: string;
  local: "login" | "cadastro";
  dividerText?: string;
}) {
  const [prov, setProv] = useState<Providers | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setProv({ google: !!d.google, facebook: !!d.facebook }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!prov || (!prov.google && !prov.facebook)) return null;
  const q = next ? `?next=${encodeURIComponent(next)}` : "";
  const btn =
    "w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-border/70 bg-white text-sm font-semibold text-foreground hover:bg-muted/40 transition-colors";

  return (
    <div>
      <div className="space-y-2.5">
        {prov.google && (
          <a href={`/api/auth/google${q}`} onClick={() => track("login_social_click", { provedor: "google", local })} className={btn}>
            <GoogleMark />
            Continuar com Google
          </a>
        )}
        {prov.facebook && (
          <a href={`/api/auth/facebook${q}`} onClick={() => track("login_social_click", { provedor: "facebook", local })} className={btn}>
            <FacebookMark />
            Continuar com Facebook
          </a>
        )}
      </div>
      <p className="mt-2.5 text-[11px] leading-snug text-muted-foreground text-center">
        Ao continuar, você aceita os <Link href="/termos" target="_blank" className="underline">Termos de Uso</Link> e a{" "}
        <Link href="/privacidade" target="_blank" className="underline">Política de Privacidade</Link>.
      </p>
      <div className="flex items-center gap-3 my-5 text-[11px] text-muted-foreground">
        <div className="flex-1 h-px bg-border/60" />
        {dividerText}
        <div className="flex-1 h-px bg-border/60" />
      </div>
    </div>
  );
}
