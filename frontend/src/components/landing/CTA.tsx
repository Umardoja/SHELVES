"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="section-padding relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto rounded-3xl text-white bg-[var(--color-orange)] p-12 md:p-24 text-center relative overflow-hidden shadow-elevated"
            >
                {/* Minimal Background Treatment */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-surface)] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 space-y-10">
                    <h2 className="text-[var(--color-text-primary)] tracking-tight leading-tight text-balance">
                        Automate Your Retail Operations <br /> 
                        <span className="opacity-80">With SHELVES.</span>
                    </h2>
                    <p className="text-xl text-indigo-100 max-w-xl mx-auto leading-relaxed">
                        Join the modern merchants scaling their business with real-time inventory precision and omni-channel reliability.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            href="/shop"
                            className="bg-[var(--color-surface)] text-indigo-700 px-10 py-4 rounded-lg font-bold text-base hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                        >
                            Browse Marketplace
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/register"
                            className="bg-[var(--color-orange)] border border-[var(--color-border)] text-white px-10 py-4 rounded-lg font-bold text-base hover:bg-indigo-800 transition-all flex items-center justify-center active:scale-95"
                        >
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
  );
}
