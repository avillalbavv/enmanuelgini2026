import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Newspaper, ArrowUpRight } from "lucide-react";
import noticias from "@/data/noticias.json";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/noticias")({
  head: () => ({
    meta: [
      { title: "Noticias — Unidos por Piribebuy" },
      { name: "description", content: "Últimas novedades de la campaña de Enmanuel Gini Orué." },
      { property: "og:title", content: "Noticias — Unidos por Piribebuy" },
      { property: "og:description", content: "Reuniones con vecinos, recorridas y actividades de campaña." },
    ],
  }),
  component: NoticiasPage,
});

function NoticiasPage() {
  const cats = useMemo(() => Array.from(new Set(noticias.map((n) => n.category))), []);
  const [activa, setActiva] = useState<string | "Todas">("Todas");
  const visibles = activa === "Todas" ? noticias : noticias.filter((n) => n.category === activa);

  return (
    <>
      <section className="relative overflow-hidden bg-hero pt-12 pb-16">
        <div className="absolute -top-32 -right-20 size-96 blob blob-1" />
        <div className="relative mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Novedades"
            title={<>Últimas <span className="text-gradient">noticias</span></>}
            description="Recorridas, reuniones con vecinos y actividades del movimiento."
          />
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
            {(["Todas", ...cats] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActiva(c)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-semibold capitalize transition-all ${
                  activa === c
                    ? "bg-primary-gradient text-primary-foreground shadow-elevated"
                    : "bg-card text-foreground/70 ring-1 ring-border hover:text-primary hover:ring-primary/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {visibles.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibles.map((n, i) => (
                <motion.article
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                  className="group rounded-3xl bg-card ring-1 ring-border p-6 shadow-soft lift flex flex-col"
                >
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-soft text-primary text-[10.5px] uppercase tracking-[0.18em] font-semibold">
                      {n.category}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(n.date).toLocaleDateString("es-PY", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-ink leading-snug flex-1">
                    {n.title}
                  </h3>
                  <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
                    {n.excerpt}
                  </p>
                  {n.url && (
                    <a
                      href={n.url}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-primary text-[13.5px] font-semibold link-underline self-start"
                    >
                      Leer más <ArrowUpRight className="size-4" />
                    </a>
                  )}
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl bg-card ring-1 ring-border p-12 text-center shadow-soft">
      <div className="mx-auto size-14 rounded-2xl bg-primary-soft text-primary grid place-items-center">
        <Newspaper className="size-6" />
      </div>
      <h3 className="mt-4 font-display text-xl text-ink font-semibold">Pronto habrá novedades</h3>
      <p className="mt-2 text-muted-foreground text-[14px] max-w-md mx-auto">
        Estamos preparando las próximas publicaciones. Volvé pronto.
      </p>
    </div>
  );
}
