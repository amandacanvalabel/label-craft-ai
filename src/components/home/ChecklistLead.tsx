"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineClipboardDocumentCheck, HiOutlineArrowRight, HiOutlineCheckCircle } from "react-icons/hi2";
import { track } from "@/lib/track";

/**
 * ChecklistLead — material gratuito em troca do e-mail.
 * Para quem ainda não vai assinar hoje: entrega valor real (os 32 itens que o
 * revisor confere) e deixa um contato para follow-up. Salva em /api/leads.
 */
const ChecklistLead = () => {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<"idle" | "loading" | "ok" | "erro">("idle");
  const [erro, setErro] = useState("");
  const [url, setUrl] = useState("/checklist-anvisa-32-itens.html");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("loading");
    setErro("");
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "checklist" }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Não deu certo. Tente de novo.");
      if (d.url) setUrl(d.url);
      setEstado("ok");
      track("lead_checklist", { source: "checklist" });
      window.open(d.url || url, "_blank", "noopener");
    } catch (err) {
      setEstado("erro");
      setErro(err instanceof Error ? err.message : "Não deu certo. Tente de novo.");
    }
  };

  return (
    <section id="checklist" className="relative py-20 sm:py-24 overflow-hidden">
      <div className="max-w-[1100px] mx-auto px-6">
        <motion.div
          className="neo-card rounded-3xl p-8 sm:p-12 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary gradient-primary-soft px-4 py-1.5 rounded-full border border-primary/10">
              <HiOutlineClipboardDocumentCheck className="w-4 h-4" />
              Material gratuito
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ainda não vai assinar?{" "}
              <span className="gradient-text">Leve o checklist dos 32 itens</span>{" "}
              que a ANVISA confere no seu rótulo
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              É a mesma lista que o revisor do CanvaLabel usa: identificação,
              origem, lote e validade, ingredientes e alérgenos, tabela
              nutricional, lupa “ALTO EM” e legibilidade. Imprima e confira o
              seu rótulo atual item por item antes de mandar pra gráfica.
            </p>
            <ul className="mt-5 grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
              {[
                "Organizado por bloco do rótulo",
                "Com a norma de cada exigência",
                "Pronto pra imprimir ou salvar em PDF",
                "Atualizado para IN 75/2020 e RDC 429/2020",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-muted/50 border border-border/60 p-6 sm:p-7">
            {estado === "ok" ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <HiOutlineCheckCircle className="w-6 h-6" />
                </div>
                <p className="font-bold">Checklist liberado!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Abrimos em uma nova aba. Se não apareceu,{" "}
                  <a href={url} target="_blank" rel="noopener" className="text-primary font-semibold hover:underline">
                    clique aqui
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={enviar} className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium">Seu melhor e-mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@suamarca.com.br"
                    className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-primary transition-colors"
                  />
                </label>
                <button
                  type="submit"
                  disabled={estado === "loading"}
                  className="group inline-flex w-full items-center justify-center gap-2 gradient-primary text-white font-semibold rounded-xl px-6 py-3.5 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {estado === "loading" ? "Liberando…" : "Quero o checklist"}
                  <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {erro && <p className="text-xs text-red-500">{erro}</p>}
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Usamos seu e-mail só pra enviar o checklist e novidades sobre
                  rotulagem. Sem spam, e você sai quando quiser.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChecklistLead;
