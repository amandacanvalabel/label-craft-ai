"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineArrowLeft, HiOutlineSparkles } from "react-icons/hi2";
import { toast } from "sonner";

type FormMode = "login" | "forgot";

const LoginPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao fazer login");
        return;
      }
      toast.success(`Bem-vindo, ${data.user.name}!`);
      router.push(data.redirect);
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implementar chamada à API de recuperação de senha
    setTimeout(() => {
      setIsLoading(false);
      setForgotSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 pattern-dots opacity-40" />
      <div className="absolute inset-0 pattern-grid opacity-20" />
      <div className="blur-brush-blue top-10 -left-20 opacity-50" />
      <div className="blur-brush-cyan -bottom-20 -right-20 opacity-40" />
      <div className="blur-brush-blue top-1/3 right-1/4 w-[500px] h-[500px] opacity-25" />
      <div className="blur-brush-cyan top-2/3 left-1/4 w-[400px] h-[400px] opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="neo-card p-8 sm:p-10">
          {/* Logo inside card */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-base">CL</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Canva<span className="gradient-text">Label</span>
              </span>
            </Link>
          </div>
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-foreground">
                    Bem-vindo de volta
                  </h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    Entre com suas credenciais para acessar o painel
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="email">
                      E-mail
                    </label>
                    <div className="relative">
                      <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="password">
                      Senha
                    </label>
                    <div className="relative">
                      <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setForgotSent(false);
                        setForgotEmail(email);
                      }}
                      className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full gradient-primary text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Entrando...
                      </span>
                    ) : (
                      "Entrar"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Ainda não é assinante?
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Subscribe CTA */}
                <Link
                  href="/#planos"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-all duration-300"
                >
                  <HiOutlineSparkles className="w-4 h-4 text-primary" />
                  Assinar um plano
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back button */}
                <button
                  onClick={() => setMode("login")}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <HiOutlineArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </button>

                {!forgotSent ? (
                  <>
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold text-foreground">
                        Recuperar senha
                      </h1>
                      <p className="text-sm text-muted-foreground mt-2">
                        Informe seu e-mail e enviaremos um link para redefinir sua senha
                      </p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground" htmlFor="forgot-email">
                          E-mail
                        </label>
                        <div className="relative">
                          <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            id="forgot-email"
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full gradient-primary text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      >
                        {isLoading ? (
                          <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Enviando...
                          </span>
                        ) : (
                          "Enviar link de recuperação"
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                      <HiOutlineEnvelope className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      E-mail enviado!
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                      Verifique sua caixa de entrada em{" "}
                      <span className="font-semibold text-foreground">{forgotEmail}</span>{" "}
                      e clique no link para redefinir sua senha.
                    </p>
                    <button
                      onClick={() => {
                        setMode("login");
                        setForgotSent(false);
                      }}
                      className="mt-6 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                    >
                      Voltar ao login
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} CanvaLabel. Todos os direitos reservados.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
