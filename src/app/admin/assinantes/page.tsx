"use client";

import { useState } from "react";
import {
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineUserMinus,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineEye,
  HiOutlineCalendarDays,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCreditCard,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import DataTable, { Column } from "@/components/admin/DataTable";
import Badge from "@/components/admin/Badge";
import Modal from "@/components/admin/Modal";
import { Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total de Assinantes", value: "1.248", change: 12, icon: HiOutlineUsers, iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15" },
  { label: "Novos (Mês)", value: "86", change: 22, icon: HiOutlineUserPlus, iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15" },
  { label: "Cancelamentos (Mês)", value: "12", change: -30, icon: HiOutlineUserMinus, iconColor: "text-red-500 bg-red-50 dark:bg-red-500/15" },
  { label: "Taxa de Retenção", value: "96.2%", change: 2, icon: HiOutlineSparkles, iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15" },
];

interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfOrCnpj: string;
  plan: string;
  status: string;
  city: string;
  state: string;
  labels: number;
  activatedAt: string;
  expiresAt: string;
  createdAt: string;
  [key: string]: unknown;
}

const subscribersData: Subscriber[] = [
  { id: "SUB-001", name: "Maria Silva", email: "maria@email.com", phone: "(11) 99999-1234", cpfOrCnpj: "123.456.789-00", plan: "Profissional", status: "active", city: "São Paulo", state: "SP", labels: 142, activatedAt: "2025-11-15", expiresAt: "2026-11-15", createdAt: "2025-11-15" },
  { id: "SUB-002", name: "Carlos Oliveira", email: "carlos@email.com", phone: "(21) 98888-5678", cpfOrCnpj: "987.654.321-00", plan: "Enterprise", status: "active", city: "Rio de Janeiro", state: "RJ", labels: 98, activatedAt: "2026-02-01", expiresAt: "2027-02-01", createdAt: "2026-02-01" },
  { id: "SUB-003", name: "Ana Costa", email: "ana@email.com", phone: "(31) 97777-9012", cpfOrCnpj: "456.789.123-00", plan: "Starter", status: "active", city: "Belo Horizonte", state: "MG", labels: 87, activatedAt: "2026-02-10", expiresAt: "2027-02-10", createdAt: "2026-02-10" },
  { id: "SUB-004", name: "João Mendes", email: "joao@email.com", phone: "(41) 96666-3456", cpfOrCnpj: "321.654.987-00", plan: "Profissional", status: "pending", city: "Curitiba", state: "PR", labels: 0, activatedAt: "—", expiresAt: "—", createdAt: "2026-03-20" },
  { id: "SUB-005", name: "Paula Santos", email: "paula@email.com", phone: "(51) 95555-7890", cpfOrCnpj: "654.321.987-00", plan: "Profissional", status: "active", city: "Porto Alegre", state: "RS", labels: 54, activatedAt: "2026-03-01", expiresAt: "2027-03-01", createdAt: "2026-03-01" },
  { id: "SUB-006", name: "Lucas Ferreira", email: "lucas@email.com", phone: "(61) 94444-1234", cpfOrCnpj: "789.123.456-00", plan: "Enterprise", status: "active", city: "Brasília", state: "DF", labels: 215, activatedAt: "2025-06-15", expiresAt: "2026-06-15", createdAt: "2025-06-15" },
  { id: "SUB-007", name: "Beatriz Lima", email: "bia@email.com", phone: "(71) 93333-5678", cpfOrCnpj: "147.258.369-00", plan: "Starter", status: "cancelled", city: "Salvador", state: "BA", labels: 12, activatedAt: "2025-12-01", expiresAt: "2026-03-01", createdAt: "2025-12-01" },
  { id: "SUB-008", name: "Ricardo Souza", email: "ricardo@email.com", phone: "(81) 92222-9012", cpfOrCnpj: "258.369.147-00", plan: "Profissional", status: "active", city: "Recife", state: "PE", labels: 76, activatedAt: "2026-01-20", expiresAt: "2027-01-20", createdAt: "2026-01-20" },
  { id: "SUB-009", name: "Fernanda Rocha", email: "fer@email.com", phone: "(85) 91111-3456", cpfOrCnpj: "369.147.258-00", plan: "Starter", status: "expired", city: "Fortaleza", state: "CE", labels: 23, activatedAt: "2025-03-15", expiresAt: "2026-03-15", createdAt: "2025-03-15" },
  { id: "SUB-010", name: "Pedro Alves", email: "pedro@email.com", phone: "(91) 90000-7890", cpfOrCnpj: "741.852.963-00", plan: "Enterprise", status: "active", city: "Belém", state: "PA", labels: 167, activatedAt: "2025-09-01", expiresAt: "2026-09-01", createdAt: "2025-09-01" },
];

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" }> = {
  active: { label: "Ativo", variant: "success" },
  pending: { label: "Pendente", variant: "warning" },
  cancelled: { label: "Cancelado", variant: "error" },
  expired: { label: "Expirado", variant: "info" },
};

// Detail item for the subscriber modal
const DetailItem = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
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

export default function AssinantesPage() {
  const [selected, setSelected] = useState<Subscriber | null>(null);

  const columns: Column<Subscriber>[] = [
    {
      key: "name",
      label: "Assinante",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm shadow-primary/20">
            {row.name.split(" ").map((n: string) => n[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{row.name}</p>
            <p className="text-[10px] text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      label: "Plano",
      sortable: true,
      render: (row) => <Badge variant={row.plan === "Enterprise" ? "primary" : row.plan === "Profissional" ? "info" : "default"}>{row.plan}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => {
        const s = statusMap[row.status];
        return <Badge variant={s?.variant} dot>{s?.label}</Badge>;
      },
    },
    {
      key: "city",
      label: "Localização",
      render: (row) => <span className="text-xs text-muted-foreground">{row.city}, {row.state}</span>,
    },
    {
      key: "labels",
      label: "Rótulos",
      sortable: true,
      render: (row) => <span className="text-sm font-bold text-foreground">{row.labels}</span>,
    },
    {
      key: "activatedAt",
      label: "Ativação",
      sortable: true,
      render: (row) => <span className="text-xs text-muted-foreground">{row.activatedAt}</span>,
    },
    {
      key: "expiresAt",
      label: "Expiração",
      sortable: true,
      render: (row) => {
        const isExpiring = row.expiresAt !== "—" && new Date(row.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return <span className={cn("text-xs", isExpiring ? "text-amber-500 font-bold" : "text-muted-foreground")}>{row.expiresAt}</span>;
      },
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelected(row); }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
        >
          <HiOutlineEye className="w-4 h-4" />
        </button>
      ),
      className: "w-12",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Assinantes"
        subtitle="Gerencie todos os assinantes da plataforma"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm"><HiOutlineArrowDownTray className="w-4 h-4" />Exportar</Button>
            <Button variant="secondary" size="sm"><HiOutlineArrowPath className="w-4 h-4" />Atualizar</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => <StatCard key={stat.label} {...stat} delay={i * 0.08} />)}
      </div>

      {/* Table */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={subscribersData}
          pageSize={8}
          searchPlaceholder="Buscar por nome, email, CPF..."
          onRowClick={(row) => setSelected(row)}
          filterSlot={
            <div className="flex flex-wrap gap-3">
              <select className="px-3 py-2 text-xs bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-lg text-foreground">
                <option value="all">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelado</option>
                <option value="expired">Expirado</option>
              </select>
              <select className="px-3 py-2 text-xs bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-lg text-foreground">
                <option value="all">Todos os planos</option>
                <option value="Starter">Starter</option>
                <option value="Profissional">Profissional</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          }
        />
      </div>

      {/* Subscriber Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        subtitle={selected?.email}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            {/* Status & Plan */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                {selected.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={statusMap[selected.status]?.variant} dot>{statusMap[selected.status]?.label}</Badge>
                  <Badge variant={selected.plan === "Enterprise" ? "primary" : selected.plan === "Profissional" ? "info" : "default"}>{selected.plan}</Badge>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailItem icon={HiOutlineEnvelope} label="Email" value={selected.email} />
              <DetailItem icon={HiOutlinePhone} label="Telefone" value={selected.phone} />
              <DetailItem icon={HiOutlineCreditCard} label="CPF/CNPJ" value={selected.cpfOrCnpj} />
              <DetailItem icon={HiOutlineMapPin} label="Localização" value={`${selected.city}, ${selected.state}`} />
              <DetailItem icon={HiOutlineCalendarDays} label="Ativação" value={selected.activatedAt} />
              <DetailItem icon={HiOutlineCalendarDays} label="Expiração" value={selected.expiresAt} />
              <DetailItem icon={HiOutlineSparkles} label="Rótulos Criados" value={String(selected.labels)} />
              <DetailItem icon={HiOutlineCalendarDays} label="Cadastro" value={selected.createdAt} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
