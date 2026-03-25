"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Faruq Umar",
    business: "Faruq's Hardware Hub",
    quote: "SHELVES has redefined our operational standard. The reliability of the USSD interface is unmatched in low-connectivity zones.",
    rating: 5,
  },
  {
    name: "Chukwudi Okafor",
    business: "Okafor Building Materials",
    quote: "We've seen a measurable 40% efficiency gain in inventory turnaround. The analytics provide clarity we never had before.",
    rating: 5,
  },
  {
    name: "Amina Yusuf",
    business: "Modern Tools Ltd",
    quote: "Record sales, send promotional alerts, and maintain full inventory control in one platform. It's a critical tool for our enterprise.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="section-padding bg-[var(--color-surface)]/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
            <h2 className="text-[var(--color-text-primary)] mb-4">Merchant Commitment.</h2>
            <p className="text-[var(--color-text-secondary)] text-lg">Trusted by high-growth merchants driving the future of retail across Africa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((review, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="p-10 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border)] transition-all flex flex-col justify-between"
                >
                    <div>
                        <div className="flex gap-0.5 mb-8">
                            {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-[var(--color-blue)] fill-current" />
                            ))}
                        </div>
                        <p className="text-balance text-[var(--color-text-secondary)] leading-relaxed mb-10 font-medium italic">
                            "{review.quote}"
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full text-white bg-[var(--color-purple)]/10 flex items-center justify-center font-bold text-[var(--color-blue)] text-xs">
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight">{review.name}</span>
                            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">{review.business}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
