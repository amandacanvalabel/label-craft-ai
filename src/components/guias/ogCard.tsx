// Arte 1200×630 usada quando um guia é compartilhado (WhatsApp, LinkedIn,
// Facebook) e nas prévias de busca. Gerada no build, sem imagem externa.
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

export function ogCard({ etiqueta, titulo, rodape }: { etiqueta: string; titulo: string; rodape: string }) {
  const tamanho = titulo.length > 70 ? 54 : titulo.length > 45 ? 62 : 72;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "64px 72px",
          borderTop: "18px solid #2563eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
              color: "#fff",
              fontSize: 26,
              fontWeight: 800,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            CL
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 800, color: "#0f172a" }}>CanvaLabel</div>
          <div
            style={{
              display: "flex",
              marginLeft: 20,
              padding: "8px 20px",
              borderRadius: 999,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {etiqueta}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: tamanho, fontWeight: 800, color: "#0f172a", lineHeight: 1.12, letterSpacing: -1 }}>
          {titulo}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, color: "#475569" }}>
          <div style={{ display: "flex" }}>{rodape}</div>
          <div style={{ display: "flex", color: "#2563eb", fontWeight: 700 }}>canvalabel.com.br/guias</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
