"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";

const STATS = [
  { label: "Active Merchants", value: 1400, suffix: "+" },
  { label: "Daily Transactions", value: 50, suffix: "k" },
  { label: "System Uptime", value: 99.9, suffix: "%" },
  { label: "Monthly Growth", value: 35, suffix: "%" },
];

export function Stats() {
  return (
    <section className="py-12 border-y border-[var(--color-border)] bg-[var(--color-surface)]/30">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                {STATS.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left"
                    >
                        <div className="text-3xl md:text-4xl font-black text-[var(--color-text-primary)] tabular-nums tracking-tight">
                            <CountUp
                                end={stat.value}
                                suffix={stat.suffix}
                                duration={2}
                                decimals={stat.label.includes("Uptime") ? 1 : 0}
                                enableScrollSpy
                                scrollSpyOnce
                            />
                        </div>
                        <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-[0.2em] max-w-[100px] leading-tight">
                            {stat.label}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
}
