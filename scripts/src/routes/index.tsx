import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Search, FileText, Users, Newspaper, Phone, Vote, MapPin,
  ArrowRight, ExternalLink, Sparkles, Instagram, Play,
} from "lucide-react";
import inicioImg from "@/assets/inicio.jpg";
import logoGrande from "@/assets/logo-grande.png";
import { SITE } from "@/lib/site";
import { Countdown } from "@/components/Countdown";
import { SectionHeading } from "@/components/SectionHeading";
import { FadeIn } from "@/components/FadeIn";
import publicaciones from "@/data/publicaciones.json";
import { ReelCard } from "@/components/ReelCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Enmanuel Gini Orué — Intendente de Piribebuy" },
      { name: "description", content: SITE.resena },
      { property: "og:title", content: `${SITE.candidato} — ${SITE.movimiento}` },
      { property: "og:description", content: SITE.slogan },
      { property: "og:image", content: "/og-share.jpg" },
      { name: "twitter:image", content: "/og-share.jpg" },
    ],
  }),
  component: HomePage,
});

const accesos = [
  { to: "/padron", label: "Padrón", desc: "Consultá tu mesa", icon: Search },
  { to: "/biografia", label: "Biografía", desc: "Trayectoria", icon: FileText },
  { to: "/propuestas", label: "Propuestas", desc: "Plan municipal", icon: Sparkles },
  { to: "/equipo", label: "Mi Equipo", desc: "Concejales", icon: Users },
  { to: "/noticias", label: "Noticias", desc: "Lo último", icon: Newspaper },
  { to: "/practica-voto", label: "Practicá tu voto", desc: "Simulador", icon: Vote },
  { to: "/info-electoral", label: "Info electoral", desc: "Guía completa", icon: MapPin },
  { to: "/contacto", label: "Contacto", desc: "Escribinos", icon: Phone },
] as const;

function HomePage() {
  return (
    <>
      <Hero />
      <PadronCTA />
      <CountdownStrip />
      <Publicaciones />
      <AccesosRapidos />
      <SobreCandidato />
      <CierreCTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 size-[28rem] blob blob-1" />
      <div className="absolute -bottom-40 -left-40 size-[26rem] blob blob-2" />

      <div className="relative mx-auto max-w-7xl px-4 pt-12 md:pt-20 pb-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <span className="inline-flex items-center gap-2 glass rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-primary">
              <span className="pulse-dot" />
              Candidato a Intendente · Piribebuy 2026
            </span>

            <h1 className="mt-5 font-display text-[42px] sm:text-6xl lg:text-7xl font-semibold tracking-[-0.025em] leading-[1.02] text-ink">
              Abog. Enmanuel{" "}
              <span className="text-gradient">Gini Orué</span>
            </h1>

            <p className="mt-4 font-display text-2xl md:text-3xl text-primary-dark/90 font-medium">
              Unidos por Piribebuy
            </p>

            <p className="mt-3 text-[17px] md:text-lg text-foreground/80 max-w-xl leading-relaxed">
              {SITE.slogan}
            </p>

            <p className="mt-5 text-[15px] text-muted-foreground max-w-xl leading-relaxed">
              {SITE.resena}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/padron"
                className="group inline-flex items-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground px-5 py-3.5 text-[14.5px] font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5"
              >
                <Search className="size-4" />
                Consultar padrón
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/propuestas"
                className="inline-flex items-center gap-2 rounded-2xl bg-white text-ink ring-1 ring-border px-5 py-3.5 text-[14.5px] font-semibold shadow-soft hover:shadow-elevated transition-all hover:-translate-y-0.5"
              >
                Ver propuestas
              </Link>
              <Link
                to="/practica-voto"
                className="inline-flex items-center gap-2 rounded-2xl glass px-5 py-3.5 text-[14.5px] font-semibold text-primary-dark hover:bg-white/80 transition-all hover:-translate-y-0.5"
              >
                <Vote className="size-4" />
                Practicá tu voto
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-[14.5px] font-semibold text-ink/80 hover:text-primary transition-colors"
              >
                Contactar al equipo →
              </Link>
            </div>
          </motion.div>

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] max-w-md mx-auto">
              {/* Background frame */}
              <div className="absolute -inset-4 bg-primary-gradient rounded-[2.5rem] opacity-25 blur-2xl" />
              <div className="absolute inset-0 bg-primary-gradient rounded-[2rem] rotate-2" />
              <div className="relative size-full rounded-[2rem] overflow-hidden shadow-ring ring-1 ring-white/20">
                <img
                  src={inicioImg}
                  alt="Abog. Enmanuel Gini Orué"
                  className="size-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-dark/80 via-primary-dark/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="rounded-2xl bg-white/95 ring-1 ring-white/40 backdrop-blur px-4 py-3 shadow-elevated">
                    <img
                      src={logoGrande}
                      alt="Enmanuel Gini · Intendente · Lista 2"
                      className="h-12 md:h-14 w-auto mx-auto"
                    />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -8 }}
                animate={{ opacity: 1, y: 0, rotate: -6 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -top-4 -left-6 glass rounded-2xl px-4 py-3 shadow-elevated hidden md:block"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Piribebuy</div>
                <div className="font-display text-base text-ink font-semibold">Cordillera, PY</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CountdownStrip() {
  return (
    <section className="relative -mt-6 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="glass rounded-3xl p-6 md:p-10 shadow-elevated relative overflow-hidden">
          <div className="absolute inset-0 opacity-50 pointer-events-none"
               style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(196,0,26,0.08), transparent 70%)" }} />
          <div className="relative">
            <Countdown targetISO={SITE.fechaElecciones} />
          </div>
        </div>
      </div>
    </section>
  );
}

function AccesosRapidos() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Navegación rápida"
          title={<>Todo lo que necesitás <span className="text-gradient">en un toque</span></>}
          description="Accedé al padrón, conocé al candidato y enterate de cada propuesta."
        />
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {accesos.map((a, i) => (
            <motion.div
              key={a.to}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={a.to}
                className="group block h-full lift bg-card rounded-2xl p-5 ring-1 ring-border hover:ring-primary/30 shadow-soft"
              >
                <div className="flex items-start justify-between">
                  <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center group-hover:bg-primary-gradient group-hover:text-primary-foreground transition-all">
                    <a.icon className="size-5" strokeWidth={2.2} />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4 font-display text-lg font-semibold text-ink">{a.label}</div>
                <div className="mt-1 text-[13px] text-muted-foreground">{a.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SobreCandidato() {
  const highlights = [
    { num: "+15", label: "años de gestión comunitaria" },
    { num: "2010", label: "Concejal Municipal de Piribebuy" },
    { num: "6×", label: "directivo del Club 12 de Agosto" },
  ];
  return (
    <section className="py-20 md:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-soft/30 to-transparent" />
      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="relative">
            <div className="absolute -inset-3 bg-primary-gradient rounded-3xl opacity-20 blur-xl" />
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated ring-1 ring-white/20">
              <img
                src={new URL("@/assets/intro.jpg", import.meta.url).href}
                alt="Enmanuel Gini Orué con vecinos de Piribebuy"
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </FadeIn>
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-[11px] font-semibold uppercase tracking-[0.2em]">
            Sobre el candidato
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold tracking-tight text-ink leading-[1.05]">
            Un hijo de <span className="text-gradient">Piribebuy</span>, comprometido con su gente.
          </h2>
          <p className="mt-5 text-[15.5px] text-foreground/80 leading-relaxed">
            Nacido y criado en Piribebuy, abogado por la Facultad de Derecho de la UNA, hijo del
            mecánico Carlos Darío Gini y de la profesora Adaluz Orué, fundadora del Instituto de
            Formación Docente. Casado y padre de Thais Nicole y Paula Adaluz.
          </p>
          <p className="mt-3 text-[15.5px] text-foreground/80 leading-relaxed">
            Con experiencia comunitaria, partidaria, municipal y deportiva, impulsa para 2026 un
            proyecto de participación ciudadana y transformación de Piribebuy.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {highlights.map((h) => (
              <div key={h.label} className="rounded-2xl bg-card ring-1 ring-border p-4 shadow-soft">
                <div className="font-display text-2xl md:text-3xl text-gradient font-semibold">{h.num}</div>
                <div className="mt-1 text-[12px] text-muted-foreground leading-tight">{h.label}</div>
              </div>
            ))}
          </div>

          <Link
            to="/biografia"
            className="mt-8 inline-flex items-center gap-2 text-primary font-semibold link-underline"
          >
            Conocer toda la trayectoria <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PadronCTA() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-5">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-primary-gradient text-primary-foreground p-8 md:p-10 shadow-elevated h-full">
            <div className="absolute inset-0 opacity-25"
                 style={{ background: "radial-gradient(60% 80% at 100% 0%, rgba(255,255,255,0.5), transparent 60%)" }} />
            <div className="relative">
              <div className="size-12 rounded-2xl bg-white/20 ring-1 ring-white/30 grid place-items-center backdrop-blur">
                <Search className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-3xl md:text-4xl font-semibold leading-tight">
                Consultá el padrón partidario
              </h3>
              <p className="mt-3 text-[15px] opacity-90 max-w-md leading-relaxed">
                Ingresá tu cédula y conocé al instante tu mesa, orden, local de votación y referencia con mapa.
              </p>
              <Link
                to="/padron"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white text-primary-dark px-5 py-3 text-[14px] font-semibold hover:bg-white/95 transition-all hover:-translate-y-0.5 shadow-elevated"
              >
                Buscar mi cédula <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="rounded-3xl bg-card ring-1 ring-border p-8 md:p-10 shadow-soft h-full">
            <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center">
              <ExternalLink className="size-5" />
            </div>
            <h3 className="mt-5 font-display text-2xl md:text-3xl font-semibold leading-tight text-ink">
              Padrón nacional oficial
            </h3>
            <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
              Verificá tus datos oficiales en el Registro Cívico Permanente de la Justicia Electoral.
            </p>
            <a
              href={SITE.padronNacionalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink text-white px-5 py-3 text-[14px] font-semibold hover:bg-primary-dark transition-colors"
            >
              Consultar padrón nacional <ExternalLink className="size-4" />
            </a>
            <p className="mt-4 text-[12px] text-muted-foreground/80 italic">
              Fuente oficial: Tribunal Superior de Justicia Electoral (rcp.tsje.gov.py).
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Publicaciones() {
  return (
    <section className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-[11px] font-semibold uppercase tracking-[0.2em]">
              <Instagram className="size-3" /> Últimas publicaciones
            </span>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold tracking-tight text-ink">
              Últimas <span className="text-gradient">publicaciones</span>
            </h2>
            <p className="mt-2 text-muted-foreground text-[14.5px] max-w-xl">
              Conocé las actividades, recorridos y mensajes más recientes de Enmanuel Gini.
            </p>
          </div>
          <a
            href={SITE.redes.instagram}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-semibold link-underline"
          >
            Seguir en Instagram <ArrowRight className="size-4" />
          </a>
        </div>

        <div className="-mx-4 overflow-x-auto scrollbar-hide snap-x-mandatory">
          <div className="flex gap-4 px-4 pb-4">
            {publicaciones.slice(0, 8).map((p) => (
              <ReelCard key={p.id} url={p.url} date={p.date} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CierreCTA() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-5xl relative overflow-hidden rounded-[2rem] bg-ink text-white p-10 md:p-16 shadow-elevated">
        <div className="absolute -top-20 -right-20 size-80 blob blob-1 opacity-40" />
        <div className="absolute -bottom-20 -left-20 size-80 blob blob-2 opacity-40" />
        <div className="relative grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-3">
            <h3 className="font-display text-3xl md:text-5xl font-semibold leading-[1.05]">
              Construyamos juntos el <span className="text-gradient">Piribebuy</span> que todos queremos.
            </h3>
            <p className="mt-4 text-white/75 max-w-xl leading-relaxed">
              Sumate al movimiento. Tu voz y tu compromiso son la energía que mueve esta propuesta.
            </p>
          </div>
          <div className="md:col-span-2 flex flex-col gap-3">
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-6 py-4 font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5"
            >
              Contactar al equipo <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/practica-voto"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 ring-1 ring-white/20 px-6 py-4 font-semibold hover:bg-white/15 transition-colors"
            >
              <Vote className="size-4" /> Practicar voto
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
