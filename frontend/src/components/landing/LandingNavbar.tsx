"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#ussd" },
    { name: "Resources", href: "#how-it-works" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-4" : "py-6"
      }`}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`flex items-center justify-between rounded-xl px-6 py-2.5 transition-all duration-300 ${
            isScrolled
              ? "bg-[var(--color-surface)]/80 backdrop-blur-md border border-[var(--color-border)] shadow-lg"
              : "bg-transparent border border-transparent"
          }`}
        >
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-indigo-500 rounded-lg">
            <div className="relative w-10 h-10 transition-transform duration-200 group-hover:scale-105">
              <Image 
                src={"/logo.png"} 
                alt="SHELVES Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-[var(--color-text-primary)] tracking-tighter ml-1">
              SHELVES
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors focus-visible:text-[var(--color-text-primary)] focus-visible:outline-none"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-lg bg-[var(--color-orange)] text-white text-sm font-semibold hover:bg-[var(--color-orange)] transition-all shadow-sm active:scale-95"
            >
              Start Using SHELVES
            </Link>
          </div>

          {/* Mobile Menu Interaction */}
          <button
            className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Interaction Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 mx-6 p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl md:hidden shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-[var(--color-text-secondary)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-[var(--color-surface)] my-2" />
              <Link href="/login" className="text-center font-medium py-2">Sign In</Link>
              <Link href="/register" className="py-3 text-center bg-[var(--color-orange)] text-white rounded-xl font-semibold">Start Free Trial</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
