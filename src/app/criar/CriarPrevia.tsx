"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineArrowPath,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { HANDOFF_DEST, saveHandoff } from "@/lib/handoff";
import { track } from "@/lib/track";

type Produto = "alimento" | "cosmetico";
type Fase = "prompt" | "gerando" | "pronto" | "limite" | "erro";

const EXEMPLOS: Record<Produto, string[]> = {
  alimento: [
    "Molho de tomate artesanal com manjericão, vidro de 350 g, estilo rústico italiano",
    "Granola crocante com castanhas e mel, pouch kraft de 250 g, visual natural",
    "Geleia de morango sem adição de açúcar, pote de 200 g, clean e moderna",
  ],
  cosmetico: [
    "Shampoo de óleo de argan, frasco 300 ml, minimalista em tons terrosos",
    "Hidratante corporal de lavanda, bisnaga 200 g, delicado e botânico",
    "Sabonete líquido de capim-limão, frasco 500 ml, fresco e vibrante",
  ],
};

const ETAPAS = [
  "Lendo a descrição do produto",
  "Escolhendo paleta e estilo",
  "Desenhando a arte do rótulo",
  "Ajustando acabamento",
];

export default function CriarPrevia() {
  const router = useRouter();
  const [produto, setProduto] = useState<Produto>("alimento");
  const [prompt, setPrompt] = useState("");
  const [fase, setFase] = useState<Fase>("prompt");
  const [etapa, setEtapa] = useState(0);
  const [imagem, setImagem] = useState<string | null>(null);
  const [erro, setErro] = useState("");
  const [logado, setLogado] = useState<boolean | null>(null);
  const [restantes, setRestantes] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Descobre se já está logado (muda o CTA final).
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setLogado(!!d?.user))
      .catch(() => setLogado(false));
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const gerar = async () => {
    const p = prompt.trim();
    if (p.length < 4) { setErro("Descreva o produto com um pouco mais de detalhe."); return; }
    setErro("");
    setFase("gerando");
    setEtapa(0);
    track("previa_ia_gerar", { produto });
    timerRef.current = setInterval(() => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)), 2600);
    try {
      const r = await fetch("/api/ai/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p, produto, ratio: 0.8 }),
      });
      const d = await r.json();
      if (timerRef.current) clearInterval(timerRef.current);
      if (d.limit) { setFase("limite"); track("previa_ia_limite"); return; }
      if (!r.ok || !d.imageBase64) throw new Error(d.error || "Não deu certo. Tente de novo.");
      const img = d.imageBase64.startsWith("data:") ? d.imageBase64 : `data:image/png;base64,${d.imageBase64}`;
      setImagem(img);
      setRestantes(typeof d.remaining === "number" ? d.remaining : null);
      setEtapa(ETAPAS.length - 1);
      setFase("pronto");
      track("previa_ia_pronta", { produto });
    } catch (e) {
      if (timerRef.current) clearInterval(timerRef.current);
      setErro(e instanceof Error ? e.message : "Não deu certo. Tente de novo.");
      setFase("erro");
    }
  };

  const seguir = (via: "login" | "cadastro" | "direto") => {
    saveHandoff({ prompt: prompt.trim(), produto, image: imagem });
    track("previa_ia_editar", { via, produto });
    const next = encodeURIComponent(HANDOFF_DEST);
    if (via === "direto") router.push(HANDOFF_DEST);
    else if (via === "login") router.push(`/login?next=${next}`);
    else router.push(`/planos?next=${next}`);
  };

  return (
    <main className="min-h-screen bg-[#f5f7fa] text-foreground">
      <header className="max-w-[1100px] mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="CanvaLabel" className="h-8 w-auto" />
        </Link>
        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Já tenho conta</Link>
      </header>

      <section className="max-w-[1100px] mx-auto px-6 pb-24 pt-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary gradient-primary-soft px-4 py-1.5 rounded-full border border-primary/10">
            <HiOutlineSparkles className="w-4 h-4" />
            Prévia grátis, sem cadastro
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Descreva seu produto e <span className="gradient-text">veja o rótulo nascer</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A IA desenha a cara do seu rótulo em segundos. Gostou? Você entra na plataforma e completa com
            tudo que a ANVISA exige — tabela nutricional, lupa, alérgenos ou INCI — sem perder a arte.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
          {/* Entrada */}
          <div className="neo-card rounded-3xl p-7 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <p className="font-bold">O que você produz?</p>
              <div className="inline-flex bg-muted rounded-full p-1">
                {(["alimento", "cosmetico"] as Produto[]).map((t) => (
                  <button key={t} type="button" onClick={() => setProduto(t)} disabled={fase === "gerando"} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${produto === t ? "gradient-primary text-white shadow" : "text-muted-foreground hover:text-foreground"}`}>
                    {t === "alimento" ? "🥫 Alimento" : "🧴 Cosmético"}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={fase === "gerando"}
              rows={4}
              placeholder={EXEMPLOS[produto][0]}
              className="w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-base outline-none focus:border-primary transition-colors resize-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {EXEMPLOS[produto].map((ex) => (
                <button key={ex} type="button" onClick={() => setPrompt(ex)} disabled={fase === "gerando"} className="text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5 hover:border-primary hover:text-primary transition-colors text-left">
                  {ex.split(",")[0]}
                </button>
              ))}
            </div>
            {erro && <p className="mt-3 text-sm text-red-500">{erro}</p>}

            <button
              type="button"
              onClick={gerar}
              disabled={fase === "gerando" || prompt.trim().length < 4}
              className="group mt-5 inline-flex w-full items-center justify-center gap-2 gradient-primary text-white font-semibold rounded-xl px-6 py-4 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {fase === "gerando" ? (
                <><HiOutlineArrowPath className="w-5 h-5 animate-spin" /> Gerando seu rótulo…</>
              ) : fase === "pronto" ? (
                <><HiOutlineArrowPath className="w-5 h-5" /> Gerar outra versão</>
              ) : (
                <><HiOutlineSparkles className="w-5 h-5" /> Gerar prévia com IA</>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Sem cartão, sem cadastro. {restantes !== null && restantes >= 0 ? `Você ainda tem ${restantes} prévia${restantes === 1 ? "" : "s"} grátis hoje.` : ""}
            </p>
          </div>

          {/* Resultado */}
          <div className="neo-card rounded-3xl p-7 sm:p-8 min-h-[420px] flex flex-col">
            <AnimatePresence mode="wait">
              {fase === "prompt" || fase === "erro" ? (
                <motion.div key="vazio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <div className="w-40 h-52 rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-4">
                    <HiOutlineSparkles className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-sm max-w-xs">A prévia do seu rótulo aparece aqui.</p>
                </motion.div>
              ) : fase === "gerando" ? (
                <motion.div key="gerando" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-40 h-52 rounded-2xl overflow-hidden bg-muted">
                    <motion.div className="absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-primary/30 to-transparent" animate={{ top: ["-20%", "110%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }} />
                  </div>
                  <p className="mt-6 font-bold text-lg">Gerando seu rótulo…</p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {ETAPAS.map((t, i) => (
                      <li key={t} className={`flex items-center gap-2 transition-colors ${i < etapa ? "text-emerald-600" : i === etapa ? "text-foreground font-semibold" : "text-muted-foreground/60"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${i <= etapa ? "bg-primary" : "bg-border"}`} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ) : fase === "limite" ? (
                <motion.div key="limite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center mb-3">
                    <HiOutlineLockClosed className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-lg">Você já usou as prévias grátis de hoje</p>
                  <p className="mt-2 text-sm text-muted-foreground max-w-xs">Com uma conta você gera quantas quiser e já edita com as normas da ANVISA. A partir de R$ 9,90/mês.</p>
                  <button type="button" onClick={() => seguir("cadastro")} className="mt-5 inline-flex items-center gap-2 gradient-primary text-white font-semibold rounded-xl px-6 py-3">
                    Ver os planos <HiOutlineArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div key="pronto" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col">
                  <div className="flex-1 flex items-center justify-center">
                    {imagem && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagem} alt="Prévia do rótulo gerada por IA" className="max-h-[360px] w-auto rounded-2xl shadow-xl border border-border/60" />
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-3 flex items-start gap-2">
                      <HiOutlineShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                      Essa é só a cara. Na plataforma a IA monta o rótulo completo com esta arte de fundo, e você preenche o que a ANVISA exige.
                    </p>
                    {logado ? (
                      <button type="button" onClick={() => seguir("direto")} className="group inline-flex w-full items-center justify-center gap-2 gradient-primary text-white font-semibold rounded-xl px-6 py-3.5 shadow-lg shadow-primary/20">
                        Editar rótulo com as normas da ANVISA <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <div className="grid gap-2">
                        <button type="button" onClick={() => seguir("cadastro")} className="group inline-flex w-full items-center justify-center gap-2 gradient-primary text-white font-semibold rounded-xl px-6 py-3.5 shadow-lg shadow-primary/20">
                          Editar rótulo com as normas da ANVISA <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button type="button" onClick={() => seguir("login")} className="inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-primary rounded-xl px-6 py-3 border border-border hover:border-primary transition-colors">
                          Já tenho conta — entrar e continuar
                        </button>
                        <p className="text-center text-[11px] text-muted-foreground">Planos a partir de R$ 9,90/mês · 7 dias de garantia · sua prévia fica salva</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </main>
  );
}
