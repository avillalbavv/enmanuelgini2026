import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  GraduationCap, Heart, Scale, Users, Trophy, Building2, Sparkles, ArrowRight,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { SectionHeading } from "@/components/SectionHeading";

export const Route = createFileRoute("/biografia")({
  head: () => ({
    meta: [
      { title: "Biografía y trayectoria — Enmanuel Gini Orué" },
      { name: "description", content: "Trayectoria comunitaria, partidaria, municipal y deportiva del Abog. Enmanuel Gini Orué, candidato a Intendente de Piribebuy." },
      { property: "og:title", content: "Biografía y trayectoria — Enmanuel Gini Orué" },
      { property: "og:description", content: "Conocé la historia y trayectoria del candidato a Intendente de Piribebuy." },
      { property: "og:image", content: "/og-share.jpg" },
    ],
  }),
  component: BiografiaPage,
});

interface Hito {
  year: string;
  title: string;
  desc: string;
  icon: typeof Heart;
}

const HITOS: Hito[] = [
  { year: "Origen", title: "Nacido y criado en Piribebuy", desc: "Hijo de Carlos Darío Gini, mecánico, y de la profesora Adaluz Orué, fundadora del Instituto de Formación Docente de Piribebuy.", icon: Heart },
  { year: "Familia", title: "Casado y padre de Thais Nicole y Paula Adaluz", desc: "Su familia es el motor cotidiano que sostiene su compromiso con la ciudad.", icon: Heart },
  { year: "Formación", title: "Educación en Piribebuy", desc: "Primaria en el Colegio Santo Domingo y un año en la Escuela Maestro Fermín López (Escuela 46). Secundaria en el Colegio Nacional Piribebuy.", icon: GraduationCap },
  { year: "UNA", title: "Abogado por la Facultad de Derecho de la UNA", desc: "Formación profesional en una de las casas de estudios más prestigiosas del país.", icon: Scale },
  { year: "Joven", title: "Participación comunitaria desde joven", desc: "Centros de estudiantes y espacios sociales: el primer entrenamiento de la gestión cercana.", icon: Users },
  { year: "ANR", title: "Militancia activa en el Partido Colorado", desc: "Miembro titular y Vicepresidente de la Seccional Colorada “Rogelio R. Benítez”. Convencional titular de la Seccional N° 218.", icon: Building2 },
  { year: "2010-2015", title: "Concejal Municipal de Piribebuy", desc: "Cinco años de trabajo institucional en el Concejo Municipal con una mirada de ciudad.", icon: Building2 },
  { year: "Club 12", title: "Dirigente del Club 12 de Agosto", desc: "Tres veces Vicepresidente y tres veces Presidente. En 2019 celebró el campeonato del fútbol de Piribebuy.", icon: Trophy },
  { year: "2026", title: "Candidato a Intendente de Piribebuy", desc: "Impulsa un proyecto de participación ciudadana y transformación con cercanía, gestión y compromiso.", icon: Sparkles },
];

function BiografiaPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero pt-12 pb-20">
        <div className="absolute -top-32 -right-20 size-96 blob blob-1" />
        <div className="relative mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Biografía y trayectoria"
            title={<>Una vida al servicio de <span className="text-gradient">Piribebuy</span></>}
            description="Familia, formación, militancia, gestión municipal y deporte: la trayectoria que sostiene la propuesta del Abog. Enmanuel Gini Orué."
          />
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl relative">
          {/* Línea vertical */}
          <div className="absolute left-5 md:left-1/2 top-2 bottom-2 w-px bg-gradient-to-b from-primary/30 via-primary-dark/20 to-transparent md:-translate-x-px" />

          <ul className="space-y-16 md:space-y-20">
            {HITOS.map((h, i) => (
              <Hito key={i} hito={h} index={i} />
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary-gradient text-primary-foreground p-10 text-center shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 opacity-30"
               style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(255,255,255,0.3), transparent 70%)" }} />
          <div className="relative">
            <h3 className="font-display text-3xl md:text-4xl font-semibold">{SITE.slogan}</h3>
            <Link to="/propuestas" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white text-primary-dark px-5 py-3 font-semibold hover:bg-white/95 transition-all hover:-translate-y-0.5 shadow-elevated">
              Ver propuestas <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Hito({ hito, index }: { hito: Hito; index: number }) {
  const Icon = hito.icon;
  const isLeft = index % 2 === 0;
  return (
    <motion.li
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-16 md:pl-0 md:grid md:grid-cols-2 md:gap-16 items-start"
    >
      {/* Dot */}
      <div className="absolute left-0 md:left-1/2 top-1.5 -translate-x-0 md:-translate-x-1/2 size-10 rounded-2xl bg-primary-gradient text-primary-foreground grid place-items-center shadow-elevated ring-4 ring-background z-10">
        <Icon className="size-4.5" />
      </div>

      <div className={isLeft ? "md:text-right md:pr-12" : "md:col-start-2 md:pl-12"}>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-[10.5px] font-semibold uppercase tracking-[0.2em]">
          {hito.year}
        </span>
        <h3 className="mt-3 font-display text-xl md:text-2xl font-semibold text-ink leading-tight">
          {hito.title}
        </h3>
        <p className="mt-2 text-[14.5px] text-muted-foreground leading-relaxed">{hito.desc}</p>
      </div>
    </motion.li>
  );
}
