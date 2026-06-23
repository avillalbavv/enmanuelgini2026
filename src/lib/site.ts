import candidato from "@/data/candidato.json";
import redes from "@/data/redes.json";
import electoral from "@/data/electoral.json";

export const SITE = {
  candidato: candidato.candidato,
  movimiento: candidato.movimiento,
  slogan: candidato.slogan,
  resena: candidato.resena_corta,
  fechaElecciones: electoral.fecha_elecciones,
  padronNacionalUrl: electoral.padron_nacional_justicia_electoral,
  redes: {
    instagram: redes.instagram,
    facebook: redes.facebook,
    tiktok: redes.tiktok,
    whatsapp: redes.whatsapp.startsWith("REEMPLAZAR") ? "" : redes.whatsapp,
    email: redes.email.startsWith("REEMPLAZAR") ? "" : redes.email,
  },
  biografia: candidato.biografia_puntos as string[],
} as const;

export const NAV_ITEMS = [
  { to: "/", label: "Inicio" },
  { to: "/biografia", label: "Biografía" },
  { to: "/propuestas", label: "Propuestas" },
  { to: "/equipo", label: "Mi Equipo" },
  { to: "/noticias", label: "Noticias" },
  { to: "/practica-voto", label: "Practicá tu voto" },
  { to: "/info-electoral", label: "Info electoral" },
  { to: "/contacto", label: "Contacto" },
] as const;
