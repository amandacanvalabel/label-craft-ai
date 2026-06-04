// Mini preview SVG de cada tipo de curva (porte de renderCurvePreview).
export function renderCurvePreview(curve: string): string {
  const stroke = "currentColor", sw = 1.4, fill = "none";
  if (curve === "arcUp") return `<path d="M 5 22 Q 30 5, 55 22" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>`;
  if (curve === "arcDown") return `<path d="M 5 8 Q 30 25, 55 8" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>`;
  if (curve === "circle") return `<circle cx="30" cy="15" r="10" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  if (curve === "wave") return `<path d="M 5 15 Q 15 5, 22 15 T 38 15 T 55 15" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"/>`;
  if (curve === "zigzag") return `<path d="M 5 20 L 17 8 L 28 20 L 40 8 L 55 20" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
  return `<line x1="5" y1="15" x2="55" y2="15" stroke="${stroke}" stroke-width="${sw}"/>`;
}
