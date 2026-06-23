import { useState } from "react";
import { Instagram, Play, ExternalLink } from "lucide-react";

interface ReelCardProps {
  url: string;
  date?: string;
}

/** Extrae el shortcode de un link de reel/post de Instagram. */
function getShortcode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:reel|p|tv)\/([^/?#]+)/i);
  return m ? m[1] : null;
}

export function ReelCard({ url, date }: ReelCardProps) {
  const [playing, setPlaying] = useState(false);
  const shortcode = getShortcode(url);
  const embedSrc = shortcode
    ? `https://www.instagram.com/p/${shortcode}/embed/?cr=1&v=14&rd=https%3A%2F%2Fwww.instagram.com`
    : null;

  const fechaTxt = date
    ? new Date(date).toLocaleDateString("es-PY", { day: "numeric", month: "long" })
    : "Reel";

  return (
    <div className="snap-start group shrink-0 w-[260px] sm:w-[300px] rounded-3xl bg-white ring-1 ring-border overflow-hidden shadow-elevated relative flex flex-col">
      <div className="relative w-full aspect-[9/14] bg-ink overflow-hidden">
        {playing && embedSrc ? (
          <iframe
            src={embedSrc}
            title={`Reel Instagram ${shortcode}`}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
            className="absolute inset-0 w-full h-full border-0 bg-white"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Reproducir reel de Instagram"
            className="absolute inset-0 w-full h-full text-left"
          >
            {/* Fondo gradiente rojo institucional */}
            <div className="absolute inset-0 bg-primary-gradient" />
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.5), transparent 70%)" }}
            />
            {/* Play */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="size-16 rounded-full bg-white/25 ring-1 ring-white/50 backdrop-blur grid place-items-center group-hover:scale-110 transition-transform shadow-glow">
                <Play className="size-7 text-white fill-white translate-x-0.5" />
              </div>
            </div>
            {/* Top badges */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between text-primary-foreground">
              <div className="size-9 rounded-xl bg-white/20 ring-1 ring-white/40 grid place-items-center backdrop-blur">
                <Instagram className="size-4" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold bg-white/20 ring-1 ring-white/30 backdrop-blur rounded-full px-2 py-1">
                Reel
              </span>
            </div>
            {/* Bottom date */}
            <div className="absolute bottom-0 inset-x-0 p-4 text-primary-foreground">
              <p className="font-display text-lg font-semibold leading-snug drop-shadow">
                {fechaTxt}
              </p>
              <p className="mt-1 text-[12px] opacity-90 font-medium">
                Tocá para reproducir
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Footer acciones */}
      <div className="flex items-center justify-between gap-2 p-3 bg-white border-t border-border">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink">
          <Instagram className="size-3.5 text-primary" /> Instagram
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Ver en Instagram <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
