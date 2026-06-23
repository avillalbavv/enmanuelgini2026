import { createFileRoute, Link } from "@tanstack/react-router";
import { Vote, MonitorSmartphone, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/practica-voto")({
  head: () => ({
    meta: [
      { title: "Practicá tu voto — Piribebuy 2026" },
      { name: "description", content: "Practicá el uso de la máquina de votación antes del día de las elecciones." },
      { property: "og:title", content: "Practicá tu voto — Piribebuy 2026" },
      { property: "og:description", content: "Simulá la votación y llegá tranquilo el 7 de junio." },
    ],
  }),
  component: PracticaVotoPage,
});

const SIM_URL = "https://tsje.gov.py/educacion-electoral/simulador-de-votacion.html";

function PracticaVotoPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero pt-12 pb-16">
        <div className="absolute -top-32 -left-20 size-96 blob blob-1" />
        <div className="relative mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Educación electoral"
            title={<>Practicá tu <span className="text-gradient">voto</span></>}
            description="Practicá el uso de la máquina de votación antes del día de las elecciones. Llegá tranquilo el 7 de junio."
          />
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-4 mb-10">
          {[
            { Icon: Vote, t: "1. Practicá", d: "Simulá tu voto cuantas veces necesites, sin presión." },
            { Icon: MonitorSmartphone, t: "2. Familiarizate", d: "Conocé los pasos y la pantalla de la máquina." },
            { Icon: Sparkles, t: "3. Llegá listo", d: "El día de la elección, votá rápido y con seguridad." },
          ].map((s) => (
            <div key={s.t} className="rounded-3xl bg-card ring-1 ring-border p-6 shadow-soft">
              <div className="size-11 rounded-2xl bg-primary-soft text-primary grid place-items-center">
                <s.Icon className="size-5" />
              </div>
              <div className="mt-4 font-display text-lg font-semibold text-ink">{s.t}</div>
              <p className="mt-1 text-[14px] text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-5xl rounded-[2rem] overflow-hidden ring-1 ring-border shadow-elevated bg-card">
          <div className="bg-primary-gradient text-primary-foreground p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-85 font-semibold">Simulador oficial</p>
              <h3 className="font-display text-xl md:text-2xl font-semibold mt-1">Justicia Electoral · Paraguay</h3>
            </div>
            <a
              href={SIM_URL}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white text-primary-dark px-3.5 py-2 text-[12.5px] font-semibold hover:bg-white/95 transition-colors"
            >
              Abrir aparte <ExternalLink className="size-3.5" />
            </a>
          </div>
          <div className="aspect-[4/3] sm:aspect-[16/10] bg-muted">
            <iframe
              src={SIM_URL}
              title="Simulador de votación"
              className="w-full h-full border-0"
              loading="lazy"
              allow="fullscreen"
            />
          </div>
        </div>

        <div className="mx-auto max-w-5xl mt-10 grid sm:grid-cols-2 gap-4">
          <Link to="/padron" className="rounded-3xl bg-card ring-1 ring-border p-6 shadow-soft lift flex items-center justify-between gap-4 group">
            <div>
              <h4 className="font-display text-lg font-semibold text-ink">Consultá tu padrón</h4>
              <p className="mt-1 text-[14px] text-muted-foreground">Conocé tu mesa antes del día.</p>
            </div>
            <ArrowRight className="size-5 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/info-electoral" className="rounded-3xl bg-card ring-1 ring-border p-6 shadow-soft lift flex items-center justify-between gap-4 group">
            <div>
              <h4 className="font-display text-lg font-semibold text-ink">Info electoral completa</h4>
              <p className="mt-1 text-[14px] text-muted-foreground">Guía de qué llevar y cómo votar.</p>
            </div>
            <ArrowRight className="size-5 text-primary group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
