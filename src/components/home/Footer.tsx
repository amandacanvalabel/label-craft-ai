import Link from "next/link";
import {
  HiOutlineEnvelope,
  HiOutlineMapPin,
} from "react-icons/hi2";
import {
  RiInstagramLine,
  RiFacebookCircleLine,
  RiLinkedinLine,
  RiYoutubeLine,
} from "react-icons/ri";
import { getSiteSettings } from "@/lib/site-settings";

// Só links que levam a algum lugar de verdade. Páginas que ainda não existem
// (blog, central de ajuda, termos) entram aqui quando forem criadas.
const footerLinks = {
  produto: [
    { label: "O que resolve", href: "#dores" },
    { label: "Funcionalidades", href: "#beneficios" },
    { label: "Como funciona", href: "#demonstracao" },
    { label: "Planos e preços", href: "#planos" },
  ],
  "para você": [
    { label: "Criar conta grátis", href: "#planos" },
    { label: "Entrar na plataforma", href: "/login" },
    { label: "Gerar prévia com IA", href: "/canvalabel-alimentos.html" },
    { label: "Dúvidas frequentes", href: "#faq" },
  ],
};

// Redes sociais: preencha os links reais no admin / aqui quando existirem.
// Enquanto estiverem vazios, os ícones não são renderizados.
const socialLinks: { icon: typeof RiInstagramLine; href: string; label: string }[] = [
  { icon: RiInstagramLine, href: "", label: "Instagram" },
  { icon: RiFacebookCircleLine, href: "", label: "Facebook" },
  { icon: RiLinkedinLine, href: "", label: "LinkedIn" },
  { icon: RiYoutubeLine, href: "", label: "YouTube" },
].filter((s) => s.href);

const Footer = async () => {
  const settings = await getSiteSettings();

  return (
    <footer className="relative bg-foreground text-white pt-20 pb-8 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />

      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.png" alt={settings.siteName} className="w-9 h-9 object-contain" />
              <span className="text-lg font-bold tracking-tight">
                {settings.siteName}
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-sm">
              Rótulos de alimentos e cosméticos dentro das normas da ANVISA,
              sem designer e sem medo de errar. Do briefing ao PDF pra gráfica
              em minutos.
            </p>
            <div className="space-y-3 text-sm text-white/40">
              <a
                href="mailto:contato@canvalabel.com.br"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <HiOutlineEnvelope className="w-4 h-4" />
                contato@canvalabel.com.br
              </a>
              <div className="flex items-center gap-2">
                <HiOutlineMapPin className="w-4 h-4" />
                São Paulo, SP · Brasil
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-white/80">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* CTA */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-white/80">
              Comece hoje
            </h4>
            <p className="text-sm text-white/40 mb-4">
              Primeiro rótulo grátis, sem cartão de crédito.
            </p>
            <a
              href="#planos"
              className="inline-flex w-full items-center justify-center gradient-primary px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Criar meu rótulo grátis
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {settings.siteName}. Todos os direitos
            reservados.
          </p>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}

          <p className="text-xs text-white/30">
            Referências: IN 75/2020 · RDC 429/2020 · RDC 26/2015 (ANVISA)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
