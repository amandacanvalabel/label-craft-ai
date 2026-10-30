"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineMagnifyingGlass, HiOutlineArrowRight, HiOutlineInformationCircle } from "react-icons/hi2";
import { track } from "@/lib/track";
import { lupaSvgString } from "@/components/studio2/alimento/lupaArt";
import type { LupaKind } from "@/components/studio2/types";

/**
 * LupaCalculadora — "Seu produto precisa da lupa ALTO EM?"
 * Mini-ferramenta interativa na própria landing. A pessoa digita os valores
 * por 100 g (ou 100 ml) e vê na hora quais lupas a RDC 429/2020 exige.
 * Serve como prova de competência e como gancho para o cadastro.
 *
 * Limites da RDC 429/2020 + IN 75/2020 (rotulagem nutricional frontal):
 *   Sólidos / semissólidos (por 100 g): açúcares adicionados ≥ 15 g,
 *     gorduras saturadas ≥ 6 g, sódio ≥ 600 mg.
 *   Líquidos (por 100 ml): açúcares adicionados ≥ 7,5 g,
 *     gorduras saturadas ≥ 3 g, sódio ≥ 300 mg.
 */
const LIMITES = {
  solido: { acucar: 15, saturada: 6, sodio: 600, unidade: "100 g" },
  liquido: { acucar: 7.5, saturada: 3, sodio: 300, unidade: "100 ml" },
} as const;

type Tipo = keyof typeof LIMITES;

const toNum = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const LupaCalculadora = () => {
  const [tipo, setTipo] = useState<Tipo>("solido");
  const [acucar, setAcucar] = useState("");
  const [saturada, setSaturada] = useState("");
  const [sodio, setSodio] = useState("");
  const [tocou, setTocou] = useState(false);

  const lim = LIMITES[tipo];
  const preenchido = acucar !== "" || saturada !== "" || sodio !== "";

  const resultado = useMemo(() => {
    const r = {
      acucar: toNum(acucar) >= lim.acucar,
      saturada: toNum(saturada) >= lim.saturada,
      sodio: toNum(sodio) >= lim.sodio,
    };
    return { ...r, total: [r.acucar, r.saturada, r.sodio].filter(Boolean).length };
  }, [acucar, saturada, sodio, lim]);

  const onChange = (set: (v: string) => void) => (v: string) => {
    set(v);
    if (!tocou) {
      setTocou(true);
      track("calculadora_lupa_uso", { tipo });
    }
  };

  const campos = [
    { key: "acucar", label: "Açúcares adicionados", unidade: "g", value: acucar, set: setAcucar, limite: `${String(lim.acucar).replace(".", ",")} g` },
    { key: "saturada", label: "Gorduras saturadas", unidade: "g", value: saturada, set: setSaturada, limite: `${lim.saturada} g` },
    { key: "sodio", label: "Sódio", unidade: "mg", value: sodio, set: setSodio, limite: `${lim.sodio} mg` },
  ] as const;

  const lupas = (
    [
      { ativa: resultado.acucar, kind: "acucar" },
      { ativa: resultado.saturada, kind: "gordura" },
      { ativa: resultado.sodio, kind: "sodio" },
    ] as { ativa: boolean; kind: LupaKind }[]
  ).filter((l) => l.ativa);

  return (
    <section id="calculadora" className="relative py-24 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-30" />
      <div className="blur-brush-blue -bottom-40 -left-40 opacity-25" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        <motion.div
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary gradient-primary-soft px-4 py-1.5 rounded-full border border-primary/10">
            <HiOutlineMagnifyingGlass className="w-4 h-4" />
            Teste agora, sem cadastro
          </span>
          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Seu produto precisa da{" "}
            <span className="gradient-text">lupa “ALTO EM”?</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Digite os valores por {lim.unidade} da tabela nutricional e veja na
            hora o que a RDC 429/2020 exige na frente da embalagem. É a mesma
            regra que o CanvaLabel aplica automaticamente no seu rótulo.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 grid lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Entrada */}
          <div className="neo-card rounded-3xl p-7 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <p className="font-bold">Valores do seu produto</p>
              <div className="inline-flex bg-muted rounded-full p-1">
                {(["solido", "liquido"] as Tipo[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      tipo === t ? "gradient-primary text-white shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "solido" ? "Sólido (100 g)" : "Líquido (100 ml)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {campos.map((c) => {
                const acima = c.value !== "" && toNum(c.value) >= toNum(c.limite);
                return (
                  <label key={c.key} className="block">
                    <span className="flex items-center justify-between text-sm font-medium mb-1.5">
                      {c.label}
                      <span className="text-xs text-muted-foreground">limite: {c.limite} / {lim.unidade}</span>
                    </span>
                    <span className="relative block">
                      <input
                        inputMode="decimal"
                        placeholder="0"
                        value={c.value}
                        onChange={(e) => onChange(c.set)(e.target.value)}
                        className={`w-full rounded-xl border bg-white px-4 py-3 pr-14 text-base font-semibold outline-none transition-colors focus:border-primary ${
                          acima ? "border-red-300 bg-red-50/40" : "border-border"
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{c.unidade}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
              <HiOutlineInformationCircle className="w-4 h-4 shrink-0 mt-0.5" />
              Vale para alimentos embalados na ausência do consumidor. Há exceções
              (por exemplo, alguns produtos com face principal menor que 40 cm²), que
              o revisor completo do CanvaLabel considera.
            </p>
          </div>

          {/* Resultado */}
          <div className="neo-card rounded-3xl p-7 sm:p-8 flex flex-col">
            <p className="font-bold mb-5">O que vai na frente da embalagem</p>

            {!preenchido ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-10">
                <HiOutlineMagnifyingGlass className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm">Preencha ao menos um valor ao lado pra ver o resultado.</p>
              </div>
            ) : lupas.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="font-bold text-lg">Sem lupa obrigatória</p>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                  Com esses valores, nenhum nutriente atinge o limite da RDC 429/2020.
                  A tabela nutricional e os alérgenos continuam obrigatórios.
                </p>
              </div>
            ) : (
              <div className="flex-1">
                {/* Arte oficial da ANVISA (Anexo XVII da IN 75/2020), montada pelo mesmo motor do estúdio */}
                <div
                  className="w-full max-w-[300px] [&>svg]:w-full [&>svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: lupaSvgString(lupas.map((l) => l.kind)) }}
                />

                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li>• {lupas.length === 1 ? "1 lupa obrigatória" : `${lupas.length} lupas, em um único selo`}, na metade superior da face principal.</li>
                  <li>• Tamanho mínimo proporcional à área do painel (Anexo XVIII da IN 75/2020).</li>
                  <li>• Preto sobre fundo branco, sem alterar cores ou proporções.</li>
                </ul>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-border/50">
              <a
                href="#planos"
                onClick={() => track("cta_click", { local: "calculadora", lupas: lupas.length })}
                className="group inline-flex w-full items-center justify-center gap-2 gradient-primary text-white font-semibold rounded-xl px-6 py-3.5 shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
              >
                Gerar meu rótulo com a lupa certa
                <HiOutlineArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                O CanvaLabel calcula isso pela sua receita e já posiciona o selo no tamanho certo.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LupaCalculadora;
