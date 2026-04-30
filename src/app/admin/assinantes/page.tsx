"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineArrowPath,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCreditCard,
  HiOutlineSparkles,
  HiOutlineCalendarDays,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineRectangleGroup,
  HiOutlineEye,
} from "react-icons/hi2";
import { toast } from "sonner";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import DataTable, { Column } from "@/components/admin/DataTable";
import Badge from "@/components/admin/Badge";
import Modal from "@/components/admin/Modal";
import FormField, { Button, Input, Select } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  type: string;
  price: number;
  promotionalPrice: number | null;
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpfOrCnpj: string;
  planId: string | null;
  planName: string | null;
  city: string | null;
  state: string | null;
  labelsCount: number;
  status: "active" | "pending" | "no_plan";
  confirmedRevenue: number;
  createdAt: string;
  activatedAt: string | null;
  expiresAt: string | null;
  [key: string]: unknown;
}

interface DashData {
  stats: { total: number; newThisMonth: number; retentionPct: number };
  subscribers: Subscriber[];
  plans: Plan[];
}

type ModalMode = "view" | "edit" | "confirm_delete";

const STATUS_MAP = {
  active:   { label: "Ativo",      variant: "success" as const },
  pending:  { label: "Pendente",   variant: "warning" as const },
  no_plan:  { label: "Sem plano",  variant: "default" as const },
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function fmtCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

const DetailItem = ({
  icon: Icon, label, value,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 bg-muted/30 dark:bg-white/[0.03] rounded-xl">
    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
    </div>
  </div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl bg-muted/50 dark:bg-white/5 animate-pulse", className)} />
);

export default function AssinantesPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Subscriber | null>(null);
  const [mode, setMode] = useState<ModalMode>("view");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPlanId, setEditPlanId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/subscribers")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function openModal(row: Subscriber) {
    setSelected(row);
    setMode("view");
  }

  function startEdit() {
    if (!selected) return;
    setEditName(selected.name);
    setEditEmail(selected.email);
    setEditPhone(selected.phone ?? "");
    setEditCity(selected.city ?? "");
    setEditState(selected.state ?? "");
    setEditPlanId(selected.planId ?? "");
    setMode("edit");
  }

  function closeModal() {
    setSelected(null);
    setMode("view");
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim() || null,
          city: editCity.trim() || null,
          state: editState.trim() || null,
          planId: editPlanId || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao salvar");
        return;
      }
      toast.success("Assinante atualizado");
      closeModal();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${selected.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Erro ao excluir"); return; }
      toast.success("Assinante excluído");
      closeModal();
      load();
    } finally {
      setDeleting(false);
    }
  }

  const s = data?.stats;
  const statCards = [
    {
      label: "Total de Assinantes",
      value: loading ? "…" : String(s?.total ?? 0),
      icon: HiOutlineUsers,
      iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
      sparkline: [20, 25, 28, 30, 32, 35, 40, 42, 45, 50, 52, s?.total ?? 0],
    },
    {
      label: "Novos (Mês)",
      value: loading ? "…" : String(s?.newThisMonth ?? 0),
      icon: HiOutlineUserPlus,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15",
      sparkline: [2, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, s?.newThisMonth ?? 0],
    },
    {
      label: "Com Plano Ativo",
      value: loading ? "…" : String(data?.subscribers.filter((x) => x.status === "active").length ?? 0),
      icon: HiOutlineRectangleGroup,
      iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15",
    },
    {
      label: "Taxa c/ Plano",
      value: loading ? "…" : `${s?.retentionPct ?? 0}%`,
      icon: HiOutlineSparkles,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15",
    },
  ];

  const plans = data?.plans ?? [];

  const columns: Column<Subscriber>[] = [
    {
      key: "name",
      label: "Assinante",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm shadow-primary/20">
            {row.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{row.name}</p>
            <p className="text-[10px] text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "planName",
      label: "Plano",
      sortable: true,
      render: (row) => row.planName
        ? <Badge variant="info">{row.planName}</Badge>
        : <span className="text-xs text-muted-foreground italic">—</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => {
        const st = STATUS_MAP[row.status];
        return <Badge variant={st.variant} dot>{st.label}</Badge>;
      },
    },
    {
      key: "city",
      label: "Localização",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.city && row.state ? `${row.city}, ${row.state}` : row.city ?? row.state ?? "—"}
        </span>
      ),
    },
    {
      key: "labelsCount",
      label: "Rótulos",
      sortable: true,
      render: (row) => <span className="text-sm font-bold text-foreground">{row.labelsCount}</span>,
    },
    {
      key: "activatedAt",
      label: "Ativação",
      sortable: true,
      render: (row) => <span className="text-xs text-muted-foreground">{fmtDate(row.activatedAt)}</span>,
    },
    {
      key: "expiresAt",
      label: "Expiração",
      sortable: true,
      render: (row) => {
        if (!row.expiresAt) return <span className="text-xs text-muted-foreground">—</span>;
        const expiring = new Date(row.expiresAt) < new Date(Date.now() + 30 * 86_400_000);
        return <span className={cn("text-xs", expiring ? "text-amber-500 font-bold" : "text-muted-foreground")}>{fmtDate(row.expiresAt)}</span>;
      },
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); openModal(row); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
        >
          <HiOutlineEye className="w-4 h-4" />
        </button>
      ),
      className: "w-12",
    },
  ];

  // Modal footer
  const modalFooter = (() => {
    if (mode === "view") return (
      <>
        <Button variant="danger" size="sm" onClick={() => setMode("confirm_delete")}>
          <HiOutlineTrash className="w-4 h-4" />
          Excluir
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" size="sm" onClick={closeModal}>Fechar</Button>
        <Button size="sm" onClick={startEdit}>
          <HiOutlinePencilSquare className="w-4 h-4" />
          Editar
        </Button>
      </>
    );
    if (mode === "edit") return (
      <>
        <Button variant="secondary" size="sm" onClick={() => setMode("view")}>Cancelar</Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <HiOutlineCheckCircle className="w-4 h-4" />
          {saving ? "Salvando…" : "Salvar"}
        </Button>
      </>
    );
    if (mode === "confirm_delete") return (
      <>
        <Button variant="secondary" size="sm" onClick={() => setMode("view")}>Cancelar</Button>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
          <HiOutlineTrash className="w-4 h-4" />
          {deleting ? "Excluindo…" : "Confirmar exclusão"}
        </Button>
      </>
    );
  })();

  return (
    <div>
      <PageHeader
        title="Assinantes"
        subtitle="Gerencie todos os assinantes da plataforma"
        actions={
          <Button variant="secondary" size="sm" onClick={load}>
            <HiOutlineArrowPath className={cn("w-4 h-4", loading && "animate-spin")} />
            Atualizar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, i) => <StatCard key={stat.label} {...stat} delay={i * 0.08} />)}
      </div>

      {/* Table */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.subscribers ?? []}
            pageSize={10}
            searchPlaceholder="Buscar por nome, email, CPF..."
            onRowClick={openModal}
            filterSlot={
              <div className="flex flex-wrap gap-3">
                <select className="px-3 py-2 text-xs bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-lg text-foreground">
                  <option value="all">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="no_plan">Sem plano</option>
                </select>
                <select className="px-3 py-2 text-xs bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-lg text-foreground">
                  <option value="all">Todos os planos</option>
                  {plans.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
            }
          />
        )}
      </div>

      {/* Subscriber Modal */}
      <Modal
        isOpen={!!selected}
        onClose={closeModal}
        title={
          mode === "view" ? (selected?.name ?? "") :
          mode === "edit" ? "Editar Assinante" :
          "Excluir Assinante"
        }
        subtitle={
          mode === "view" ? selected?.email :
          mode === "edit" ? selected?.email :
          undefined
        }
        size="lg"
        footer={modalFooter}
      >
        {selected && mode === "view" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                {selected.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={STATUS_MAP[selected.status].variant} dot>
                    {STATUS_MAP[selected.status].label}
                  </Badge>
                  {selected.planName && <Badge variant="info">{selected.planName}</Badge>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailItem icon={HiOutlineEnvelope} label="Email" value={selected.email} />
              <DetailItem icon={HiOutlinePhone} label="Telefone" value={selected.phone ?? "—"} />
              <DetailItem icon={HiOutlineCreditCard} label="CPF/CNPJ" value={selected.cpfOrCnpj} />
              <DetailItem icon={HiOutlineMapPin} label="Localização"
                value={selected.city && selected.state ? `${selected.city}, ${selected.state}` : selected.city ?? selected.state ?? "—"} />
              <DetailItem icon={HiOutlineCalendarDays} label="Ativação" value={fmtDate(selected.activatedAt)} />
              <DetailItem icon={HiOutlineCalendarDays} label="Expiração" value={fmtDate(selected.expiresAt)} />
              <DetailItem icon={HiOutlineSparkles} label="Rótulos Criados" value={String(selected.labelsCount)} />
              <DetailItem icon={HiOutlineCreditCard} label="Receita Total" value={fmtCurrency(selected.confirmedRevenue)} />
              <DetailItem icon={HiOutlineCalendarDays} label="Cadastro" value={fmtDate(selected.createdAt)} />
            </div>
          </div>
        )}

        {selected && mode === "edit" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Nome" required>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </FormField>
              <FormField label="E-mail" required>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </FormField>
              <FormField label="Telefone">
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="(11) 99999-0000" />
              </FormField>
              <FormField label="Cidade">
                <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} />
              </FormField>
              <FormField label="Estado">
                <Input value={editState} onChange={(e) => setEditState(e.target.value)} maxLength={2} placeholder="SP" />
              </FormField>
              <FormField label="Plano">
                <Select value={editPlanId} onChange={(e) => setEditPlanId(e.target.value)}>
                  <option value="">Sem plano</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.promotionalPrice ?? p.price)}/mês
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </div>
        )}

        {selected && mode === "confirm_delete" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
              <HiOutlineExclamationTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Ação irreversível</p>
                <p className="text-xs text-red-600 dark:text-red-400/80 mt-0.5">
                  Todos os rótulos e pagamentos de <strong>{selected.name}</strong> serão permanentemente excluídos.
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted/30 dark:bg-white/[0.03] rounded-xl space-y-1.5">
              <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Nome:</span> {selected.name}</p>
              <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Email:</span> {selected.email}</p>
              <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Rótulos:</span> {selected.labelsCount} criados</p>
              <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">Receita:</span> {fmtCurrency(selected.confirmedRevenue)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
