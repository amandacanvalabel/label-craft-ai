"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { HiOutlineLifebuoy, HiOutlinePaperAirplane, HiOutlineCheckCircle, HiOutlineUser, HiOutlineSparkles, HiOutlineArrowPath } from "react-icons/hi2";
import PageHeader from "@/components/admin/PageHeader";
import { cn } from "@/lib/utils";

interface TicketItem {
  id: string; subject: string; status: "AI" | "HUMAN" | "RESOLVED";
  subscriberName: string; subscriberEmail: string; lastMessage: string; lastMessageAt: string; waitingReply: boolean;
}
interface Message { id: string; role: "USER" | "ASSISTANT" | "AGENT"; content: string; attachmentUrl?: string | null; attachmentName?: string | null; createdAt: string }
interface Conversation { id: string; subject: string; status: TicketItem["status"]; subscriberName: string; subscriberEmail: string; messages: Message[] }

const statusInfo: Record<TicketItem["status"], { label: string; cls: string }> = {
  AI: { label: "Assistente IA", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  HUMAN: { label: "Aguardando atendente", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  RESOLVED: { label: "Resolvido", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

export default function AdminSuportePage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [filter, setFilter] = useState<"ALL" | "HUMAN" | "RESOLVED">("ALL");
  const [active, setActive] = useState<Conversation | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/support/tickets");
    if (r.ok) setTickets(await r.json());
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [active?.messages]);

  const openTicket = async (id: string) => {
    const r = await fetch(`/api/admin/support/tickets/${id}`);
    if (r.ok) setActive(await r.json());
  };

  const sendReply = async () => {
    if (!active || !reply.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/admin/support/tickets/${active.id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: reply }) });
      setReply("");
      await openTicket(active.id);
      await load();
    } finally { setSending(false); }
  };

  const resolve = async () => {
    if (!active) return;
    await fetch(`/api/admin/support/tickets/${active.id}/resolve`, { method: "POST" });
    await openTicket(active.id);
    await load();
  };

  const filtered = tickets.filter((t) => filter === "ALL" || t.status === filter);

  return (
    <div>
      <PageHeader title="Suporte" subtitle={`${tickets.length} chamado${tickets.length !== 1 ? "s" : ""}`} actions={
        <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#12121a] border border-border/50 dark:border-white/10 text-muted-foreground hover:text-foreground"><HiOutlineArrowPath className="w-4 h-4" /></button>
      } />

      <div className="flex gap-1 mb-4">
        {([["ALL", "Todos"], ["HUMAN", "Aguardando"], ["RESOLVED", "Resolvidos"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg", filter === k ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/50 dark:hover:bg-white/5")}>{l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        {/* Lista */}
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground"><HiOutlineLifebuoy className="w-10 h-10 mx-auto mb-2 opacity-40" /><p className="text-sm">Nenhum chamado</p></div>
          )}
          {filtered.map((t) => (
            <button key={t.id} onClick={() => openTicket(t.id)} className={cn("w-full text-left p-3 rounded-xl border transition-colors", active?.id === t.id ? "border-primary ring-2 ring-primary/20" : "border-border/40 dark:border-white/8 hover:border-primary/40", "bg-white dark:bg-[#12121a]")}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground truncate flex-1">{t.subject}</p>
                {t.waitingReply && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{t.subscriberName} · {t.subscriberEmail}</p>
              <span className={cn("inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full", statusInfo[t.status].cls)}>{statusInfo[t.status].label}</span>
            </button>
          ))}
        </div>

        {/* Conversa */}
        <div className="bg-white dark:bg-[#12121a] rounded-2xl border border-border/40 dark:border-white/8 flex flex-col min-h-[70vh] max-h-[70vh]">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <HiOutlineLifebuoy className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Selecione um chamado para responder</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border/40 dark:border-white/8 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{active.subject}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{active.subscriberName} · {active.subscriberEmail}</p>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusInfo[active.status].cls)}>{statusInfo[active.status].label}</span>
                {active.status !== "RESOLVED" && (
                  <button onClick={resolve} className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg hover:bg-emerald-500/10"><HiOutlineCheckCircle className="w-4 h-4" />Resolver</button>
                )}
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {active.messages.map((m) => {
                  const isUser = m.role === "USER";
                  return (
                    <div key={m.id} className={cn("flex", isUser ? "justify-start" : "justify-end")}>
                      <div className={cn("max-w-[75%] rounded-2xl px-3 py-2", isUser ? "bg-muted/70 dark:bg-white/8 text-foreground rounded-bl-sm" : m.role === "AGENT" ? "bg-primary text-white rounded-br-sm" : "bg-sky-500/15 text-foreground rounded-br-sm")}>
                        <p className="text-[10px] font-bold mb-0.5 opacity-70 flex items-center gap-1">
                          {m.role === "USER" ? <><HiOutlineUser className="w-3 h-3" />{active.subscriberName}</> : m.role === "AGENT" ? "Você (atendente)" : <><HiOutlineSparkles className="w-3 h-3" />Assistente IA</>}
                        </p>
                        {m.content && <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>}
                        {m.attachmentUrl && (
                          /\.(png|jpe?g|webp|gif)$/i.test(m.attachmentUrl)
                            ? // eslint-disable-next-line @next/next/no-img-element
                              <img src={m.attachmentUrl} alt={m.attachmentName ?? "anexo"} className="mt-1 rounded-lg max-h-44" />
                            : <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs underline mt-1 inline-block">{m.attachmentName ?? "Anexo"}</a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-end gap-2 p-3 border-t border-border/40 dark:border-white/8">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }} placeholder="Responder como atendente..." rows={1} className="flex-1 px-3 py-2 text-sm rounded-xl border border-border/50 dark:border-white/10 bg-transparent text-foreground resize-none max-h-28" />
                <button onClick={sendReply} disabled={sending || !reply.trim()} className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-40"><HiOutlinePaperAirplane className="w-4 h-4" /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
