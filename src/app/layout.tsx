import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

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
    icons: settings.faviconUrl ? { icon: settings.faviconUrl, shortcut: settings.faviconUrl } : undefined,
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
  const initialDark = settings.defaultTheme === "dark";
  const themeScript = `
    (() => {
      const stored = localStorage.getItem("theme");
      const theme = stored || ${JSON.stringify(settings.defaultTheme)};
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && prefersDark));
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
      </body>
    </html>
  );
};

export default RootLayout;

function cnClass(...classes: Array<string | false>) {
  return classes.filter(Boolean).join(" ");
}
