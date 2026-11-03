"use client";

// Faixa no topo do painel para quem ainda não pagou (conta criada e salva,
// pagamento pendente), para plano vencido e para conta sem plano (Google).
// Abre o PIX/boleto pendente sem sair do painel e acompanha a confirmação.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineCheck, HiOutlineClipboard, HiOutlineXMark, HiOutlineArrowTopRightOnSquare, HiOutlineClock, HiOutlineCheckCircle } from "react-icons/hi2";

interface Pending {
  id: string;
  amount: number;
  method: "PIX" | "BOLETO" | "CARD";
  invoiceUrl: string | null;
  pix?: { qrCodeImage: string; qrCodePayload: string; expirationDate: string };
}
interface Info {
  status: "none" | "active" | "pending" | "expired";
  active: boolean;
  plan: { name: string; price: number } | null;
  expiresAt: string | null;
  pending: Pending | null;
}

const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function PlanStatusBanner() {
  const [info, setInfo] = useState<Info | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const load = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let alive = true;
    fetch("/api/subscriber/subscribe")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d) setInfo(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  // Enquanto o modal do PIX estiver aberto, confere a confirmação a cada 5s.
  useEffect(() => {
    if (!open || !info?.pending) return;
    const id = info.pending.id;
    poll.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/checkout/status/${id}`);
        const d = await r.json();
        if (d.status === "CONFIRMED") {
          if (poll.current) clearInterval(poll.current);
          setPaid(true);
          setTimeout(() => {
            setOpen(false);
            load();
          }, 2500);
        }
      } catch {
        /* tenta de novo */
      }
    }, 5000);
    return () => {
      if (poll.current) clearInterval(poll.current);
    };
  }, [open, info, load]);

  if (!info || info.status === "active") return null;

  const pending = info.pending;
  const title =
    info.status === "none"
      ? "Sua conta está pronta — escolha um plano para liberar a exportação."
      : info.status === "expired"
      ? `Seu plano ${info.plan?.name ?? ""} venceu${info.expiresAt ? ` em ${new Date(info.expiresAt).toLocaleDateString("pt-BR")}` : ""}.`
      : `Seu plano ${info.plan?.name ?? ""} aguarda o pagamento${pending ? ` de ${fmt(pending.amount)}` : ""}.`;
  const sub =
    info.status === "none"
      ? "Enquanto isso você pode montar rótulos à vontade no modo gratuito."
      : "Seus rótulos continuam salvos. Até regularizar, valem os limites do modo gratuito e a exportação fica bloqueada.";

  const copy = async () => {
    if (!pending?.pix) return;
    await navigator.clipboard.writeText(pending.pix.qrCodePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <div className="mb-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <HiOutlineClock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-900">{title}</p>
          <p className="text-xs text-amber-800/80">{sub}</p>
        </div>
        {pending && (pending.method === "PIX" ? pending.pix : pending.invoiceUrl) ? (
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold gradient-primary text-white shadow-md hover:-translate-y-0.5 transition-all"
          >
            {pending.method === "PIX" ? "Pagar com PIX" : "Abrir boleto"}
          </button>
        ) : (
          <Link
            href="/planos"
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold gradient-primary text-white shadow-md hover:-translate-y-0.5 transition-all text-center"
          >
            {info.status === "expired" ? "Renovar agora" : info.status === "none" ? "Ver planos" : "Gerar pagamento"}
          </Link>
        )}
      </div>

      <AnimatePresence>
        {open && pending && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
            >
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center" aria-label="Fechar">
                <HiOutlineXMark className="w-5 h-5" />
              </button>
              {paid ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <HiOutlineCheckCircle className="w-14 h-14 text-emerald-500" />
                  <h4 className="mt-3 text-lg font-bold">Pagamento confirmado!</h4>
                  <p className="text-sm text-muted-foreground mt-1">Seu plano {info.plan?.name} está ativo.</p>
                </div>
              ) : (
                <>
                  <h4 className="text-lg font-bold text-foreground">Pagar {fmt(pending.amount)}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Plano {info.plan?.name}</p>
                  {pending.method === "PIX" && pending.pix && (
                    <div className="mt-4 flex flex-col items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`data:image/png;base64,${pending.pix.qrCodeImage}`} alt="QR Code PIX" className="w-52 h-52 rounded-xl border border-border/50" />
                      <p className="mt-3 text-sm font-medium">Escaneie com o app do banco</p>
                      <div className="mt-3 w-full flex items-center gap-2 bg-muted/50 rounded-xl p-3 border border-border/40">
                        <code className="flex-1 text-[11px] text-muted-foreground break-all line-clamp-2">{pending.pix.qrCodePayload}</code>
                        <button onClick={copy} className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20">
                          {copied ? (
                            <span className="flex items-center gap-1"><HiOutlineCheck className="w-3.5 h-3.5" /> Copiado</span>
                          ) : (
                            <span className="flex items-center gap-1"><HiOutlineClipboard className="w-3.5 h-3.5" /> Copiar</span>
                          )}
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Aguardando confirmação…
                      </p>
                    </div>
                  )}
                  {pending.method !== "PIX" && pending.invoiceUrl && (
                    <a
                      href={pending.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 w-full py-3.5 rounded-2xl font-semibold text-sm gradient-primary text-white flex items-center justify-center gap-2"
                    >
                      <HiOutlineArrowTopRightOnSquare className="w-4 h-4" /> Abrir boleto / fatura
                    </a>
                  )}
                  <p className="mt-4 text-[11px] text-muted-foreground text-center">
                    Quer trocar a forma de pagamento?{" "}
                    <Link href="/planos" className="text-primary font-semibold hover:underline">Gerar outra cobrança</Link>
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
