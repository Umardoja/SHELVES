"use client";

import Link from "next/link";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="pt-24 pb-12 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
             <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded text-white bg-[var(--color-orange)] flex items-center justify-center shadow-sm">
                  <span className="text-[var(--color-text-primary)] font-bold text-lg leading-none">U</span>
                </div>
                <span className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
                  SHELVES
                </span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-[200px]">
              The intelligent operating system for multi-location retail enterprises.
            </p>
            <div className="flex gap-4">
               {[Twitter, Linkedin, Github].map((Icon, i) => (
                   <Link key={i} href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" aria-label="Social Link">
                        <Icon className="w-5 h-5" />
                   </Link>
               ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4 text-sm text-[var(--color-text-secondary)] font-medium">
                {["Core Features", "USSD Integration", "API Access", "Security", "Status"].map(item => (
                    <li key={item}><Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">{item}</Link></li>
                ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Company</h4>
            <ul className="space-y-4 text-sm text-[var(--color-text-secondary)] font-medium">
                { ["About SHELVES", "Success Stories", "Press Kit", "Privacy Policy", "Terms of Service"].map(item => (
                    <li key={item}><Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">{item}</Link></li>
                ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-widest">Support</h4>
            <ul className="space-y-4 text-sm text-[var(--color-text-secondary)] font-medium">
                {["Documentation", "Community Hub", "Enterprise Solutions", "Contact Relations"].map(item => (
                    <li key={item}><Link href="#" className="hover:text-[var(--color-text-primary)] transition-colors">{item}</Link></li>
                ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 text-xs font-semibold uppercase tracking-[0.1em]">
                Built for the merchants of the future.
            </p>
            <p className="text-slate-600 text-xs font-medium">
                © {new Date().getFullYear()} SHELVES. All rights reserved. SOC2 Compliant. Designed in Lagos, Nigeria.
            </p>
        </div>
      </div>
    </footer>
  );
}
