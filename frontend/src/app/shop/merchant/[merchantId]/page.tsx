"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import ProductCard from "@/components/customer/ProductCard";
import { CardSkeleton } from "@/components/customer/Skeleton";
import { apiGet } from "@/lib/api";
import { ArrowLeft, Store, Package, Phone } from "lucide-react";

export default function MerchantProductsPage() {
  const params = useParams();
  const router = useRouter();
  const merchantId = params.merchantId as string;
  
  const [products, setProducts] = useState<any[]>([]);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchantData = async () => {
      setLoading(true);
      try {
        const response = await apiGet(`/api/products/public?merchantId=${merchantId}`);
        if (response.success) {
          const validResults = (response.data || []).filter((p: any) => p && p.merchant);
          setProducts(validResults);
          
          // Get merchant info from first product if available
          if (validResults.length > 0) {
            setMerchant(validResults[0].merchant);
          } else {
            // Fallback: fetch merchant info separately if needed
            // For now, if no products, we show empty state
          }
        }
      } catch (err) {
        console.error("Failed to fetch merchant products", err);
      } finally {
        setLoading(false);
      }
    };

    if (merchantId) {
      fetchMerchantData();
    }
  }, [merchantId]);

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-xs">Back</span>
        </button>

        {loading ? (
          <div className="space-y-12">
            <div className="h-24 w-full bg-[var(--color-surface)] animate-pulse rounded-3xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-12">
            <div className="p-8 rounded-[2.5rem] text-white bg-[var(--color-orange)]/10 border border-[var(--color-purple)]/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-orange)] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-[var(--color-orange)]/20">
                  {merchant?.businessName?.substring(0, 1) || "S"}
                </div>
                <div>
                  <h1 className="text-3xl font-black text-[var(--color-text-primary)] mb-1 tracking-tight">
                    {merchant?.businessName || "Merchant Store"}
                  </h1>
                  <div className="flex items-center gap-4 text-[var(--color-text-secondary)] text-sm font-medium">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[var(--color-blue)]" />
                      {merchant?.storeCode}
                    </span>
                    {merchant?.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[var(--color-blue)]" />
                        {merchant.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] text-center md:text-right">
                <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mb-1">Products</p>
                <p className="text-2xl font-black text-[var(--color-text-primary)] leading-none">{products.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-32 bg-[var(--color-surface)] rounded-[2.5rem] border border-dashed border-[var(--color-border)]">
            <div className="bg-[var(--color-surface)] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-700 shadow-xl border border-[var(--color-border)]">
              <Package className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">No products available</h3>
            <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto font-medium">
              This merchant hasn't listed any products yet.
            </p>
            <button 
              onClick={() => router.push('/shop')}
              className="mt-8 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold hover:bg-[var(--color-orange)] transition-all active:scale-95"
            >
              Back to Marketplace
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
