import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

export default async function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    pathname === "/" ||
    pathname === "/login" ||
    // Páginas que precisam funcionar SEM conta: cadastro/planos (é onde a
    // pessoa cria a conta) e a redefinição de senha (quem esqueceu a senha
    // obviamente não está logado).
    pathname === "/planos" ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    // Arquivos estáticos públicos (logo, imagens, fontes, etc.)
    // OBS: "html" precisa estar aqui. Sem isso, /canvalabel-alimentos.html era
    // tratado como rota protegida e o visitante anônimo ia parar no /login —
    // quebrando o funil (prompt -> prévia com IA) de quem ainda não tem conta.
    /\.(html?|png|jpe?g|svg|gif|webp|ico|css|js|map|woff2?|ttf|txt|xml|json)$/i.test(pathname)
  ) {
    // If logged in and trying to access login, redirect to dashboard
    if (pathname === "/login" && token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = (payload as { role: string }).role;
        const redirectUrl = role === "ADMIN" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      } catch {
        // Invalid token, let them access login
      }
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload as { role: string }).role;

    // Admin routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Subscriber routes
    if (pathname.startsWith("/dashboard") && role !== "SUBSCRIBER") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid token
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("token", "", { maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
