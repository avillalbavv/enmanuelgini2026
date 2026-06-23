import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Search } from "lucide-react";
import logoGrande from "@/assets/logo-grande.png";
import { NAV_ITEMS, SITE } from "@/lib/site";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-3 md:py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`rounded-2xl flex items-center justify-between gap-3 px-3 md:px-4 transition-all duration-500 border ${
            scrolled
              ? "py-2 shadow-elevated bg-white border-border/70"
              : "py-2.5 shadow-soft glass border-transparent"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center group" aria-label="Inicio - Enmanuel Gini Intendente">
            <img
              src={logoGrande}
              alt="Enmanuel Gini · Intendente · Lista 2"
              className={`w-auto transition-all duration-500 ${
                scrolled ? "h-10 md:h-11" : "h-12 md:h-14"
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 text-[13.5px] font-medium text-foreground/75 hover:text-primary rounded-lg transition-colors"
                activeProps={{ className: "px-3 py-2 text-[13.5px] font-semibold text-primary rounded-lg bg-primary-soft/60" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2">
            <Link
              to="/padron"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-gradient text-primary-foreground px-3.5 py-2 text-[13px] font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5"
            >
              <Search className="size-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">Consultar padrón</span>
              <span className="sm:hidden">Padrón</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden inline-flex items-center justify-center size-10 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
              aria-label="Abrir menú"
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 top-0 z-[100] animate-fade-up"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
          <div
            className="relative mx-4 mt-[88px] rounded-2xl p-3 shadow-elevated border border-border"
            style={{ background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3.5 text-[15px] font-semibold text-ink hover:text-primary hover:bg-primary-soft rounded-xl transition-colors"
                  activeProps={{ className: "px-4 py-3.5 text-[15px] font-bold text-primary bg-primary-soft rounded-xl" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/padron"
                onClick={() => setOpen(false)}
                className="mt-2 px-4 py-3.5 text-[15px] font-semibold text-primary-foreground bg-primary-gradient rounded-xl text-center shadow-elevated"
              >
                Consultar padrón
              </Link>
            </nav>
            <p className="mt-3 px-2 text-[11px] text-muted-foreground text-center">
              {SITE.movimiento}
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
