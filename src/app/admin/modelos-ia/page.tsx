"use client";

import { useState } from "react";
import {
  HiOutlineSparkles,
  HiOutlineCpuChip,
  HiOutlineBolt,
  HiOutlineBanknotes,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineSignal,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
  apiKey: string;
  baseUrl: string;
  isActive: boolean;
  requests: number;
  cost: string;
  avgLatency: string;
  successRate: number;
  lastUsed: string;
}

const initialModels: AIModel[] = [
  { id: "AI-001", name: "Grok Vision", provider: "GROK", apiKey: "gsk_***************abcd", baseUrl: "https://api.x.ai/v1", isActive: true, requests: 4250, cost: "R$ 1.280", avgLatency: "1.2s", successRate: 98.5, lastUsed: "há 2min" },
  { id: "AI-002", name: "DALL·E 3", provider: "DALLE", apiKey: "sk-***************efgh", baseUrl: "https://api.openai.com/v1", isActive: true, requests: 2180, cost: "R$ 2.450", avgLatency: "3.8s", successRate: 96.2, lastUsed: "há 8min" },
  { id: "AI-003", name: "Leonardo AI", provider: "LEONARDO", apiKey: "leo_***************ijkl", baseUrl: "https://cloud.leonardo.ai/api", isActive: true, requests: 1540, cost: "R$ 890", avgLatency: "2.5s", successRate: 97.8, lastUsed: "há 15min" },
  { id: "AI-004", name: "Midjourney v6", provider: "MIDJOURNEY", apiKey: "mj_***************mnop", baseUrl: "https://api.midjourney.com", isActive: false, requests: 459, cost: "R$ 320", avgLatency: "8.2s", successRate: 94.1, lastUsed: "há 3 dias" },
];

const providerColors: Record<string, { bg: string; text: string; hex: string }> = {
  GROK: { bg: "bg-blue-50 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", hex: "#3b82f6" },
  DALLE: { bg: "bg-emerald-50 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", hex: "#10b981" },
  LEONARDO: { bg: "bg-violet-50 dark:bg-violet-500/15", text: "text-violet-600 dark:text-violet-400", hex: "#8b5cf6" },
  MIDJOURNEY: { bg: "bg-amber-50 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", hex: "#f59e0b" },
};

const stats = [
  { label: "Total de Requisições", value: "8.429", change: 18, icon: HiOutlineBolt, iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15" },
  { label: "Modelos Ativos", value: "3", icon: HiOutlineCpuChip, iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15" },
  { label: "Custo Total (Mês)", value: "R$ 4.940", change: -5, icon: HiOutlineBanknotes, iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15" },
  { label: "Taxa de Sucesso", value: "96.8%", change: 1.2, icon: HiOutlineSparkles, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15" },
];

const pieData = [
  { name: "Grok", value: 4250, color: "#3b82f6" },
  { name: "DALL·E", value: 2180, color: "#10b981" },
  { name: "Leonardo", value: 1540, color: "#8b5cf6" },
  { name: "Midjourney", value: 459, color: "#f59e0b" },
];

const barData = [
  { name: "Seg", Grok: 180, "DALL·E": 95, Leonardo: 72, Midjourney: 33 },
  { name: "Ter", Grok: 210, "DALL·E": 110, Leonardo: 85, Midjourney: 45 },
  { name: "Qua", Grok: 250, "DALL·E": 130, Leonardo: 95, Midjourney: 45 },
  { name: "Qui", Grok: 195, "DALL·E": 105, Leonardo: 78, Midjourney: 32 },
  { name: "Sex", Grok: 230, "DALL·E": 120, Leonardo: 90, Midjourney: 50 },
  { name: "Sáb", Grok: 110, "DALL·E": 55, Leonardo: 38, Midjourney: 17 },
  { name: "Dom", Grok: 75, "DALL·E": 40, Leonardo: 25, Midjourney: 10 },
];

const emptyModel: AIModel = { id: "", name: "", provider: "GROK", apiKey: "", baseUrl: "", isActive: true, requests: 0, cost: "R$ 0", avgLatency: "—", successRate: 0, lastUsed: "—" };

const CustomTooltipBar = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-border/50 dark:border-white/10 shadow-xl p-3 text-xs">
      <p className="font-bold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}</span>
          <span className="font-bold text-foreground ml-auto">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomTooltipPie = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-border/50 dark:border-white/10 shadow-xl p-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.payload.color }} />
        <span className="font-bold text-foreground">{d.name}</span>
      </div>
      <p className="text-muted-foreground mt-1">{d.value.toLocaleString("pt-BR")} requisições</p>
    </div>
  );
};

export default function ModelosIAPage() {
  const [models, setModels] = useState(initialModels);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AIModel | null>(null);
  const [form, setForm] = useState(emptyModel);
  const [showKey, setShowKey] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyModel, id: `AI-${String(models.length + 1).padStart(3, "0")}` });
    setShowKey(false);
    setModalOpen(true);
  };

  const openEdit = (model: AIModel) => {
    setEditing(model);
    setForm({ ...model });
    setShowKey(false);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setModels(models.map((m) => (m.id === editing.id ? { ...form } : m)));
    } else {
      setModels([...models, { ...form }]);
    }
    setModalOpen(false);
  };

  const toggleActive = (id: string) => {
    setModels(models.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)));
  };

  return (
    <div>
      <PageHeader
        title="Modelos de IA"
        subtitle="Gerencie as integrações de inteligência artificial"
        actions={
          <Button variant="primary" size="sm" onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" />
            Novo Modelo
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => <StatCard key={stat.label} {...stat} delay={i * 0.08} />)}
      </div>

      {/* Charts — Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <motion.div
          className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h3 className="text-sm font-bold text-foreground">Uso por Provedor</h3>
          <p className="text-[11px] text-muted-foreground mb-2">Requisições este mês</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipPie />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => <span className="text-[11px] text-foreground font-medium ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="lg:col-span-2 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h3 className="text-sm font-bold text-foreground">Uso Diário por Modelo</h3>
          <p className="text-[11px] text-muted-foreground mb-2">Requisições por dia (semana)</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltipBar />} cursor={{ fill: "var(--color-muted)", opacity: 0.3 }} />
              <Bar dataKey="Grok" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="DALL·E" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Leonardo" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Midjourney" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <AnimatePresence mode="popLayout">
          {models.map((model, i) => {
            const pc = providerColors[model.provider] || providerColors.GROK;
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
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", pc.bg)}>
                        <HiOutlineCpuChip className={cn("w-5 h-5", pc.text)} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{model.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={model.isActive ? "success" : "default"} dot>{model.isActive ? "Ativo" : "Inativo"}</Badge>
                          <span className="text-[10px] text-muted-foreground">{model.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleActive(model.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all" title={model.isActive ? "Desativar" : "Ativar"}>
                        <HiOutlineSignal className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(model)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                        <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(model.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Requisições", value: model.requests.toLocaleString("pt-BR") },
                      { label: "Custo", value: model.cost },
                      { label: "Latência", value: model.avgLatency },
                      { label: "Sucesso", value: `${model.successRate}%` },
                    ].map((m) => (
                      <div key={m.label} className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-2.5 text-center">
                        <p className="text-sm font-extrabold text-foreground">{m.value}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Success rate bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground font-medium">Taxa de sucesso</span>
                      <span className="font-bold text-foreground">{model.successRate}%</span>
                    </div>
                    <div className="h-1.5 bg-muted dark:bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", model.successRate > 97 ? "bg-emerald-500" : model.successRate > 95 ? "bg-blue-500" : "bg-amber-500")}
                        initial={{ width: 0 }}
                        animate={{ width: `${model.successRate}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Modelo" : "Novo Modelo de IA"}
        subtitle={editing ? `Editando ${editing.name}` : "Configure a integração com o provedor de IA"}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave}>{editing ? "Salvar" : "Criar Modelo"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Nome do Modelo" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Grok Vision" />
          </FormField>
          <FormField label="Provedor" required>
            <Select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}>
              <option value="GROK">Grok (xAI)</option>
              <option value="DALLE">DALL·E (OpenAI)</option>
              <option value="LEONARDO">Leonardo AI</option>
              <option value="MIDJOURNEY">Midjourney</option>
            </Select>
          </FormField>
          <FormField label="API Key" required>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>
          <FormField label="Base URL" hint="URL base da API do provedor">
            <Input value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} placeholder="https://api.example.com/v1" />
          </FormField>
          <FormField label="Status">
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label={form.isActive ? "Ativo — aceitando requisições" : "Inativo — parado"} />
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Excluir Modelo"
        subtitle="Esta ação não pode ser desfeita"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => { setModels(models.filter((m) => m.id !== deleteConfirm)); setDeleteConfirm(null); }}>
              <HiOutlineTrash className="w-4 h-4" />Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este modelo de IA? As requisições não serão mais processadas por ele.</p>
      </Modal>
    </div>
  );
}
