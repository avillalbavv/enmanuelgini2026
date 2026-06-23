import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import equipo from "@/data/equipo.json";
import { SectionHeading } from "@/components/SectionHeading";

// Importes estáticos de las 12 fotos del equipo
import e1 from "@/assets/equipo/opcion-01.jpg";
import e2 from "@/assets/equipo/opcion-02.jpg";
import e3 from "@/assets/equipo/opcion-03.jpg";
import e4 from "@/assets/equipo/opcion-04.jpg";
import e5 from "@/assets/equipo/opcion-05.jpg";
import e6 from "@/assets/equipo/opcion-06.jpg";
import e7 from "@/assets/equipo/opcion-07.jpg";
import e8 from "@/assets/equipo/opcion-08.jpg";
import e9 from "@/assets/equipo/opcion-09.jpg";
import e10 from "@/assets/equipo/opcion-10.jpg";
import e11 from "@/assets/equipo/opcion-11.jpg";
import e12 from "@/assets/equipo/opcion-12.jpg";

const FOTOS = [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12];

export const Route = createFileRoute("/equipo")({
  head: () => ({
    meta: [
      { title: "Mi Equipo — Concejales · Unidos por Piribebuy" },
      { name: "description", content: "Conocé al equipo de candidatos a Concejales del movimiento Unidos por Piribebuy." },
      { property: "og:title", content: "Mi Equipo — Unidos por Piribebuy" },
      { property: "og:description", content: "Concejales y dirigentes que acompañan a Enmanuel Gini Orué." },
    ],
  }),
  component: EquipoPage,
});

function EquipoPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero pt-12 pb-16">
        <div className="absolute -top-32 right-10 size-96 blob blob-1" />
        <div className="relative mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Mi equipo"
            title={<>El equipo que <span className="text-gradient">camina con vos</span></>}
            description="Vecinos, dirigentes y referentes comunitarios que acompañan al Abog. Enmanuel Gini Orué en este proyecto."
          />
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 md:gap-x-10 md:gap-y-14">
          {equipo.map((m, i) => (
            <motion.figure
              key={m.nombre}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 8) * 0.04 }}
              className="group flex flex-col items-center text-center"
            >
              <div
                className="relative aspect-[4/5] w-full max-w-[240px] rounded-3xl overflow-hidden ring-1 ring-border shadow-elevated"
                style={{
                  background:
                    "linear-gradient(160deg, oklch(0.985 0.012 60) 0%, oklch(0.95 0.035 18) 100%)",
                }}
              >
                <img
                  src={FOTOS[i] ?? FOTOS[0]}
                  alt={m.nombre}
                  loading="lazy"
                  className="size-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-primary/10 rounded-3xl" />
              </div>
              <figcaption className="mt-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                  {m.cargo}
                </span>
                <div className="mt-1 font-display text-lg font-semibold leading-tight text-ink">
                  {m.nombre}
                </div>
                {m.descripcion && (
                  <p className="mt-1 text-[12.5px] text-muted-foreground line-clamp-2">{m.descripcion}</p>
                )}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>
    </>
  );
}
