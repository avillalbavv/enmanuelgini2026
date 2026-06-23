import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  Send, Instagram, Facebook, MessageCircle, Mail, CheckCircle2,
  Phone, MapPin, ExternalLink, Loader2, AlertCircle,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { SectionHeading } from "@/components/SectionHeading";
import { FadeIn } from "@/components/FadeIn";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Equipo de Enmanuel Gini" },
      { name: "description", content: "Escribinos, sumate al movimiento Unidos por Piribebuy y contanos qué necesita tu zona." },
      { property: "og:title", content: "Contacto — Unidos por Piribebuy" },
      { property: "og:description", content: "Sumá tu voz al movimiento. Estamos para escucharte." },
    ],
  }),
  component: ContactoPage,
});

/* ================================================================
 * INTEGRACIÓN CON GOOGLE SHEETS
 *
 * Pasos para activar (solo una vez):
 * 1. Creá una hoja de Google Sheets con estas columnas en la fila 1:
 *    Fecha | Nombre | Apellido | Celular | Correo | Zona | Mensaje
 * 2. En el menú: Extensiones → Apps Script
 * 3. Pegá el código de apps-script.gs (incluido en este proyecto)
 * 4. Clic en "Implementar" → "Nueva implementación"
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier usuario
 * 5. Copiá la URL que genera y pegala abajo.
 * ================================================================ */
// URL directa del Apps Script Web App.
// También acepta VITE_GOOGLE_SCRIPT_URL si después querés manejarlo por Cloudflare.
const GOOGLE_SCRIPT_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbx3psko_TilWWvV70qgAs17RMedCrAkOGPPhFMLLzJH41xS0KSseUntMhINPcIejjNT/exec";

const FormSchema = z.object({
  nombre:   z.string().trim().min(2, "Ingresá tu nombre").max(80),
  apellido: z.string().trim().min(2, "Ingresá tu apellido").max(80),
  celular:  z.string().trim().min(6, "Ingresá un celular válido").max(20),
  correo:   z.union([z.literal(""), z.string().trim().email("Correo inválido").max(120)]).optional(),
  zona:     z.string().trim().max(120).optional(),
  mensaje:  z.string().trim().min(5, "Escribí tu mensaje").max(800),
});

type Status = "idle" | "sending" | "success" | "error";

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.5 3a4.5 4.5 0 0 0 4.5 4.5v3.2a7.7 7.7 0 0 1-4.5-1.45v6.6a6.25 6.25 0 1 1-6.25-6.25c.31 0 .61.02.91.07v3.36a3 3 0 1 0 2.09 2.86V3h3.25Z" />
    </svg>
  );
}

function ContactoPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const res = FormSchema.safeParse(data);

    if (!res.success) {
      const fe: Record<string, string> = {};
      res.error.issues.forEach((i) => { fe[String(i.path[0])] = i.message; });
      setErrors(fe);
      // Scroll al primer error
      const firstError = form.querySelector("[data-error='true']");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setErrors({});
    setStatus("sending");

    const payload = {
      fecha: new Date().toLocaleString("es-PY", {
        timeZone: "America/Asuncion",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
      }),
      ...res.data,
    };

    // Enviar a Google Sheets
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        // Google Apps Script acepta text/plain para evitar CORS preflight
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error enviando a Google Sheets:", error);
      setStatus("error");
      return;
    }

    // WhatsApp como canal principal / fallback
    if (SITE.redes.whatsapp) {
      const text =
        `Hola, soy ${res.data.nombre} ${res.data.apellido}.\n` +
        `Cel: ${res.data.celular}` +
        (res.data.zona ? `\nBarrio/Compañía: ${res.data.zona}` : "") +
        `\n\n${res.data.mensaje}`;
      window.open(
        `https://wa.me/${SITE.redes.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }

    setStatus("success");
    form.reset();
  }

  return (
    <>
      <section className="relative overflow-hidden pt-16 pb-10">
        <div className="relative mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Contacto"
            title={<>Hablemos de <span className="text-gradient">Piribebuy</span></>}
            description="Escribinos por el formulario o por nuestras redes. Tu mensaje llega directo al equipo."
          />
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-3 gap-5">
          {/* Formulario */}
          <FadeIn className="lg:col-span-2">
            <motion.form
              ref={formRef}
              onSubmit={onSubmit}
              className="rounded-3xl bg-card ring-1 ring-border p-6 sm:p-8 shadow-soft"
            >
              <h3 className="font-display text-xl font-semibold text-ink mb-5">
                Envianos tu mensaje
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nombre" name="nombre" error={errors.nombre} required />
                <Field label="Apellido" name="apellido" error={errors.apellido} required />
                <Field label="Celular" name="celular" type="tel" inputMode="tel" error={errors.celular} required />
                <Field label="Correo electrónico" name="correo" type="email" error={errors.correo} />
                <div className="sm:col-span-2">
                  <Field
                    label="Barrio o compañía"
                    name="zona"
                    placeholder="Ej: Cordillera, Itá Morotĩ Guazú..."
                    error={errors.zona}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
                    Mensaje *
                  </label>
                  <textarea
                    name="mensaje"
                    rows={5}
                    maxLength={800}
                    className="w-full rounded-2xl bg-background ring-1 ring-border focus:ring-primary/40 focus:outline-none px-4 py-3 text-[15px] text-ink resize-none transition-shadow focus-ring"
                    placeholder="Contanos qué necesita tu zona, una propuesta o cómo podés ayudar."
                  />
                  {errors.mensaje && (
                    <p className="mt-1 text-[12px] text-destructive flex items-center gap-1">
                      <AlertCircle className="size-3 shrink-0" /> {errors.mensaje}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row items-start gap-4">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground px-6 py-3.5 font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-wait w-full sm:w-auto"
                >
                  {status === "sending" ? (
                    <><Loader2 className="size-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="size-4" /> Enviar mensaje</>
                  )}
                </button>

                {!GOOGLE_SCRIPT_URL && (
                  <p className="text-[11.5px] text-muted-foreground self-center">
                    El formulario abre WhatsApp para completar el envío.
                  </p>
                )}
              </div>

              <AnimatePresence>
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 rounded-2xl bg-primary-soft text-primary-dark p-4 flex items-start gap-3"
                  >
                    <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">¡Mensaje enviado correctamente!</p>
                      <p className="text-[13.5px] opacity-90 mt-0.5">
                        {SITE.redes.whatsapp
                          ? "También te abrimos WhatsApp para que lo confirmes directamente."
                          : "Gracias por escribirnos. Te responderemos pronto."}
                        {GOOGLE_SCRIPT_URL && " Tu mensaje quedó registrado en nuestra base de datos."}
                      </p>
                    </div>
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 rounded-2xl bg-destructive/10 text-destructive p-4 flex items-center gap-3"
                  >
                    <AlertCircle className="size-5 shrink-0" />
                    <p className="text-[13.5px] font-medium">
                      Error al enviar. Intentá nuevamente o escribinos por WhatsApp.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </FadeIn>

          {/* Sidebar */}
          <div className="space-y-4">
            <FadeIn delay={0.1}>
              <div className="rounded-3xl bg-primary-gradient text-primary-foreground p-7 shadow-elevated">
                <h3 className="font-display text-2xl font-semibold">Seguinos</h3>
                <p className="mt-2 text-[14px] opacity-90">Sumate a la conversación.</p>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <SocialBtn href={SITE.redes.instagram} label="Instagram" Icon={Instagram} />
                  <SocialBtn href={SITE.redes.facebook} label="Facebook" Icon={Facebook} />
                  <SocialBtn href={SITE.redes.tiktok} label="TikTok" Icon={TikTokIcon} />
                  {SITE.redes.whatsapp && (
                    <SocialBtn href={`https://wa.me/${SITE.redes.whatsapp.replace(/\D/g, "")}`} label="WhatsApp" Icon={MessageCircle} />
                  )}
                  {SITE.redes.email && (
                    <SocialBtn href={`mailto:${SITE.redes.email}`} label="Correo" Icon={Mail} />
                  )}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="rounded-3xl bg-card ring-1 ring-border p-7 shadow-soft">
                <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
                  <MapPin className="size-5" />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-ink">Piribebuy, Cordillera</h3>
                <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                  Trabajamos por nuestra ciudad, todos los días.
                </p>
              </div>
            </FadeIn>

            {SITE.redes.whatsapp && (
              <FadeIn delay={0.2}>
                <a
                  href={`https://wa.me/${SITE.redes.whatsapp.replace(/\D/g, "")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block rounded-3xl bg-ink text-white p-6 hover:bg-primary-dark transition-colors card-interactive"
                >
                  <Phone className="size-5" />
                  <h3 className="mt-3 font-display text-lg font-semibold">Llamada o WhatsApp</h3>
                  <p className="mt-1 text-[13.5px] opacity-80">Tocá para escribirnos directo.</p>
                </a>
              </FadeIn>
            )}

            {GOOGLE_SCRIPT_URL && (
              <FadeIn delay={0.25}>
                <div className="rounded-2xl bg-muted p-4 flex items-start gap-3">
                  <ExternalLink className="size-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Los mensajes se guardan automáticamente en nuestra base de datos interna.
                  </p>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label, name, type = "text", error, required, placeholder, inputMode,
}: {
  label: string; name: string; type?: string; error?: string;
  required?: boolean; placeholder?: string;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div data-error={!!error}>
      <label className="block text-[11.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
        {label}{required && " *"}
      </label>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        autoComplete={type === "email" ? "email" : type === "tel" ? "tel" : "off"}
        className="w-full rounded-2xl bg-background ring-1 ring-border focus:ring-primary/40 focus:outline-none px-4 py-3 text-[15px] text-ink transition-shadow focus-ring"
      />
      {error && (
        <p className="mt-1 text-[12px] text-destructive flex items-center gap-1">
          <AlertCircle className="size-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function SocialBtn({ href, label, Icon }: { href: string; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
  return (
    <a
      href={href}
      target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-xl bg-white/15 ring-1 ring-white/25 px-3 py-2.5 text-[13px] font-semibold hover:bg-white/25 transition-colors backdrop-blur"
    >
      <Icon className="size-4" /> {label}
    </a>
  );
}
