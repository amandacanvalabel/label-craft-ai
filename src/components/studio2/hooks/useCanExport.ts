"use client";

import { useEffect, useState } from "react";

// Descobre se o assinante pode exportar (somente planos pagos).
// Retorna:
//   null  → ainda carregando
//   false → plano grátis / sem plano (exportação bloqueada)
//   true  → plano pago (exportação liberada)
export function useCanExport(): boolean | null {
  const [canExport, setCanExport] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/subscriber/can-export")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setCanExport(data ? !!data.canExport : false);
      })
      .catch(() => {
        if (!cancelled) setCanExport(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return canExport;
}
