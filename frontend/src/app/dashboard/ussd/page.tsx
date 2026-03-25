"use client";

import { motion } from "framer-motion";
import { Smartphone, WifiOff, Cloud, Server, Database, ArrowRight, ArrowDown } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function USSDPage() {
  const ussdCode = process.env.NEXT_PUBLIC_LIVE_USSD_CODE || "*347*592#";

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-brand from-white ">
            Offline Inventory (USSD)
          </h1>
          <p className="text-[var(--color-text-secondary)]">Manage your shop without internet using our USSD code.</p>
        </div>
        <div className="text-white bg-gradient-brand px-6 py-3 rounded-full font-bold text-lg shadow-lg shadow-[var(--color-purple)]/10 animate-pulse tracking-widest">
            {ussdCode}
        </div>
      </div>

      <GlassCard className="p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            {/* Step 1: User Action */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center space-y-4"
            >
                <div className="w-24 h-24 rounded-full text-white bg-[var(--color-purple)] flex items-center justify-center border border-[var(--color-border)]/30 relative">
                    <Smartphone className="w-10 h-10 text-[var(--color-purple)]" />
                    <div className="absolute -top-2 -right-2 bg-[var(--color-bg)] rounded-full p-1 border border-[var(--color-border)]">
                        <WifiOff className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">1. Dial the Code</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-[200px]">Dial {ussdCode} on any phone to start.</p>
                </div>
            </motion.div>

            <ArrowRight className="hidden md:block w-8 h-8 text-slate-600 animate-pulse" />
            <ArrowDown className="md:hidden w-8 h-8 text-slate-600 animate-pulse" />

            {/* Step 2: USSD Gateway */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center text-center space-y-4"
            >
                <div className="w-24 h-24 rounded-full text-white bg-[var(--color-orange)] flex items-center justify-center border border-[var(--color-border)]/30">
                    <Server className="w-10 h-10 text-[var(--color-blue)]" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">2. Info is Sent</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-[200px]">Your information is sent instantly to your shop records.</p>
                </div>
            </motion.div>

            <ArrowRight className="hidden md:block w-8 h-8 text-slate-600 animate-pulse" />
            <ArrowDown className="md:hidden w-8 h-8 text-slate-600 animate-pulse" />

            {/* Step 3: Cloud Sync */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col items-center text-center space-y-4"
            >
                <div className="w-24 h-24 rounded-full text-white bg-[var(--color-green)]/20 flex items-center justify-center border border-[var(--color-border)]/30">
                     <Database className="w-10 h-10 text-[var(--color-green)]" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">3. Update Completed</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-[200px]">Your stock is updated immediately on this website.</p>
                </div>
            </motion.div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4">Menu Options</h3>
            <ul className="space-y-4">
                <li className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-xl">
                    <span className="font-mono text-[var(--color-blue)]">1. Check Stock</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">See what you have left</span>
                </li>
                 <li className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-xl">
                    <span className="font-mono text-[var(--color-blue)]">2. Record Sale</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">Add a new sale you made</span>
                </li>
                 <li className="flex items-center justify-between p-3 bg-[var(--color-surface)] rounded-xl">
                    <span className="font-mono text-[var(--color-blue)]">3. Add Stock</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">Update how many items you have</span>
                </li>
            </ul>
        </GlassCard>

        <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4">Why use this?</h3>
            <ul className="space-y-4 text-sm text-[var(--color-text-secondary)]">
                <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-green)] flex-shrink-0" />
                    <span>Works on any mobile phone (Nokia touchlight included).</span>
                </li>
                 <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-green)] flex-shrink-0" />
                    <span>No internet connection or data required.</span>
                </li>
                 <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-green)] flex-shrink-0" />
                    <span>Instant sync with your web dashboard.</span>
                </li>
                 <li className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-green)] flex-shrink-0" />
                    <span>Secure and pin-protected transactions.</span>
                </li>
            </ul>
        </GlassCard>
      </div>
    </div>
  );
}

import { CheckCircle } from "lucide-react";
