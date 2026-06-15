"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineBellAlert,
  HiOutlinePaintBrush,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCamera,
  HiOutlineSwatch,
  HiOutlinePlus,
  HiOutlineXMark,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import FormField, { Input, Toggle, Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "profile", label: "Perfil", icon: HiOutlineUser },
  { key: "security", label: "Segurança", icon: HiOutlineShieldCheck },
  { key: "brand", label: "Marca", icon: HiOutlineSwatch },
  { key: "notifications", label: "Notificações", icon: HiOutlineBellAlert },
  { key: "appearance", label: "Aparência", icon: HiOutlinePaintBrush },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const SettingsSection = ({ title, desc, children, delay = 0 }: {
  title: string; desc?: string; children: React.ReactNode; delay?: number;
}) => (
  <motion.div
    className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5 sm:p-6"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    <h3 className="text-sm font-bold text-foreground">{title}</h3>
    {desc && <p className="text-[11px] text-muted-foreground mt-0.5 mb-5">{desc}</p>}
    {!desc && <div className="mb-5" />}
    {children}
  </motion.div>
);

const NOTIF_KEY = "cl_notifs";
const THEME_KEY = "cl_theme";

function loadNotifs() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function loadTheme(): "light" | "dark" | "system" {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch { /* empty */ }
  return "system";
}

function applyTheme(theme: "light" | "dark" | "system") {
  const el = document.documentElement;
  if (theme === "dark") {
    el.classList.add("dark");
  } else if (theme === "light") {
    el.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    el.classList.toggle("dark", prefersDark);
  }
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", cpfOrCnpj: "",
    city: "", state: "", street: "", number: "", neighborhood: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Brand identity
  const [brandName, setBrandName] = useState("");
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("#2563eb");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);

  const initials = profile.name
    ? profile.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Notifications
  const [notifs, setNotifs] = useState({
    email: true, push: false, labelReady: true,
    planExpiring: true, newsletter: false, tips: true,
  });

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Load profile on mount
  useEffect(() => {
    fetch("/api/subscriber/profile")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setProfile({
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            cpfOrCnpj: data.cpfOrCnpj ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            street: data.street ?? "",
            number: data.number ?? "",
            neighborhood: data.neighborhood ?? "",
          });
          if (data.avatar) setAvatarUrl(data.avatar);
          setBrandName(data.brandName ?? "");
          setBrandLogo(data.brandLogo ?? null);
          setBrandColors(Array.isArray(data.brandColors) ? data.brandColors : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));

    // Load persisted notifs and theme
    const saved = loadNotifs();
    if (saved) setNotifs(saved);
    const savedTheme = loadTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("/api/subscriber/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao enviar foto"); return; }
      setAvatarUrl(data.avatarUrl);
      toast.success("Foto atualizada com sucesso");
    } catch {
      toast.error("Erro ao enviar foto");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const res = await fetch("/api/subscriber/brand-logo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao enviar logo"); return; }
      setBrandLogo(data.brandLogo);
      toast.success("Logo da marca atualizada");
    } catch {
      toast.error("Erro ao enviar logo");
    } finally {
      setUploadingLogo(false);
      if (brandLogoInputRef.current) brandLogoInputRef.current.value = "";
    }
  };

  const handleRemoveBrandLogo = async () => {
    setBrandLogo(null);
    await fetch("/api/subscriber/brand-logo", { method: "DELETE" });
  };

  const addBrandColor = () => {
    const c = newColor.toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(c)) { toast.error("Cor inválida"); return; }
    if (brandColors.includes(c)) return;
    if (brandColors.length >= 12) { toast.error("Máximo de 12 cores"); return; }
    setBrandColors([...brandColors, c]);
  };

  const handleSaveBrand = async () => {
    setSavingBrand(true);
    try {
      const res = await fetch("/api/subscriber/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: brandName || undefined, brandColors }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao salvar"); return; }
      toast.success("Identidade da marca salva");
    } catch {
      toast.error("Erro ao salvar a marca");
    } finally {
      setSavingBrand(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/subscriber/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone || undefined,
          city: profile.city || undefined,
          state: profile.state || undefined,
          street: profile.street || undefined,
          number: profile.number || undefined,
          neighborhood: profile.neighborhood || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao salvar"); return; }
      toast.success("Perfil atualizado com sucesso");
    } catch {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error("As senhas não coincidem"); return; }
    if (newPassword.length < 8) { toast.error("Nova senha deve ter ao menos 8 caracteres"); return; }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/subscriber/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao alterar senha"); return; }
      toast.success("Senha alterada com sucesso");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      toast.error("Erro ao alterar senha");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleNotifsChange = (key: keyof typeof notifs, value: boolean) => {
    const next = { ...notifs, [key]: value };
    setNotifs(next);
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); } catch { /* empty */ }
  };

  const handleThemeChange = (t: "light" | "dark" | "system") => {
    setTheme(t);
    try { localStorage.setItem(THEME_KEY, t); } catch { /* empty */ }
    applyTheme(t);
  };

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Gerencie seu perfil e preferências" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <motion.div
          className="lg:w-56 shrink-0"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <nav className="flex lg:flex-col gap-1 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all w-full text-left",
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <div className="flex-1 space-y-5">

          {/* ── Profile Tab ── */}
          {activeTab === "profile" && (
            <>
              <SettingsSection title="Foto de Perfil" delay={0.1}>
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
                        {loadingProfile ? "…" : initials}
                      </div>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <HiOutlineCamera className="w-4 h-4" />
                      {uploadingAvatar ? "Enviando..." : "Alterar Foto"}
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1.5">JPG, PNG ou WebP · máx. 2MB</p>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Dados Pessoais" desc="Informações básicas da sua conta" delay={0.15}>
                {loadingProfile ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-10 rounded-xl bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Nome Completo" required>
                      <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </FormField>
                    <FormField label="Email" required>
                      <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                    </FormField>
                    <FormField label="Telefone">
                      <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="(11) 99999-0000" />
                    </FormField>
                    <FormField label="CPF/CNPJ">
                      <Input value={profile.cpfOrCnpj} disabled className="opacity-60 cursor-not-allowed" />
                    </FormField>
                    <FormField label="Cidade">
                      <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                    </FormField>
                    <FormField label="Estado">
                      <Input value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} placeholder="SP" maxLength={2} />
                    </FormField>
                    <FormField label="Rua" className="sm:col-span-2">
                      <Input value={profile.street} onChange={(e) => setProfile({ ...profile, street: e.target.value })} />
                    </FormField>
                    <FormField label="Número">
                      <Input value={profile.number} onChange={(e) => setProfile({ ...profile, number: e.target.value })} />
                    </FormField>
                    <FormField label="Bairro">
                      <Input value={profile.neighborhood} onChange={(e) => setProfile({ ...profile, neighborhood: e.target.value })} />
                    </FormField>
                  </div>
                )}
                <div className="flex justify-end mt-5">
                  <Button variant="primary" size="sm" onClick={handleSaveProfile} disabled={savingProfile || loadingProfile}>
                    {savingProfile ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* ── Brand Tab ── */}
          {activeTab === "brand" && (
            <>
              <SettingsSection title="Identidade da Marca" desc="Disponível em todos os planos. Usada no editor para aplicar sua identidade com um clique." delay={0.1}>
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl border border-border/50 dark:border-white/10 bg-muted/30 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {brandLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={brandLogo} alt="Logo da marca" className="w-full h-full object-contain p-2" />
                    ) : (
                      <HiOutlineSwatch className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input ref={brandLogoInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleBrandLogoUpload} className="hidden" />
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => brandLogoInputRef.current?.click()} disabled={uploadingLogo}>
                        <HiOutlineCamera className="w-4 h-4" />
                        {uploadingLogo ? "Enviando..." : "Enviar logo"}
                      </Button>
                      {brandLogo && (
                        <Button variant="ghost" onClick={handleRemoveBrandLogo}>Remover</Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">PNG, SVG, JPG ou WebP. Máx. 2MB.</p>
                  </div>
                </div>

                <div className="mt-6">
                  <FormField label="Nome da marca">
                    <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Ex.: Bella Cosméticos" />
                  </FormField>
                </div>
              </SettingsSection>

              <SettingsSection title="Paleta de Cores da Marca" desc="Suas cores favoritas aparecem no editor para aplicar com um clique." delay={0.15}>
                <div className="flex flex-wrap gap-2.5 mb-4">
                  {brandColors.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma cor adicionada ainda.</p>
                  )}
                  {brandColors.map((c) => (
                    <div key={c} className="group relative">
                      <div className="w-12 h-12 rounded-xl border border-border/50 dark:border-white/10 shadow-sm" style={{ background: c }} title={c} />
                      <button
                        onClick={() => setBrandColors(brandColors.filter((x) => x !== c))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        aria-label={`Remover ${c}`}
                      >
                        <HiOutlineXMark className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border/50 dark:border-white/10 cursor-pointer bg-transparent" />
                  <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-32 font-mono uppercase" />
                  <Button variant="secondary" onClick={addBrandColor}><HiOutlinePlus className="w-4 h-4" /> Adicionar</Button>
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSaveBrand} disabled={savingBrand}>
                    {savingBrand ? "Salvando..." : "Salvar Marca"}
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* ── Security Tab ── */}
          {activeTab === "security" && (
            <>
              <SettingsSection title="Alterar Senha" desc="Atualize sua senha de acesso" delay={0.1}>
                <div className="space-y-4 max-w-md">
                  <FormField label="Senha Atual" required>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pr-10"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>
                  <FormField label="Nova Senha" required>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        className="pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showNewPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>
                  <FormField label="Confirmar Nova Senha" required>
                    <Input
                      type="password"
                      placeholder="Repita a nova senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </FormField>
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="primary" size="sm"
                      onClick={handleChangePassword}
                      disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {savingPassword ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Segurança Avançada" delay={0.15}>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Autenticação em dois fatores (2FA)</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Em breve — adicione uma camada extra de segurança</p>
                    </div>
                    <Toggle checked={twoFactor} onChange={setTwoFactor} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Alertas de login</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Em breve — aviso por email em novos acessos</p>
                    </div>
                    <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Sessões Ativas" delay={0.2}>
                <div className="space-y-3">
                  {[
                    { device: "Navegador atual", location: "Sessão ativa", time: "Agora", current: true },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{session.device}</p>
                        <p className="text-[10px] text-muted-foreground">{session.location} · {session.time}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1 rounded-full">Atual</span>
                    </div>
                  ))}
                </div>
              </SettingsSection>
            </>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === "notifications" && (
            <>
              <SettingsSection title="Canais de Notificação" desc="Escolha como deseja ser notificado" delay={0.1}>
                <div className="space-y-4">
                  {([
                    { key: "email" as const, label: "Email", desc: "Receber notificações por email" },
                    { key: "push" as const, label: "Push no navegador", desc: "Notificações em tempo real no browser" },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <Toggle checked={notifs[key]} onChange={(v) => handleNotifsChange(key, v)} />
                    </div>
                  ))}
                </div>
              </SettingsSection>

              <SettingsSection title="Tipos de Notificação" desc="Quais eventos você quer acompanhar" delay={0.15}>
                <div className="space-y-4">
                  {([
                    { key: "labelReady" as const, label: "Rótulo pronto", desc: "Quando um rótulo gerado por IA estiver pronto" },
                    { key: "planExpiring" as const, label: "Plano expirando", desc: "Aviso 7 dias antes da expiração do plano" },
                    { key: "newsletter" as const, label: "Newsletter", desc: "Novidades e atualizações do CanvaLabel" },
                    { key: "tips" as const, label: "Dicas e tutoriais", desc: "Aprenda a usar melhor a plataforma" },
                  ] as const).map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <Toggle checked={notifs[key]} onChange={(v) => handleNotifsChange(key, v)} />
                    </div>
                  ))}
                </div>
              </SettingsSection>
            </>
          )}

          {/* ── Appearance Tab ── */}
          {activeTab === "appearance" && (
            <SettingsSection title="Tema da Interface" desc="Escolha como você prefere visualizar o painel" delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([
                  { key: "light" as const, label: "Claro", desc: "Interface em tons claros", preview: "bg-white" },
                  { key: "dark" as const, label: "Escuro", desc: "Interface em tons escuros", preview: "bg-[#12121a]" },
                  { key: "system" as const, label: "Sistema", desc: "Seguir preferência do OS", preview: "bg-gradient-to-r from-white to-[#12121a]" },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleThemeChange(opt.key)}
                    className={cn(
                      "group relative p-4 rounded-2xl border transition-all text-left",
                      theme === opt.key
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10"
                        : "border-border/40 dark:border-white/8 bg-white dark:bg-[#12121a] hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-full h-20 rounded-xl mb-3 border",
                      opt.preview,
                      theme === opt.key ? "border-primary/30" : "border-border/30 dark:border-white/10"
                    )} />
                    <p className="text-sm font-bold text-foreground">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                    {theme === opt.key && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}
