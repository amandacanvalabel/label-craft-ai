"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineBellAlert,
  HiOutlinePaintBrush,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCamera,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineIdentification,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import FormField, { Input, Toggle, Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "profile", label: "Perfil", icon: HiOutlineUser },
  { key: "security", label: "Segurança", icon: HiOutlineShieldCheck },
  { key: "notifications", label: "Notificações", icon: HiOutlineBellAlert },
  { key: "appearance", label: "Aparência", icon: HiOutlinePaintBrush },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const SettingsSection = ({ title, desc, children, delay = 0 }: { title: string; desc?: string; children: React.ReactNode; delay?: number }) => (
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

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1234",
    cpf: "123.456.789-00",
    company: "Silva Alimentos LTDA",
    city: "São Paulo",
    state: "SP",
  });

  // Security state
  const [twoFactor, setTwoFactor] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Notification state
  const [notifs, setNotifs] = useState({
    email: true,
    push: false,
    labelReady: true,
    planExpiring: true,
    newsletter: false,
    tips: true,
  });

  // Appearance state
  const [theme, setTheme] = useState("light");

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Gerencie seu perfil e preferências"
      />

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
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <>
              <SettingsSection title="Foto de Perfil" delay={0.1}>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
                    MS
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      <HiOutlineCamera className="w-4 h-4" />
                      Alterar Foto
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-1.5">JPG, PNG até 2MB</p>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Dados Pessoais" desc="Informações básicas da sua conta" delay={0.15}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nome Completo" required>
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                  </FormField>
                  <FormField label="Email" required>
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </FormField>
                  <FormField label="Telefone">
                    <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </FormField>
                  <FormField label="CPF/CNPJ">
                    <Input value={profile.cpf} onChange={(e) => setProfile({ ...profile, cpf: e.target.value })} />
                  </FormField>
                  <FormField label="Empresa">
                    <Input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Cidade">
                      <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                    </FormField>
                    <FormField label="Estado">
                      <Input value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                    </FormField>
                  </div>
                </div>
                <div className="flex justify-end mt-5">
                  <Button variant="primary" size="sm">Salvar Alterações</Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <>
              <SettingsSection title="Alterar Senha" desc="Atualize sua senha de acesso" delay={0.1}>
                <div className="space-y-4 max-w-md">
                  <FormField label="Senha Atual" required>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pr-10" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>
                  <FormField label="Nova Senha" required>
                    <div className="relative">
                      <Input type={showNewPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" className="pr-10" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>
                  <FormField label="Confirmar Nova Senha" required>
                    <Input type="password" placeholder="Repita a nova senha" />
                  </FormField>
                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="sm">Alterar Senha</Button>
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Segurança Avançada" delay={0.15}>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Autenticação em dois fatores (2FA)</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Adicione uma camada extra de segurança à sua conta</p>
                    </div>
                    <Toggle checked={twoFactor} onChange={setTwoFactor} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Alertas de login</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Receba um email quando acessar de um novo dispositivo</p>
                    </div>
                    <Toggle checked={loginAlerts} onChange={setLoginAlerts} />
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Sessões Ativas" delay={0.2}>
                <div className="space-y-3">
                  {[
                    { device: "Chrome — Linux", location: "São Paulo, SP", time: "Agora (sessão atual)", current: true },
                    { device: "Safari — iPhone", location: "São Paulo, SP", time: "há 2 dias", current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                      <div>
                        <p className="text-xs font-semibold text-foreground">{session.device}</p>
                        <p className="text-[10px] text-muted-foreground">{session.location} · {session.time}</p>
                      </div>
                      {session.current ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 px-2.5 py-1 rounded-full">Atual</span>
                      ) : (
                        <Button variant="ghost" size="sm">Encerrar</Button>
                      )}
                    </div>
                  ))}
                </div>
              </SettingsSection>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <>
              <SettingsSection title="Canais de Notificação" desc="Escolha como deseja ser notificado" delay={0.1}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Email</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Receber notificações por email</p>
                    </div>
                    <Toggle checked={notifs.email} onChange={(v) => setNotifs({ ...notifs, email: v })} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Push no navegador</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Notificações em tempo real no browser</p>
                    </div>
                    <Toggle checked={notifs.push} onChange={(v) => setNotifs({ ...notifs, push: v })} />
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Tipos de Notificação" desc="Quais eventos você quer acompanhar" delay={0.15}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Rótulo pronto</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Quando um rótulo gerado por IA estiver pronto</p>
                    </div>
                    <Toggle checked={notifs.labelReady} onChange={(v) => setNotifs({ ...notifs, labelReady: v })} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Plano expirando</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Aviso 7 dias antes da expiração do plano</p>
                    </div>
                    <Toggle checked={notifs.planExpiring} onChange={(v) => setNotifs({ ...notifs, planExpiring: v })} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Newsletter</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Novidades e atualizações do CanvaLabel</p>
                    </div>
                    <Toggle checked={notifs.newsletter} onChange={(v) => setNotifs({ ...notifs, newsletter: v })} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-white/[0.02] rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Dicas e tutoriais</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Aprenda a usar melhor a plataforma</p>
                    </div>
                    <Toggle checked={notifs.tips} onChange={(v) => setNotifs({ ...notifs, tips: v })} />
                  </div>
                </div>
              </SettingsSection>
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <SettingsSection title="Tema da Interface" desc="Escolha como você prefere visualizar o painel" delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: "light", label: "Claro", desc: "Interface em tons claros", preview: "bg-white border-2" },
                  { key: "dark", label: "Escuro", desc: "Interface em tons escuros", preview: "bg-[#12121a] border-2" },
                  { key: "system", label: "Sistema", desc: "Seguir preferência do OS", preview: "bg-gradient-to-r from-white to-[#12121a] border-2" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setTheme(opt.key)}
                    className={cn(
                      "group relative p-4 rounded-2xl border transition-all text-left",
                      theme === opt.key
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10"
                        : "border-border/40 dark:border-white/8 bg-white dark:bg-[#12121a] hover:border-primary/30"
                    )}
                  >
                    <div className={cn("w-full h-20 rounded-xl mb-3", opt.preview, theme === opt.key ? "border-primary/30" : "border-border/30 dark:border-white/10")} />
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
