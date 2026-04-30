"use client";

import { useState, useEffect } from "react";
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
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
  benefits: string[];
  subscriberCount: number;
  totalRevenue: number;
}

interface DashData {
  stats: {
    activePlans: number;
    subscriberTotal: number;
    totalRevenue: number;
    mostPopularName: string;
  };
  plans: Plan[];
}

const TYPE_LABELS: Record<string, string> = {
  MONTHLY: "Mensal",
  QUARTERLY: "Trimestral",
  SEMIANNUAL: "Semestral",
  ANNUAL: "Anual",
  LIFETIME: "Vitalício",
};

function fmtCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

const emptyForm = {
  name: "", description: "", type: "MONTHLY",
  price: 0, promotionalPrice: null as number | null,
  isActive: true, benefits: [] as string[],
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-2xl bg-muted/50 dark:bg-white/5 animate-pulse", className)} />
);

export default function PlanosPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [benefitInput, setBenefitInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/plans")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setBenefitInput("");
    setModalOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      description: plan.description,
      type: plan.type,
      price: plan.price,
      promotionalPrice: plan.promotionalPrice,
      isActive: plan.isActive,
      benefits: [...plan.benefits],
    });
    setBenefitInput("");
    setModalOpen(true);
  }

  function addBenefit() {
    if (benefitInput.trim()) {
      setForm((f) => ({ ...f, benefits: [...f.benefits, benefitInput.trim()] }));
      setBenefitInput("");
    }
  }

  function removeBenefit(i: number) {
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }));
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/plans/${editingId}` : "/api/admin/plans";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao salvar");
        return;
      }
      toast.success(editingId ? "Plano atualizado" : "Plano criado");
      setModalOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/plans/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao excluir");
        return;
      }
      toast.success("Plano excluído");
      setDeleteId(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  const s = data?.stats;
  const statCards = [
    {
      label: "Planos Ativos",
      value: loading ? "…" : String(s?.activePlans ?? 0),
      icon: HiOutlineRectangleGroup,
      iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
    },
    {
      label: "Assinantes (Total)",
      value: loading ? "…" : String(s?.subscriberTotal ?? 0),
      icon: HiOutlineUsers,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15",
    },
    {
      label: "Receita (Total)",
      value: loading ? "…" : fmtCurrency(s?.totalRevenue ?? 0),
      icon: HiOutlineBanknotes,
      iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15",
    },
    {
      label: "Plano Mais Popular",
      value: loading ? "…" : (s?.mostPopularName ?? "—"),
      icon: HiOutlineSparkles,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15",
    },
  ];

  const filtered = (data?.plans ?? []).filter((p) => {
    if (filter === "active") return p.isActive;
    if (filter === "inactive") return !p.isActive;
    return true;
  });

  const deletingPlan = data?.plans.find((p) => p.id === deleteId);

  return (
    <div>
      <PageHeader
        title="Planos"
        subtitle="Gerencie os planos de assinatura da plataforma"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={load}>
              <HiOutlineArrowPath className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="primary" size="sm" onClick={openCreate}>
              <HiOutlinePlus className="w-4 h-4" />
              Novo Plano
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, i) => <StatCard key={stat.label} {...stat} delay={i * 0.08} />)}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mt-6 mb-4">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-xl transition-all",
              filter === f
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-muted/50 dark:bg-white/5 text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">Nenhum plano encontrado</p>
      ) : (
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
                      <Badge variant={plan.isActive ? "success" : "default"} dot>
                        {plan.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{plan.description || "Sem descrição"}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(plan)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(plan.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pricing */}
                <div className="px-5 pb-4">
                  <div className="flex items-baseline gap-2">
                    {plan.promotionalPrice !== null ? (
                      <>
                        <span className="text-3xl font-extrabold text-foreground">{fmtCurrency(plan.promotionalPrice)}</span>
                        <span className="text-sm text-muted-foreground line-through">{fmtCurrency(plan.price)}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-extrabold text-foreground">
                        {plan.price === 0 ? "Grátis" : fmtCurrency(plan.price)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">/{TYPE_LABELS[plan.type]?.toLowerCase()}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="px-5 pb-4 grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-foreground">{plan.subscriberCount}</p>
                    <p className="text-[10px] text-muted-foreground">assinantes</p>
                  </div>
                  <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-3 text-center">
                    <p className="text-lg font-extrabold text-foreground">{fmtCurrency(plan.totalRevenue)}</p>
                    <p className="text-[10px] text-muted-foreground">receita total</p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="px-5 pb-5 border-t border-border/30 dark:border-white/5 pt-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Benefícios</p>
                  {plan.benefits.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Nenhum benefício cadastrado</p>
                  ) : (
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
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar Plano" : "Novo Plano"}
        subtitle={editingId ? `Editando ${form.name}` : "Preencha os dados do novo plano"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando…" : editingId ? "Salvar Alterações" : "Criar Plano"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nome do Plano" required>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Profissional" />
            </FormField>
            <FormField label="Tipo">
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField label="Descrição">
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descrição breve do plano" rows={2} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Preço (R$)" required>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Preço Promocional (R$)" hint="Deixe 0 para sem promoção">
              <Input type="number" step="0.01" min="0" value={form.promotionalPrice ?? 0} onChange={(e) => setForm((f) => ({ ...f, promotionalPrice: Number(e.target.value) || null }))} />
            </FormField>
          </div>

          <FormField label="Status">
            <Toggle checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} label={form.isActive ? "Plano ativo e visível" : "Plano inativo"} />
          </FormField>

          <FormField label="Benefícios" hint="Pressione Enter ou clique + para adicionar">
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
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir Plano"
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
          {deletingPlan && deletingPlan.subscriberCount > 0 && (
            <div className="flex items-center gap-2.5 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Este plano tem <strong>{deletingPlan.subscriberCount} assinante(s)</strong>. A exclusão será bloqueada.
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o plano <strong className="text-foreground">{deletingPlan?.name}</strong>?
          </p>
        </div>
      </Modal>
    </div>
  );
}
