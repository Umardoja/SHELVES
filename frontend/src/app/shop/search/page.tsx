"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import ProductCard from "@/components/customer/ProductCard";
import { CardSkeleton } from "@/components/customer/Skeleton";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, PackageX, Search, Store, Package, ChevronLeft, ChevronRight } from "lucide-react";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Pagination & Sort States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiGet("/api/products/categories");
        if (res.success) setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(false);
      try {
        const [prodRes, merchRes] = await Promise.all([
          apiGet(`/api/products/public?search=${searchTerm}&category=${category}&page=${currentPage}&limit=12&sort=${sortBy}`),
          searchTerm ? apiGet(`/api/merchants/search?q=${searchTerm}`) : Promise.resolve({ success: true, data: [] })
        ]);

        if (prodRes.success) {
          const validResults = (prodRes.data || []).filter((p: any) => p && p.merchant);
          setProducts(validResults);
          setTotalPages(prodRes.totalPages || 1);
        } else {
            setError(true);
        }

        if (merchRes.success) {
          setMerchants(merchRes.data || []);
        }
      } catch (err) {
        console.error("Search failed", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm, category, currentPage, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) params.set("q", searchTerm);
    else params.delete("q");
    params.set("page", "1"); // Reset to page 1 on search
    setCurrentPage(1);
    router.push(`/shop/search?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset to page 1 on sort change
  };

  const handleCategoryClick = (cat: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (cat) {
      params.set("category", cat);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    setCurrentPage(1);
    router.push(`/shop/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-black text-[var(--color-text-primary)] mb-2 tracking-tight">
            {searchTerm ? `Results for "${searchTerm}"` : "All Products"}
          </h1>
          <p className="text-[var(--color-text-secondary)] font-bold uppercase tracking-widest text-xs mb-6">
            {products.length} Items Found
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)] group-focus-within:text-[var(--color-blue)] transition-colors" />
            <input 
              type="text"
              placeholder="Search products or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl py-4 pl-12 pr-4 text-[var(--color-text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-[var(--color-border)] transition-all placeholder:text-slate-600"
            />
          </form>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-blue)] pointer-events-none" />
            <select 
              value={sortBy}
              onChange={handleSortChange}
              className="appearance-none bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:bg-[var(--color-surface)] transition-all font-sans"
            >
              <option value="newest" className="bg-[var(--color-surface)]">Newest First</option>
              <option value="price_high" className="bg-[var(--color-surface)]">Highest Price</option>
              <option value="price_low" className="bg-[var(--color-surface)]">Lowest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="w-full mb-12 overflow-x-auto no-scrollbar scroll-smooth border-y border-[var(--color-border)] py-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => handleCategoryClick(null)}
            className={cn(
              "px-6 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
              category === "" 
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
                "px-6 py-2 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                category === cat 
                  ? "bg-[var(--color-orange)] border-[var(--color-border)] text-white shadow-lg shadow-[var(--color-orange)]/20" 
                  : "bg-[var(--color-surface)] border-[var(--color-border)] text-white hover:bg-[var(--color-surface)] hover:border-[var(--color-border)]"
              )}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-32 bg-red-500/5 rounded-[2.5rem] border border-dashed border-[var(--color-border)]/20">
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Something went wrong</h3>
          <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto font-medium">
            Please try again later.
          </p>
        </div>
      ) : products.length > 0 || merchants.length > 0 ? (
        <div className="space-y-16">
          {/* Merchants Section */}
          {merchants.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Store className="w-5 h-5 text-[var(--color-blue)]" />
                Matching Merchants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {merchants.map((merchant) => (
                  <Link 
                    key={merchant.storeCode} 
                    href={`/shop/merchant/${merchant._id}`}
                    className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border)]/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--color-orange)] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[var(--color-orange)]/20">
                        {merchant.businessName.substring(0, 1)}
                      </div>
                      <div>
                        <h4 className="text-[var(--color-text-primary)] font-bold group-hover:text-[var(--color-blue)] transition-colors">{merchant.businessName}</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] font-medium">Store Code: {merchant.storeCode}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-[var(--color-blue)]" />
                Matching Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "w-12 h-12 rounded-xl border font-bold text-sm transition-all",
                        currentPage === i + 1
                          ? "bg-[var(--color-orange)] border-[var(--color-border)] text-white shadow-lg shadow-[var(--color-orange)]/20"
                          : "bg-[var(--color-surface)] border-[var(--color-border)] text-white hover:bg-[var(--color-surface)] hover:border-[var(--color-border)] hover:text-white"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
        <div className="text-center py-32 bg-[var(--color-surface)] rounded-[2.5rem] border border-dashed border-[var(--color-border)]">
          <div className="bg-[var(--color-surface)] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-700 shadow-xl border border-[var(--color-border)]">
            <PackageX className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">No results found</h3>
          <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto font-medium">
             We couldn't find any merchants or products matching "{query}".
          </p>
          <button 
            onClick={() => window.location.href = '/shop'}
            className="mt-8 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--color-orange)] transition-all active:scale-95"
          >
            Browse Marketplace
          </button>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-6 py-12">
          <div className="h-12 w-64 bg-[var(--color-surface)] animate-pulse rounded-xl mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
      <Footer />
    </main>
  );
}
