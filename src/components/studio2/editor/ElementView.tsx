"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import type { El, ElFinish } from "../types";
import { MM_PER_PT } from "../generate/primitives";
import { HOT_STAMPING_COLORS } from "../data/hotStamping";
import { ShapeSvg, SeloSvg, BarcodeSvg, QrSvg, TextCurveSvg } from "./svg";

// Porte de edRenderElements + edPaintEl (render de um elemento no artboard).
export default function ElementView({ el, ppm, selected, finish, editing, onCommitText }: { el: El; ppm: number; selected: boolean; finish?: ElFinish; editing?: boolean; onCommitText?: (id: string, text: string, html: string, height: number) => void }) {
  if (!el.visible) return null;

  const hasFinish = !!(finish && (finish.verniz || finish.hotstamp || finish.baixoRelevo));
  const cls = ["el", el.locked ? "locked" : "", selected ? "multi-sel" : "", hasFinish ? "has-finish" : ""].filter(Boolean).join(" ");

  const base: CSSProperties = {
    left: el.x * ppm,
    top: el.y * ppm,
    width: el.w * ppm,
    height: el.h * ppm,
    transform: `rotate(${el.rot}deg)`,
    opacity: el.opacity / 100,
  };

  let content: React.ReactNode = null;
  const style: CSSProperties = { ...base };

  if (el.type === "text") {
    const t: CSSProperties = {
      fontFamily: `'${el.font}'`,
      fontSize: (el.size || 12) * MM_PER_PT * ppm,
      fontWeight: el.weight as CSSProperties["fontWeight"],
      fontStyle: el.italic ? "italic" : "normal",
      color: el.color,
      textAlign: el.align,
      lineHeight: el.lh,
      letterSpacing: (el.ls || 0) * ppm / 4,
      wordBreak: "break-word",
      whiteSpace: "pre-wrap",
    };
    style.alignItems = "flex-start";
    return (
      <div className={cls + " el-text" + (editing ? " editing" : "")} data-id={el.id} style={style}>
        {editing ? (
          <EditableText el={el} style={t} onCommit={onCommitText} ppm={ppm} />
        ) : el.html && el.html.includes("<span") ? (
          <div className="txt" style={t} dangerouslySetInnerHTML={{ __html: el.html }} />
        ) : (
          <div className="txt" style={t}>{el.text}</div>
        )}
        {hasFinish && <FinishOverlay finish={finish!} />}
      </div>
    );
  } else if (el.type === "rect") {
    style.background = el.fill;
    style.borderRadius = (el.radius || 0) * ppm;
    if ((el.sw || 0) > 0) style.boxShadow = `0 0 0 ${(el.sw || 0) * ppm}px ${el.stroke}`;
  } else if (el.type === "ellipse") {
    style.background = el.fill;
    style.borderRadius = "50%";
    if ((el.sw || 0) > 0) style.border = `${(el.sw || 0) * ppm}px solid ${el.stroke}`;
  } else if (el.type === "line") {
    content = <div style={{ position: "absolute", left: 0, top: "50%", width: "100%", height: (el.sw || 0) * ppm, transform: "translateY(-50%)", background: el.stroke }} />;
  } else if (el.type === "image") {
    if (el.src) {
      const fit = el.fit === "cover" ? "cover" : "contain";
      style.background = `center/${fit} no-repeat url(${el.src})`;
    } else {
      style.background = "repeating-conic-gradient(#e8e8ec 0% 25%,#dadadf 0% 50%) 0/16px 16px";
      style.display = "grid";
      style.placeItems = "center";
      content = (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9a9aa6" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.8" />
          <path d="M21 16l-5-5-9 9" />
        </svg>
      );
    }
  } else if (el.type === "barcode") {
    content = <BarcodeSvg el={el} ppm={ppm} />;
  } else if (el.type === "qr") {
    content = <QrSvg el={el} ppm={ppm} />;
  } else if (el.type === "selo") {
    content = <SeloSvg el={el} ppm={ppm} />;
  } else if (el.type === "shape") {
    content = <ShapeSvg el={el} ppm={ppm} />;
  } else if (el.type === "textCurve") {
    content = <TextCurveSvg el={el} ppm={ppm} />;
  }

  return (
    <div className={cls} data-id={el.id} style={style}>
      {content}
      {hasFinish && <FinishOverlay finish={finish!} />}
    </div>
  );
}

// Edição inline de texto (porte de edStartTextEdit) — contentEditable + auto-resize.
function EditableText({ el, style, onCommit, ppm }: { el: El; style: CSSProperties; onCommit?: (id: string, text: string, html: string, height: number) => void; ppm: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = ref.current;
    if (!t) return;
    if (el.html && el.html.includes("<span")) t.innerHTML = el.html;
    else t.textContent = el.text || "";
    t.focus();
    const r = document.createRange();
    r.selectNodeContents(t);
    r.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = () => {
    const t = ref.current;
    if (!t) return;
    const text = (t.innerText || "").trim() || "Texto";
    const html = sanitizeRichTextHTML(t.innerHTML) || text;
    const minH = (el.size || 12) * MM_PER_PT * 1.2;
    const h = Math.max(minH, t.scrollHeight / ppm);
    onCommit?.(el.id, text, html, h);
  };

  return (
    <div
      className="txt"
      style={style}
      contentEditable
      suppressContentEditableWarning
      ref={ref}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); (e.target as HTMLElement).blur(); } }}
    />
  );
}

// Limpa HTML do contenteditable, mantendo spans com estilo (porte de sanitizeRichTextHTML).
function sanitizeRichTextHTML(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  tmp.querySelectorAll("div").forEach((div) => {
    const br = document.createElement("br");
    div.parentNode?.insertBefore(br, div);
    while (div.firstChild) div.parentNode?.insertBefore(div.firstChild, div);
    div.remove();
  });
  tmp.querySelectorAll("font").forEach((f) => {
    const span = document.createElement("span");
    if (f.getAttribute("color")) span.style.color = f.getAttribute("color")!;
    span.innerHTML = f.innerHTML;
    f.parentNode?.replaceChild(span, f);
  });
  tmp.querySelectorAll("span").forEach((s) => { if (!s.textContent && !s.querySelector("br")) s.remove(); });
  return tmp.innerHTML;
}

function FinishOverlay({ finish }: { finish: ElFinish }) {
  let bg = "";
  let blend: CSSProperties["mixBlendMode"] = "multiply";
  let opacity = 0.7;
  const parts: string[] = [];
  if (finish.hotstamp) {
    const c = HOT_STAMPING_COLORS[finish.hotstamp];
    if (c) bg = c.css;
    blend = "screen";
    opacity = 0.55;
    if (c) parts.push(`✦ ${c.name}`);
  } else if (finish.verniz) {
    bg = "linear-gradient(120deg, rgba(255,255,255,.0) 0%, rgba(255,255,255,.45) 45%, rgba(255,255,255,.0) 60%)";
    blend = "overlay";
    opacity = 0.6;
    parts.push("✨ Verniz");
  } else if (finish.baixoRelevo) {
    bg = "radial-gradient(ellipse at center, rgba(0,0,0,.18), rgba(0,0,0,0) 70%)";
    parts.push("▽ Relevo");
  }
  return (
    <>
      <div className="el-finish-overlay" style={{ pointerEvents: "none", background: bg, mixBlendMode: blend, opacity }} />
      <div className="el-finish-tag">{parts.join("  ·  ")}</div>
    </>
  );
}
