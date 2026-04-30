"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlinePlusCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineMagnifyingGlass,
  HiOutlineSquares2X2,
  HiOutlineListBullet,
  HiOutlineSparkles,
  HiOutlinePhoto,
  HiOutlineClipboardDocument,
  HiOutlineArrowPath,
} from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import Modal from "@/components/admin/Modal";
import FormField, { Input, Select, Textarea, Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

interface CanvasData {
  category: string;
  status: "approved" | "pending" | "draft";
  description: string;
  img: string;
  aiModel: string;
}

interface LabelModel {
  id: string;
  code: string;
  name: string;
  category: string;
  status: "approved" | "pending" | "draft";
  createdAt: string;
  updatedAt: string;
  description: string;
  img: string;
  aiModel: string;
}

function toLabel(m: { id: string; name: string; canvasData: unknown; createdAt: string; updatedAt: string }, index: number): LabelModel {
  const data = (m.canvasData ?? {}) as Partial<CanvasData>;
  return {
    id: m.id,
    code: `RTL-${String(index + 1).padStart(3, "0")}`,
    name: m.name,
    category: data.category ?? "Outros",
    status: data.status ?? "draft",
    createdAt: m.createdAt.split("T")[0],
    updatedAt: m.updatedAt.split("T")[0],
    description: data.description ?? "",
    img: data.img ?? "📋",
    aiModel: data.aiModel ?? "—",
  };
}

const statusMap = {
  approved: { label: "Aprovado", variant: "success" as const },
  pending: { label: "Pendente", variant: "warning" as const },
  draft: { label: "Rascunho", variant: "default" as const },
};

const categories = ["Todos", "Bebidas", "Alimentos", "Suplementos", "Cosméticos", "Higiene Pessoal", "Limpeza", "Outros"];

const categoryEmoji: Record<string, string> = {
  Bebidas: "🍊",
  Alimentos: "🥗",
  Suplementos: "💪",
  Cosméticos: "🧴",
  "Higiene Pessoal": "🫧",
  Limpeza: "🧹",
};

export default function ModelosSalvosPage() {
  const router = useRouter();
  const [models, setModels] = useState<LabelModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [selected, setSelected] = useState<LabelModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LabelModel | null>(null);
  const [form, setForm] = useState<Partial<LabelModel>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/models");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setModels(data.map((m: Parameters<typeof toLabel>[0], i: number) => toLabel(m, i)));
    } catch {
      // silently fail, keep empty list
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const filtered = models.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "Todos" || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", category: "Bebidas", description: "", status: "draft" });
    setModalOpen(true);
  };

  const openEdit = (model: LabelModel) => {
    setEditing(model);
    setForm({ ...model });
    setModalOpen(true);
  };

  const openInStudio = (model: LabelModel) => {
    router.push(`/dashboard/estudio-ia?id=${model.id}`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const category = form.category ?? "Bebidas";
      const canvasData: CanvasData = {
        category,
        status: form.status ?? "draft",
        description: form.description ?? "",
        img: categoryEmoji[category] ?? "📋",
        aiModel: editing?.aiModel ?? "—",
      };

      if (editing) {
        await fetch(`/api/models/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, canvasData }),
        });
      } else {
        await fetch("/api/models", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, canvasData }),
        });
      }

      await fetchModels();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/models/${id}`, { method: "DELETE" });
    setModels((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      <PageHeader
        title="Modelos Salvos"
        subtitle={loading ? "Carregando..." : `${models.length} rótulo${models.length !== 1 ? "s" : ""} na sua galeria`}
        actions={
          <Button variant="primary" size="sm" onClick={openCreate}>
            <HiOutlinePlusCircle className="w-4 h-4" />
            Novo Modelo
          </Button>
        }
      />

      {/* Toolbar */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="relative flex-1 w-full sm:max-w-sm">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#12121a] border border-border/50 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-[#12121a] border border-border/50 dark:border-white/10 rounded-xl p-1 overflow-x-auto max-w-[340px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap",
                  categoryFilter === cat
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-white dark:bg-[#12121a] border border-border/50 dark:border-white/10 rounded-xl p-1">
            <button onClick={() => setView("grid")} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", view === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/50")}>
              <HiOutlineSquares2X2 className="w-4 h-4" />
            </button>
            <button onClick={() => setView("list")} className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", view === "list" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/50")}>
              <HiOutlineListBullet className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={fetchModels}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#12121a] border border-border/50 dark:border-white/10 text-muted-foreground hover:text-foreground transition-all"
            title="Recarregar"
          >
            <HiOutlineArrowPath className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>
      </motion.div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 overflow-hidden animate-pulse">
              <div className="h-40 bg-muted/40 dark:bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 bg-muted/60 dark:bg-white/8 rounded" />
                <div className="h-4 w-3/4 bg-muted/60 dark:bg-white/8 rounded" />
                <div className="h-3 w-full bg-muted/40 dark:bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid View */}
      {!loading && view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((model, i) => {
              const st = statusMap[model.status];
              return (
                <motion.div
                  key={model.id}
                  className="group bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm overflow-hidden hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  layout
                >
                  <div className="h-40 bg-gradient-to-br from-muted/50 to-muted/30 dark:from-white/[0.03] dark:to-white/[0.01] flex items-center justify-center relative">
                    <span className="text-5xl">{model.img}</span>
                    <div className="absolute top-3 left-3">
                      <Badge variant={st.variant} dot>{st.label}</Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setSelected(model)} className="w-7 h-7 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black/60 transition-all shadow-sm">
                        <HiOutlineEye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(model)} className="w-7 h-7 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black/60 transition-all shadow-sm">
                        <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(model.id)} className="w-7 h-7 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all shadow-sm">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{model.code}</span>
                      <span className="text-[10px] text-muted-foreground">{model.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground truncate">{model.name}</h3>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{model.description || "Sem descrição"}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <HiOutlineSparkles className="w-3 h-3" />
                        {model.aiModel}
                      </div>
                      <button
                        onClick={() => openInStudio(model)}
                        className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                      >
                        Abrir no Estúdio →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {!loading && view === "list" && (
        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((model, i) => {
              const st = statusMap[model.status];
              return (
                <motion.div
                  key={model.id}
                  className="group flex items-center gap-4 p-4 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm hover:shadow-md transition-all"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  layout
                >
                  <div className="w-14 h-14 rounded-xl bg-muted/50 dark:bg-white/5 flex items-center justify-center text-2xl shrink-0">
                    {model.img}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{model.code}</span>
                      <Badge variant={st.variant} dot>{st.label}</Badge>
                    </div>
                    <h3 className="text-sm font-bold text-foreground truncate">{model.name}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{model.category} · {model.aiModel} · {model.updatedAt}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setSelected(model)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 hover:text-foreground transition-all">
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(model)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(model.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <HiOutlinePhoto className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            {models.length === 0 ? "Nenhum rótulo criado ainda" : "Nenhum modelo encontrado"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {models.length === 0 ? "Clique em \"Novo Modelo\" ou crie um no Estúdio IA" : "Tente ajustar os filtros"}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ""} subtitle={selected?.code} size="md">
        {selected && (
          <div className="space-y-5">
            <div className="h-48 bg-gradient-to-br from-muted/50 to-muted/30 dark:from-white/[0.03] dark:to-white/[0.01] rounded-xl flex items-center justify-center">
              <span className="text-7xl">{selected.img}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusMap[selected.status].variant} dot>{statusMap[selected.status].label}</Badge>
              <Badge variant="info">{selected.category}</Badge>
              <Badge variant="default">{selected.aiModel}</Badge>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{selected.description || "Sem descrição"}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Código</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-bold text-foreground font-mono">{selected.code}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(selected.code)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <HiOutlineClipboardDocument className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Criado em</p>
                <p className="text-sm font-bold text-foreground mt-1">{selected.createdAt}</p>
              </div>
              <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Atualizado</p>
                <p className="text-sm font-bold text-foreground mt-1">{selected.updatedAt}</p>
              </div>
              <div className="bg-muted/30 dark:bg-white/[0.03] rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Modelo IA</p>
                <p className="text-sm font-bold text-foreground mt-1">{selected.aiModel}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Modelo" : "Novo Modelo"}
        subtitle={editing ? `Editando ${editing.code}` : "Preencha as informações do rótulo"}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : editing ? "Salvar" : "Criar"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Nome do Rótulo" required>
            <Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Suco de Laranja Natural" />
          </FormField>
          <FormField label="Categoria" required>
            <Select value={form.category || "Bebidas"} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="Bebidas">Bebidas</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Suplementos">Suplementos</option>
              <option value="Cosméticos">Cosméticos</option>
              <option value="Higiene Pessoal">Higiene Pessoal</option>
              <option value="Limpeza">Limpeza</option>
              <option value="Outros">Outros</option>
            </Select>
          </FormField>
          <FormField label="Descrição">
            <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva o produto e o rótulo..." rows={3} />
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
            <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <HiOutlineTrash className="w-4 h-4" />Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este modelo? O rótulo será removido permanentemente.</p>
      </Modal>
    </div>
  );
}
