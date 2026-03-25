"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPatch } from "@/lib/api";
import { Skeleton } from "@/components/customer/Skeleton";
import { useToast } from "@/context/ToastContext";
import { Handshake, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";

export default function MerchantNegotiations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [negotiations, setNegotiations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Counter Modal State
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedNeg, setSelectedNeg] = useState<any>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const fetchNegotiations = async () => {
    try {
      const res = await apiGet("/api/negotiations/merchant");
      if (res.success) {
        setNegotiations(res.data);
      }
    } catch (err: any) {
      toast("Failed to load negotiations", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, action: "accept" | "reject") => {
    try {
      let endpoint = `/api/negotiations/${id}/${action === "accept" ? "accept" : "respond"}`;
      let body = action === "reject" ? { status: "REJECTED" } : {};
      
      const res = await apiPatch(endpoint, body);
      if (res.success) {
        toast(`Negotiation ${action}ed successfully`, "success");
        fetchNegotiations();
      } else {
        toast(res.message, "error");
      }
    } catch (err: any) {
      toast(err.message || `Error ${action}ing negotiation`, "error");
    }
  };

  const submitCounter = async () => {
    if (!counterPrice || isNaN(Number(counterPrice))) {
      toast("Invalid counter price", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPatch(`/api/negotiations/${selectedNeg._id}/respond`, {
        status: "COUNTERED",
        merchantCounterOfferPrice: Number(counterPrice),
        merchantMessage: counterMessage
      });
      if (res.success) {
        toast("Counter offer submitted", "success");
        setShowCounterModal(false);
        fetchNegotiations();
      } else {
        toast(res.message, "error");
      }
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] flex items-center gap-3">
            <Handshake className="w-8 h-8 text-[var(--color-blue)]" />
            Price Negotiations
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2 font-medium">Review customer offers for bulk purchases.</p>
        </div>
      </div>

      {negotiations.length === 0 ? (
        <div className="bg-[var(--color-surface)]/[0.02] border border-[var(--color-border)] rounded-[2.5rem] p-12 text-center flex flex-col items-center shadow-2xl">
          <Handshake className="w-20 h-20 text-[var(--color-blue)]/50 mb-6" />
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">No Active Negotiations</h2>
          <p className="text-[var(--color-text-secondary)]">When a customer offers a bulk price, it will appear here.</p>
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
                    Customer: <span className="text-[var(--color-text-secondary)] font-semibold">{neg.customerId?.businessName || neg.customerId?.name || neg.customerId?.phone}</span>
                  </div>
                  {neg.customerMessage && (
                    <div className="mt-3 bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border)] text-sm italic text-[var(--color-text-secondary)]">
                      "{neg.customerMessage}"
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-start md:items-end gap-1">
                   <div className="text-sm text-[var(--color-text-secondary)] flex justify-between w-full md:w-auto md:gap-8">
                     <span>Original Total:</span>
                     <span className="line-through">{formatCurrency(neg.originalTotalPrice)}</span>
                   </div>
                   <div className="text-sm text-[var(--color-blue)] flex justify-between w-full md:w-auto md:gap-8 font-semibold">
                     <span>AI Suggested:</span>
                     <span>{formatCurrency(neg.aiSuggestedPrice)}</span>
                   </div>
                   <div className="text-lg text-[var(--color-text-primary)] font-black flex justify-between w-full md:w-auto md:gap-8 mt-2 items-center">
                     <span className="text-sm">Customer Offer:</span>
                     <span className="text-amber-400 text-2xl">{formatCurrency(neg.customerOfferPrice)}</span>
                   </div>
                </div>

                {neg.status === "PENDING" && (
                  <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <button 
                      onClick={() => handleStatusUpdate(neg._id, "accept")}
                      className="flex-1 md:w-32 py-2.5 rounded-xl text-white bg-[var(--color-green)]/10 text-[var(--color-green)] font-bold hover:bg-[var(--color-green)]/20 border border-[var(--color-border)]/20 transition-all flex justify-center items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedNeg(neg);
                        setCounterPrice(neg.aiSuggestedPrice.toString());
                        setShowCounterModal(true);
                      }}
                      className="flex-1 md:w-32 py-2.5 rounded-xl text-white bg-[var(--color-purple)]/10 text-[var(--color-blue)] font-bold hover:bg-[var(--color-orange)]/20 border border-[var(--color-purple)]/20 transition-all flex justify-center items-center gap-2"
                    >
                      <RefreshCcw className="w-4 h-4" /> Counter
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(neg._id, "reject")}
                      className="flex-1 md:w-32 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-bold hover:bg-rose-500/20 border border-[var(--color-border)]/20 transition-all flex justify-center items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}

                {neg.status === "COUNTERED" && (
                  <div className="w-full md:w-auto mt-4 md:mt-0 p-4 rounded-xl text-white bg-[var(--color-orange)] border border-[var(--color-purple)]/20 text-right">
                    <p className="text-xs text-[var(--color-blue)] font-bold uppercase tracking-wider mb-1">Your Counter Offer</p>
                    <p className="text-xl font-black text-[var(--color-text-primary)]">{formatCurrency(neg.merchantCounterOfferPrice)}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">Waiting for customer response</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter Offer Modal */}
      {showCounterModal && selectedNeg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Counter Offer</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-[var(--color-surface)] p-4 rounded-xl">
                 <p className="text-sm text-[var(--color-text-secondary)] mb-1">Customer's Offer:</p>
                 <p className="text-2xl font-black text-amber-400">{formatCurrency(selectedNeg.customerOfferPrice)}</p>
              </div>

              <div>
                <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2">Your New Total Price (₦)</label>
                <input 
                  type="number" 
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[var(--color-border)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2">Message to Customer (Optional)</label>
                <textarea 
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border)] transition-colors resize-none"
                  placeholder="E.g., I can do this price instead..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowCounterModal(false)}
                className="flex-1 py-3 font-bold rounded-2xl border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button 
                onClick={submitCounter}
                disabled={submitting}
                className="flex-1 py-3 font-bold rounded-2xl bg-[var(--color-orange)] hover:bg-[var(--color-orange)] transition-colors text-white flex justify-center items-center disabled:opacity-50"
              >
                {submitting ? <RefreshCcw className="w-5 h-5 animate-spin" /> : "Send Counter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
