import { useEffect, useState } from "react";

function getTimeLeft(target: Date) {
  const now = Date.now();
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

interface Props {
  targetISO: string; // "2026-06-07"
  compact?: boolean;
}

export function Countdown({ targetISO, compact = false }: Props) {
  const target = new Date(`${targetISO}T07:00:00-03:00`);
  const [t, setT] = useState(() => getTimeLeft(target));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setT(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetISO]);

  if (t.done) {
    return (
      <div className="inline-flex items-center gap-2 rounded-2xl bg-primary-gradient px-6 py-3 text-primary-foreground font-semibold shadow-elevated">
        <span className="pulse-dot" />¡Hoy es el día! Domingo 7 de junio
      </div>
    );
  }

  const cells = [
    { label: "Días", value: t.days },
    { label: "Horas", value: t.hours },
    { label: "Min", value: t.minutes },
    { label: "Seg", value: t.seconds },
  ];

  return (
    <div className={compact ? "" : "text-center"}>
      <p className="text-[11px] md:text-[12px] uppercase tracking-[0.22em] font-semibold text-primary mb-3">
        Faltan para las elecciones · Domingo 7 de junio 2026
      </p>
      <div className="flex justify-center gap-2 md:gap-3" aria-live="polite">
        {cells.map((c) => (
          <div key={c.label} className="countdown-cell rounded-2xl px-3 md:px-5 py-3 md:py-4 min-w-[68px] md:min-w-[88px]">
            <div className="font-display text-3xl md:text-5xl font-semibold leading-none tabular-nums">
              {mounted ? String(c.value).padStart(2, "0") : "--"}
            </div>
            <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] mt-1.5 opacity-85">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
