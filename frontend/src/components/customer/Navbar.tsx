"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, Search, Store, ClipboardList, User, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { name: "Marketplace", href: "/shop", icon: Store },
    { name: "Search", href: "/shop/search", icon: Search },
    { name: "My Orders", href: "/shop/orders", icon: ClipboardList },
    { name: "Profile", href: "/profile", icon: User },
  ];

  if (user?.roles?.isMerchant) {
    navLinks.push({ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10">
              <Image 
                src={"/logo.png"} 
                alt="SHELVES" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-black text-[var(--color-text-primary)] tracking-tighter">SHELVES</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-[var(--color-blue)]",
                  pathname === link.href ? "text-[var(--color-blue)]" : "text-[var(--color-text-secondary)]"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/shop/cart"
              className="relative p-2 md:p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl md:rounded-2xl hover:bg-[var(--color-surface)] transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-blue)]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-orange)] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--color-border)] shadow-lg">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                      isActive 
                        ? "bg-[var(--color-purple)]/10 text-[var(--color-blue)] border border-[var(--color-purple)]/20" 
                        : "text-white hover:bg-[var(--color-surface)] hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
