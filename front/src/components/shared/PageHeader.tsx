import { motion } from "framer-motion";
import { easeOut } from "@/components/shared/Motion";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground/70 mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">{subtitle}</p>}
      </motion.div>
      {actions && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
          className="flex items-center gap-3"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}
