"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineSparkles,
  HiOutlineCpuChip,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineSignal,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineCalendarDays,
  HiOutlineKey,
  HiOutlineGlobeAlt,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import Badge from "@/components/admin/Badge";
import Modal from "@/components/admin/Modal";
import FormField, { Input, Select, Toggle, Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiKeyMasked: string;
  baseUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashData {
  stats: { totalModels: number; activeCount: number; inactiveCount: number; uniqueProviders: number };
  models: AIModel[];
  providerDist: { provider: string; count: number }[];
}

const PROVIDER_LABELS: Record<string, string> = {
  GROK: "Grok (xAI)",
  DALLE: "DALL·E (OpenAI)",
  LEONARDO: "Leonardo AI",
  MIDJOURNEY: "Midjourney",
};

const PROVIDER_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  GROK:       { bg: "bg-blue-50 dark:bg-blue-500/15",    text: "text-blue-600 dark:text-blue-400",    hex: "#3b82f6" },
  DALLE:      { bg: "bg-emerald-50 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", hex: "#10b981" },
  LEONARDO:   { bg: "bg-violet-50 dark:bg-violet-500/15",  text: "text-violet-600 dark:text-violet-400",   hex: "#8b5cf6" },
  MIDJOURNEY: { bg: "bg-amber-50 dark:bg-amber-500/15",   text: "text-amber-600 dark:text-amber-400",   hex: "#f59e0b" },
};

const PIE_FALLBACK_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  return `há ${Math.floor(hrs / 24)}d`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-2xl bg-muted/50 dark:bg-white/5 animate-pulse", className)} />
);

const CustomTooltipPie = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { hex: string } }[] }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-border/50 dark:border-white/10 shadow-xl p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.payload.hex }} />
        <span className="font-bold text-foreground">{PROVIDER_LABELS[d.name] ?? d.name}</span>
      </div>
      <p className="text-muted-foreground mt-1">{d.value} modelo{d.value !== 1 ? "s" : ""}</p>
    </div>
  );
};

const emptyForm = { name: "", provider: "GROK", apiKey: "", baseUrl: "", isActive: true };

export default function ModelosIAPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/ai-models")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowKey(true);
    setModalOpen(true);
  }

  async function openEdit(model: AIModel) {
    setEditingId(model.id);
    setShowKey(false);
    // Fetch full apiKey for edit
    const res = await fetch(`/api/admin/ai-models/${model.id}`);
    const full = res.ok ? await res.json() : null;
    setForm({
      name: model.name,
      provider: model.provider,
      apiKey: full?.apiKey ?? "",
      baseUrl: model.baseUrl ?? "",
      isActive: model.isActive,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Nome obrigatório"); return; }
    if (!editingId && !form.apiKey.trim()) { toast.error("API Key obrigatória"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/ai-models/${editingId}` : "/api/admin/ai-models";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          provider: form.provider,
          ...(form.apiKey.trim() && { apiKey: form.apiKey }),
          baseUrl: form.baseUrl || null,
          isActive: form.isActive,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao salvar");
        return;
      }
      toast.success(editingId ? "Modelo atualizado" : "Modelo criado");
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(model: AIModel) {
    const res = await fetch(`/api/admin/ai-models/${model.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !model.isActive }),
    });
    if (res.ok) {
      toast.success(model.isActive ? "Modelo desativado" : "Modelo ativado");
      load();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/ai-models/${deleteId}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Erro ao excluir"); return; }
      toast.success("Modelo excluído");
      setDeleteId(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  const s = data?.stats;
  const statCards = [
    {
      label: "Total de Modelos",
      value: loading ? "…" : String(s?.totalModels ?? 0),
      icon: HiOutlineCpuChip,
      iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
    },
    {
      label: "Modelos Ativos",
      value: loading ? "…" : String(s?.activeCount ?? 0),
      icon: HiOutlineCheckCircle,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15",
    },
    {
      label: "Modelos Inativos",
      value: loading ? "…" : String(s?.inactiveCount ?? 0),
      icon: HiOutlineXCircle,
      iconColor: "text-red-500 bg-red-50 dark:bg-red-500/15",
    },
    {
      label: "Provedores Únicos",
      value: loading ? "…" : String(s?.uniqueProviders ?? 0),
      icon: HiOutlineSparkles,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15",
    },
  ];

  const pieData = (data?.providerDist ?? []).map((p, i) => ({
    name: p.provider,
    value: p.count,
    hex: PROVIDER_COLORS[p.provider]?.hex ?? PIE_FALLBACK_COLORS[i % PIE_FALLBACK_COLORS.length],
  }));

  const deletingModel = data?.models.find((m) => m.id === deleteId);

  return (
    <div>
      <PageHeader
        title="Modelos de IA"
        subtitle="Gerencie as integrações de inteligência artificial"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={load}>
              <HiOutlineArrowPath className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="primary" size="sm" onClick={openCreate}>
              <HiOutlinePlus className="w-4 h-4" />
              Novo Modelo
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, i) => <StatCard key={stat.label} {...stat} delay={i * 0.08} />)}
      </div>

      {/* Pie chart */}
      {!loading && pieData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
          <motion.div
            className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-foreground">Modelos por Provedor</h3>
            <p className="text-[11px] text-muted-foreground mb-2">Distribuição atual</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.hex} />)}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-[11px] text-foreground font-medium ml-1">
                      {PROVIDER_LABELS[value] ?? value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            className="lg:col-span-2 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5 flex flex-col items-center justify-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <HiOutlineSparkles className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm font-semibold text-muted-foreground">Métricas de Uso</p>
            <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
              Requisições, custo e latência por modelo estarão disponíveis quando o tracking de uso for implementado.
            </p>
            <Badge variant="default">Em breve</Badge>
          </motion.div>
        </div>
      )}

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-48" />)
        ) : data?.models.length === 0 ? (
          <div className="lg:col-span-2 text-center py-16 text-muted-foreground text-sm">
            Nenhum modelo cadastrado ainda.{" "}
            <button onClick={openCreate} className="text-primary font-semibold hover:underline">
              Adicionar agora
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {(data?.models ?? []).map((model, i) => {
              const pc = PROVIDER_COLORS[model.provider] ?? PROVIDER_COLORS.GROK;
              return (
                <motion.div
                  key={model.id}
                  className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm overflow-hidden group hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  layout
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", pc.bg)}>
                          <HiOutlineCpuChip className={cn("w-5 h-5", pc.text)} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{model.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={model.isActive ? "success" : "default"} dot>
                              {model.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                            <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", pc.bg, pc.text)}>
                              {PROVIDER_LABELS[model.provider] ?? model.provider}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggle(model)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all"
                          title={model.isActive ? "Desativar" : "Ativar"}
                        >
                          <HiOutlineSignal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(model)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(model.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                        >
                          <HiOutlineTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2.5 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
                        <HiOutlineKey className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono text-muted-foreground truncate">{model.apiKeyMasked}</span>
                      </div>
                      {model.baseUrl && (
                        <div className="flex items-center gap-2 p-2.5 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
                          <HiOutlineGlobeAlt className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{model.baseUrl}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-2.5 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
                        <div className="flex items-center gap-2">
                          <HiOutlineCalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">Criado {fmtDate(model.createdAt)}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">Atualizado {timeAgo(model.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Modelo" : "Novo Modelo de IA"}
        subtitle={editingId ? `Editando ${form.name}` : "Configure a integração com o provedor de IA"}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando…" : editingId ? "Salvar" : "Criar Modelo"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Nome do Modelo" required>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Grok Vision"
            />
          </FormField>

          <FormField label="Provedor" required>
            <Select value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}>
              {Object.entries(PROVIDER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </FormField>

          <FormField
            label={editingId ? "API Key (deixe em branco para manter)" : "API Key"}
            required={!editingId}
          >
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={form.apiKey}
                onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                placeholder={editingId ? "Nova chave (opcional)" : "sk-..."}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>

          <FormField label="Base URL" hint="URL base da API do provedor">
            <Input
              value={form.baseUrl}
              onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
              placeholder="https://api.example.com/v1"
            />
          </FormField>

          <FormField label="Status">
            <Toggle
              checked={form.isActive}
              onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              label={form.isActive ? "Ativo — aceitando requisições" : "Inativo — parado"}
            />
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir Modelo"
        subtitle="Esta ação não pode ser desfeita"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              <HiOutlineTrash className="w-4 h-4" />
              {deleting ? "Excluindo…" : "Excluir"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Requisições em andamento via <strong>{deletingModel?.name}</strong> serão interrompidas.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <strong className="text-foreground">{deletingModel?.name}</strong>?
          </p>
        </div>
      </Modal>
    </div>
  );
}
