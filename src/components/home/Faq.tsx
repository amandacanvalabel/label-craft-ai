"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineChevronDown, HiOutlineQuestionMarkCircle } from "react-icons/hi2";

/**
 * Faq — as objeções que travam o cadastro, respondidas sem rodeio.
 * Fica entre Avaliações e o CTA final: a pessoa já viu o valor, aqui
 * tiramos as últimas dúvidas antes de pedir a ação.
 */
const faqs = [
  {
    q: "Eu não entendo nada de design. Consigo usar?",
    a: "Sim. Você descreve o produto em uma frase e a IA monta o layout inicial. No editor você só troca texto, cor e imagem, do jeito que já faz em qualquer app de edição. Não precisa saber o que é CMYK, sangria ou tipografia: isso a ferramenta resolve.",
  },
  {
    q: "O rótulo sai mesmo dentro das normas da ANVISA?",
    a: "O revisor confere 32 regras da IN 75/2020, da RDC 429/2020 e da RDC 26/2015 antes de você exportar: tamanho mínimo de letra, campos obrigatórios, tabela nutricional no padrão do Anexo IX, lupa “ALTO EM”, alérgenos e glúten. Ele lista o que está faltando para você corrigir ali mesmo. A responsabilidade pelo produto continua sendo do fabricante, mas você exporta sabendo exatamente o que foi verificado.",
  },
  {
    q: "Como funciona a tabela nutricional?",
    a: "Você informa a receita (ingredientes e quantidades) ou os valores por porção. A ferramenta calcula com base TACO/USDA de mais de 1.000 alimentos, aplica o arredondamento e o %VD da norma e monta a tabela no formato exigido. Também decide, pelos seus números, se a lupa “ALTO EM” precisa entrar.",
  },
  {
    q: "Serve para cosméticos também?",
    a: "Sim. Para cosméticos a ferramenta pede os campos que a categoria exige, como INCI, modo de uso, advertências, lote e validade, em vez da tabela nutricional. Alimentos e cosméticos ficam na mesma conta.",
  },
  {
    q: "A gráfica vai aceitar o arquivo?",
    a: "O PDF sai em 300 DPI, CMYK, com sangria de 3 mm e marcas de corte. É a especificação padrão que gráficas pedem para rótulo adesivo e embalagem. Se a sua gráfica tiver alguma exigência específica, você ajusta as medidas no próprio editor.",
  },
  {
    q: "Preciso colocar cartão para testar?",
    a: "Não. O primeiro rótulo é grátis e o cadastro pede só nome, e-mail, CPF ou CNPJ e uma senha. Você assina um plano quando precisar de mais rótulos ou de recursos adicionais, e pode cancelar quando quiser.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-muted/40" />
      <div className="blur-brush-cyan -top-40 left-0 opacity-20" />

      <div className="relative z-10 max-w-[900px] mx-auto px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary gradient-primary-soft px-4 py-1.5 rounded-full border border-primary/10">
            <HiOutlineQuestionMarkCircle className="w-4 h-4" />
            Dúvidas frequentes
          </span>
          <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            O que todo mundo pergunta{" "}
            <span className="gradient-text">antes de começar</span>
          </h2>
        </motion.div>

        <div className="mt-12 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={item.q}
                className="neo-card rounded-2xl overflow-hidden"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 cursor-pointer"
                >
                  <span className="font-bold text-base sm:text-lg leading-snug">{item.q}</span>
                  <HiOutlineChevronDown
                    className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="px-6 pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          className="mt-10 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Ficou alguma dúvida? Escreva pra{" "}
          <a href="mailto:contato@canvalabel.com.br" className="font-semibold text-primary hover:underline">
            contato@canvalabel.com.br
          </a>
        </motion.p>
      </div>
    </section>
  );
};

export default Faq;
