"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface DashboardChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  rightElement?: ReactNode;
}

export function DashboardChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  rightElement,
}: DashboardChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative group overflow-hidden p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-xl shadow-soft transition-all duration-300 hover:border-[var(--color-border)] ${className}`}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 text-white bg-[var(--color-orange)] blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-blue)]">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-[var(--color-text-primary)] font-bold tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-[var(--color-text-secondary)] font-medium">{subtitle}</p>}
            </div>
          </div>
          {rightElement}
        </div>

        <div className="flex-1 min-h-[300px] w-full mt-2">
          {children}
        </div>
      </div>
      
      {/* Decorative Neon Edge */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] text-white bg-gradient-brand from-transparent  to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
    </motion.div>
  );
}
