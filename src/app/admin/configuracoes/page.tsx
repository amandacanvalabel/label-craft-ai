"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  HiOutlinePhoto,
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck,
  HiOutlinePaintBrush,
  HiOutlineWrenchScrewdriver,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheckCircle,
  HiOutlineCloudArrowUp,
  HiOutlineExclamationTriangle,
  HiOutlineDevicePhoneMobile,
} from "react-icons/hi2";
import { motion } from "framer-motion";
import PageHeader from "@/components/admin/PageHeader";
import FormField, { Input, Textarea, Toggle, Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "branding" | "seo" | "security" | "appearance" | "profile";
type ThemeOption = "light" | "dark" | "system";
type AssetType = "logoHeader" | "logoFooter" | "favicon" | "openGraph";

interface SiteSettings {
  siteName: string;
  siteTagline: string;
  logoHeaderUrl: string | null;
  logoFooterUrl: string | null;
  faviconUrl: string | null;
  openGraphImageUrl: string | null;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  keywords: string[];
  maintenanceMode: boolean;
  twoFactorEnabled: boolean;
  sessionTimeoutDays: number;
  defaultTheme: ThemeOption;
  primaryColor: string;
  accentColor: string;
}

interface AdminProfile {
  name: string;
  email: string;
}

const defaultSettings: SiteSettings = {
  siteName: "CanvaLabel",
  siteTagline: "Crie rótulos profissionais com IA",
  logoHeaderUrl: null,
  logoFooterUrl: null,
  faviconUrl: null,
  openGraphImageUrl: null,
  metaTitle: "CanvaLabel — Crie rótulos profissionais com IA",
  metaDescription: "Plataforma inteligente para criação de rótulos e etiquetas em conformidade com a ANVISA. Geração com IA, editor visual e exportação para gráficas.",
  canonicalUrl: "https://canvalabel.com.br",
  keywords: ["rótulos", "etiquetas", "ANVISA", "IA", "inteligência artificial", "editor visual"],
  maintenanceMode: false,
  twoFactorEnabled: false,
  sessionTimeoutDays: 7,
  defaultTheme: "system",
  primaryColor: "#2563eb",
  accentColor: "#0ea5e9",
};

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "branding", label: "Branding", icon: HiOutlinePhoto },
  { id: "seo", label: "SEO & Meta", icon: HiOutlineGlobeAlt },
  { id: "security", label: "Segurança", icon: HiOutlineShieldCheck },
  { id: "appearance", label: "Aparência", icon: HiOutlinePaintBrush },
  { id: "profile", label: "Meu Perfil", icon: HiOutlineUser },
];

const SettingsSection = ({ title, subtitle, children, delay = 0 }: { title: string; subtitle?: string; children: React.ReactNode; delay?: number }) => (
  <motion.div
    className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
  >
    <div className="p-5 border-b border-border/40 dark:border-white/8">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-5 space-y-5">{children}</div>
  </motion.div>
);

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

function applyTheme(theme: ThemeOption) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", theme);
}

const FileUpload = ({
  label,
  current,
  hint,
  type,
  uploading,
  onUpload,
}: {
  label: string;
  current: string | null;
  hint?: string;
  type: AssetType;
  uploading: boolean;
  onUpload: (type: AssetType, file: File) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FormField label={label} hint={hint}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-muted/50 dark:bg-white/5 border-2 border-dashed border-border/60 dark:border-white/15 flex items-center justify-center overflow-hidden">
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt={label} className="w-full h-full object-contain p-2" />
          ) : (
            <HiOutlineCloudArrowUp className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(type, file);
              e.target.value = "";
            }}
          />
          <Button type="button" variant="secondary" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
            <HiOutlineCloudArrowUp className="w-4 h-4" />
            {uploading ? "Enviando..." : "Upload"}
          </Button>
          <p className="text-[10px] text-muted-foreground mt-1">PNG, SVG, ICO, JPG ou WebP. Máx 512KB</p>
        </div>
      </div>
    </FormField>
  );
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("branding");
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [profile, setProfile] = useState<AdminProfile>({ name: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<AssetType | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar configurações");
        setSettings({ ...defaultSettings, ...data.settings, defaultTheme: data.settings.defaultTheme as ThemeOption });
        setProfile(data.admin);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const keywordText = useMemo(() => settings.keywords.join(", "), [settings.keywords]);
  const passwordMismatch = Boolean(passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword);
  const initials = (profile.name || settings.siteName)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveSettings = async (label: string, payload: Partial<SiteSettings>) => {
    setSaving(label);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setSettings({ ...defaultSettings, ...data.settings, defaultTheme: data.settings.defaultTheme as ThemeOption });
      toast.success(`${label} salvo com sucesso!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setSaving(null);
    }
  };

  const uploadAsset = async (type: AssetType, file: File) => {
    if (file.size > 512 * 1024) {
      toast.error("Arquivo muito grande. Máximo 512KB.");
      return;
    }
    setUploading(type);
    try {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("file", file);
      const res = await fetch("/api/admin/settings/assets", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar arquivo");
      setSettings({ ...defaultSettings, ...data.settings, defaultTheme: data.settings.defaultTheme as ThemeOption });
      toast.success("Asset atualizado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar arquivo");
    } finally {
      setUploading(null);
    }
  };

  const saveProfile = async () => {
    setSaving("Perfil");
    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar perfil");
      setProfile(data.admin);
      toast.success("Perfil salvo com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar perfil");
    } finally {
      setSaving(null);
    }
  };

  const savePassword = async () => {
    if (passwordMismatch) return;
    setSaving("Senha");
    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar senha");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Senha alterada com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao alterar senha");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl gradient-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Gerencie as configurações gerais do sistema" />

      <div className="flex flex-col lg:flex-row gap-6">
        <motion.div className="lg:w-56 shrink-0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-2 lg:sticky lg:top-20">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all text-left",
                  activeTab === tab.id ? "bg-primary/8 text-primary font-bold" : "text-muted-foreground hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/5 font-medium"
                )}
              >
                <tab.icon className="w-4.5 h-4.5 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex-1 space-y-5">
          {activeTab === "branding" && (
            <>
              <SettingsSection title="Identidade Visual" subtitle="Logo, favicon e nome do site" delay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FileUpload type="logoHeader" label="Logo Header" current={settings.logoHeaderUrl} hint="Exibida no header e sidebar" uploading={uploading === "logoHeader"} onUpload={uploadAsset} />
                  <FileUpload type="logoFooter" label="Logo Footer" current={settings.logoFooterUrl} hint="Exibida no footer da home" uploading={uploading === "logoFooter"} onUpload={uploadAsset} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FileUpload type="favicon" label="Favicon" current={settings.faviconUrl} hint="Ícone da aba do navegador" uploading={uploading === "favicon"} onUpload={uploadAsset} />
                  <FileUpload type="openGraph" label="Open Graph Image" current={settings.openGraphImageUrl} hint="Imagem compartilhamento social (1200x630)" uploading={uploading === "openGraph"} onUpload={uploadAsset} />
                </div>
              </SettingsSection>

              <SettingsSection title="Informações do Site" subtitle="Nome e tagline exibidos na plataforma" delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nome do Site" required>
                    <Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
                  </FormField>
                  <FormField label="Tagline">
                    <Input value={settings.siteTagline} onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })} />
                  </FormField>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="primary" disabled={saving === "Branding"} onClick={() => saveSettings("Branding", { siteName: settings.siteName, siteTagline: settings.siteTagline })}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    {saving === "Branding" ? "Salvando..." : "Salvar Branding"}
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {activeTab === "seo" && (
            <>
              <SettingsSection title="Meta Tags" subtitle="Configurações de SEO para mecanismos de busca" delay={0.1}>
                <FormField label="Meta Title" required hint="Recomendado: 50-60 caracteres">
                  <Input value={settings.metaTitle} onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })} />
                  <Meter value={settings.metaTitle.length} limit={60} max={70} />
                </FormField>
                <FormField label="Meta Description" required hint="Recomendado: 150-160 caracteres">
                  <Textarea value={settings.metaDescription} onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })} rows={3} />
                  <Meter value={settings.metaDescription.length} limit={160} max={180} />
                </FormField>
                <FormField label="Keywords" hint="Separados por vírgula">
                  <Input value={keywordText} onChange={(e) => setSettings({ ...settings, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })} />
                </FormField>
                <FormField label="Canonical URL">
                  <Input value={settings.canonicalUrl} onChange={(e) => setSettings({ ...settings, canonicalUrl: e.target.value })} />
                </FormField>
              </SettingsSection>

              <SettingsSection title="Prévia no Google" subtitle="Como seu site aparece nos resultados de busca" delay={0.2}>
                <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-4 space-y-1">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">{settings.canonicalUrl}</p>
                  <p className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate">{settings.metaTitle}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{settings.metaDescription}</p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="primary" disabled={saving === "SEO"} onClick={() => saveSettings("SEO", {
                    metaTitle: settings.metaTitle,
                    metaDescription: settings.metaDescription,
                    canonicalUrl: settings.canonicalUrl,
                    keywords: settings.keywords,
                  })}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    {saving === "SEO" ? "Salvando..." : "Salvar SEO"}
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {activeTab === "security" && (
            <>
              <SettingsSection title="Modo Manutenção" subtitle="Ative para bloquear acesso de visitantes" delay={0.1}>
                <SettingToggle
                  active={settings.maintenanceMode}
                  icon={HiOutlineWrenchScrewdriver}
                  title="Modo Manutenção"
                  enabledText="Site indisponível para visitantes"
                  disabledText="Site acessível normalmente"
                  onChange={(maintenanceMode) => setSettings({ ...settings, maintenanceMode })}
                />
                {settings.maintenanceMode && (
                  <motion.div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">O site ficará marcado em manutenção para visitantes.</p>
                  </motion.div>
                )}
              </SettingsSection>

              <SettingsSection title="Autenticação de Dois Fatores (2FA)" subtitle="Camada extra de segurança no login" delay={0.2}>
                <SettingToggle
                  active={settings.twoFactorEnabled}
                  icon={HiOutlineDevicePhoneMobile}
                  title="2FA via Aplicativo"
                  enabledText="Verificação ativada"
                  disabledText="Recomendado ativar"
                  onChange={(twoFactorEnabled) => setSettings({ ...settings, twoFactorEnabled })}
                />
              </SettingsSection>

              <SettingsSection title="Sessão" subtitle="Configurações de timeout" delay={0.3}>
                <FormField label="Expiração do Token (dias)" hint="Tempo antes de exigir novo login">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.sessionTimeoutDays}
                    onChange={(e) => setSettings({ ...settings, sessionTimeoutDays: Math.min(30, Math.max(1, Number(e.target.value) || 1)) })}
                  />
                </FormField>
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="primary" disabled={saving === "Segurança"} onClick={() => saveSettings("Segurança", {
                    maintenanceMode: settings.maintenanceMode,
                    twoFactorEnabled: settings.twoFactorEnabled,
                    sessionTimeoutDays: settings.sessionTimeoutDays,
                  })}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    {saving === "Segurança" ? "Salvando..." : "Salvar Segurança"}
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {activeTab === "appearance" && (
            <>
              <SettingsSection title="Tema Padrão" subtitle="Tema default para novos visitantes" delay={0.1}>
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((theme) => (
                    <button
                      type="button"
                      key={theme}
                      onClick={() => {
                        setSettings({ ...settings, defaultTheme: theme });
                        applyTheme(theme);
                      }}
                      className={cn("p-4 rounded-xl border-2 text-center transition-all", settings.defaultTheme === theme ? "border-primary bg-primary/5" : "border-border/40 dark:border-white/10 hover:border-primary/30")}
                    >
                      <div className={cn("w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center", theme === "light" ? "bg-amber-50 dark:bg-amber-500/15" : theme === "dark" ? "bg-slate-800 dark:bg-white/10" : "bg-gradient-to-br from-amber-50 to-slate-800")}>
                        <HiOutlinePaintBrush className={cn("w-5 h-5", theme === "light" ? "text-amber-500" : theme === "dark" ? "text-white" : "text-violet-500")} />
                      </div>
                      <p className="text-xs font-bold text-foreground">{theme === "system" ? "Sistema" : theme === "light" ? "Claro" : "Escuro"}</p>
                    </button>
                  ))}
                </div>
              </SettingsSection>

              <SettingsSection title="Cores do Sistema" subtitle="Personalize as cores principais" delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorField label="Cor Primária" value={settings.primaryColor} onChange={(primaryColor) => setSettings({ ...settings, primaryColor })} />
                  <ColorField label="Cor de Destaque" value={settings.accentColor} onChange={(accentColor) => setSettings({ ...settings, accentColor })} />
                </div>
                <div className="p-4 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Prévia</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="h-8 px-4 rounded-lg flex items-center text-white text-xs font-bold" style={{ backgroundColor: isHex(settings.primaryColor) ? settings.primaryColor : defaultSettings.primaryColor }}>Botão Primário</div>
                    <div className="h-8 px-4 rounded-lg flex items-center text-white text-xs font-bold" style={{ backgroundColor: isHex(settings.accentColor) ? settings.accentColor : defaultSettings.accentColor }}>Botão Destaque</div>
                    <div className="h-4 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${isHex(settings.primaryColor) ? settings.primaryColor : defaultSettings.primaryColor}, ${isHex(settings.accentColor) ? settings.accentColor : defaultSettings.accentColor})` }} />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="primary" disabled={saving === "Aparência"} onClick={() => saveSettings("Aparência", {
                    defaultTheme: settings.defaultTheme,
                    primaryColor: settings.primaryColor,
                    accentColor: settings.accentColor,
                  })}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    {saving === "Aparência" ? "Salvando..." : "Salvar Aparência"}
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {activeTab === "profile" && (
            <>
              <SettingsSection title="Dados Pessoais" subtitle="Informações da conta de administrador" delay={0.1}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">{initials}</div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nome Completo" required>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="pl-9" />
                    </div>
                  </FormField>
                  <FormField label="Email" required>
                    <div className="relative">
                      <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="pl-9" />
                    </div>
                  </FormField>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="primary" disabled={saving === "Perfil"} onClick={saveProfile}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    {saving === "Perfil" ? "Salvando..." : "Salvar Dados"}
                  </Button>
                </div>
              </SettingsSection>

              <SettingsSection title="Alterar Senha" subtitle="Atualize sua senha de acesso" delay={0.2}>
                <PasswordField label="Senha Atual" value={passwords.currentPassword} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} onChange={(currentPassword) => setPasswords({ ...passwords, currentPassword })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PasswordField label="Nova Senha" value={passwords.newPassword} visible={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} onChange={(newPassword) => setPasswords({ ...passwords, newPassword })} />
                  <FormField label="Confirmar Nova Senha" required error={passwordMismatch ? "As senhas não coincidem" : undefined}>
                    <div className="relative">
                      <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} placeholder="Confirme a nova senha" className="pl-9" />
                    </div>
                  </FormField>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={saving === "Senha" || !passwords.currentPassword || !passwords.newPassword || passwordMismatch}
                    onClick={savePassword}
                  >
                    <HiOutlineLockClosed className="w-4 h-4" />
                    {saving === "Senha" ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const Meter = ({ value, limit, max }: { value: number; limit: number; max: number }) => (
  <div className="mt-1">
    <div className="h-1 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", value <= limit ? "bg-emerald-500" : "bg-red-500")} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
    <p className="text-[10px] text-muted-foreground mt-0.5">{value}/{limit} caracteres</p>
  </div>
);

const SettingToggle = ({
  active,
  icon: Icon,
  title,
  enabledText,
  disabledText,
  onChange,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  enabledText: string;
  disabledText: string;
  onChange: (value: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-4 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
    <div className="flex items-center gap-3">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", active ? "bg-emerald-50 dark:bg-emerald-500/15" : "bg-muted dark:bg-white/8")}>
        <Icon className={cn("w-5 h-5", active ? "text-emerald-500" : "text-muted-foreground")} />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{active ? enabledText : disabledText}</p>
      </div>
    </div>
    <Toggle checked={active} onChange={onChange} />
  </div>
);

const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <FormField label={label} error={value && !isHex(value) ? "Use o formato #RRGGBB" : undefined}>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={isHex(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-border/50 dark:border-white/10 cursor-pointer"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
    </div>
  </FormField>
);

const PasswordField = ({
  label,
  value,
  visible,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) => (
  <FormField label={label} required>
    <div className="relative">
      <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className="pl-9 pr-10" />
      <button type="button" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
        {visible ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
      </button>
    </div>
  </FormField>
);
