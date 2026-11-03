import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import { getSiteSettings } from "@/lib/site-settings";
import CookieConsent from "@/components/legal/CookieConsent";
import "./globals.css";

const GA_ID = "G-W7WFJ9XER5";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
    keywords: settings.keywords,
    metadataBase: new URL(settings.canonicalUrl),
    alternates: { canonical: settings.canonicalUrl },
    icons: { icon: "/favicon.png", shortcut: "/favicon.png", apple: "/favicon.png" },
    openGraph: {
      title: settings.metaTitle,
      description: settings.metaDescription,
      url: settings.canonicalUrl,
      siteName: settings.siteName,
      images: settings.openGraphImageUrl ? [{ url: settings.openGraphImageUrl }] : undefined,
      locale: "pt_BR",
      type: "website",
    },
  };
}

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const settings = await getSiteSettings();
  // TEMPORÁRIO: site travado no modo claro (o modo escuro será reconstruído
  // depois). Ignoramos tema salvo / preferência do sistema e forçamos claro.
  const initialDark = false;
  const themeScript = `
    (() => {
      document.documentElement.classList.remove("dark");
    })();
  `;
  const cssVars = {
    "--color-primary": settings.primaryColor,
    "--color-primary-light": settings.primaryColor,
    "--color-primary-dark": settings.primaryColor,
    "--color-accent": settings.accentColor,
    "--color-accent-light": settings.accentColor,
  } as CSSProperties;

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cnClass(`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`, initialDark && "dark")}
      style={cssVars}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
        <Toaster position="top-right" richColors />
        <CookieConsent />
        {/* Google Analytics com Consent Mode v2 (LGPD): tudo começa NEGADO e só
            libera a medição depois que a pessoa aceita no banner de cookies.
            Quem já aceitou antes (localStorage) é liberado aqui mesmo. */}
        <Script id="google-consent" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: 'denied', ad_storage: 'denied',
            ad_user_data: 'denied', ad_personalization: 'denied',
            wait_for_update: 500
          });
          try {
            var c = JSON.parse(localStorage.getItem('cl_cookie_consent') || 'null');
            if (c && c.analytics === true && Date.now() - (c.ts || 0) < 31536000000) {
              gtag('consent', 'update', { analytics_storage: 'granted' });
            }
          } catch (e) {}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}</Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      </body>
    </html>
  );
};

export default RootLayout;

function cnClass(...classes: Array<string | false>) {
  return classes.filter(Boolean).join(" ");
}
