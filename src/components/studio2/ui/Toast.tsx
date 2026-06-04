"use client";

import { useEffect, useRef, useState } from "react";

// Emissor simples (porte de toast()/#toast do editor original).
let emit: ((msg: string) => void) | null = null;

export function toast(msg: string) {
  emit?.(msg);
}

export default function Toast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    emit = (m: string) => {
      setMsg(m);
      setShow(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setShow(false), 2400);
    };
    return () => {
      emit = null;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className={"toast" + (show ? " show" : "")} id="toast">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span id="toastMsg">{msg}</span>
    </div>
  );
}
