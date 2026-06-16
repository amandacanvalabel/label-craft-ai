"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlineArrowLeft, HiOutlinePaperClip,
  HiOutlinePaperAirplane, HiOutlinePlus, HiOutlineUser, HiOutlineSparkles, HiOutlineLifebuoy,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface TicketItem { id: string; subject: string; status: "AI" | "HUMAN" | "RESOLVED"; lastMessageAt: string; unread: number }
interface Message { id: string; role: "USER" | "ASSISTANT" | "AGENT"; content: string; attachmentUrl?: string | null; attachmentName?: string | null; createdAt: string }

const statusLabel: Record<TicketItem["status"], string> = { AI: "Assistente IA", HUMAN: "Com atendente", RESOLVED: "Resolvido" };

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "new" | "chat">("list");
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<TicketItem["status"]>("AI");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    try {
      const r = await fetch("/api/support/tickets");
      if (r.ok) { const d = await r.json(); setTickets(d.tickets); setUnread(d.unread); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadTickets(); const t = setInterval(loadTickets, 45000); return () => clearInterval(t); }, [loadTickets]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, view]);

  const openTicket = async (id: string) => {
    setActiveId(id); setView("chat");
    try {
      const r = await fetch(`/api/support/tickets/${id}`);
      if (r.ok) { const d = await r.json(); setMessages(d.messages); setActiveStatus(d.status); }
      loadTickets();
    } catch { /* ignore */ }
  };

  const startNew = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const r = await fetch("/api/support/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, message: input }) });
      const d = await r.json();
      if (r.ok) { setInput(""); setSubject(""); await loadTickets(); await openTicket(d.id); }
    } finally { setSending(false); }
  };

  const send = async (attachmentUrl?: string, attachmentName?: string) => {
    if (!activeId || (!input.trim() && !attachmentUrl)) return;
    const text = input;
    setInput(""); setSending(true);
    // otimista
    setMessages((m) => [...m, { id: "tmp" + Date.now(), role: "USER", content: text || "(anexo)", attachmentUrl, attachmentName, createdAt: new Date().toISOString() }]);
    try {
      await fetch(`/api/support/tickets/${activeId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: text, attachmentUrl, attachmentName }) });
      await openTicket(activeId);
    } finally { setSending(false); }
  };

  const escalate = async () => {
    if (!activeId) return;
    await fetch(`/api/support/tickets/${activeId}/escalate`, { method: "POST" });
    await openTicket(activeId);
  };
  const reopen = async () => {
    if (!activeId) return;
    await fetch(`/api/support/tickets/${activeId}/reopen`, { method: "POST" });
    await openTicket(activeId);
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch("/api/support/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (r.ok) await send(d.url, d.name);
    } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => { setOpen((o) => !o); if (!open) { setView("list"); loadTickets(); } }}
        className="fixed bottom-5 right-5 z-[120] w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Suporte"
      >
        {open ? <HiOutlineXMark className="w-6 h-6" /> : <HiOutlineChatBubbleLeftRight className="w-6 h-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-5 z-[120] w-[min(380px,calc(100vw-2.5rem))] h-[min(560px,calc(100vh-8rem))] bg-white dark:bg-[#12121a] rounded-2xl border border-border/50 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white">
              {view === "chat" || view === "new" ? (
                <button onClick={() => setView("list")} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/15"><HiOutlineArrowLeft className="w-4 h-4" /></button>
              ) : <HiOutlineLifebuoy className="w-5 h-5" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight">Suporte CanvaLabel</p>
                <p className="text-[11px] text-white/80 leading-tight">{view === "chat" ? statusLabel[activeStatus] : "Estamos aqui para ajudar"}</p>
              </div>
            </div>

            {/* Body */}
            {view === "list" && (
              <div className="flex-1 overflow-y-auto p-3">
                <button onClick={() => { setView("new"); setInput(""); setSubject(""); }} className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-xl bg-primary text-white text-sm font-semibold">
                  <HiOutlinePlus className="w-4 h-4" /> Nova conversa
                </button>
                {tickets.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">Nenhuma conversa ainda.<br />Comece uma nova acima.</p>}
                <div className="space-y-1.5">
                  {tickets.map((t) => (
                    <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left p-3 rounded-xl border border-border/40 dark:border-white/8 hover:border-primary/40 transition-colors">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate flex-1">{t.subject}</p>
                        {t.unread > 0 && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{statusLabel[t.status]}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view === "new" && (
              <div className="flex-1 flex flex-col p-3">
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Assunto (opcional)" className="mb-2 px-3 py-2 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground" />
                <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Descreva sua dúvida..." rows={5} className="flex-1 px-3 py-2 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground resize-none" autoFocus />
                <button onClick={startNew} disabled={sending || !input.trim()} className="mt-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50">
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            )}

            {view === "chat" && (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {messages.map((m) => {
                    const mine = m.role === "USER";
                    return (
                      <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                        <div className={cn("max-w-[80%] rounded-2xl px-3 py-2", mine ? "bg-primary text-white rounded-br-sm" : "bg-muted/70 dark:bg-white/8 text-foreground rounded-bl-sm")}>
                          {!mine && (
                            <p className="text-[10px] font-bold mb-0.5 flex items-center gap-1 opacity-70">
                              {m.role === "AGENT" ? <><HiOutlineUser className="w-3 h-3" /> Atendente</> : <><HiOutlineSparkles className="w-3 h-3" /> Assistente IA</>}
                            </p>
                          )}
                          {m.content && <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>}
                          {m.attachmentUrl && (
                            /\.(png|jpe?g|webp|gif)$/i.test(m.attachmentUrl)
                              ? // eslint-disable-next-line @next/next/no-img-element
                                <img src={m.attachmentUrl} alt={m.attachmentName ?? "anexo"} className="mt-1 rounded-lg max-h-40" />
                              : <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs underline mt-1 inline-block">{m.attachmentName ?? "Anexo"}</a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Ações de status */}
                <div className="px-3 pb-1 flex flex-wrap gap-1.5">
                  {activeStatus === "AI" && <button onClick={escalate} className="text-[11px] font-semibold text-primary px-2.5 py-1 rounded-lg bg-primary/10">Falar com atendente</button>}
                  {activeStatus === "RESOLVED" && <button onClick={reopen} className="text-[11px] font-semibold text-primary px-2.5 py-1 rounded-lg bg-primary/10">Reabrir conversa</button>}
                  {activeStatus === "HUMAN" && <span className="text-[11px] text-muted-foreground px-1 py-1">Um atendente vai responder por aqui.</span>}
                </div>

                {/* Input */}
                <div className="flex items-end gap-1.5 p-2.5 border-t border-border/40 dark:border-white/8">
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onPickFile} className="hidden" />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading} title="Anexar" className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 shrink-0">
                    <HiOutlinePaperClip className="w-5 h-5" />
                  </button>
                  <textarea
                    value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={uploading ? "Enviando anexo..." : "Escreva uma mensagem..."} rows={1}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground resize-none max-h-24"
                  />
                  <button onClick={() => send()} disabled={sending || !input.trim()} className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40 shrink-0">
                    <HiOutlinePaperAirplane className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
