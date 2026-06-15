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
  HiOutlineFolder,
  HiOutlineFolderPlus,
  HiOutlineFolderArrowDown,
  HiOutlineSquaresPlus,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { toast } from "sonner";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import Modal from "@/components/admin/Modal";
import FormField, { Input, Select, Textarea, Button } from "@/components/admin/FormField";
import { cn } from "@/lib/utils";

interface FolderT { id: string; name: string; color: string; parentId: string | null; count: number }
const FOLDER_COLORS = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"];

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
  folderId: string | null;
  ownerName?: string;
}

function toLabel(m: { id: string; name: string; canvasData: unknown; createdAt: string; updatedAt: string; folderId?: string | null; ownerName?: string }, index: number): LabelModel {
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
    folderId: m.folderId ?? null,
    ownerName: m.ownerName,
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

  // Pastas
  const [folders, setFolders] = useState<FolderT[]>([]);
  const [folderFilter, setFolderFilter] = useState<"all" | "none" | string>("all");
  const [folderSearch, setFolderSearch] = useState("");
  const [folderModal, setFolderModal] = useState<null | { editing?: FolderT; parentId?: string | null }>(null);
  const [folderForm, setFolderForm] = useState<{ name: string; color: string }>({ name: "", color: FOLDER_COLORS[0] });
  const [folderDelete, setFolderDelete] = useState<FolderT | null>(null);
  const [movingModel, setMovingModel] = useState<LabelModel | null>(null);
  const [savingFolder, setSavingFolder] = useState(false);

  // Compartilhados comigo (equipe)
  const [sharedModels, setSharedModels] = useState<LabelModel[]>([]);
  const isShared = folderFilter === "shared";

  useEffect(() => {
    fetch("/api/team/shared-models")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Parameters<typeof toLabel>[0][]) => setSharedModels(d.map((m, i) => toLabel(m, i))))
      .catch(() => {});
  }, []);

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

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      if (res.ok) setFolders(await res.json());
    } catch { /* keep current */ }
  }, []);

  useEffect(() => { fetchModels(); fetchFolders(); }, [fetchModels, fetchFolders]);

  const filtered = models.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "Todos" || m.category === categoryFilter;
    const matchFolder = folderFilter === "all" ? true : folderFilter === "none" ? !m.folderId : m.folderId === folderFilter;
    return matchSearch && matchCategory && matchFolder;
  });

  const noFolderCount = models.filter((m) => !m.folderId).length;
  const topFolders = folders.filter((f) => !f.parentId && f.name.toLowerCase().includes(folderSearch.toLowerCase()));
  const subFoldersOf = (id: string) => folders.filter((f) => f.parentId === id);

  const filteredShared = sharedModels.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  const display = isShared ? filteredShared : filtered;

  const saveFolder = async () => {
    if (!folderForm.name.trim()) { toast.error("Dê um nome à pasta"); return; }
    setSavingFolder(true);
    try {
      if (folderModal?.editing) {
        const res = await fetch(`/api/folders/${folderModal.editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: folderForm.name, color: folderForm.color }),
        });
        if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao salvar"); return; }
      } else {
        const res = await fetch("/api/folders", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: folderForm.name, color: folderForm.color, parentId: folderModal?.parentId ?? null }),
        });
        if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao criar pasta"); return; }
      }
      setFolderModal(null);
      await fetchFolders();
    } finally {
      setSavingFolder(false);
    }
  };

  const deleteFolder = async (f: FolderT) => {
    await fetch(`/api/folders/${f.id}`, { method: "DELETE" });
    if (folderFilter === f.id) setFolderFilter("all");
    setFolderDelete(null);
    await Promise.all([fetchFolders(), fetchModels()]);
  };

  const moveModel = async (folderId: string | null) => {
    if (!movingModel) return;
    await fetch(`/api/models/${movingModel.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId: folderId ?? null }),
    });
    setMovingModel(null);
    await Promise.all([fetchModels(), fetchFolders()]);
    toast.success("Rótulo movido");
  };

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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de pastas */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm p-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Pastas</h3>
              <button onClick={() => { setFolderForm({ name: "", color: FOLDER_COLORS[0] }); setFolderModal({}); }} title="Nova pasta" className="w-7 h-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                <HiOutlineFolderPlus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative mb-2">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={folderSearch} onChange={(e) => setFolderSearch(e.target.value)} placeholder="Buscar pasta..." className="w-full pl-8 pr-2 py-1.5 text-xs bg-muted/40 dark:bg-white/5 border border-border/40 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground" />
            </div>
            <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
              <button onClick={() => setFolderFilter("all")} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors", folderFilter === "all" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/5")}>
                <HiOutlineSquaresPlus className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">Todos os rótulos</span>
                <span className="text-[10px] opacity-70">{models.length}</span>
              </button>
              <button onClick={() => setFolderFilter("none")} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors", folderFilter === "none" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/5")}>
                <HiOutlineFolder className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left truncate">Sem pasta</span>
                <span className="text-[10px] opacity-70">{noFolderCount}</span>
              </button>
              {sharedModels.length > 0 && (
                <button onClick={() => setFolderFilter("shared")} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors", folderFilter === "shared" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/5")}>
                  <HiOutlineUserGroup className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left truncate">Compartilhados comigo</span>
                  <span className="text-[10px] opacity-70">{sharedModels.length}</span>
                </button>
              )}

              {topFolders.map((f) => (
                <div key={f.id}>
                  <div className={cn("group flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors", folderFilter === f.id ? "bg-primary/10" : "hover:bg-muted/50 dark:hover:bg-white/5")}>
                    <button onClick={() => setFolderFilter(f.id)} className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: f.color }} />
                      <span className={cn("text-xs font-medium truncate", folderFilter === f.id ? "text-primary" : "text-foreground")}>{f.name}</span>
                    </button>
                    <span className="text-[10px] text-muted-foreground group-hover:hidden">{f.count}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button title="Nova subpasta" onClick={() => { setFolderForm({ name: "", color: f.color }); setFolderModal({ parentId: f.id }); }} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary"><HiOutlineFolderPlus className="w-3.5 h-3.5" /></button>
                      <button title="Renomear" onClick={() => { setFolderForm({ name: f.name, color: f.color }); setFolderModal({ editing: f }); }} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary"><HiOutlinePencilSquare className="w-3.5 h-3.5" /></button>
                      <button title="Excluir" onClick={() => setFolderDelete(f)} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-500"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {subFoldersOf(f.id).map((sf) => (
                    <div key={sf.id} className={cn("group flex items-center gap-1.5 pl-7 pr-2 py-1.5 rounded-lg transition-colors", folderFilter === sf.id ? "bg-primary/10" : "hover:bg-muted/50 dark:hover:bg-white/5")}>
                      <button onClick={() => setFolderFilter(sf.id)} className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sf.color }} />
                        <span className={cn("text-xs truncate", folderFilter === sf.id ? "text-primary font-medium" : "text-muted-foreground")}>{sf.name}</span>
                      </button>
                      <span className="text-[10px] text-muted-foreground group-hover:hidden">{sf.count}</span>
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <button title="Renomear" onClick={() => { setFolderForm({ name: sf.name, color: sf.color }); setFolderModal({ editing: sf }); }} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary"><HiOutlinePencilSquare className="w-3.5 h-3.5" /></button>
                        <button title="Excluir" onClick={() => setFolderDelete(sf)} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-500"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {folders.length === 0 && <p className="text-[11px] text-muted-foreground px-2 py-3 text-center">Crie pastas para organizar seus rótulos.</p>}
            </div>
          </div>
        </aside>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
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
            {display.map((model, i) => {
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
                      {!isShared && <>
                      <button onClick={() => openEdit(model)} className="w-7 h-7 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black/60 transition-all shadow-sm">
                        <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setMovingModel(model)} title="Mover para pasta" className="w-7 h-7 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white dark:hover:bg-black/60 transition-all shadow-sm">
                        <HiOutlineFolderArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(model.id)} className="w-7 h-7 rounded-lg bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-all shadow-sm">
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                      </button>
                      </>}
                    </div>
                  </div>
                  <div className="p-4">
                    {model.ownerName && <p className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold mb-1 flex items-center gap-1"><HiOutlineUserGroup className="w-3 h-3" /> {model.ownerName}</p>}
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
            {display.map((model, i) => {
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
                    <h3 className="text-sm font-bold text-foreground truncate">{model.name}{model.ownerName ? <span className="ml-2 text-[10px] font-medium text-violet-600 dark:text-violet-400">· {model.ownerName}</span> : null}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{model.category} · {model.aiModel} · {model.updatedAt}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openInStudio(model)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all" title="Abrir no Estúdio">
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
                    {!isShared && <>
                    <button onClick={() => openEdit(model)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                      <HiOutlinePencilSquare className="w-4 h-4" />
                    </button>
                    <button onClick={() => setMovingModel(model)} title="Mover para pasta" className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                      <HiOutlineFolderArrowDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirm(model.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                    </>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && display.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <HiOutlinePhoto className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            {isShared ? "Nenhum rótulo compartilhado" : models.length === 0 ? "Nenhum rótulo criado ainda" : "Nenhum modelo encontrado"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {isShared ? "Quando alguém te adicionar à equipe, os rótulos aparecem aqui" : models.length === 0 ? "Clique em \"Novo Modelo\" ou crie um no Estúdio IA" : "Tente ajustar os filtros"}
          </p>
        </div>
      )}

        </div>
      </div>

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

      {/* Folder Create/Edit Modal */}
      <Modal
        isOpen={!!folderModal}
        onClose={() => setFolderModal(null)}
        title={folderModal?.editing ? "Renomear pasta" : folderModal?.parentId ? "Nova subpasta" : "Nova pasta"}
        subtitle={folderModal?.parentId && !folderModal?.editing ? "Subpastas são um recurso do plano Profissional" : undefined}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFolderModal(null)}>Cancelar</Button>
            <Button variant="primary" onClick={saveFolder} disabled={savingFolder}>
              {savingFolder ? "Salvando..." : folderModal?.editing ? "Salvar" : "Criar"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Nome da pasta" required>
            <Input value={folderForm.name} onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })} placeholder="Ex: Cosméticos 2026" autoFocus />
          </FormField>
          <FormField label="Cor">
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((c) => (
                <button key={c} onClick={() => setFolderForm({ ...folderForm, color: c })} className={cn("w-8 h-8 rounded-lg transition-transform", folderForm.color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/40 scale-110" : "hover:scale-105")} style={{ background: c }} aria-label={c} />
              ))}
            </div>
          </FormField>
        </div>
      </Modal>

      {/* Folder Delete Confirm */}
      <Modal
        isOpen={!!folderDelete}
        onClose={() => setFolderDelete(null)}
        title="Excluir pasta"
        subtitle="Os rótulos não são apagados"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFolderDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={() => folderDelete && deleteFolder(folderDelete)}>
              <HiOutlineTrash className="w-4 h-4" />Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          Excluir a pasta <b className="text-foreground">{folderDelete?.name}</b>? Os rótulos dentro dela voltam para &quot;Sem pasta&quot;{folderDelete && subFoldersOf(folderDelete.id).length > 0 ? " e as subpastas também serão removidas" : ""}.
        </p>
      </Modal>

      {/* Move to Folder Modal */}
      <Modal
        isOpen={!!movingModel}
        onClose={() => setMovingModel(null)}
        title="Mover para pasta"
        subtitle={movingModel?.name}
        size="sm"
      >
        <div className="space-y-1 max-h-[50vh] overflow-y-auto">
          <button onClick={() => moveModel(null)} className={cn("w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors", !movingModel?.folderId ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50 dark:hover:bg-white/5 text-foreground")}>
            <HiOutlineFolder className="w-4 h-4" /> Sem pasta
          </button>
          {folders.map((f) => (
            <button key={f.id} onClick={() => moveModel(f.id)} className={cn("w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors", movingModel?.folderId === f.id ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/50 dark:hover:bg-white/5 text-foreground")}>
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: f.color }} />
              <span className={cn("truncate", f.parentId && "text-muted-foreground")}>{f.parentId ? "↳ " : ""}{f.name}</span>
            </button>
          ))}
          {folders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma pasta criada ainda.</p>}
        </div>
      </Modal>
    </div>
  );
}
