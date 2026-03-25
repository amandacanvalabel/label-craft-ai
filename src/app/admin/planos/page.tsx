"use client";

import { useState } from "react";
import {
  HiOutlineRectangleGroup,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineBanknotes,
  HiOutlineUsers,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import Badge from "@/components/admin/Badge";
import Modal from "@/components/admin/Modal";
import FormField, { Input, Select, Textarea, Toggle, Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  description: string;
  type: string;
  price: number;
  promotionalPrice: number | null;
  isActive: boolean;
  subscribers: number;
  revenue: string;
  benefits: string[];
}

const initialPlans: Plan[] = [
  { id: "PLN-001", name: "Starter", description: "Ideal para quem está começando", type: "MONTHLY", price: 49.90, promotionalPrice: 39.90, isActive: true, subscribers: 420, revenue: "R$ 16.758", benefits: ["10 rótulos/mês", "2 modelos de IA", "Suporte por email", "Exportação PNG"] },
  { id: "PLN-002", name: "Profissional", description: "Para profissionais e pequenas empresas", type: "MONTHLY", price: 99.90, promotionalPrice: 79.90, isActive: true, subscribers: 650, revenue: "R$ 51.935", benefits: ["50 rótulos/mês", "Todos os modelos de IA", "Suporte prioritário", "Exportação PNG/PDF/SVG", "Templates premium", "Conformidade ANVISA"] },
  { id: "PLN-003", name: "Enterprise", description: "Para grandes operações e indústrias", type: "MONTHLY", price: 299.90, promotionalPrice: 249.90, isActive: true, subscribers: 178, revenue: "R$ 44.482", benefits: ["Rótulos ilimitados", "Todos os modelos de IA", "Suporte 24/7", "Todos os formatos", "API de integração", "White label", "Gerente de conta", "Conformidade ANVISA+"] },
  { id: "PLN-004", name: "Trial", description: "Período de teste gratuito — 14 dias", type: "MONTHLY", price: 0, promotionalPrice: null, isActive: false, subscribers: 0, revenue: "R$ 0", benefits: ["5 rótulos", "1 modelo de IA", "Suporte por email"] },
];

const typeLabels: Record<string, string> = {
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
  LIFETIME: "Vitalício",
};

const stats = [
  { label: "Planos Ativos", value: "3", icon: HiOutlineRectangleGroup, iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15" },
  { label: "Assinantes (Total)", value: "1.248", change: 12, icon: HiOutlineUsers, iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15" },
  { label: "Receita (Planos)", value: "R$ 113.175", change: 8, icon: HiOutlineBanknotes, iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15" },
  { label: "Plano Mais Popular", value: "Profissional", icon: HiOutlineSparkles, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15" },
];

const emptyPlan = { id: "", name: "", description: "", type: "MONTHLY", price: 0, promotionalPrice: null as number | null, isActive: true, subscribers: 0, revenue: "R$ 0", benefits: [] as string[] };

export default function PlanosPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [benefitInput, setBenefitInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyPlan, id: `PLN-${String(plans.length + 1).padStart(3, "0")}` });
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setForm({ ...plan });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setPlans(plans.map((p) => (p.id === editing.id ? { ...form } : p)));
    } else {
      setPlans([...plans, { ...form }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setPlans(plans.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setForm({ ...form, benefits: [...form.benefits, benefitInput.trim()] });
      setBenefitInput("");
    }
  };

  const removeBenefit = (i: number) => {
    setForm({ ...form, benefits: form.benefits.filter((_, idx) => idx !== i) });
  };

  const filtered = plans.filter((p) => {
    if (filter === "active") return p.isActive;
    if (filter === "inactive") return !p.isActive;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Planos"
        subtitle="Gerencie os planos de assinatura da plataforma"
        actions={
          <Button variant="primary" size="sm" onClick={openCreate}>
            <HiOutlinePlus className="w-4 h-4" />
            Novo Plano
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => <StatCard key={stat.label} {...stat} delay={i * 0.08} />)}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mt-6 mb-4">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              filter === f ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-muted/50 dark:bg-white/5 text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((plan, i) => (
            <motion.div
              key={plan.id}
              className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              layout
            >
              {/* Header */}
              <div className="p-5 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-foreground">{plan.name}</h3>
                    <Badge variant={plan.isActive ? "success" : "default"} dot>{plan.isActive ? "Ativo" : "Inativo"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(plan)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                    <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm(plan.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all">
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Pricing */}
              <div className="px-5 pb-4">
                <div className="flex items-baseline gap-2">
                  {plan.promotionalPrice !== null ? (
                    <>
                      <span className="text-3xl font-extrabold text-foreground">R$ {plan.promotionalPrice.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground line-through">R$ {plan.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-extrabold text-foreground">{plan.price === 0 ? "Grátis" : `R$ ${plan.price.toFixed(2)}`}</span>
                  )}
                  <span className="text-xs text-muted-foreground">/{typeLabels[plan.type]?.toLowerCase()}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="px-5 pb-4 grid grid-cols-2 gap-3">
                <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-3 text-center">
                  <p className="text-lg font-extrabold text-foreground">{plan.subscribers}</p>
                  <p className="text-[10px] text-muted-foreground">assinantes</p>
                </div>
                <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-3 text-center">
                  <p className="text-lg font-extrabold text-foreground">{plan.revenue}</p>
                  <p className="text-[10px] text-muted-foreground">receita/mês</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="px-5 pb-5 border-t border-border/30 dark:border-white/5 pt-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Benefícios</p>
                <div className="space-y-1.5">
                  {plan.benefits.slice(0, 4).map((b) => (
                    <div key={b} className="flex items-center gap-2 text-xs text-foreground">
                      <HiOutlineCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {b}
                    </div>
                  ))}
                  {plan.benefits.length > 4 && (
                    <p className="text-[10px] text-primary font-semibold ml-5">+{plan.benefits.length - 4} mais</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Plano" : "Novo Plano"}
        subtitle={editing ? `Editando ${editing.name}` : "Preencha os dados do novo plano"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave}>
              {editing ? "Salvar Alterações" : "Criar Plano"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nome do Plano" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Profissional" />
            </FormField>
            <FormField label="Tipo">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField label="Descrição">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição breve do plano" rows={2} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Preço (R$)" required>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </FormField>
            <FormField label="Preço Promocional (R$)" hint="Deixe 0 para sem promoção">
              <Input type="number" step="0.01" value={form.promotionalPrice ?? 0} onChange={(e) => setForm({ ...form, promotionalPrice: Number(e.target.value) || null })} />
            </FormField>
          </div>

          <FormField label="Ativo">
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label={form.isActive ? "Plano ativo e visível" : "Plano inativo"} />
          </FormField>

          <FormField label="Benefícios">
            <div className="flex gap-2">
              <Input
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                placeholder="Ex: 50 rótulos/mês"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBenefit(); } }}
              />
              <Button variant="secondary" onClick={addBenefit} className="shrink-0">
                <HiOutlinePlus className="w-4 h-4" />
              </Button>
            </div>
            {form.benefits.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {form.benefits.map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/8 text-primary px-3 py-1.5 rounded-full">
                    {b}
                    <button onClick={() => removeBenefit(i)} className="hover:text-red-500 transition-colors">
                      <HiOutlineXCircle className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormField>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Excluir Plano"
        subtitle="Esta ação não pode ser desfeita"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <HiOutlineTrash className="w-4 h-4" />
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir este plano? Assinantes vinculados serão afetados.
        </p>
      </Modal>
    </div>
  );
}
