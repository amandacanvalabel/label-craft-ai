"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXMark, HiOutlineSparkles, HiOutlinePhoto, HiOutlineCheckCircle, HiOutlineTag } from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface Pkg {
  id: string; name: string; description: string | null;
  aiCredits: number; imageCredits: number; price: number;
}

function brl(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export default function BuyPackageModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Pkg | null>(null);
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [card, setCard] = useState({ holderName: "", number: "", expiryMonth: "", expiryYear: "", ccv: "" });

  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState<{ discount: number; finalAmount: number; label: string } | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<{ qrCodeImage: string; qrCodePayload: string } | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/credit-packages")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Pkg[]) => { setPackages(d); setSelected(d[0] ?? null); })
      .catch(() => setError("Não foi possível carregar os pacotes."))
      .finally(() => setLoading(false));
  }, []);

  // Recalcula cupom ao trocar de pacote.
  useEffect(() => { setCouponInfo(null); setCouponErr(null); }, [selected?.id]);

  const price = selected?.price ?? 0;
  const finalPrice = couponInfo ? couponInfo.finalAmount : price;

  const applyCoupon = async () => {
    if (!coupon.trim() || !selected) return;
    setCouponErr(null);
    const r = await fetch("/api/coupons/validate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon, amount: price }),
    });
    const d = await r.json();
    if (d.valid) { setCouponInfo({ discount: d.discount, finalAmount: d.finalAmount, label: d.label }); setCouponErr(null); }
    else { setCouponInfo(null); setCouponErr(d.error || "Cupom inválido"); }
  };

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true); setError(null);
    try {
      const body: Record<string, unknown> = { packageId: selected.id, paymentMethod: method };
      if (couponInfo) body.couponCode = coupon.trim();
      if (method === "card") body.creditCard = card;
      const r = await fetch("/api/checkout/package", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Erro ao processar a compra."); return; }
      if (method === "pix" && d.pix) { setPix(d.pix); }
      else if (d.confirmed) { setDone(true); onSuccess?.(); }
      else { setPix(d.pix ?? null); if (!d.pix) setDone(true); onSuccess?.(); }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onMouseDown={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}
      >
        <motion.div
          className="w-full max-w-lg max-h-[88vh] overflow-y-auto bg-white dark:bg-[#12121a] rounded-2xl border border-border/50 dark:border-white/10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 dark:border-white/8">
            <h3 className="text-base font-bold text-foreground">Comprar pacote de créditos</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5">
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Sucesso */}
            {done ? (
              <div className="text-center py-8">
                <HiOutlineCheckCircle className="w-14 h-14 mx-auto text-emerald-500 mb-3" />
                <p className="font-bold text-foreground">Pagamento confirmado!</p>
                <p className="text-sm text-muted-foreground mt-1">Seus créditos já estão disponíveis.</p>
                <button onClick={onClose} className="mt-5 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">Fechar</button>
              </div>
            ) : pix ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Escaneie o QR Code no app do seu banco. Os créditos entram assim que o pagamento for confirmado.</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`data:image/png;base64,${pix.qrCodeImage}`} alt="QR Code PIX" className="w-48 h-48 mx-auto rounded-xl border border-border/40" />
                <button
                  onClick={() => navigator.clipboard?.writeText(pix.qrCodePayload)}
                  className="mt-4 px-4 py-2 rounded-lg bg-muted/60 dark:bg-white/5 text-xs font-semibold text-foreground"
                >
                  Copiar código PIX (copia e cola)
                </button>
                <div className="mt-5">
                  <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Fechar</button>
                </div>
              </div>
            ) : (
              <>
                {/* Pacotes */}
                {loading ? (
                  <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted/50 dark:bg-white/5 animate-pulse" />)}</div>
                ) : (
                  <div className="space-y-2">
                    {packages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3",
                          selected?.id === p.id ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border/50 dark:border-white/10 hover:border-primary/40"
                        )}
                      >
                        <div>
                          <p className="text-sm font-bold text-foreground">{p.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><HiOutlineSparkles className="w-3.5 h-3.5" /> {p.aiCredits} IA</span>
                            <span className="flex items-center gap-1"><HiOutlinePhoto className="w-3.5 h-3.5" /> {p.imageCredits} imagens</span>
                          </div>
                        </div>
                        <span className="text-base font-extrabold text-foreground shrink-0">{brl(p.price)}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Cupom */}
                <div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <HiOutlineTag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                        placeholder="Cupom de desconto"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground"
                      />
                    </div>
                    <button onClick={applyCoupon} className="px-4 py-2.5 rounded-xl bg-muted/60 dark:bg-white/5 text-xs font-semibold text-foreground">Aplicar</button>
                  </div>
                  {couponErr && <p className="text-[11px] text-red-500 mt-1.5">{couponErr}</p>}
                  {couponInfo && <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5">Cupom aplicado: {couponInfo.label} (−{brl(couponInfo.discount)})</p>}
                </div>

                {/* Método */}
                <div className="grid grid-cols-2 gap-2">
                  {(["pix", "card"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={cn(
                        "py-2.5 rounded-xl border text-sm font-semibold transition-all",
                        method === m ? "border-primary ring-2 ring-primary/20 bg-primary/5 text-foreground" : "border-border/50 dark:border-white/10 text-muted-foreground"
                      )}
                    >
                      {m === "pix" ? "PIX" : "Cartão"}
                    </button>
                  ))}
                </div>

                {/* Cartão */}
                {method === "card" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Nome no cartão" value={card.holderName} onChange={(e) => setCard({ ...card, holderName: e.target.value })} className="col-span-2 px-3 py-2.5 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground" />
                    <input placeholder="Número do cartão" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="col-span-2 px-3 py-2.5 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground" />
                    <input placeholder="MM" value={card.expiryMonth} onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })} className="px-3 py-2.5 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground" />
                    <input placeholder="AAAA" value={card.expiryYear} onChange={(e) => setCard({ ...card, expiryYear: e.target.value })} className="px-3 py-2.5 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground" />
                    <input placeholder="CVV" value={card.ccv} onChange={(e) => setCard({ ...card, ccv: e.target.value })} className="col-span-2 px-3 py-2.5 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground" />
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  onClick={submit}
                  disabled={submitting || !selected}
                  className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? "Processando…" : `Pagar ${brl(finalPrice)}`}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
