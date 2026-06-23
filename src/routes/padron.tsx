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

/* ================================================================
 * CARGA DEL PADRÓN VÍA WEB WORKER
 *
 * Por qué se congelaba la página:
 * ─ fetch('/padron.json') devuelve 5.7 MB de JSON.
 * ─ res.json() y el armado del Map se ejecutan sincrónicamente
 *   en el hilo principal, bloqueando el input del usuario.
 *
 * Solución: el Worker hace el fetch + parse fuera del hilo principal.
 * Transfiere el ArrayBuffer en modo zero-copy (transferable).
 * El hilo principal recibe bytes crudos y hace un JSON.parse
 * rápido (~50 ms) solo cuando el usuario presiona "Buscar".
 * ================================================================ */

// Singleton a nivel de módulo: se carga una sola vez, se comparte
let _padronPromise: Promise<Map<string, Registro>> | null = null;

function loadPadronAsync(): Promise<Map<string, Registro>> {
  if (_padronPromise) return _padronPromise;

  _padronPromise = new Promise<Map<string, Registro>>((resolve, reject) => {
    /* ── Código del Worker como string (sin bundling adicional) ── */
    // El Worker recibe la URL absoluta desde el hilo principal.
    // fetch('/padron.json') dentro de blob: workers falla porque
    // las URLs relativas se resuelven contra blob:null, no el dominio.
    const padronUrl = new URL('/padron.json', window.location.origin).href;
    const workerCode = `
      self.onmessage = async function(e) {
        try {
          var url = e.data.url; // URL absoluta pasada desde el hilo principal
          var res = await fetch(url);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          var buf = await res.arrayBuffer();
          self.postMessage({ ok: true, buf: buf }, [buf]);
        } catch (err) {
          self.postMessage({ ok: false, msg: String(err.message || err) });
        }
      };
    `;

    let worker: Worker;
    try {
      const blob = new Blob([workerCode], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      worker = new Worker(url);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: sin Worker (navegadores muy antiguos)
      _padronPromise = null;
      fetch("/padron.json")
        .then((r) => r.arrayBuffer())
        .then((buf) => {
          const text = new TextDecoder().decode(buf);
          const arr: Registro[] = JSON.parse(text);
          const map = new Map<string, Registro>();
          for (const r of arr) map.set(normalizeCI(String(r.ci)), r);
          resolve(map);
        })
        .catch((e) => { _padronPromise = null; reject(e); });
      return;
    }

    worker.onmessage = (e) => {
      worker.terminate();
      if (!e.data.ok) {
        _padronPromise = null;
        reject(new Error(e.data.msg || "Error al cargar el padrón"));
        return;
      }
      /* ── Decode + parse en hilo principal (rápido, ~50 ms) ── */
      try {
        const text = new TextDecoder().decode(new Uint8Array(e.data.buf));
        const arr: Registro[] = JSON.parse(text);
        const map = new Map<string, Registro>();
        for (const r of arr) map.set(normalizeCI(String(r.ci)), r);
        resolve(map);
      } catch (parseErr) {
        _padronPromise = null;
        reject(parseErr);
      }
    };

    worker.onerror = (e) => {
      worker.terminate();
      _padronPromise = null;
      reject(new Error(e.message || "Worker error"));
    };

    worker.postMessage({ url: padronUrl });
  });

  return _padronPromise;
}

// Rate limiter: máx 12 búsquedas por minuto
const RATE_LIMIT = 12;
const WINDOW_MS = 60_000;

function PadronPage() {
  const [ci, setCi] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<Registro | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataReady, setDataReady] = useState(false);
  const callsRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-carga del padrón en background tan pronto como el componente monta.
  // Al usar un Worker, esto NO bloquea el hilo principal en ningún momento.
  useEffect(() => {
    loadPadronAsync()
      .then(() => setDataReady(true))
      .catch(() => {/* silencio; el error se muestra al buscar */});
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
      const map = await loadPadronAsync();
      // Pequeña espera para mostrar el loader (UX)
      await new Promise((r) => setTimeout(r, 180));
      const found = map.get(cleaned);
      setResult(found ?? null);
      setSearched(true);
    } catch {
      setError("No se pudo cargar la base de datos. Intentá nuevamente.");
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
      <section className="relative overflow-hidden pt-16 pb-20">

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
                  placeholder={dataReady ? "Ej: 1358482" : "Cargando datos..."}
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
  const full = (reg.nombre_completo ?? "").trim();
  if (!full) return "";
  const parts = full.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]}, ${parts.slice(1).join(" ")}`.toUpperCase();
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
