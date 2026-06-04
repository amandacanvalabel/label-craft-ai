"use client";

// Alterna o tema global (.dark no <html>) — o StudioApp observa e aplica
// .theme-light no container. Persiste em localStorage("theme") como o resto do app.
export default function ThemeToggle({ id, small }: { id?: string; small?: boolean }) {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      className={"theme-toggle" + (small ? " theme-toggle-sm" : "")}
      id={id}
      title="Alternar modo claro/escuro"
      aria-label="Alternar tema"
      onClick={toggle}
    >
      <svg className="th-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg className="th-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </button>
  );
}
