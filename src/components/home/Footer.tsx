import Link from "next/link";
import {
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
} from "react-icons/hi2";
import {
  RiInstagramLine,
  RiFacebookCircleLine,
  RiLinkedinLine,
  RiYoutubeLine,
} from "react-icons/ri";

const footerLinks = {
  produto: [
    { label: "Funcionalidades", href: "#beneficios" },
    { label: "Planos e Preços", href: "#planos" },
    { label: "Templates", href: "#" },
    { label: "Integrações", href: "#" },
  ],
  recursos: [
    { label: "Central de Ajuda", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Normas ANVISA", href: "#" },
    { label: "API Docs", href: "#" },
  ],
  empresa: [
    { label: "Sobre nós", href: "#" },
    { label: "Carreiras", href: "#" },
    { label: "Contato", href: "#" },
    { label: "Parceiros", href: "#" },
  ],
};

const socialLinks = [
  { icon: RiInstagramLine, href: "#", label: "Instagram" },
  { icon: RiFacebookCircleLine, href: "#", label: "Facebook" },
  { icon: RiLinkedinLine, href: "#", label: "LinkedIn" },
  { icon: RiYoutubeLine, href: "#", label: "YouTube" },
];

const Footer = () => {
  return (
    <footer className="relative bg-foreground text-white pt-20 pb-8 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />

      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">CL</span>
              </div>
              <span className="text-lg font-bold tracking-tight">
                CanvaLabel
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-6">
              A plataforma inteligente para criação de rótulos profissionais em
              conformidade com a ANVISA.
            </p>
            <div className="space-y-3 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <HiOutlineEnvelope className="w-4 h-4" />
                contato@canvalabel.com.br
              </div>
              <div className="flex items-center gap-2">
                <HiOutlinePhone className="w-4 h-4" />
                (11) 9999-9999
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineMapPin className="w-4 h-4" />
                São Paulo, SP
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

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-5 text-white/80">
              Newsletter
            </h4>
            <p className="text-sm text-white/40 mb-4">
              Receba novidades e dicas sobre rotulagem.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
              />
              <button className="gradient-primary px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shrink-0">
                Enviar
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} CanvaLabel. Todos os direitos
            reservados.
          </p>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          <div className="flex gap-5 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Termos
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
