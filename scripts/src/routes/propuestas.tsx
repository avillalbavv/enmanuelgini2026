import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Construction, Building2, Leaf, Shield, GraduationCap, Landmark, Trophy, FileCheck2, ArrowRight,
} from "lucide-react";
import propuestas from "@/data/propuestas.json";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/propuestas")({
  head: () => ({
    meta: [
      { title: "Propuestas para Piribebuy — Enmanuel Gini" },
      { name: "description", content: "Plan municipal: infraestructura, servicios, ambiente, seguridad, educación, turismo, deporte y transparencia." },
      { property: "og:title", content: "Propuestas para Piribebuy" },
      { property: "og:description", content: "Cercanía, gestión y compromiso. Conocé el plan municipal completo." },
    ],
  }),
  component: PropuestasPage,
});

const ICONS: Record<string, typeof Construction> = {
  "Infraestructura y movilidad": Construction,
  "Servicios municipales y atención al ciudadano": Building2,
  "Ambiente, agua y saneamiento": Leaf,
  "Seguridad y convivencia": Shield,
  "Educación, juventud y empleo": GraduationCap,
  "Turismo, cultura y patrimonio": Landmark,
  "Deporte y recreación": Trophy,
  "Transparencia y gestión": FileCheck2,
};

function PropuestasPage() {
  const categorias = useMemo(
    () => Array.from(new Set(propuestas.map((p) => p.categoria))),
    []
  );
  const [activa, setActiva] = useState<string | "Todas">("Todas");
  const visibles = activa === "Todas" ? propuestas : propuestas.filter((p) => p.categoria === activa);

  return (
    <>
      <section className="relative overflow-hidden bg-hero pt-12 pb-16">
        <div className="absolute -top-32 -left-20 size-96 blob blob-1" />
        <div className="relative mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Plan municipal"
            title={<>Propuestas para <span className="text-gradient">Piribebuy</span></>}
            description="Una hoja de ruta municipal cercana, ordenada y realizable. Conocé las prioridades por área."
          />
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {(["Todas", ...categorias] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActiva(c)}
                className={`px-4 py-2 rounded-full text-[12.5px] font-semibold transition-all ${
                  activa === c
                    ? "bg-primary-gradient text-primary-foreground shadow-elevated"
                    : "bg-card text-foreground/70 ring-1 ring-border hover:ring-primary/30 hover:text-primary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibles.map((p, i) => {
              const Icon = ICONS[p.categoria] ?? Building2;
              return (
                <motion.article
                  key={`${p.categoria}-${p.titulo}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                  className="group relative rounded-3xl bg-card ring-1 ring-border p-6 shadow-soft lift overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 size-32 rounded-full bg-primary-soft opacity-0 group-hover:opacity-100 blur-2xl transition-opacity" />
                  <div className="relative">
                    <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center group-hover:bg-primary-gradient group-hover:text-primary-foreground transition-all">
                      <Icon className="size-5" strokeWidth={2.2} />
                    </div>
                    <span className="mt-4 inline-block text-[10.5px] uppercase tracking-[0.18em] font-semibold text-primary">
                      {p.categoria}
                    </span>
                    <h3 className="mt-1.5 font-display text-xl font-semibold text-ink leading-tight">
                      {p.titulo}
                    </h3>
                    <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
                      {p.descripcion}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link to="/contacto" className="inline-flex items-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground px-6 py-3.5 font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5">
              Sumá tu propuesta <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
