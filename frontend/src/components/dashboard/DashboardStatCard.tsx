"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: string;
  isPositive: boolean;
  icon: LucideIcon;
  color: "indigo" | "emerald" | "amber" | "cyan" | "rose";
  decimals?: number;
  details?: string;
}

export function DashboardStatCard({
  title,
  value,
  prefix = "",
  suffix = "",
  trend,
  isPositive,
  icon: Icon,
  color,
  decimals = 0,
}: StatCardProps) {
  const themes = {
    indigo: "text-[var(--color-blue)]",
    emerald: "text-[var(--color-green)]",
    cyan: "text-[var(--color-blue)]",
    amber: "text-amber-400",
    rose: "text-rose-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:bg-[var(--color-bg)]"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] ${themes[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] tracking-wider uppercase ${isPositive ? 'text-[var(--color-green)]' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-[var(--color-text-secondary)] text-[10px] font-black uppercase tracking-widest">
            {title}
          </h3>
          <div className="text-2xl font-black text-[var(--color-text-primary)] flex items-baseline gap-1 tracking-tight">
            <span className="text-lg opacity-40 font-bold">{prefix}</span>
            <CountUp end={value} duration={1.5} decimals={decimals} separator="," />
            <span className="text-lg opacity-40 font-bold">{suffix}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
