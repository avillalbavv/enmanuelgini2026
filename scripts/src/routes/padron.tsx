import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, AlertCircle, Loader2, ExternalLink, X, CheckCircle2, ShieldAlert } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/padron")({
  head: () => ({
    meta: [
      { title: "Consulta de padrón partidario — Enmanuel Gini" },
      { name: "description", content: "Buscá tu mesa, orden y local de votación con tu número de cédula. Padrón partidario del movimiento Unidos por Piribebuy." },
      { property: "og:title", content: "Consulta de padrón partidario — Piribebuy 2026" },
      { property: "og:description", content: "Encontrá tu mesa y local de votación con tu cédula." },
    ],
  }),
  component: PadronPage,
});

interface Registro {
  ci: string | number;
  nombre?: string;
  apellido?: string;
  nombre_completo?: string;
  mesa: string | number;
  orden: string | number;
  local_votacion: string;
  seccional?: string;
  referencia?: string;
  maps_url?: string;
}

function normalizeCI(input: string) {
  return input.replace(/\D/g, "");
}

// Rate limiter sencillo: máx 12 búsquedas por minuto en el navegador.
const RATE_LIMIT = 12;
const WINDOW_MS = 60_000;

function PadronPage() {
  const [ci, setCi] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Registro | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const padronRef = useRef<Map<string, Registro> | null>(null);
  const callsRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function ensureData() {
    if (padronRef.current) return padronRef.current;
    const res = await fetch("/padron.json");
    if (!res.ok) throw new Error("No se pudo cargar el padrón");
    const arr: Registro[] = await res.json();
    const map = new Map<string, Registro>();
    for (const r of arr) {
      map.set(normalizeCI(String(r.ci)), r);
    }
    padronRef.current = map;
    setDataLoaded(true);
    return map;
  }

  useEffect(() => {
    // Pre-carga en idle para que la primera búsqueda sea instantánea
    const idle = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 800));
    idle(() => { ensureData().catch(() => {}); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleaned = normalizeCI(ci);
    if (!cleaned) {
      setError("Ingresá tu número de cédula.");
      return;
    }
    if (cleaned.length < 5 || cleaned.length > 9) {
      setError("La cédula debe tener entre 5 y 9 dígitos.");
      return;
    }

    // Rate limit
    const now = Date.now();
    callsRef.current = callsRef.current.filter((t) => now - t < WINDOW_MS);
    if (callsRef.current.length >= RATE_LIMIT) {
      setError("Demasiadas consultas seguidas. Esperá unos segundos.");
      return;
    }
    callsRef.current.push(now);

    setLoading(true);
    setSearched(false);
    try {
      const map = await ensureData();
      // pequeña espera para mostrar el loader
      await new Promise((r) => setTimeout(r, 250));
      const found = map.get(cleaned);
      setResult(found ?? null);
      setSearched(true);
    } catch (err) {
      setError("No se pudo cargar la base. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setCi("");
    setResult(null);
    setSearched(false);
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <>
      <section className="relative overflow-hidden bg-hero pt-12 pb-20">
        <div className="absolute -top-32 -right-32 size-96 blob blob-1" />
        <div className="absolute -bottom-32 -left-32 size-80 blob blob-2" />

        <div className="relative mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="Padrón partidario"
            title={<>Consultá tu <span className="text-gradient">mesa y local</span> de votación</>}
            description="Ingresá tu número de cédula, sin puntos ni espacios. La búsqueda es instantánea."
          />

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-10 glass rounded-3xl p-3 md:p-4 shadow-elevated"
          >
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-primary/70 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={ci}
                  onChange={(e) => setCi(normalizeCI(e.target.value).slice(0, 9))}
                  placeholder="Ej: 1358482"
                  aria-label="Número de cédula"
                  className="w-full rounded-2xl bg-white border-0 ring-1 ring-border focus:ring-primary/40 focus:outline-none pl-12 pr-12 py-4 text-lg font-semibold tracking-wider text-ink placeholder:text-muted-foreground/60 placeholder:font-normal placeholder:tracking-normal transition-shadow"
                />
                {ci && (
                  <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Limpiar"
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-lg hover:bg-muted grid place-items-center text-muted-foreground hover:text-ink transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground px-7 py-4 font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait"
              >
                {loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 mx-1 flex items-center gap-2 rounded-xl bg-destructive/10 text-destructive px-4 py-2.5 text-[13.5px] font-medium"
              >
                <AlertCircle className="size-4 shrink-0" /> {error}
              </motion.div>
            )}

            <p className="mt-3 mx-1 text-[12px] text-muted-foreground flex items-start gap-1.5">
              <ShieldAlert className="size-3.5 mt-0.5 shrink-0" />
              La consulta corresponde al padrón partidario cargado por el equipo.
              Para datos oficiales nacionales, verificá también en{" "}
              <a href={SITE.padronNacionalUrl} target="_blank" rel="noopener noreferrer"
                 className="underline font-medium hover:text-primary">Justicia Electoral</a>.
            </p>
          </motion.form>

          {/* Resultado */}
          <AnimatePresence mode="wait">
            {searched && result && (
              <ResultadoCard key="ok" reg={result} />
            )}
            {searched && !result && (
              <NoEncontrado key="no" ci={normalizeCI(ci)} />
            )}
            {loading && !searched && (
              <SkeletonCard key="skel" />
            )}
          </AnimatePresence>

          {!searched && !loading && (
            <div className="mt-10 grid md:grid-cols-3 gap-3">
              {[
                { t: "1", d: "Ingresá tu cédula sin puntos." },
                { t: "2", d: "Tocá Buscar y obtené tu mesa, orden y local." },
                { t: "3", d: "Abrí la ubicación en Google Maps." },
              ].map((s) => (
                <div key={s.t} className="rounded-2xl bg-card ring-1 ring-border p-5 shadow-soft">
                  <div className="size-9 rounded-xl bg-primary-soft text-primary grid place-items-center font-display font-semibold">{s.t}</div>
                  <p className="mt-3 text-[14px] text-foreground/85">{s.d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Padrón nacional */}
      <section className="py-12 px-4 -mt-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-ink text-white p-8 md:p-10 shadow-elevated relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 size-60 blob blob-1 opacity-50" />
          <div className="relative grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.22em] opacity-70 font-semibold">
                Padrón nacional oficial
              </span>
              <h3 className="mt-2 font-display text-2xl md:text-3xl font-semibold leading-tight">
                Verificá tus datos oficiales
              </h3>
              <p className="mt-2 text-white/75 text-[14.5px]">
                Consultá la base oficial del Tribunal Superior de Justicia Electoral.
              </p>
            </div>
            <a
              href={SITE.padronNacionalUrl}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient px-5 py-3.5 font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5"
            >
              Consultar padrón nacional <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function formatNombre(reg: Registro): string {
  const ap = (reg.apellido ?? "").trim();
  const nom = (reg.nombre ?? "").trim();
  if (ap && nom) return `${ap}, ${nom}`.toUpperCase();
  if (ap) return ap.toUpperCase();
  if (nom) return nom.toUpperCase();
  // Fallback: intentar separar nombre_completo (heurística: "APELLIDO NOMBRE NOMBRE2")
  const full = (reg.nombre_completo ?? "").trim();
  if (!full) return "";
  const parts = full.split(/\s+/);
  if (parts.length >= 2) {
    // Asumir primer token = apellido, resto = nombres
    const apellido = parts[0];
    const nombres = parts.slice(1).join(" ");
    return `${apellido}, ${nombres}`.toUpperCase();
  }
  return full.toUpperCase();
}

function ResultadoCard({ reg }: { reg: Registro }) {
  const nombre = formatNombre(reg);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-3xl bg-card shadow-elevated ring-1 ring-border overflow-hidden"
    >
      <div className="bg-primary-gradient p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-25"
             style={{ background: "radial-gradient(60% 80% at 100% 0%, rgba(255,255,255,0.5), transparent 60%)" }} />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 ring-1 ring-white/30 backdrop-blur text-[10.5px] font-semibold uppercase tracking-[0.18em]">
              <CheckCircle2 className="size-3" /> Registro encontrado
            </div>
            <h3 className="mt-3 font-display text-[26px] sm:text-3xl md:text-4xl font-semibold leading-[1.1] tracking-tight break-words">
              {nombre}
            </h3>
            <p className="mt-1.5 text-[13px] opacity-85 tabular-nums">
              C.I. {reg.ci}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-px bg-border">
        <div className="bg-card p-5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Mesa</div>
          <div className="mt-1 font-display text-3xl text-ink font-semibold tabular-nums">{reg.mesa}</div>
        </div>
        <div className="bg-card p-5">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Orden</div>
          <div className="mt-1 font-display text-3xl text-ink font-semibold tabular-nums">{reg.orden}</div>
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-cream">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
            <MapPin className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">Local de votación</div>
            <div className="mt-1 font-display text-lg text-ink font-semibold leading-snug">
              {reg.local_votacion}
            </div>
            {reg.seccional && (
              <div className="mt-1 text-[13px] text-muted-foreground">{reg.seccional}</div>
            )}
            {reg.referencia && (
              <p className="mt-2.5 text-[14px] text-foreground/80 leading-relaxed">
                <span className="font-semibold text-ink">Referencia: </span>{reg.referencia}
              </p>
            )}
            {reg.maps_url && (
              <a
                href={reg.maps_url}
                target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-gradient text-primary-foreground px-4 py-2.5 text-[13.5px] font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5"
              >
                <MapPin className="size-4" /> Ver en Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NoEncontrado({ ci }: { ci: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-8 rounded-3xl bg-card ring-1 ring-border p-8 text-center shadow-soft"
    >
      <div className="mx-auto size-14 rounded-2xl bg-primary-soft text-primary grid place-items-center">
        <AlertCircle className="size-7" />
      </div>
      <h3 className="mt-4 font-display text-2xl text-ink font-semibold">No encontramos tu cédula</h3>
      <p className="mt-2 text-muted-foreground text-[14.5px] max-w-md mx-auto">
        La cédula <span className="font-semibold text-ink tabular-nums">{ci}</span> no figura en el padrón
        partidario cargado. Verificá los dígitos y consultá también el padrón nacional oficial.
      </p>
      <a
        href={SITE.padronNacionalUrl}
        target="_blank" rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink text-white px-5 py-3 text-[14px] font-semibold hover:bg-primary-dark transition-colors"
      >
        Verificar en Justicia Electoral <ExternalLink className="size-4" />
      </a>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-8 rounded-3xl bg-card ring-1 ring-border overflow-hidden shadow-soft"
    >
      <div className="bg-muted h-28 animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
      </div>
    </motion.div>
  );
}
