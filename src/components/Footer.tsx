import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle, Mail } from "lucide-react";
import logoGrande from "@/assets/logo-grande.png";
import { SITE, NAV_ITEMS } from "@/lib/site";

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.5 3a4.5 4.5 0 0 0 4.5 4.5v3.2a7.7 7.7 0 0 1-4.5-1.45v6.6a6.25 6.25 0 1 1-6.25-6.25c.31 0 .61.02.91.07v3.36a3 3 0 1 0 2.09 2.86V3h3.25Z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 bg-white border-t border-border">
      {/* Acento superior rojo */}
      <div className="h-1 w-full bg-primary-gradient" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 text-foreground">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="rounded-2xl bg-white ring-1 ring-border p-4 inline-block shadow-soft">
              <img
                src={logoGrande}
                alt={`${SITE.candidato} · ${SITE.movimiento}`}
                className="h-16 md:h-20 w-auto"
              />
            </div>
            <div className="mt-4 text-[12px] uppercase tracking-[0.2em] text-primary font-semibold">
              {SITE.movimiento}
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-foreground/75 max-w-md">
              {SITE.slogan} Una propuesta cercana, ordenada y participativa para Piribebuy.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={SITE.redes.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                 className="size-10 rounded-xl bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground ring-1 ring-border grid place-items-center transition-colors">
                <Instagram className="size-4.5" />
              </a>
              <a href={SITE.redes.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                 className="size-10 rounded-xl bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground ring-1 ring-border grid place-items-center transition-colors">
                <Facebook className="size-4.5" />
              </a>
              <a href={SITE.redes.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                 className="size-10 rounded-xl bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground ring-1 ring-border grid place-items-center transition-colors">
                <TikTokIcon className="size-4.5" />
              </a>
              {SITE.redes.whatsapp && (
                <a href={`https://wa.me/${SITE.redes.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                   className="size-10 rounded-xl bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground ring-1 ring-border grid place-items-center transition-colors">
                  <MessageCircle className="size-4.5" />
                </a>
              )}
              {SITE.redes.email && (
                <a href={`mailto:${SITE.redes.email}`} aria-label="Correo"
                   className="size-10 rounded-xl bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground ring-1 ring-border grid place-items-center transition-colors">
                  <Mail className="size-4.5" />
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-[12px] uppercase tracking-[0.22em] text-muted-foreground font-sans font-semibold">Navegación</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14.5px]">
              {NAV_ITEMS.map((it) => (
                <li key={it.to}>
                  <Link to={it.to} className="text-foreground/80 hover:text-primary hover:underline underline-offset-4">
                    {it.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/padron" className="text-foreground/80 hover:text-primary hover:underline underline-offset-4">
                  Padrón partidario
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-[12px] uppercase tracking-[0.22em] text-muted-foreground font-sans font-semibold">Síguenos</h3>
            <p className="mt-4 text-[14px] text-foreground/75 leading-relaxed">
              Sumate a la conversación y enterate primero de cada actividad del movimiento.
            </p>
            <a
              href={SITE.redes.instagram}
              target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-gradient text-primary-foreground px-4 py-2.5 text-[13.5px] font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5"
            >
              <Instagram className="size-4" /> @enmanuelgini
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row gap-3 items-center justify-between text-[12.5px] text-muted-foreground">
          <p>© {year} {SITE.candidato}. Todos los derechos reservados.</p>
          <p>Piribebuy · Departamento de Cordillera · Paraguay</p>
        </div>
        <div className="mt-3 text-center text-[12px] text-muted-foreground">
          Desarrollo Web: <span className="font-semibold text-foreground">Alejandro J. Villalba</span>
        </div>
      </div>
    </footer>
  );
}
