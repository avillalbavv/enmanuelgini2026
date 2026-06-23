import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  Send, Instagram, Facebook, MessageCircle, Mail, CheckCircle2, Phone, MapPin,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { SectionHeading } from "@/components/SectionHeading";

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

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.5 3a4.5 4.5 0 0 0 4.5 4.5v3.2a7.7 7.7 0 0 1-4.5-1.45v6.6a6.25 6.25 0 1 1-6.25-6.25c.31 0 .61.02.91.07v3.36a3 3 0 1 0 2.09 2.86V3h3.25Z" />
    </svg>
  );
}

const FormSchema = z.object({
  nombre: z.string().trim().min(2, "Ingresá tu nombre").max(80),
  apellido: z.string().trim().min(2, "Ingresá tu apellido").max(80),
  celular: z.string().trim().min(6, "Ingresá un celular válido").max(20),
  correo: z.union([z.literal(""), z.string().trim().email("Correo inválido").max(120)]).optional(),
  zona: z.string().trim().max(120).optional(),
  mensaje: z.string().trim().min(5, "Escribí tu mensaje").max(800),
});

function ContactoPage() {
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const res = FormSchema.safeParse(data);
    if (!res.success) {
      const fe: Record<string, string> = {};
      res.error.issues.forEach((i) => { fe[String(i.path[0])] = i.message; });
      setErrors(fe);
      return;
    }
    setErrors({});
    form.reset();
    setSent(true);

    // Si hay WhatsApp configurado, abrir wa.me con mensaje prellenado.
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
  }

  return (
    <>
      <section className="relative overflow-hidden bg-hero pt-12 pb-16">
        <div className="absolute -top-32 -left-20 size-96 blob blob-1" />
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
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 rounded-3xl bg-card ring-1 ring-border p-6 md:p-8 shadow-soft"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nombre" name="nombre" error={errors.nombre} required />
              <Field label="Apellido" name="apellido" error={errors.apellido} required />
              <Field label="Celular" name="celular" type="tel" inputMode="tel" error={errors.celular} required />
              <Field label="Correo electrónico" name="correo" type="email" error={errors.correo} />
              <div className="sm:col-span-2">
                <Field label="Barrio o compañía" name="zona" placeholder="Ej: Cordillera, Itá Morotĩ Guazú..." error={errors.zona} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
                  Mensaje *
                </label>
                <textarea
                  name="mensaje"
                  rows={5}
                  maxLength={800}
                  className="w-full rounded-2xl bg-background ring-1 ring-border focus:ring-primary/40 focus:outline-none px-4 py-3 text-[15px] text-ink resize-none transition-shadow"
                  placeholder="Contanos qué necesita tu zona, una propuesta o cómo podés ayudar."
                />
                {errors.mensaje && <p className="mt-1 text-[12px] text-destructive">{errors.mensaje}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground px-6 py-3.5 font-semibold shadow-elevated hover:shadow-glow transition-all hover:-translate-y-0.5"
            >
              <Send className="size-4" /> Enviar mensaje
            </button>

            {sent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 rounded-2xl bg-primary-soft text-primary-dark p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">¡Mensaje listo para enviar!</p>
                  <p className="text-[13.5px] opacity-90">
                    {SITE.redes.whatsapp
                      ? "Te abrimos WhatsApp para que termines de enviarlo."
                      : "Gracias por escribirnos. Te responderemos pronto."}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.form>

          <div className="space-y-4">
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

            <div className="rounded-3xl bg-card ring-1 ring-border p-7 shadow-soft">
              <div className="size-11 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <MapPin className="size-5" />
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-ink">Piribebuy, Cordillera</h3>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">
                Trabajamos por nuestra ciudad, todos los días.
              </p>
            </div>

            {SITE.redes.whatsapp && (
              <a
                href={`https://wa.me/${SITE.redes.whatsapp.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="block rounded-3xl bg-ink text-white p-6 hover:bg-primary-dark transition-colors"
              >
                <Phone className="size-5" />
                <h3 className="mt-3 font-display text-lg font-semibold">Llamada o WhatsApp</h3>
                <p className="mt-1 text-[13.5px] opacity-80">Tocá para escribirnos directo.</p>
              </a>
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
  required?: boolean; placeholder?: string; inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-1.5">
        {label}{required && " *"}
      </label>
      <input
        name={name}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-background ring-1 ring-border focus:ring-primary/40 focus:outline-none px-4 py-3 text-[15px] text-ink transition-shadow"
      />
      {error && <p className="mt-1 text-[12px] text-destructive">{error}</p>}
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
