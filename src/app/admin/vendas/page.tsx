"use client";

import { useState } from "react";
import {
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineReceiptPercent,
  HiOutlineArrowDownTray,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import DataTable, { Column } from "@/components/admin/DataTable";
import Badge from "@/components/admin/Badge";
import { Button } from "@/components/admin/FormField";

const stats = [
  { label: "Receita Total (Mês)", value: "R$ 98.450", change: 8, icon: HiOutlineBanknotes, iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15", sparkline: [60, 68, 72, 78, 85, 80, 88, 92, 95, 90, 98, 102] },
  { label: "Vendas Confirmadas", value: "342", change: 15, icon: HiOutlineCheckCircle, iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15", sparkline: [20, 22, 25, 28, 30, 35, 32, 38, 40, 42, 45, 48] },
  { label: "Vendas Pendentes", value: "28", change: -5, icon: HiOutlineClock, iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15", sparkline: [15, 12, 18, 14, 10, 16, 12, 8, 14, 10, 6, 8] },
  { label: "Ticket Médio", value: "R$ 287,86", change: 3, icon: HiOutlineReceiptPercent, iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15", sparkline: [250, 260, 255, 270, 280, 275, 285, 290, 280, 295, 288, 300] },
];


interface Sale {
  id: string;
  subscriber: string;
  email: string;
  plan: string;
  method: string;
  amount: number;
  status: string;
  activatedAt: string;
  expiresAt: string;
  [key: string]: unknown;
}

const salesData: Sale[] = [
  { id: "VND-001", subscriber: "Maria Silva", email: "maria@email.com", plan: "Profissional", method: "PIX", amount: 79.90, status: "CONFIRMED", activatedAt: "2026-01-15", expiresAt: "2027-01-15" },
  { id: "VND-002", subscriber: "Carlos Oliveira", email: "carlos@email.com", plan: "Enterprise", method: "CARD", amount: 199.90, status: "CONFIRMED", activatedAt: "2026-02-01", expiresAt: "2027-02-01" },
  { id: "VND-003", subscriber: "Ana Costa", email: "ana@email.com", plan: "Starter", method: "PIX", amount: 39.90, status: "CONFIRMED", activatedAt: "2026-02-10", expiresAt: "2027-02-10" },
  { id: "VND-004", subscriber: "João Mendes", email: "joao@email.com", plan: "Profissional", method: "BOLETO", amount: 79.90, status: "PENDING", activatedAt: "—", expiresAt: "—" },
  { id: "VND-005", subscriber: "Paula Santos", email: "paula@email.com", plan: "Profissional", method: "PIX", amount: 79.90, status: "CONFIRMED", activatedAt: "2026-03-01", expiresAt: "2027-03-01" },
  { id: "VND-006", subscriber: "Lucas Ferreira", email: "lucas@email.com", plan: "Enterprise", method: "CARD", amount: 199.90, status: "CONFIRMED", activatedAt: "2026-03-05", expiresAt: "2027-03-05" },
  { id: "VND-007", subscriber: "Beatriz Lima", email: "bia@email.com", plan: "Starter", method: "PIX", amount: 39.90, status: "CANCELLED", activatedAt: "—", expiresAt: "—" },
  { id: "VND-008", subscriber: "Ricardo Souza", email: "ricardo@email.com", plan: "Profissional", method: "PIX", amount: 79.90, status: "CONFIRMED", activatedAt: "2026-03-12", expiresAt: "2027-03-12" },
  { id: "VND-009", subscriber: "Fernanda Rocha", email: "fer@email.com", plan: "Starter", method: "BOLETO", amount: 39.90, status: "PENDING", activatedAt: "—", expiresAt: "—" },
  { id: "VND-010", subscriber: "Pedro Alves", email: "pedro@email.com", plan: "Enterprise", method: "CARD", amount: 199.90, status: "REFUNDED", activatedAt: "2026-01-20", expiresAt: "—" },
  { id: "VND-011", subscriber: "Camila Dias", email: "camila@email.com", plan: "Profissional", method: "PIX", amount: 79.90, status: "CONFIRMED", activatedAt: "2026-03-18", expiresAt: "2027-03-18" },
  { id: "VND-012", subscriber: "Bruno Martins", email: "bruno@email.com", plan: "Starter", method: "PIX", amount: 39.90, status: "CONFIRMED", activatedAt: "2026-03-20", expiresAt: "2027-03-20" },
];

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" }> = {
  CONFIRMED: { label: "Confirmado", variant: "success" },
  PENDING: { label: "Pendente", variant: "warning" },
  CANCELLED: { label: "Cancelado", variant: "error" },
  REFUNDED: { label: "Estornado", variant: "info" },
};

const methodMap: Record<string, { label: string; icon: React.ReactNode }> = {
  PIX: { label: "PIX", icon: <span className="text-emerald-500 font-bold text-[10px]">PIX</span> },
  CARD: { label: "Cartão", icon: <HiOutlineCreditCard className="w-3.5 h-3.5 text-blue-500" /> },
  BOLETO: { label: "Boleto", icon: <span className="text-amber-500 font-bold text-[10px]">BOL</span> },
};

const columns: Column<Sale>[] = [
  {
    key: "id",
    label: "ID",
    sortable: true,
    render: (row) => <span className="text-xs font-mono font-bold text-primary">{row.id}</span>,
  },
  {
    key: "subscriber",
    label: "Assinante",
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {row.subscriber.split(" ").map((n: string) => n[0]).join("")}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{row.subscriber}</p>
          <p className="text-[10px] text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "plan",
    label: "Plano",
    sortable: true,
    render: (row) => (
      <Badge variant={row.plan === "Enterprise" ? "primary" : row.plan === "Profissional" ? "info" : "default"}>
        {row.plan}
      </Badge>
    ),
  },
  {
    key: "method",
    label: "Método",
    render: (row) => {
      const m = methodMap[row.method];
      return (
        <div className="flex items-center gap-1.5">
          {m?.icon}
          <span className="text-xs font-medium text-foreground">{m?.label}</span>
        </div>
      );
    },
  },
  {
    key: "amount",
    label: "Valor",
    sortable: true,
    render: (row) => <span className="text-sm font-bold text-foreground">R$ {row.amount.toFixed(2)}</span>,
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
    key: "activatedAt",
    label: "Ativação",
    sortable: true,
    render: (row) => <span className="text-xs text-muted-foreground">{row.activatedAt}</span>,
  },
  {
    key: "expiresAt",
    label: "Expiração",
    sortable: true,
    render: (row) => <span className="text-xs text-muted-foreground">{row.expiresAt}</span>,
  },
];

const FilterSlot = () => {
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 text-xs bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-lg text-foreground"
      >
        <option value="all">Todos os status</option>
        <option value="CONFIRMED">Confirmado</option>
        <option value="PENDING">Pendente</option>
        <option value="CANCELLED">Cancelado</option>
        <option value="REFUNDED">Estornado</option>
      </select>
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="px-3 py-2 text-xs bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-lg text-foreground"
      >
        <option value="all">Todos os métodos</option>
        <option value="PIX">PIX</option>
        <option value="CARD">Cartão</option>
        <option value="BOLETO">Boleto</option>
      </select>
    </div>
  );
};

export default function VendasPage() {
  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Acompanhe todas as vendas de planos e pagamentos"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <HiOutlineArrowDownTray className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="secondary" size="sm">
              <HiOutlineArrowPath className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.08} />
        ))}
      </div>

      {/* Sales Table */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={salesData}
          pageSize={8}
          searchPlaceholder="Buscar por nome, email, plano..."
          filterSlot={<FilterSlot />}
        />
      </div>
    </div>
  );
}
