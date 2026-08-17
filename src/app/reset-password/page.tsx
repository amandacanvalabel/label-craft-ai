"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiOutlineLockClosed,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Lê o token da URL sem useSearchParams (evita exigir Suspense no build).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Link inválido. Solicite a recuperação novamente.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Não foi possível redefinir a senha.");
        return;
      }
      setDone(true);
      toast.success("Senha redefinida com sucesso!");
      setTimeout(() => router.push("/login"), 2200);
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 pattern-dots opacity-40" />
      <div className="blur-brush-blue top-10 -left-20 opacity-50" />
      <div className="blur-brush-cyan -bottom-20 -right-20 opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="neo-card p-8 sm:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center">
              <span className="text-xl font-extrabold gradient-text">CanvaLabel</span>
            </Link>
          </div>

          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <HiOutlineCheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h1 className="text-xl font-extrabold text-foreground mb-2">Senha redefinida!</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Sua nova senha já está valendo. Estamos te levando para o login…
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 gradient-primary text-white font-semibold text-sm rounded-full px-6 py-3"
              >
                Ir para o login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground text-center mb-2">
                Criar nova senha
              </h1>
              <p className="text-sm text-muted-foreground text-center mb-8">
                Escolha uma nova senha para a sua conta.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Nova senha
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repita a senha"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gradient-primary text-white font-semibold rounded-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:-translate-y-0.5"
                >
                  {isLoading ? "Salvando…" : "Redefinir senha"}
                  {!isLoading && <HiOutlineSparkles className="w-5 h-5" />}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HiOutlineArrowLeft className="w-4 h-4" /> Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
