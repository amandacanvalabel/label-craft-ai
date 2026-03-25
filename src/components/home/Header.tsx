"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { HiOutlineMenuAlt3, HiX } from "react-icons/hi";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Benefícios", href: "#beneficios" },
  { label: "Demonstração", href: "#demonstracao" },
  { label: "Planos", href: "#planos" },
  { label: "Avaliações", href: "#avaliacoes" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-strong shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Canva<span className="gradient-text">Label</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Entrar
          </Link>
          <a
            href="#planos"
            className="text-sm font-semibold text-primary-foreground gradient-primary rounded-full px-6 py-2.5 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Assinar Plano
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Menu"
        >
          {mobileOpen ? <HiX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-border/50 px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-center text-foreground py-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
            >
              Entrar
            </Link>
            <a
              href="#planos"
              className="text-sm font-semibold text-center text-primary-foreground gradient-primary rounded-xl py-2.5"
            >
              Assinar Plano
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
