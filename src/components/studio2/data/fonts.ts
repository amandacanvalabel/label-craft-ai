// Catálogo de fontes + lazy-load (porte do editor original).

export const FONT_CATALOG: Record<string, string[]> = {
  "Sans-serif": [
    "Inter", "Hanken Grotesk", "Bricolage Grotesque", "DM Sans", "Manrope", "Plus Jakarta Sans",
    "Outfit", "Sora", "Public Sans", "Work Sans", "Nunito Sans", "Mulish", "Be Vietnam Pro",
    "Albert Sans", "Onest", "Geist", "Figtree", "Lato", "Open Sans", "Roboto", "Roboto Flex",
    "Noto Sans", "Source Sans 3", "PT Sans", "Karla", "Heebo", "Rubik", "Cabin", "Quicksand",
    "Barlow", "Archivo", "Archivo Narrow", "Archivo Black", "Oswald", "Bebas Neue", "Anton",
    "Teko", "Saira", "Saira Condensed", "Fjalla One", "Big Shoulders Display",
    "Unbounded", "Space Grotesk", "Syne", "Chakra Petch", "Familjen Grotesk", "Urbanist", "Sen",
  ],
  Serif: [
    "Playfair Display", "Fraunces", "DM Serif Display", "DM Serif Text", "Cormorant Garamond",
    "Cormorant", "Libre Baskerville", "Libre Caslon Text", "Lora", "Spectral", "EB Garamond",
    "Crimson Text", "Crimson Pro", "Cardo", "Bitter", "Merriweather", "PT Serif", "Source Serif 4",
    "Noto Serif", "Tinos", "Newsreader", "Young Serif", "Instrument Serif", "Italiana",
    "Bodoni Moda", "Petrona", "Frank Ruhl Libre", "Marcellus", "Marcellus SC", "IM Fell English",
    "Old Standard TT", "Sorts Mill Goudy", "Vollkorn", "Gilda Display", "Forum", "Cinzel",
    "Trajan Pro", "Yeseva One", "Prata", "Suranna",
  ],
  Display: [
    "Abril Fatface", "Bagel Fat One", "Big Shoulders Stencil Display", "Black Ops One",
    "Bowlby One", "Bungee", "Bungee Shade", "Chango", "Cherry Bomb One", "DM Serif Display",
    "Lilita One", "Major Mono Display", "Monoton", "Notable", "Oi", "Paytone One", "Permanent Marker",
    "Press Start 2P", "Racing Sans One", "Righteous", "Rubik Mono One", "Rubik Wet Paint",
    "Rye", "Shrikhand", "Spicy Rice", "Staatliches", "Syncopate", "Titan One", "Ultra", "Unica One",
    "Vast Shadow", "Wallpoet", "Climate Crisis", "Sedgwick Ave Display",
  ],
  "Script / Handwriting": [
    "Caveat", "Dancing Script", "Pacifico", "Great Vibes", "Sacramento", "Allura", "Tangerine",
    "Satisfy", "Kaushan Script", "Yellowtail", "Cookie", "Parisienne", "Alex Brush", "Petit Formal Script",
    "Mrs Saint Delafield", "Italianno", "Pinyon Script", "Niconne", "Mr Dafoe", "Yeseva One",
    "Homemade Apple", "Reenie Beanie", "Architects Daughter", "Shadows Into Light", "Indie Flower",
    "Amatic SC", "Patrick Hand", "Gloria Hallelujah", "Just Another Hand", "Kalam",
  ],
  Monospace: [
    "JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono", "Roboto Mono",
    "Space Mono", "Inconsolata", "Anonymous Pro", "Cousine", "Cutive Mono", "Major Mono Display",
    "Nova Mono", "PT Mono", "Share Tech Mono", "VT323", "Ubuntu Mono", "DM Mono", "Geist Mono",
  ],
};

export const FONTS = Object.values(FONT_CATALOG).flat();

export const FONTS_FEATURED = [
  "Inter", "Playfair Display", "Hanken Grotesk", "Fraunces", "DM Sans", "DM Serif Display",
  "Bricolage Grotesque", "Cormorant Garamond", "Libre Baskerville", "Lora", "Manrope",
  "Outfit", "Archivo", "Archivo Black", "Bebas Neue", "Oswald", "Anton", "Caveat",
  "Pacifico", "Dancing Script", "Permanent Marker", "JetBrains Mono", "Roboto", "Lato",
];

const FONTS_LOADED = new Set<string>(["Hanken Grotesk", "Bricolage Grotesque", "Playfair Display"]);

// Lazy-load: injeta um <link> ao Google Fonts para essa família.
export function ensureFontLoaded(family?: string) {
  if (!family || FONTS_LOADED.has(family) || typeof document === "undefined") return;
  FONTS_LOADED.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  const fam = family.trim().replace(/ /g, "+");
  link.href = `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap`;
  document.head.appendChild(link);
}

export const LAYER_ICONS: Record<string, string> = {
  text: '<path d="M4 7V4h16v3"/><path d="M9 20h6M12 4v16"/>',
  textCurve: '<path d="M3 17 Q 12 4, 21 17"/>',
  rect: '<rect x="3" y="6" width="18" height="12" rx="2"/>',
  ellipse: '<circle cx="12" cy="12" r="9"/>',
  line: '<line x1="5" y1="19" x2="19" y2="5"/><circle cx="5" cy="19" r="1.5" fill="currentColor"/><circle cx="19" cy="5" r="1.5" fill="currentColor"/>',
  shape: '<path d="M12 3L21 20H3z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21"/>',
  selo: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5L15.5 10" stroke-linecap="round" stroke-linejoin="round"/>',
  barcode: '<path d="M4 5v14M7 5v14M10 5v14M14 5v14M17 5v14M20 5v14" stroke-width="1.7"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="0.5"/><rect x="14" y="3" width="7" height="7" rx="0.5"/><rect x="3" y="14" width="7" height="7" rx="0.5"/>',
};
