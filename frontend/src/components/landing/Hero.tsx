"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-10">
          {/* Brand Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="relative w-24 h-24">
              <Image 
                src={"/logo.png"} 
                alt="SHELVES Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          {/* Sub-badge for visual hierarchy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-white bg-[var(--color-purple)]/10 border border-[var(--color-purple)]/20 text-[var(--color-blue)] text-xs font-semibold tracking-wide uppercase"
          >
            <span>Now Live</span>
            <ChevronRight className="w-3 h-3" />
          </motion.div>

          {/* Professional Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl space-y-6"
          >
            <h1 className="text-slate-50 font-extrabold leading-[1.1] tracking-tight text-balance text-4xl md:text-6xl">
              Simplest Way to Manage Your <br />
              <span className="text-[var(--color-blue)]">Shop and Stock.</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
              SHELVES helps you track your items, see your sales, and manage your shop easily. Works on any phone—even without internet.
            </p>
          </motion.div>

          {/* Primary Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link
              href="/shop"
              className="px-8 py-4 bg-[var(--color-orange)] text-white rounded-lg font-bold text-base hover:bg-[var(--color-orange)] transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-95"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-lg font-bold text-base hover:bg-[var(--color-surface)] transition-all flex items-center justify-center active:scale-95"
            >
              Start Using SHELVES
            </Link>
          </motion.div>

          {/* Contextual Social Proof / Logos - Clean & Minimal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="pt-12 w-full max-w-lg opacity-40 grayscale flex flex-wrap justify-center gap-x-12 gap-y-6"
          >
            {/* Mock Partner Logos - Representing scale */}
            <div className="font-bold text-lg tracking-widest uppercase">
              Bestools Store
            </div>
            <div className="font-bold text-lg tracking-widest uppercase">
              SwirlRetail
            </div>
            <div className="font-bold text-lg tracking-widest uppercase">
              Konfam Store
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
