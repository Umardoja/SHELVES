"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPatch } from "@/lib/api";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useToast } from "@/context/ToastContext";
import { Handshake, Loader2, CheckCircle2, ShoppingCart, ArrowLeft } from "lucide-react";

export default function CustomerNegotiations() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/profile/negotiations");
      return;
    }
    
    if (isAuthenticated) {
      fetchNegotiations();
    }
  }, [isAuthenticated, authLoading]);

  const fetchNegotiations = async () => {
    try {
      const res = await apiGet("/api/negotiations/customer");
      if (res.success) {
        setNegotiations(res.data);
      }
    } catch (err: any) {
      toast("Failed to load your negotiations", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await apiPatch(`/api/negotiations/${id}/accept`, {});
      if (res.success) {
        toast("Negotiation accepted successfully!", "success");
        fetchNegotiations();
      } else {
        toast(res.message, "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to accept negotiation", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-amber-400 bg-amber-400/10 border-[var(--color-border)]/20";
      case "COUNTERED": return "text-[var(--color-blue)] bg-indigo-400/10 border-[var(--color-border)]/20";
      case "ACCEPTED": return "text-[var(--color-green)] bg-[var(--color-green)]/10 border-[var(--color-border)]/20";
      case "REJECTED": return "text-rose-400 bg-rose-400/10 border-[var(--color-border)]/20";
      case "EXPIRED": return "text-[var(--color-text-secondary)] bg-slate-400/10 border-[var(--color-border)]";
      default: return "text-[var(--color-text-secondary)] bg-slate-400/10 border-[var(--color-border)]";
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-blue)] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)]">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-24 pb-20 md:pb-32">
        <button 
          onClick={() => router.push("/profile")}
          className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-blue)] font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </button>

        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <Handshake className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-blue)]" />
              My Negotiations
            </h1>
            <p className="text-[var(--color-text-secondary)] font-medium text-sm md:text-base">
              Track your bulk offers and respond to merchant counters.
            </p>
          </div>

          {negotiations.length === 0 ? (
            <div className="bg-[var(--color-surface)]/[0.02] border border-[var(--color-border)] rounded-[2.5rem] p-12 text-center flex flex-col items-center shadow-2xl">
              <Handshake className="w-20 h-20 text-[var(--color-blue)]/50 mb-6" />
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">No Negotiations Found</h2>
              <p className="text-[var(--color-text-secondary)] mb-8">You haven't made any bulk price offers yet.</p>
              <button 
                onClick={() => router.push("/shop")}
                className="px-8 py-4 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] rounded-2xl font-bold text-white transition-all shadow-xl shadow-[var(--color-purple)]/20"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {negotiations.map((neg) => (
                <div key={neg._id} className="bg-[var(--color-surface)]/[0.02] border border-[var(--color-border)] rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-[var(--color-border)] transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getStatusColor(neg.status)}`}>
                          {neg.status}
                        </span>
                        <span className="text-xs font-bold text-[var(--color-blue)] uppercase tracking-widest">
                          {neg.quantity} Units
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{neg.productId?.name}</h3>
                      <div className="text-[var(--color-text-secondary)] text-sm mt-1">
                        Merchant: <span className="text-[var(--color-text-secondary)] font-semibold">{neg.merchantId?.businessName}</span>
                      </div>
                      
                      {neg.merchantMessage && (
                        <div className="mt-4 text-white bg-[var(--color-orange)] p-4 rounded-xl border border-[var(--color-purple)]/20">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-blue)] mb-1">Message from merchant</p>
                          <p className="text-sm italic text-[var(--color-text-secondary)]">"{neg.merchantMessage}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col items-start md:items-end gap-1 w-full">
                       <div className="text-sm text-[var(--color-text-secondary)] flex justify-between w-full md:w-auto md:gap-8">
                         <span>Original Total:</span>
                         <span className="line-through">{formatCurrency(neg.originalTotalPrice)}</span>
                       </div>
                       <div className="text-sm text-[var(--color-blue)] flex justify-between w-full md:w-auto md:gap-8 font-semibold">
                         <span>AI Suggested:</span>
                         <span>{formatCurrency(neg.aiSuggestedPrice)}</span>
                       </div>
                       
                       <div className={`mt-2 p-3 rounded-xl border w-full md:w-auto md:min-w-[200px] text-right ${
                         neg.status === "COUNTERED" ? "bg-amber-500/10 border-[var(--color-border)]/20" : "bg-[var(--color-surface)] border-[var(--color-border)]"
                       }`}>
                         <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)] mb-1">
                           {neg.status === "COUNTERED" ? "Merchant Counter Offer" : "Your Offer"}
                         </p>
                         <p className={`text-xl font-black ${neg.status === "COUNTERED" ? "text-amber-400" : "text-[var(--color-text-primary)]"}`}>
                           {formatCurrency(neg.status === "COUNTERED" ? neg.merchantCounterOfferPrice : neg.customerOfferPrice)}
                         </p>
                       </div>
                    </div>

                    <div className="w-full md:w-auto mt-4 md:mt-0 flex flex-col gap-3">
                      {neg.status === "COUNTERED" && (
                        <button 
                          disabled={actionLoading === neg._id}
                          onClick={() => handleAccept(neg._id)}
                          className="w-full md:w-40 py-3 rounded-xl text-white bg-[var(--color-green)]/10 text-[var(--color-green)] font-bold hover:bg-[var(--color-green)]/20 border border-[var(--color-border)]/20 transition-all flex justify-center items-center gap-2"
                        >
                          {actionLoading === neg._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Accept Counter</>}
                        </button>
                      )}
                      
                      {neg.status === "ACCEPTED" && (
                        <button 
                          onClick={() => router.push(`/shop/checkout?negotiationId=${neg._id}`)}
                          className="w-full md:w-40 py-3 rounded-xl bg-[var(--color-orange)] text-white font-bold hover:bg-[var(--color-orange)] transition-all flex justify-center items-center gap-2 shadow-lg shadow-[var(--color-purple)]/20"
                        >
                          <ShoppingCart className="w-4 h-4" /> Checkout Now
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
