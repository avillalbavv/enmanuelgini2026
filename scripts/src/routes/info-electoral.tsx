import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, IdCard, Search, MapPin, Vote, ExternalLink, AlertCircle, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/info-electoral")({
  head: () => ({
    meta: [
      { title: "Info electoral — Piribebuy 2026" },
      { name: "description", content: "Guía simple: padrón, documento, mesa, local y práctica de voto para el 7 de junio de 2026." },
      { property: "og:title", content: "Info electoral — Piribebuy 2026" },
      { property: "og:description", content: "Todo lo que necesitás saber para votar el 7 de junio." },
    ],
  }),
  component: InfoElectoralPage,
});

const PASOS = [
  { Icon: Search, t: "Verificá tu padrón partidario", d: "Buscá tu cédula en la consulta del padrón cargado por el equipo." },
  { Icon: IdCard, t: "Verificá el padrón nacional", d: "Confirmá tus datos oficiales en el sistema de Justicia Electoral." },
  { Icon: CheckCircle2, t: "Llevá tu documento", d: "Cédula de identidad vigente. Sin documento no podés votar." },
  { Icon: MapPin, t: "Revisá mesa, orden y local", d: "Conocé con anticipación dónde, en qué mesa y con qué orden votás." },
  { Icon: Vote, t: "Practicá el voto", d: "Usá el simulador oficial para familiarizarte con la máquina." },
  { Icon: ExternalLink, t: "Consultá canales oficiales", d: "Información definitiva siempre desde Justicia Electoral." },
];

function InfoElectoralPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero pt-12 pb-16">
        <div className="absolute -top-32 -right-20 size-96 blob blob-1" />
        <div className="relative mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Información electoral"
            title={<>Todo lo que necesitás saber para <span className="text-gradient">votar el 7 de junio</span></>}
            description="Una guía simple, paso a paso, para llegar preparado al día de la elección."
          />
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PASOS.map((p, i) => (
            <div key={p.t} className="rounded-3xl bg-card ring-1 ring-border p-6 shadow-soft lift">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary-gradient text-primary-foreground grid place-items-center font-display font-semibold tabular-nums shrink-0">
                  {i + 1}
                </div>
                <p.Icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink leading-snug">{p.t}</h3>
              <p className="mt-2 text-[14px] text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-4">
          <Link to="/padron" className="rounded-3xl bg-primary-gradient text-primary-foreground p-7 shadow-elevated lift block">
            <Search className="size-6" />
            <h3 className="mt-4 font-display text-xl font-semibold">Padrón partidario</h3>
            <p className="mt-1.5 text-[13.5px] opacity-90">Buscá tu mesa con tu cédula.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold">Ir <ArrowRight className="size-4" /></span>
          </Link>
          <a href={SITE.padronNacionalUrl} target="_blank" rel="noopener noreferrer"
             className="rounded-3xl bg-ink text-white p-7 shadow-elevated lift block">
            <ExternalLink className="size-6" />
            <h3 className="mt-4 font-display text-xl font-semibold">Padrón nacional</h3>
            <p className="mt-1.5 text-[13.5px] opacity-80">Justicia Electoral oficial.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold">Abrir <ExternalLink className="size-4" /></span>
          </a>
          <Link to="/practica-voto" className="rounded-3xl bg-card ring-1 ring-border p-7 shadow-soft lift block">
            <Vote className="size-6 text-primary" />
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">Practicá tu voto</h3>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">Simulador de la máquina.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">Practicar <ArrowRight className="size-4" /></span>
          </Link>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary-soft border border-primary/20 p-6 md:p-8 flex items-start gap-4">
          <div className="size-11 rounded-xl bg-white text-primary grid place-items-center shrink-0 shadow-soft">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-primary-dark">Aclaración importante</h3>
            <p className="mt-1.5 text-[14.5px] text-foreground/85 leading-relaxed">
              Para datos oficiales definitivos, usá siempre fuentes oficiales del Tribunal Superior de
              Justicia Electoral. La consulta del padrón en este sitio corresponde al padrón partidario
              cargado por el equipo del movimiento.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
