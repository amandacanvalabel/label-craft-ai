"use client";

import { motion } from "framer-motion";
import {
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
  HiOutlineClock,
  HiOutlineTableCells,
  HiOutlineQuestionMarkCircle,
  HiOutlinePrinter,
  HiOutlineShieldExclamation,
} from "react-icons/hi2";

/**
 * Dores — "Isso parece familiar?"
 * Cada card mostra a dor real de quem produz alimento/cosmético e, logo
 * abaixo, como o CanvaLabel resolve. É a ponte entre o hero e os benefícios:
 * a pessoa se reconhece no problema antes de ver a solução.
 */
const dores = [
  {
    icon: HiOutlineShieldExclamation,
    dor: "Medo de reprovar na ANVISA",
    detalhe:
      "Uma letra abaixo de 1 mm, uma advertência faltando — e o lote volta, com multa e recolhimento.",
    solucao: "O revisor confere 32 regras, norma por norma, e aponta o que falta antes de você exportar.",
  },
  {
    icon: HiOutlineBanknotes,
    dor: "Designer cobra caro e não conhece a norma",
    detalhe:
      "R$ 2 a 3 mil por rótulo, semanas de ida e volta, e no fim quem responde pela conformidade é você.",
    solucao: "Layout profissional gerado com IA, já dentro das regras, a partir de R$ 9,90 por mês.",
  },
  {
    icon: HiOutlineTableCells,
    dor: "Tabela nutricional na mão",
    detalhe:
      "Horas de planilha, arredondamento errado, porção fora do padrão — e a lupa “ALTO EM” que ninguém sabe quando entra.",
    solucao: "Calculada automaticamente pela receita, com base TACO/USDA de +1.000 alimentos, no layout do Anexo IX.",
  },
  {
    icon: HiOutlineQuestionMarkCircle,
    dor: "Não sei o que é obrigatório",
    detalhe:
      "Alérgenos, glúten, lactose, lote, validade, INCI, modo de uso… cada categoria tem uma lista diferente.",
    solucao: "A ferramenta pede exatamente os campos que a sua categoria exige. Nada a mais, nada faltando.",
  },
  {
    icon: HiOutlinePrinter,
    dor: "O arquivo volta da gráfica",
    detalhe:
      "Sem sangria, fora do CMYK, resolução baixa. Mais uma semana perdida e mais uma cobrança.",
    solucao: "PDF em 300 DPI, CMYK, com sangria de 3 mm e marcas de corte. A gráfica aceita de primeira.",
  },
  {
    icon: HiOutlineClock,
    dor: "O lançamento trava no rótulo",
    detalhe:
      "Produto pronto, embalagem comprada, cliente esperando — e o rótulo ainda em revisão.",
    solucao: "Do briefing ao arquivo final em minutos. Você lança quando quiser, não quando dá.",
  },
];

const Dores = () => {
  return (
    <section id="dores" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pattern-dots opacity-30" />
      <div className="blur-brush-blue -top-40 right-0 opacity-30" />

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Cabeçalho */}
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary gradient-primary-soft px-4 py-1.5 rounded-full border border-primary/10">
            <HiOutlineExclamationTriangle className="w-4 h-4" />
            Isso parece familiar?
          </span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Quem produz alimento ou cosmético{" "}
            <span className="gradient-text">passa por isso</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Não precisa ser assim. Cada problema abaixo foi o motivo de uma
            funcionalidade do CanvaLabel existir.
          </p>
        </motion.div>

        {/* Grid dor → solução */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dores.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.dor}
                className="neo-card group relative flex flex-col p-7 rounded-2xl transition-transform duration-300 hover:-translate-y-1"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              >
                {/* A dor */}
                <div className="flex items-start gap-4">
                  <span className="shrink-0 w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-500/80">
                      O problema
                    </p>
                    <h3 className="mt-1 text-lg font-bold leading-snug">{item.dor}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {item.detalhe}
                </p>

                {/* Divisor */}
                <div className="my-5 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* A solução */}
                <div className="flex items-start gap-3 mt-auto">
                  <HiOutlineCheckCircle className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Como o CanvaLabel resolve
                    </p>
                    <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
                      {item.solucao}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Ponte para os benefícios */}
        <motion.p
          className="mt-14 text-center text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Resolvemos cada um desses problemas em um só lugar.{" "}
          <a href="#beneficios" className="font-semibold text-primary hover:underline">
            Veja como ↓
          </a>
        </motion.p>
      </div>
    </section>
  );
};

export default Dores;
