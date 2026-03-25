"use client";

import { motion } from "framer-motion";
import { Smartphone, Database, Bell } from "lucide-react";

const STEPS = [
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: "Capture Operations",
    description: "Input sales or track inventory via Web Dashboard, Mobile, or simple USSD commands—no internet required.",
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Centralize Data",
    description: "Every transaction is securely recorded and synchronized across your entire business ecosystem instantly.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Analyze & Automate",
    description: "Gain 360-degree visibility into your stock health and automate customer engagement with smart SMS triggers.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-[var(--color-surface)]/40 relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[var(--color-text-primary)] mb-4"
          >
            Operational Workflow.
          </motion.h2>
          <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
            A precise, three-step system designed for high-efficiency retail operations.
          </p>
        </div>

        <div className="relative">
          {/* Subtle Connection Line */}
          <div className="hidden lg:block absolute top-[2.5rem] left-[15%] right-[15%] h-px bg-[var(--color-surface)]" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8">
            {STEPS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex flex-col items-center text-center px-4"
              >
                <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-blue)] mb-8 relative z-10">
                  {step.icon}
                  {/* Step Number Badge */}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-md bg-[var(--color-orange)] text-[10px] font-bold text-white flex items-center justify-center">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-[var(--color-text-primary)] font-bold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
