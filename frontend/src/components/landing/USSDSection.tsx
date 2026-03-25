"use client";

import { motion } from "framer-motion";
import { Hash, PhoneCall, CheckCircle2, ArrowRight } from "lucide-react";

const STEPS = [
  {
    title: "Dial the Code",
    description: "Simply dial the USSD code on any mobile device. No internet required.",
    icon: <Hash className="w-5 h-5 text-[var(--color-blue)]" />
  },
  {
    title: "Select Your Option",
    description: "Navigate through our intuitive menu to manage stock or place orders.",
    icon: <PhoneCall className="w-5 h-5 text-[var(--color-green)]" />
  },
  {
    title: "Complete Transaction",
    description: "Receive instant confirmation via SMS once your action is processed.",
    icon: <CheckCircle2 className="w-5 h-5 text-[var(--color-blue)]" />
  }
];

export function USSDSection() {
  const ussdCode = process.env.NEXT_PUBLIC_LIVE_USSD_CODE || "*347*592#";

  return (
    <section id="ussd" className="py-24 bg-[var(--color-surface)]/40 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] text-white bg-[var(--color-orange)]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] leading-tight mb-6">
                Access SHELVES via <span className="text-[var(--color-blue)] underline decoration-indigo-500/30 underline-offset-8">USSD</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg font-medium leading-relaxed max-w-xl">
                Take control of your business even without a data connection. Our USSD integration allows you to sync operations directly from your basic mobile phone.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-6 p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] shadow-2xl backdrop-blur-xl group hover:border-[var(--color-border)]/30 transition-all duration-500"
            >
              <div className="w-16 h-16 text-white bg-[var(--color-orange)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-orange)]/20 group-hover:scale-110 transition-transform">
                <Hash className="w-8 h-8 text-[var(--color-text-primary)]" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Dial Now</p>
                <p className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">{ussdCode}</p>
              </div>
            </motion.div>

            <div className="pt-4">
              <button 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center gap-3 text-[var(--color-text-secondary)] font-black text-sm uppercase tracking-widest hover:text-[var(--color-text-primary)] transition-colors"
              >
                Learn how it works
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Steps */}
          <div className="space-y-6">
            {STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-6 p-6 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-3xl hover:bg-[var(--color-surface)]/[0.03] transition-all group"
              >
                <div className="w-12 h-12 text-white bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-orange)] group-hover:border-[var(--color-border)] transition-all duration-300">
                  {step.icon}
                </div>
                <div className="space-y-2">
                  <h4 className="text-[var(--color-text-primary)] font-bold">{step.title}</h4>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
