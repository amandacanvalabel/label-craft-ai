"use client";

import { useEffect, useRef, useState } from "react";
import { useStudioStore, selIds } from "../store/useStudioStore";
import type { El } from "../types";
import ElementView from "./ElementView";

export const BASE_PX_PER_MM = 4;
const SNAP_MM = 1.6;
const ED_HANDLES: [number, number][] = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];

function rot2(px: number, py: number, deg: number) {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return { x: px * c - py * s, y: px * s + py * c };
}

interface Guide { axis: "v" | "h"; pos: number; }

export default function Canvas() {
  const editor = useStudioStore((s) => s.editor);
  const finishes = useStudioStore((s) => s.finishes);
  const edSetFaceEls = useStudioStore((s) => s.edSetFaceEls);
  const edSelect = useStudioStore((s) => s.edSelect);
  const edToggle = useStudioStore((s) => s.edToggle);
  const edSetSelection = useStudioStore((s) => s.edSetSelection);
  const edUpdateEl = useStudioStore((s) => s.edUpdateEl);
  const pushHistory = useStudioStore((s) => s.pushHistory);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { label, face, zoom } = editor;
  const els = editor.faces[face] || [];
  const ppm = BASE_PX_PER_MM * zoom;
  const selected = new Set(selIds(editor));

  const artRef = useRef<HTMLDivElement>(null);
  const rulerTopRef = useRef<HTMLCanvasElement>(null);
  const rulerLeftRef = useRef<HTMLCanvasElement>(null);

  const [guides, setGuides] = useState<Guide[]>([]);
  const [dim, setDim] = useState<{ text: string; left: number; top: number } | null>(null);
  const [band, setBand] = useState<{ left: number; top: number; w: number; h: number } | null>(null);

  // ---- réguas ----
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const paint = (cv: HTMLCanvasElement | null, len: number, dir: "h" | "v") => {
      if (!cv) return;
      const px = len * ppm;
      if (dir === "h") { cv.width = px * dpr; cv.height = 24 * dpr; cv.style.width = px + "px"; cv.style.height = "24px"; }
      else { cv.width = 24 * dpr; cv.height = px * dpr; cv.style.width = "24px"; cv.style.height = px + "px"; }
      const c = cv.getContext("2d");
      if (!c) return;
      c.scale(dpr, dpr);
      c.font = "8px sans-serif";
      c.textBaseline = "top";
      for (let mm = 0; mm <= len; mm++) {
        const p = mm * ppm, tick = mm % 10 === 0 ? 13 : mm % 5 === 0 ? 8 : 4;
        c.strokeStyle = mm % 10 === 0 ? "#6c6c78" : "#3d3d47";
        c.lineWidth = 1;
        c.beginPath();
        if (dir === "h") { c.moveTo(p + 0.5, 24); c.lineTo(p + 0.5, 24 - tick); }
        else { c.moveTo(24, p + 0.5); c.lineTo(24 - tick, p + 0.5); }
        c.stroke();
        if (mm % 10 === 0 && mm > 0) {
          c.fillStyle = "#8a8a96";
          if (dir === "h") c.fillText(String(mm), p + 2, 2);
          else { c.save(); c.translate(3, p + 2); c.fillText(String(mm), 0, 0); c.restore(); }
        }
      }
    };
    paint(rulerTopRef.current, label.w, "h");
    paint(rulerLeftRef.current, label.h, "v");
  }, [label.w, label.h, ppm]);

  // ---- helpers ----
  const ptToMm = (e: { clientX: number; clientY: number }) => {
    const r = artRef.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / ppm, y: (e.clientY - r.top) / ppm };
  };

  const applySnap = (el: El, nx: number, ny: number, arr: El[]) => {
    const L = label;
    const tgV = [0, L.safe, L.w / 2, L.w - L.safe, L.w];
    const tgH = [0, L.safe, L.h / 2, L.h - L.safe, L.h];
    arr.forEach((o) => {
      if (o.id === el.id || !o.visible) return;
      tgV.push(o.x, o.x + o.w / 2, o.x + o.w);
      tgH.push(o.y, o.y + o.h / 2, o.y + o.h);
    });
    const gs: Guide[] = [];
    const best: { v: { d: number; nx: number; line: number } | null; h: { d: number; ny: number; line: number } | null } = { v: null, h: null };
    ([[nx, 0], [nx + el.w / 2, el.w / 2], [nx + el.w, el.w]] as [number, number][]).forEach(([val, off]) => {
      tgV.forEach((t) => { const d = Math.abs(val - t); if (d < SNAP_MM && (!best.v || d < best.v.d)) best.v = { d, nx: t - off, line: t }; });
    });
    if (best.v) { nx = best.v.nx; gs.push({ axis: "v", pos: best.v.line }); }
    ([[ny, 0], [ny + el.h / 2, el.h / 2], [ny + el.h, el.h]] as [number, number][]).forEach(([val, off]) => {
      tgH.forEach((t) => { const d = Math.abs(val - t); if (d < SNAP_MM && (!best.h || d < best.h.d)) best.h = { d, ny: t - off, line: t }; });
    });
    if (best.h) { ny = best.h.ny; gs.push({ axis: "h", pos: best.h.line }); }
    setGuides(gs);
    return { x: Math.round(nx * 100) / 100, y: Math.round(ny * 100) / 100 };
  };

  const showDim = (el: El, mode: string) => {
    setDim({ text: mode === "rotate" ? `${Math.round(el.rot)}°` : `${Math.round(el.w)} × ${Math.round(el.h)} mm`, left: el.x * ppm + (el.w * ppm) / 2, top: el.y * ppm + el.h * ppm + 10 });
  };

  // ---- drag (move / resize / rotate) ----
  const dragRef = useRef<{ cleanup: () => void } | null>(null);

  const beginDrag = (
    onMove: (e: PointerEvent) => void,
    onEnd: () => void,
  ) => {
    const move = (e: PointerEvent) => onMove(e);
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setGuides([]); setDim(null); onEnd(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    dragRef.current = { cleanup: () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); } };
  };

  const startMove = (ev: React.PointerEvent, el: El) => {
    ev.preventDefault();
    const s = ptToMm(ev);
    const selIdSet = new Set(selIds(editor));
    const isMulti = selIdSet.size > 1 && selIdSet.has(el.id);
    const orig = els.map((e) => ({ id: e.id, x: e.x, y: e.y }));
    let moved = false;
    const startClient = { x: ev.clientX, y: ev.clientY };
    let active = false;
    const onMove = (e: PointerEvent) => {
      if (!active) { if (Math.hypot(e.clientX - startClient.x, e.clientY - startClient.y) < 3) return; active = true; }
      moved = true;
      const p = ptToMm(e);
      const rawDx = p.x - s.x, rawDy = p.y - s.y;
      const o0 = orig.find((o) => o.id === el.id)!;
      const sn = applySnap(el, o0.x + rawDx, o0.y + rawDy, els);
      const dx = sn.x - o0.x, dy = sn.y - o0.y;
      const next = els.map((e2) => {
        const o = orig.find((oo) => oo.id === e2.id)!;
        if (isMulti ? selIdSet.has(e2.id) : e2.id === el.id) return { ...e2, x: o.x + dx, y: o.y + dy };
        return e2;
      });
      edSetFaceEls(face, next);
      const moving = next.find((e2) => e2.id === el.id)!;
      showDim(moving, "move");
    };
    beginDrag(onMove, () => { if (moved) pushHistory(); });
  };

  const startResize = (ev: React.PointerEvent, el: El, hx: number, hy: number) => {
    ev.preventDefault();
    ev.stopPropagation();
    const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
    const a = rot2(-hx * el.w / 2, -hy * el.h / 2, el.rot);
    const ax = cx + a.x, ay = cy + a.y;
    const aspect = el.w / Math.max(0.01, el.h);
    let moved = false;
    const onMove = (e: PointerEvent) => {
      moved = true;
      const p = ptToMm(e);
      const loc = rot2(p.x - ax, p.y - ay, -el.rot);
      let nw = el.w, nh = el.h;
      if (hx !== 0) nw = Math.max(5, loc.x * hx);
      if (hy !== 0) nh = Math.max(el.type === "line" ? 0.1 : 5, loc.y * hy);
      if (e.shiftKey && aspect && hx !== 0 && hy !== 0) {
        if (Math.abs(nw - el.w) > Math.abs(nh - el.h)) nh = nw / aspect;
        else nw = nh * aspect;
      } else if (e.shiftKey && aspect && hx !== 0) nh = nw / aspect;
      else if (e.shiftKey && aspect && hy !== 0) nw = nh * aspect;
      const v = rot2((hx * nw) / 2, (hy * nh) / 2, el.rot);
      const nx = ax + v.x - nw / 2, ny = ay + v.y - nh / 2;
      const next = els.map((e2) => (e2.id === el.id ? { ...e2, w: nw, h: nh, x: nx, y: ny } : e2));
      edSetFaceEls(face, next);
      showDim({ ...el, w: nw, h: nh, x: nx, y: ny }, "resize");
    };
    beginDrag(onMove, () => { if (moved) pushHistory(); });
  };

  const startRotate = (ev: React.PointerEvent, el: El) => {
    ev.preventDefault();
    ev.stopPropagation();
    const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
    let moved = false;
    const onMove = (e: PointerEvent) => {
      moved = true;
      const p = ptToMm(e);
      let a = (Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI + 90;
      for (const sa of [0, 45, 90, 135, 180, -45, -90, -135, -180]) if (Math.abs(a - sa) < 3) { a = sa; break; }
      if (e.shiftKey) a = Math.round(a / 15) * 15;
      const rot = Math.round(a * 10) / 10;
      const next = els.map((e2) => (e2.id === el.id ? { ...e2, rot } : e2));
      edSetFaceEls(face, next);
      showDim({ ...el, rot }, "rotate");
    };
    beginDrag(onMove, () => { if (moved) pushHistory(); });
  };

  // ---- rubber band ----
  const startRubberBand = (ev: React.PointerEvent) => {
    ev.preventDefault();
    const start = ptToMm(ev);
    const additivePre = ev.shiftKey ? new Set(selIds(editor)) : new Set<string>();
    const onMove = (e: PointerEvent) => {
      const p = ptToMm(e);
      const x1 = Math.min(start.x, p.x), y1 = Math.min(start.y, p.y), x2 = Math.max(start.x, p.x), y2 = Math.max(start.y, p.y);
      setBand({ left: x1 * ppm, top: y1 * ppm, w: (x2 - x1) * ppm, h: (y2 - y1) * ppm });
      const inside = els.filter((el) => {
        if (!el.visible || el.locked) return false;
        const ecx = el.x + el.w / 2, ecy = el.y + el.h / 2;
        return ecx >= x1 && ecx <= x2 && ecy >= y1 && ecy <= y2;
      });
      edSetSelection([...new Set([...additivePre, ...inside.map((e2) => e2.id)])]);
    };
    const up = () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", up); setBand(null); };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", up);
  };

  // ---- edição inline de texto ----
  const onArtDbl = (ev: React.MouseEvent) => {
    const dv = (ev.target as HTMLElement).closest("[data-id]") as HTMLElement | null;
    if (!dv) return;
    const el = els.find((e) => e.id === dv.dataset.id);
    if (el && el.type === "text" && !el.locked) setEditingId(el.id);
  };
  const commitText = (id: string, text: string, html: string, height: number) => {
    edUpdateEl(id, { text, html, h: height });
    setEditingId(null);
  };

  // ---- pointer no artboard ----
  const onArtPointer = (ev: React.PointerEvent) => {
    if (ev.button !== 0) return;
    const target = ev.target as HTMLElement;
    const dv = target.closest("[data-id]") as HTMLElement | null;
    if (editingId && dv?.dataset.id === editingId) return; // deixa o contentEditable tratar
    if (editingId) setEditingId(null);
    if (!dv) {
      if (!ev.shiftKey) edSelect(null);
      startRubberBand(ev);
      return;
    }
    const el = els.find((e) => e.id === dv.dataset.id);
    if (!el) { edSelect(null); return; }
    if (ev.shiftKey) { edToggle(el.id); return; }
    if (selected.has(el.id) && selIds(editor).length > 1) {
      if (el.locked) return;
      startMove(ev, el);
      return;
    }
    edSelect(el.id);
    if (el.locked) return;
    startMove(ev, el);
  };

  // ---- overlay (seleção única) ----
  const selEl = editor.selSet ? null : els.find((e) => e.id === editor.sel) || null;
  const multiEls = editor.selSet ? els.filter((e) => editor.selSet!.includes(e.id)) : [];
  const multiBBox = (() => {
    if (multiEls.length < 2) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    multiEls.forEach((el) => {
      const cx = el.x + el.w / 2, cy = el.y + el.h / 2;
      [[-el.w / 2, -el.h / 2], [el.w / 2, -el.h / 2], [el.w / 2, el.h / 2], [-el.w / 2, el.h / 2]].forEach(([dx, dy]) => {
        const r = rot2(dx, dy, el.rot);
        minX = Math.min(minX, cx + r.x); maxX = Math.max(maxX, cx + r.x);
        minY = Math.min(minY, cy + r.y); maxY = Math.max(maxY, cy + r.y);
      });
    });
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  })();

  useEffect(() => () => dragRef.current?.cleanup(), []);

  return (
    <div className="workspace" id="workspace">
      <div className="stage">
        <div className="canvas-frame" id="frame">
          <div className="ruler-corner">mm</div>
          <div className="ruler top" id="rulerTop"><canvas ref={rulerTopRef} /></div>
          <div className="ruler left" id="rulerLeft"><canvas ref={rulerLeftRef} /></div>
          <div className="artboard-wrap" id="abWrap">
            <div className="bleed" id="bleed" style={{ left: -label.bleed * ppm, top: -label.bleed * ppm, width: (label.w + 2 * label.bleed) * ppm, height: (label.h + 2 * label.bleed) * ppm }} />
            <div className="artboard" id="artboard" ref={artRef} style={{ width: label.w * ppm, height: label.h * ppm, background: label.bg }} onPointerDown={onArtPointer} onDoubleClick={onArtDbl}>
              {els.map((el) => (
                <ElementView key={el.id} el={el} ppm={ppm} selected={selected.has(el.id)} finish={finishes[el.id]} editing={editingId === el.id} onCommitText={commitText} />
              ))}
            </div>
            <div className="safe" id="safe" style={{ left: label.safe * ppm, top: label.safe * ppm, width: (label.w - 2 * label.safe) * ppm, height: (label.h - 2 * label.safe) * ppm }} />
          </div>
          <div className="overlay" id="overlay" style={{ width: label.w * ppm, height: label.h * ppm }}>
            {guides.map((g, i) => (
              <div key={i} className="guide" style={g.axis === "v" ? { left: g.pos * ppm, top: 0, width: 1, height: label.h * ppm } : { top: g.pos * ppm, left: 0, height: 1, width: label.w * ppm }} />
            ))}
            {band && <div className="rubber-band" style={{ left: band.left, top: band.top, width: band.w, height: band.h }} />}

            {/* multi-seleção */}
            {multiBBox && (
              <div className="multi-bbox" style={{ left: multiBBox.x * ppm, top: multiBBox.y * ppm, width: multiBBox.w * ppm, height: multiBBox.h * ppm }}>
                <div className="mb-count">{multiEls.length} itens</div>
              </div>
            )}

            {/* seleção única */}
            {selEl && selEl.visible && (
              <div className="selbox" style={{ left: selEl.x * ppm, top: selEl.y * ppm, width: selEl.w * ppm, height: selEl.h * ppm, transform: `rotate(${selEl.rot}deg)` }}>
                {!selEl.locked && (
                  <>
                    {ED_HANDLES.map(([hx, hy]) => {
                      if (selEl.type === "line" && (hy !== 0 || hx === 0)) return null;
                      const cursor = hx !== 0 && hy !== 0 ? (hx * hy > 0 ? "nwse-resize" : "nesw-resize") : hx === 0 ? "ns-resize" : "ew-resize";
                      return (
                        <div
                          key={`${hx},${hy}`}
                          className={"handle" + (hx === 0 || hy === 0 ? " edge" : "")}
                          style={{ left: ((hx + 1) / 2) * 100 + "%", top: ((hy + 1) / 2) * 100 + "%", cursor }}
                          onPointerDown={(e) => startResize(e, selEl, hx, hy)}
                        />
                      );
                    })}
                    {selEl.type !== "line" && (
                      <>
                        <div className="rot-stem" style={{ left: "50%", top: -22, height: 22 }} />
                        <div className="rot-handle" style={{ left: "50%", top: -30 }} onPointerDown={(e) => startRotate(e, selEl)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21 12a9 9 0 1 1-3-6.7" />
                            <path d="M21 3v6h-6" />
                          </svg>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {dim && <div className="dimtag" style={{ left: dim.left, top: dim.top, transform: "translateX(-50%)" }}>{dim.text}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
