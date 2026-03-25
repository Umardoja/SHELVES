"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import ProductCard from "@/components/customer/ProductCard";
import { CardSkeleton } from "@/components/customer/Skeleton";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Search, ArrowRight, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";

export default function ShopHome() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          apiGet(selectedCategory ? `/api/products/public?category=${selectedCategory}` : "/api/products/public"),
          apiGet("/api/products/categories")
        ]);

        if (prodRes.success) {
          const validProducts = (prodRes.data || []).filter((p: any) => p && p.merchant);
          setProducts(validProducts);
        }
        
        if (catRes.success) {
          setCategories(catRes.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [selectedCategory]);

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)] selection:text-indigo-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full text-white bg-[var(--color-purple)]/10 border border-[var(--color-purple)]/20 text-[var(--color-blue)] text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3 h-3" />
            <span>Premium Marketplace</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.1]">
            Everything you need,<br />
            <span className="text-[var(--color-blue)]">delivered.</span>
          </h1>

          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-blue)] transition-colors" />
            <input 
              type="text"
              placeholder="Search products, categories, or merchants..."
              className="w-full h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-16 pr-6 outline-none focus:bg-[var(--color-surface)] focus:border-[var(--color-border)]/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-[var(--color-text-secondary)] font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (window.location.href = `/shop/search?q=${searchQuery}`)}
            />
            <button 
              onClick={() => window.location.href = `/shop/search?q=${searchQuery}`}
              className="absolute right-3 top-3 h-10 px-6 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] text-white rounded-xl font-bold transition-all active:scale-95"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-4 opacity-40">
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
              <TrendingUp className="w-4 h-4" />
              Verified Sellers
            </div>
            <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4" />
              Secure Checkout
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="w-full mt-16 overflow-x-auto no-scrollbar scroll-smooth border-y border-[var(--color-border)] py-4">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleCategoryClick(null)}
              className={cn(
                "px-6 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                selectedCategory === null 
                  ? "bg-[var(--color-orange)] border-[var(--color-border)] text-white shadow-lg shadow-[var(--color-orange)]/20" 
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-white hover:bg-[var(--color-surface)] hover:border-[var(--color-border)]"
              )}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedCategory === cat 
                    ? "bg-[var(--color-orange)] border-[var(--color-border)] text-white shadow-lg shadow-[var(--color-orange)]/20" 
                    : "bg-[var(--color-surface)] border-[var(--color-border)] text-white hover:bg-[var(--color-surface)] hover:border-[var(--color-border)]"
                )}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[var(--color-text-primary)] mb-1">
              {selectedCategory ? `${selectedCategory} Products` : "Featured Products"}
            </h2>
            <p className="text-[var(--color-text-secondary)] font-medium text-sm md:text-base">
              {selectedCategory ? `Browsing our top ${selectedCategory} selection` : "Handpicked items from our pro merchants"}
            </p>
          </div>
          {selectedCategory && (
            <button 
              onClick={() => handleCategoryClick(null)}
              className="flex items-center gap-2 text-[var(--color-blue)] font-bold hover:text-[var(--color-purple)] transition-colors"
            >
              Clear Filter
            </button>
          )}
          {!selectedCategory && (
            <Link href="/shop/search" className="flex items-center gap-2 text-[var(--color-blue)] font-bold hover:text-[var(--color-purple)] transition-colors">
              Browse all
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-24 bg-[var(--color-surface)] rounded-2xl md:rounded-3xl border border-dashed border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] font-bold md:text-lg">No products found.</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
