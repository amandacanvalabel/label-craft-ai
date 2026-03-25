"use client";

import { useState } from "react";
import {
  HiOutlineCog6Tooth,
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

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "branding", label: "Branding", icon: HiOutlinePhoto },
  { id: "seo", label: "SEO & Meta", icon: HiOutlineGlobeAlt },
  { id: "security", label: "Segurança", icon: HiOutlineShieldCheck },
  { id: "appearance", label: "Aparência", icon: HiOutlinePaintBrush },
  { id: "profile", label: "Meu Perfil", icon: HiOutlineUser },
];

// Section card wrapper
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

// File upload preview
const FileUpload = ({ label, current, hint }: { label: string; current?: string; hint?: string }) => (
  <FormField label={label} hint={hint}>
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-muted/50 dark:bg-white/5 border-2 border-dashed border-border/60 dark:border-white/15 flex items-center justify-center overflow-hidden">
        {current ? (
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold text-xs">CL</div>
        ) : (
          <HiOutlineCloudArrowUp className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <Button variant="secondary" size="sm">
          <HiOutlineCloudArrowUp className="w-4 h-4" />
          Upload
        </Button>
        <p className="text-[10px] text-muted-foreground mt-1">PNG, SVG ou ICO. Máx 512KB</p>
      </div>
    </div>
  </FormField>
);

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("branding");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Branding state
  const [branding, setBranding] = useState({
    siteName: "CanvaLabel",
    siteTagline: "Crie rótulos profissionais com IA",
  });

  // SEO state
  const [seo, setSeo] = useState({
    metaTitle: "CanvaLabel — Crie rótulos profissionais com IA",
    metaDescription: "Plataforma inteligente para criação de rótulos e etiquetas em conformidade com a ANVISA. Geração com IA, editor visual e exportação para gráficas.",
    metaImage: "",
    ogUrl: "https://canvalabel.com.br",
    keywords: "rótulos, etiquetas, ANVISA, IA, inteligência artificial, editor visual",
  });

  // Security state
  const [security, setSecurity] = useState({
    maintenanceMode: false,
    twoFactorEnabled: false,
    sessionTimeout: 7,
  });

  // Appearance state
  const [appearance, setAppearance] = useState({
    defaultTheme: "light" as "light" | "dark" | "system",
    primaryColor: "#2563eb",
    accentColor: "#0ea5e9",
  });

  // Profile state
  const [profile, setProfile] = useState({
    name: "Administrador",
    email: "admin@canvalabel.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = (section: string) => {
    toast.success(`${section} salvo com sucesso!`);
  };

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Gerencie as configurações gerais do sistema"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs Sidebar */}
        <motion.div
          className="lg:w-56 shrink-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-2 lg:sticky lg:top-20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all text-left",
                  activeTab === tab.id
                    ? "bg-primary/8 text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/5 font-medium"
                )}
              >
                <tab.icon className="w-4.5 h-4.5 shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {/* BRANDING */}
          {activeTab === "branding" && (
            <>
              <SettingsSection title="Identidade Visual" subtitle="Logo, favicon e nome do site" delay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FileUpload label="Logo Header" current="current" hint="Exibida no header e sidebar" />
                  <FileUpload label="Logo Footer" current="current" hint="Exibida no footer da home" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FileUpload label="Favicon" current="current" hint="Ícone da aba do navegador" />
                  <FileUpload label="Open Graph Image" hint="Imagem compartilhamento social (1200x630)" />
                </div>
              </SettingsSection>

              <SettingsSection title="Informações do Site" subtitle="Nome e tagline exibidos na plataforma" delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nome do Site" required>
                    <Input value={branding.siteName} onChange={(e) => setBranding({ ...branding, siteName: e.target.value })} />
                  </FormField>
                  <FormField label="Tagline">
                    <Input value={branding.siteTagline} onChange={(e) => setBranding({ ...branding, siteTagline: e.target.value })} />
                  </FormField>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => handleSave("Branding")}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Salvar Branding
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* SEO */}
          {activeTab === "seo" && (
            <>
              <SettingsSection title="Meta Tags" subtitle="Configurações de SEO para mecanismos de busca" delay={0.1}>
                <FormField label="Meta Title" required hint="Recomendado: 50-60 caracteres">
                  <Input value={seo.metaTitle} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} />
                  <div className="mt-1">
                    <div className="h-1 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", seo.metaTitle.length <= 60 ? "bg-emerald-500" : "bg-red-500")}
                        style={{ width: `${Math.min(100, (seo.metaTitle.length / 70) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{seo.metaTitle.length}/60 caracteres</p>
                  </div>
                </FormField>

                <FormField label="Meta Description" required hint="Recomendado: 150-160 caracteres">
                  <Textarea value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} rows={3} />
                  <div className="mt-1">
                    <div className="h-1 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", seo.metaDescription.length <= 160 ? "bg-emerald-500" : "bg-red-500")}
                        style={{ width: `${Math.min(100, (seo.metaDescription.length / 180) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{seo.metaDescription.length}/160 caracteres</p>
                  </div>
                </FormField>

                <FormField label="Keywords" hint="Separados por vírgula">
                  <Input value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} />
                </FormField>

                <FormField label="Canonical URL">
                  <Input value={seo.ogUrl} onChange={(e) => setSeo({ ...seo, ogUrl: e.target.value })} />
                </FormField>
              </SettingsSection>

              {/* SEO Preview */}
              <SettingsSection title="Prévia no Google" subtitle="Como seu site aparece nos resultados de busca" delay={0.2}>
                <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-4 space-y-1">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">{seo.ogUrl}</p>
                  <p className="text-base font-semibold text-blue-600 dark:text-blue-400 truncate">{seo.metaTitle}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{seo.metaDescription}</p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => handleSave("SEO")}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Salvar SEO
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <>
              <SettingsSection title="Modo Manutenção" subtitle="Ative para bloquear acesso de visitantes" delay={0.1}>
                <div className="flex items-center justify-between p-4 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", security.maintenanceMode ? "bg-amber-50 dark:bg-amber-500/15" : "bg-muted dark:bg-white/8")}>
                      <HiOutlineWrenchScrewdriver className={cn("w-5 h-5", security.maintenanceMode ? "text-amber-500" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Modo Manutenção</p>
                      <p className="text-[11px] text-muted-foreground">{security.maintenanceMode ? "Site indisponível para visitantes" : "Site acessível normalmente"}</p>
                    </div>
                  </div>
                  <Toggle checked={security.maintenanceMode} onChange={(v) => setSecurity({ ...security, maintenanceMode: v })} />
                </div>
                {security.maintenanceMode && (
                  <motion.div
                    className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <HiOutlineExclamationTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">O site está em modo manutenção. Apenas administradores podem acessar.</p>
                  </motion.div>
                )}
              </SettingsSection>

              <SettingsSection title="Autenticação de Dois Fatores (2FA)" subtitle="Camada extra de segurança no login" delay={0.2}>
                <div className="flex items-center justify-between p-4 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", security.twoFactorEnabled ? "bg-emerald-50 dark:bg-emerald-500/15" : "bg-muted dark:bg-white/8")}>
                      <HiOutlineDevicePhoneMobile className={cn("w-5 h-5", security.twoFactorEnabled ? "text-emerald-500" : "text-muted-foreground")} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">2FA via Aplicativo</p>
                      <p className="text-[11px] text-muted-foreground">{security.twoFactorEnabled ? "Verificação ativada" : "Recomendado ativar"}</p>
                    </div>
                  </div>
                  <Toggle checked={security.twoFactorEnabled} onChange={(v) => setSecurity({ ...security, twoFactorEnabled: v })} />
                </div>
              </SettingsSection>

              <SettingsSection title="Sessão" subtitle="Configurações de timeout" delay={0.3}>
                <FormField label="Expiração do Token (dias)" hint="Tempo antes de exigir novo login">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
                  />
                </FormField>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => handleSave("Segurança")}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Salvar Segurança
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* APPEARANCE */}
          {activeTab === "appearance" && (
            <>
              <SettingsSection title="Tema Padrão" subtitle="Tema default para novos visitantes" delay={0.1}>
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setAppearance({ ...appearance, defaultTheme: t })}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all",
                        appearance.defaultTheme === t
                          ? "border-primary bg-primary/5"
                          : "border-border/40 dark:border-white/10 hover:border-primary/30"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center",
                        t === "light" ? "bg-amber-50 dark:bg-amber-500/15" : t === "dark" ? "bg-slate-800 dark:bg-white/10" : "bg-gradient-to-br from-amber-50 to-slate-800"
                      )}>
                        <HiOutlinePaintBrush className={cn("w-5 h-5", t === "light" ? "text-amber-500" : t === "dark" ? "text-white" : "text-violet-500")} />
                      </div>
                      <p className="text-xs font-bold text-foreground capitalize">{t === "system" ? "Sistema" : t === "light" ? "Claro" : "Escuro"}</p>
                    </button>
                  ))}
                </div>
              </SettingsSection>

              <SettingsSection title="Cores do Sistema" subtitle="Personalize as cores principais" delay={0.2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Cor Primária">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-border/50 dark:border-white/10 cursor-pointer"
                      />
                      <Input
                        value={appearance.primaryColor}
                        onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </FormField>
                  <FormField label="Cor de Destaque">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={appearance.accentColor}
                        onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-border/50 dark:border-white/10 cursor-pointer"
                      />
                      <Input
                        value={appearance.accentColor}
                        onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </FormField>
                </div>
                {/* Preview */}
                <div className="p-4 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Prévia</p>
                  <div className="flex items-center gap-3">
                    <div className="h-8 px-4 rounded-lg flex items-center text-white text-xs font-bold" style={{ backgroundColor: appearance.primaryColor }}>Botão Primário</div>
                    <div className="h-8 px-4 rounded-lg flex items-center text-white text-xs font-bold" style={{ backgroundColor: appearance.accentColor }}>Botão Destaque</div>
                    <div className="h-4 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${appearance.primaryColor}, ${appearance.accentColor})` }} />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" onClick={() => handleSave("Aparência")}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Salvar Aparência
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <>
              <SettingsSection title="Dados Pessoais" subtitle="Informações da conta de administrador" delay={0.1}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
                    {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
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
                  <Button variant="primary" onClick={() => handleSave("Perfil")}>
                    <HiOutlineCheckCircle className="w-4 h-4" />
                    Salvar Dados
                  </Button>
                </div>
              </SettingsSection>

              <SettingsSection title="Alterar Senha" subtitle="Atualize sua senha de acesso" delay={0.2}>
                <FormField label="Senha Atual" required>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={profile.currentPassword}
                      onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                      placeholder="Senha atual"
                      className="pl-9 pr-10"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nova Senha" required>
                    <div className="relative">
                      <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={profile.newPassword}
                        onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                        placeholder="Nova senha"
                        className="pl-9 pr-10"
                      />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showNewPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>
                  <FormField label="Confirmar Nova Senha" required>
                    <div className="relative">
                      <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={profile.confirmPassword}
                        onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                        placeholder="Confirme a nova senha"
                        className="pl-9"
                      />
                    </div>
                  </FormField>
                </div>

                {profile.newPassword && profile.confirmPassword && profile.newPassword !== profile.confirmPassword && (
                  <p className="text-[11px] text-red-500 font-medium">As senhas não coincidem</p>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    disabled={!profile.currentPassword || !profile.newPassword || profile.newPassword !== profile.confirmPassword}
                    onClick={() => handleSave("Senha")}
                  >
                    <HiOutlineLockClosed className="w-4 h-4" />
                    Alterar Senha
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
