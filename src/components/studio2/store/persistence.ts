"use client";

// Persistência: save/load/autosave via /api/models (substitui o localStorage do editor original).

import { useStudioStore, serializeStudioState } from "./useStudioStore";
import { captureFace } from "../export/capture";
import type { StudioState } from "../types";

// Gera uma miniatura PNG pequena da primeira face (para a lista "Modelos salvos").
async function makeThumbnail(state: StudioState): Promise<string | null> {
  const faceId = Object.keys(state.editor.faces || {})[0];
  if (!faceId) return null;
  try {
    const canvas = await captureFace(state, faceId, 2, { finishes: false });
    // Limita largura ~320px para não inflar o JSON.
    const max = 320;
    if (canvas.width > max) {
      const sc = max / canvas.width;
      const small = document.createElement("canvas");
      small.width = max;
      small.height = Math.round(canvas.height * sc);
      small.getContext("2d")?.drawImage(canvas, 0, 0, small.width, small.height);
      return small.toDataURL("image/png");
    }
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export interface SaveResult {
  ok: boolean;
  id?: string;
  name?: string;
  error?: string;
}

// Evita salvamentos concorrentes (autosave + botão "Salvar" ao mesmo tempo),
// o que poderia criar o mesmo rótulo duas vezes antes do id ser definido.
let saveInFlight: Promise<SaveResult> | null = null;

// Salva o projeto. Cria (POST) se novo, atualiza (PATCH) se já tem id.
export async function saveProject(opts: { silent?: boolean } = {}): Promise<SaveResult> {
  if (saveInFlight) return saveInFlight;
  saveInFlight = doSaveProject(opts);
  try {
    return await saveInFlight;
  } finally {
    saveInFlight = null;
  }
}

async function doSaveProject(opts: { silent?: boolean } = {}): Promise<SaveResult> {
  const st = useStudioStore.getState();
  const name = st.editor.docname?.trim() || st.projectName || "Rótulo";
  const canvasData = serializeStudioState(st);
  // Sempre gera miniatura ao CRIAR (mesmo em autosave silencioso), para o rótulo
  // aparecer com imagem em "Modelos salvos". Nas atualizações silenciosas, pula
  // a miniatura para não pesar.
  const needThumbnail = !opts.silent || !st.projectId;
  const thumbnail = needThumbnail ? await makeThumbnail(st) : undefined;

  try {
    if (st.projectId) {
      const res = await fetch(`/api/models/${st.projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, canvasData, ...(thumbnail ? { thumbnail } : {}) }),
      });
      if (!res.ok) return { ok: false, error: "Falha ao atualizar" };
      useStudioStore.getState().markSaved(st.projectId, name);
      return { ok: true, id: st.projectId, name };
    }
    const res = await fetch(`/api/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, canvasData, ...(thumbnail ? { thumbnail } : {}) }),
    });
    if (!res.ok) return { ok: false, error: "Falha ao criar" };
    const model = await res.json();
    useStudioStore.getState().markSaved(model.id, name);
    return { ok: true, id: model.id, name };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Carrega um projeto pelo id e popula o store.
export async function loadProject(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/models/${id}`);
    if (!res.ok) return false;
    const model = await res.json();
    const data = model.canvasData as StudioState;
    if (!data || typeof data !== "object" || !data.editor) return false;
    useStudioStore.getState().loadState(data, { projectId: model.id, projectName: model.name });
    return true;
  } catch {
    return false;
  }
}
