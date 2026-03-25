"use client";

import { motion } from "framer-motion";
import { Box, BarChart2, Smartphone, MessageSquare, CreditCard, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: <Box className="w-6 h-6" />,
    title: "Track Your Stock",
    description: "Know exactly how many items you have left in your shop at any time.",
    benefit: "Never run out of goods.",
  },
  {
    icon: <BarChart2 className="w-6 h-6" />,
    title: "Business Summary",
    description: "See simple reports of how much money you are making and what is selling fast.",
    benefit: "Grow your business with data.",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Works on Any Phone",
    description: "Use SHELVES on your computer, smartphone, or even a small button phone (USSD).",
    benefit: "Manage your shop from anywhere.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Message Your Customers",
    description: "Send promo messages to your customers and get alerts when stock is running low.",
    benefit: "Keep your customers coming back.",
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Easy Sales Recording",
    description: "Every time you sell an item, your record updates automatically. No mistakes.",
    benefit: "Fast and easy to use.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Safe and Secure",
    description: "Your business records are safe with us and always available when you need them.",
    benefit: "Peace of mind for your business.",
  },
];

export function Features() {
  return (
    <section id="features" className="section-padding relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-end">
          <div className="space-y-4">
            <h2 className="text-[var(--color-text-primary)] text-balance">
              Engineered for the <br />
              <span className="text-[var(--color-text-secondary)] font-bold">Resilient Retailer.</span>
            </h2>
          </div>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
            We've stripped away the noise to provide a precise toolset for high-growth merchants. Focus on your inventory, not your software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-soft">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className="p-10 bg-[var(--color-surface)]/50 hover:bg-[var(--color-surface)]/80 transition-all group border-0"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--color-purple)]/10 text-[var(--color-blue)] flex items-center justify-center mb-6 group-hover:bg-[var(--color-orange)] group-hover:text-white transition-all" aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="text-[var(--color-text-primary)] font-bold mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-4 text-[15px] leading-relaxed">
                {feature.description}
              </p>
              <p className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                {feature.benefit}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
