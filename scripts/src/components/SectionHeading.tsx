import { motion } from "framer-motion";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
}

export function SectionHeading({ eyebrow, title, description, align = "center" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={align === "center" ? "max-w-2xl mx-auto text-center" : "max-w-2xl"}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-[11px] font-semibold uppercase tracking-[0.2em]">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[15.5px] md:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}
