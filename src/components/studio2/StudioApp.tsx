"use client";

import { useEffect, useState } from "react";
import "./brand.css";
import { useStudioStore } from "./store/useStudioStore";
import { STEPS, stepIdx } from "./data/steps";
import { loadProject } from "./store/persistence";
import WizardShell from "./wizard/WizardShell";
import EditorShell from "./editor/EditorShell";
import Toast from "./ui/Toast";

interface StudioAppProps {
  modelId?: string;
}

// Container raiz do editor v2. Aplica o escopo de estilos (.studio2),
// sincroniza o tema claro/escuro com o nosso app (classe .dark no <html>)
// e alterna entre o wizard e o editor full-screen (classe .editor-mode).
export default function StudioApp({ modelId }: StudioAppProps) {
  const cur = useStudioStore((s) => s.cur);
  const isEditor = STEPS[cur]?.id === "editor";
  const [light, setLight] = useState(true);

  // Sincroniza o tema do studio com o tema global (.dark no documentElement).
  useEffect(() => {
    const sync = () => setLight(!document.documentElement.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Carrega a paleta da marca do assinante (config) para uso no editor.
  useEffect(() => {
    fetch("/api/subscriber/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.brandColors)) {
          useStudioStore.getState().setBrandColors(data.brandColors);
        }
      })
      .catch(() => {});
  }, []);

  // Carrega modelo existente via ?id= e abre direto no editor.
  useEffect(() => {
    if (!modelId) return;
    let cancelled = false;
    (async () => {
      const ok = await loadProject(modelId);
      if (cancelled || !ok) return;
      const st = useStudioStore.getState();
      const hasEls = Object.values(st.editor.faces || {}).some((f) => f.length > 0);
      if (hasEls) st.go(stepIdx("editor"));
    })();
    return () => {
      cancelled = true;
    };
  }, [modelId]);

  const cls = ["studio2", light ? "theme-light" : "", isEditor ? "editor-mode" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <WizardShell />
      {isEditor && <EditorShell />}
      <Toast />
      <input type="file" id="fileInput" accept="image/*,.pdf,.svg,.ai,.eps" style={{ display: "none" }} />
      <input type="file" id="fileInputMulti" accept="image/*" multiple style={{ display: "none" }} />
    </div>
  );
}
