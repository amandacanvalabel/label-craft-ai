"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineMegaphone } from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import Modal from "@/components/admin/Modal";
import FormField, { Input, Select, Textarea, Toggle, Button } from "@/components/admin/FormField";

interface Announcement {
  id: string;
  title: string;
  message: string;
  variant: "INFO" | "SUCCESS" | "WARNING" | "PROMO";
  linkUrl: string | null;
  linkLabel: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

const variantLabel: Record<Announcement["variant"], { label: string; variant: "info" | "success" | "warning" | "primary" }> = {
  INFO: { label: "Informação", variant: "info" },
  SUCCESS: { label: "Sucesso", variant: "success" },
  WARNING: { label: "Atenção", variant: "warning" },
  PROMO: { label: "Promoção", variant: "primary" },
};

type FormState = {
  title: string; message: string; variant: Announcement["variant"];
  linkUrl: string; linkLabel: string; isActive: boolean; startsAt: string; endsAt: string;
};
const emptyForm: FormState = { title: "", message: "", variant: "INFO", linkUrl: "", linkLabel: "", isActive: true, startsAt: "", endsAt: "" };

export default function AdminAvisosPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/announcements");
      if (r.ok) setItems(await r.json());
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({
      title: a.title, message: a.message, variant: a.variant,
      linkUrl: a.linkUrl ?? "", linkLabel: a.linkLabel ?? "", isActive: a.isActive,
      startsAt: a.startsAt ? a.startsAt.slice(0, 10) : "", endsAt: a.endsAt ? a.endsAt.slice(0, 10) : "",
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error("Título e mensagem são obrigatórios"); return; }
    setSaving(true);
    try {
      const body = {
        title: form.title, message: form.message, variant: form.variant,
        linkUrl: form.linkUrl || null, linkLabel: form.linkLabel || null, isActive: form.isActive,
        startsAt: form.startsAt || null, endsAt: form.endsAt || null,
      };
      const res = editing
        ? await fetch(`/api/admin/announcements/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        : await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { toast.error((await res.json()).error ?? "Erro ao salvar"); return; }
      toast.success(editing ? "Aviso atualizado" : "Aviso criado");
      setModalOpen(false);
      await load();
    } finally { setSaving(false); }
  };

  const toggleActive = async (a: Announcement) => {
    await fetch(`/api/admin/announcements/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !a.isActive }) });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    setDeleteId(null);
    await load();
  };

  return (
    <div>
      <PageHeader
        title="Avisos"
        subtitle={loading ? "Carregando..." : `${items.length} aviso${items.length !== 1 ? "s" : ""} cadastrado${items.length !== 1 ? "s" : ""}`}
        actions={<Button variant="primary" size="sm" onClick={openCreate}><HiOutlinePlusCircle className="w-4 h-4" />Novo Aviso</Button>}
      />

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <HiOutlineMegaphone className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">Nenhum aviso ainda</p>
          <p className="text-[11px] text-muted-foreground mt-1">Crie um aviso para aparecer no topo do painel dos assinantes.</p>
        </div>
      )}

      <div className="space-y-2.5">
        {items.map((a, i) => (
          <motion.div
            key={a.id}
            className="flex items-center gap-4 p-4 bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 shadow-sm"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant={variantLabel[a.variant].variant}>{variantLabel[a.variant].label}</Badge>
                <Badge variant={a.isActive ? "success" : "default"} dot>{a.isActive ? "Ativo" : "Inativo"}</Badge>
              </div>
              <h3 className="text-sm font-bold text-foreground truncate">{a.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{a.message}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Toggle checked={a.isActive} onChange={() => toggleActive(a)} />
              <button onClick={() => openEdit(a)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"><HiOutlinePencilSquare className="w-4 h-4" /></button>
              <button onClick={() => setDeleteId(a.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all"><HiOutlineTrash className="w-4 h-4" /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar Aviso" : "Novo Aviso"}
        subtitle="Aparece no topo do painel dos assinantes"
        size="md"
        footer={<>
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button variant="primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar" : "Criar"}</Button>
        </>}
      >
        <div className="space-y-4">
          <FormField label="Título" required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Nova função disponível!" />
          </FormField>
          <FormField label="Mensagem" required>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Descreva o aviso ou a promoção..." />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tipo">
              <Select value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value as Announcement["variant"] })}>
                <option value="INFO">Informação</option>
                <option value="SUCCESS">Sucesso</option>
                <option value="WARNING">Atenção</option>
                <option value="PROMO">Promoção</option>
              </Select>
            </FormField>
            <FormField label="Status">
              <div className="flex items-center gap-2 h-[42px]">
                <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label={form.isActive ? "Ativo" : "Inativo"} />
              </div>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Link (opcional)">
              <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." />
            </FormField>
            <FormField label="Texto do link">
              <Input value={form.linkLabel} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} placeholder="Saiba mais" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Início (opcional)">
              <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </FormField>
            <FormField label="Fim (opcional)">
              <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </FormField>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir aviso"
        subtitle="Esta ação não pode ser desfeita"
        size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => deleteId && remove(deleteId)}><HiOutlineTrash className="w-4 h-4" />Excluir</Button>
        </>}
      >
        <p className="text-sm text-muted-foreground">Tem certeza que deseja excluir este aviso?</p>
      </Modal>
    </div>
  );
}
