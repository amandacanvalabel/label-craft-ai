"use client";

import { useState, useEffect } from "react";
import {
  HiOutlineBanknotes,
  HiOutlineCreditCard,
  HiOutlineArrowPath,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineReceiptPercent,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import StatCard from "@/components/admin/StatCard";
import DataTable, { Column } from "@/components/admin/DataTable";
import Badge from "@/components/admin/Badge";
import { Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

interface Sale {
  id: string;
  subscriberName: string;
  subscriberEmail: string;
  planName: string;
  method: string;
  amount: number;
  status: string;
  invoiceUrl: string | null;
  createdAt: string;
  expiresAt: string | null;
  [key: string]: unknown;
}

interface DashData {
  stats: {
    receitaMensal: number;
    confirmedTotal: number;
    pendingTotal: number;
    ticketMedio: number;
  };
  sales: Sale[];
}

const STATUS_MAP: Record<string, { label: string; variant: "success" | "warning" | "error" | "info" }> = {
  CONFIRMED: { label: "Confirmado", variant: "success" },
  PENDING:   { label: "Pendente",   variant: "warning" },
  CANCELLED: { label: "Cancelado",  variant: "error" },
  REFUNDED:  { label: "Estornado",  variant: "info" },
};

const METHOD_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
  PIX:    { label: "PIX",    icon: <span className="text-emerald-500 font-bold text-[10px]">PIX</span> },
  CARD:   { label: "Cartão", icon: <HiOutlineCreditCard className="w-3.5 h-3.5 text-blue-500" /> },
  BOLETO: { label: "Boleto", icon: <span className="text-amber-500 font-bold text-[10px]">BOL</span> },
};

function fmtCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-xl bg-muted/50 dark:bg-white/5 animate-pulse", className)} />
);

export default function VendasPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/sales")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const s = data?.stats;

  const statCards = [
    {
      label: "Receita Total (Mês)",
      value: loading ? "…" : fmtCurrency(s?.receitaMensal ?? 0),
      icon: HiOutlineBanknotes,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/15",
      sparkline: [60, 68, 72, 78, 85, 80, 88, 92, 95, 90, 98, s?.receitaMensal ?? 0],
    },
    {
      label: "Vendas Confirmadas",
      value: loading ? "…" : String(s?.confirmedTotal ?? 0),
      icon: HiOutlineCheckCircle,
      iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-500/15",
      sparkline: [20, 22, 25, 28, 30, 35, 32, 38, 40, 42, 45, s?.confirmedTotal ?? 0],
    },
    {
      label: "Vendas Pendentes",
      value: loading ? "…" : String(s?.pendingTotal ?? 0),
      icon: HiOutlineClock,
      iconColor: "text-amber-500 bg-amber-50 dark:bg-amber-500/15",
      sparkline: [15, 12, 18, 14, 10, 16, 12, 8, 14, 10, 6, s?.pendingTotal ?? 0],
    },
    {
      label: "Ticket Médio",
      value: loading ? "…" : fmtCurrency(s?.ticketMedio ?? 0),
      icon: HiOutlineReceiptPercent,
      iconColor: "text-violet-500 bg-violet-50 dark:bg-violet-500/15",
      sparkline: [250, 260, 255, 270, 280, 275, 285, 290, 280, 295, 288, s?.ticketMedio ?? 0],
    },
  ];

  const filteredSales = (data?.sales ?? []).filter((sale) => {
    if (filterStatus !== "all" && sale.status !== filterStatus) return false;
    if (filterMethod !== "all" && sale.method !== filterMethod) return false;
    return true;
  });

  const columns: Column<Sale>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (row) => (
        <span className="text-[10px] font-mono font-bold text-primary truncate max-w-[100px] block" title={row.id}>
          {row.id.slice(0, 8)}…
        </span>
      ),
    },
    {
      key: "subscriberName",
      label: "Assinante",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {row.subscriberName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{row.subscriberName}</p>
            <p className="text-[10px] text-muted-foreground">{row.subscriberEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: "planName",
      label: "Plano",
      sortable: true,
      render: (row) => <Badge variant="info">{row.planName}</Badge>,
    },
    {
      key: "method",
      label: "Método",
      render: (row) => {
        const m = METHOD_MAP[row.method];
        return (
          <div className="flex items-center gap-1.5">
            {m?.icon}
            <span className="text-xs font-medium text-foreground">{m?.label ?? row.method}</span>
          </div>
        );
      },
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (row) => <span className="text-sm font-bold text-foreground">{fmtCurrency(row.amount)}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row) => {
        const st = STATUS_MAP[row.status];
        return <Badge variant={st?.variant} dot>{st?.label ?? row.status}</Badge>;
      },
    },
    {
      key: "createdAt",
      label: "Data",
      sortable: true,
      render: (row) => <span className="text-xs text-muted-foreground">{fmtDate(row.createdAt)}</span>,
    },
    {
      key: "expiresAt",
      label: "Expiração",
      sortable: true,
      render: (row) => <span className="text-xs text-muted-foreground">{fmtDate(row.expiresAt)}</span>,
    },
    {
      key: "invoiceUrl",
      label: "Fatura",
      render: (row) => row.invoiceUrl ? (
        <a
          href={row.invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
        >
          Ver <HiOutlineArrowTopRightOnSquare className="w-3 h-3" />
        </a>
      ) : <span className="text-[10px] text-muted-foreground">—</span>,
      className: "w-20",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Vendas"
        subtitle="Acompanhe todas as vendas de planos e pagamentos"
        actions={
          <Button variant="secondary" size="sm" onClick={load}>
            <HiOutlineArrowPath className={cn("w-4 h-4", loading && "animate-spin")} />
            Atualizar
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.08} />
        ))}
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
            data={filteredSales}
            pageSize={10}
            searchPlaceholder="Buscar por nome, email, plano..."
            filterSlot={
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-xs bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-lg text-foreground"
                >
                  <option value="all">Todos os status</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="PENDING">Pendente</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="REFUNDED">Estornado</option>
                </select>
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="px-3 py-2 text-xs bg-white dark:bg-white/5 border border-border/50 dark:border-white/10 rounded-lg text-foreground"
                >
                  <option value="all">Todos os métodos</option>
                  <option value="PIX">PIX</option>
                  <option value="CARD">Cartão</option>
                  <option value="BOLETO">Boleto</option>
                </select>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
