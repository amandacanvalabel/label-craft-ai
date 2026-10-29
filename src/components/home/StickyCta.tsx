"use client";

import { useEffect, useState } from "react";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { track } from "@/lib/track";

/**
 * StickyCta — barra fixa no rodapé, só no celular.
 * Aparece depois que a pessoa rola além do hero e some quando a seção de
 * planos (onde ela já tem o botão) ou o rodapé estão na tela.
 */
const StickyCta = () => {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const planos = document.getElementById("planos");
    const footer = document.querySelector("footer");
    let planosNaTela = false;
    let footerNaTela = false;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === planos) planosNaTela = e.isIntersecting;
          if (e.target === footer) footerNaTela = e.isIntersecting;
        }
        atualizar();
      },
      { threshold: 0.05 }
    );
    if (planos) io.observe(planos);
    if (footer) io.observe(footer);

    const atualizar = () => {
      const passouHero = window.scrollY > window.innerHeight * 0.9;
      setVisivel(passouHero && !planosNaTela && !footerNaTela);
    };
    window.addEventListener("scroll", atualizar, { passive: true });
    atualizar();
    return () => {
      window.removeEventListener("scroll", atualizar);
      io.disconnect();
    };
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 bg-white/90 backdrop-blur border-t border-border/60 transition-transform duration-300 ${
        visivel ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visivel}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground leading-none">A partir de</p>
          <p className="text-base font-extrabold leading-tight">R$ 9,90<span className="text-xs font-medium text-muted-foreground">/mês</span></p>
        </div>
        <a
          href="#planos"
          onClick={() => track("cta_click", { local: "sticky_mobile" })}
          className="inline-flex items-center gap-2 gradient-primary text-white font-semibold text-sm rounded-full px-5 py-3 shadow-lg shadow-primary/25"
        >
          Criar meu rótulo
          <HiOutlineArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default StickyCta;
