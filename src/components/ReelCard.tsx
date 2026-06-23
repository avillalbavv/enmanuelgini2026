import { useState } from "react";
import { Instagram, ExternalLink } from "lucide-react";

interface ReelCardProps {
  url: string;
  date?: string;
  thumbnail?: string;
}

function getShortcode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:reel|p|tv)\/([^/?#]+)/i);
  return m ? m[1] : null;
}

function isReel(url: string): boolean {
  return /instagram\.com\/reel\//i.test(url);
}

export function ReelCard({ url, date, thumbnail }: ReelCardProps) {
  const [loaded, setLoaded] = useState(false);
  const shortcode = getShortcode(url);
  const type = isReel(url) ? "reel" : "p";
  const embedSrc = shortcode
    ? `https://www.instagram.com/${type}/${shortcode}/embed/`
    : null;

  const fechaTxt = date
    ? new Date(date + "T12:00:00").toLocaleDateString("es-PY", {
        day: "numeric",
        month: "long",
      })
    : "Publicación";

  return (
    <div className="snap-start shrink-0 w-[260px] sm:w-[300px] rounded-3xl bg-white ring-1 ring-border overflow-hidden shadow-elevated flex flex-col transition-transform hover:-translate-y-1">
      {/* Área del embed - siempre visible */}
      <div className="relative w-full aspect-[9/14] overflow-hidden bg-muted">
        {/* Skeleton mientras carga */}
        {!loaded && (
          <div className="absolute inset-0 shimmer flex flex-col items-center justify-center gap-3">
            <Instagram className="size-8 text-muted-foreground/30" />
            <span className="text-[12px] text-muted-foreground/50">{fechaTxt}</span>
          </div>
        )}
        {thumbnail && !loaded && (
          <img
            src={thumbnail}
            alt={`Publicación del ${fechaTxt}`}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        {embedSrc ? (
          <iframe
            src={embedSrc}
            title={`Publicación Instagram ${shortcode}`}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            scrolling="no"
            onLoad={() => setLoaded(true)}
            className={`absolute inset-0 w-full h-full border-0 bg-white transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer"
             className="absolute inset-0 flex items-center justify-center bg-primary-gradient text-white text-[13px] font-semibold">
            Ver en Instagram
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-3 bg-white border-t border-border shrink-0">
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
