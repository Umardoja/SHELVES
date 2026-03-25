"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Skeleton } from "@/components/customer/Skeleton";
import { apiGet } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import { 
  Store, 
  ShoppingCart, 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RefreshCcw,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiPost } from "@/lib/api";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number | "">(1);
  const [adding, setAdding] = useState(false);

  // Negotiation Modal State
  const [showNegotiationModal, setShowNegotiationModal] = useState(false);
  const [customerOfferPrice, setCustomerOfferPrice] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amt);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiGet(`/api/products/public/${id}`);
        if (response.success) {
          setProduct(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const safeQty = !quantity || quantity < 1 ? 1 : quantity;
    setAdding(true);
    addToCart(product, safeQty);
    toast(`${safeQty}x ${product.name} added to cart!`, "success");
    setQuantity(1);
    setTimeout(() => {
      setAdding(false);
    }, 500);
  };

  const handleOpenNegotiation = () => {
    if (!isAuthenticated) {
      toast("Please login to negotiate price.", "error");
      router.push("/login?redirect=/shop/product/" + id);
      return;
    }

    const originalTotalPrice = product.sellingPrice * (quantity || 1);
    let discountPercent = 0;
    const safeQtyForCalc = Number(quantity) || 1;
    if (safeQtyForCalc >= 100) discountPercent = 0.12;
    else if (safeQtyForCalc >= 50) discountPercent = 0.08;
    else if (safeQtyForCalc >= 20) discountPercent = 0.05;

    const discountAmount = originalTotalPrice * discountPercent;
    let suggestedPrice = originalTotalPrice - discountAmount;

    // Local safety floor (mirroring backend min rule)
    const costTotal = (product.costPrice || 0) * safeQtyForCalc;
    const floor = costTotal * 1.05;
    if (suggestedPrice < floor && floor < originalTotalPrice) {
        suggestedPrice = floor;
    }

    setAiSuggestion({
      originalTotal: originalTotalPrice,
      suggestedTotal: suggestedPrice,
      discountPercent: discountPercent * 100
    });
    setCustomerOfferPrice(suggestedPrice.toString());
    setShowNegotiationModal(true);
  };

  const submitNegotiation = async () => {
    if (!customerOfferPrice || isNaN(Number(customerOfferPrice))) {
      toast("Please enter a valid offer price.", "error");
      return;
    }
    
    setSubmittingOffer(true);
    try {
      const res = await apiPost("/api/negotiations", {
        productId: product._id,
        quantity,
        customerOfferPrice: Number(customerOfferPrice),
        customerMessage
      });

      if (res.success) {
        toast("Negotiation request submitted! The merchant will review it.", "success");
        setShowNegotiationModal(false);
      } else {
        toast(res.message || "Failed to submit request", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error submitting offer", "error");
    } finally {
      setSubmittingOffer(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <div className="pt-8 space-y-4">
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <Navbar />
        <div className="container mx-auto px-6 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <button onClick={() => router.back()} className="text-[var(--color-blue)] font-bold hover:underline">
            Go back
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)]">
      <Navbar />

      <div className="container mx-auto px-6 py-12 md:py-20">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-blue)] font-bold mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to marketplace
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--color-surface)]/[0.02] rounded-[3rem] border border-[var(--color-border)] p-8 md:p-16 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 text-white bg-[var(--color-purple)]/10 rounded-full blur-[120px] -mr-32 -mt-32 transition-all group-hover:bg-[var(--color-orange)]/20" />
            
            <div className="relative z-10">
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-2 text-[var(--color-blue)] font-black tracking-widest uppercase text-xs mb-4">
                  <Store className="w-4 h-4" />
                  <span>{product.merchant?.businessName || "Verified Merchant"}</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-extrabold text-[var(--color-text-primary)] leading-[1.1] tracking-tight mb-8">
                  {product.name}
                </h1>
                <div className="text-4xl md:text-5xl font-black text-[var(--color-blue)]">
                  {formatCurrency(product.sellingPrice)}
                </div>
              </div>

              <div className="space-y-12">
                <div className="bg-[var(--color-surface)] p-8 md:p-12 rounded-[2.5rem] border border-[var(--color-border)] relative group/info">
                  <div className="absolute inset-0 text-white bg-gradient-brand opacity-0 group-hover/info:opacity-100 transition-opacity rounded-[2.5rem]" />
                  <div className="relative z-10">
                    <div className="text-white bg-[var(--color-purple)]/10 text-[var(--color-blue)] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--color-purple)]/20 inline-block mb-6">
                      {product.category || "General"}
                    </div>
                    <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-6">Product Insight</h2>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed text-xl font-medium">
                      {product.description || `High-quality ${product.name} meticulously sourced by ${product.merchant?.businessName || "our verified partner"}. Grab yours today while available.`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: ShieldCheck, label: "Verified", color: "text-[var(--color-green)]" },
                    { icon: Truck, label: "Global", color: "text-[var(--color-blue)]" },
                    { icon: RefreshCcw, label: "Fast", color: "text-amber-500" }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center p-8 text-center bg-[var(--color-surface)]/[0.03] rounded-3xl border border-[var(--color-border)] hover:bg-[var(--color-surface)]/[0.05] transition-colors">
                      <item.icon className={cn("w-10 h-10 mb-4", item.color)} />
                      <span className="text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-16 border-t border-[var(--color-border)] space-y-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center bg-[var(--color-surface)]/[0.05] rounded-[2rem] p-2 border border-[var(--color-border)] shadow-2xl">
                      <button 
                        onClick={() => setQuantity(Math.max(1, (Number(quantity) || 1) - 1))}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl hover:bg-[var(--color-surface)] transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                          type="number"
                          value={quantity}
                          min={1}
                          max={product.stock}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setQuantity("");
                              return;
                            }
                            const number = parseInt(value);
                            if (!isNaN(number) && number >= 1 && number <= product.stock) {
                              setQuantity(number);
                            }
                          }}
                          className="w-20 h-14 text-center text-2xl font-black text-[var(--color-text-primary)] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      <button 
                        onClick={() => setQuantity((Number(quantity) || 1) + 1)}
                        className="w-14 h-14 flex items-center justify-center rounded-2xl hover:bg-[var(--color-surface)] transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-xl font-bold text-[var(--color-text-secondary)]">
                      {product.stock > 0 ? (
                        <span className="text-[var(--color-blue)]">{product.stock} Units Left</span>
                      ) : (
                        <span className="text-rose-500">Sold Out</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={cn(
                      "w-full h-24 rounded-[2rem] flex items-center justify-center gap-4 font-black text-2xl transition-all shadow-2xl active:scale-[0.98]",
                      product.stock > 0 
                      ? "bg-[var(--color-orange)] text-white hover:bg-[var(--color-orange)] shadow-[var(--color-orange)]/30" 
                      : "bg-[var(--color-surface)] text-white-700 cursor-not-allowed"
                    )}
                  >
                    {adding ? (
                      <>Added to Cart!</>
                    ) : (
                      <>
                        <ShoppingCart className="w-8 h-8" />
                        Add to Cart • {formatCurrency(product.sellingPrice * (quantity || 1))}
                      </>
                    )}
                  </button>

                  {(product.sellingPrice * (Number(quantity) || 1)) >= 300000 && (
                    <button
                      onClick={handleOpenNegotiation}
                      className="w-full h-16 rounded-[1.5rem] mt-4 flex items-center justify-center gap-3 font-bold text-xl transition-all shadow-xl text-white bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-[var(--color-border)]/20 active:scale-[0.98]"
                    >
                      <MessageSquare className="w-6 h-6" />
                      Negotiate Bulk Price
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Negotiation Modal */}
      {showNegotiationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Negotiate Price</h2>
            <p className="text-[var(--color-text-secondary)] mb-6 flex items-center gap-2">
               You are offering for <strong>{quantity} units</strong> of {product.name}
            </p>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-6">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[var(--color-text-secondary)] text-sm">Original Total Price:</span>
                 <span className="text-[var(--color-text-primary)] line-through font-semibold">{formatCurrency(aiSuggestion?.originalTotal || 0)}</span>
               </div>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[var(--color-blue)] font-bold text-sm">AI Suggested Offer (-{aiSuggestion?.discountPercent}%):</span>
                 <span className="text-[var(--color-blue)] font-black text-xl">{formatCurrency(aiSuggestion?.suggestedTotal || 0)}</span>
               </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2">Your Offer Price Total (₦)</label>
                <input 
                  type="number" 
                  value={customerOfferPrice}
                  onChange={(e) => setCustomerOfferPrice(e.target.value)}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[var(--color-border)] transition-colors"
                  placeholder="Enter total amount"
                />
              </div>
              <div>
                <label className="block text-[var(--color-text-secondary)] text-sm font-semibold mb-2">Message to Merchant (Optional)</label>
                <textarea 
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl px-5 py-4 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border)] transition-colors resize-none"
                  placeholder="E.g., I'll buy continuously if we can agree on this."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowNegotiationModal(false)}
                className="flex-1 py-4 font-bold rounded-2xl border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button 
                onClick={submitNegotiation}
                disabled={submittingOffer}
                className="flex-1 py-4 font-bold rounded-2xl bg-[var(--color-orange)] hover:bg-[var(--color-orange)] transition-colors text-white disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {submittingOffer ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  "Submit Offer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
