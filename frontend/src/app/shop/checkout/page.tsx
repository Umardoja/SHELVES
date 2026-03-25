"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { apiGet, apiPost } from "@/lib/api";
import {
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  ArrowRight,
  PackageCheck,
  Loader2,
  Lock,
  Store,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import Script from "next/script";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const negotiationId = searchParams.get("negotiationId");
  
  const { cart, cartTotal, clearCart, itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [negotiation, setNegotiation] = useState<any>(null);
  const [loadingNegotiation, setLoadingNegotiation] = useState(!!negotiationId);

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderResults, setOrderResults] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amt);
  };

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || "",
        customerPhone: user.phone || "",
        customerEmail: user.email || "",
      }));
    }
  }, [user]);

  // Fetch negotiation if exists
  useEffect(() => {
    const fetchNegotiation = async () => {
      try {
        const res = await apiGet(`/api/negotiations/${negotiationId}`);
        if (res.success && res.data.status === "ACCEPTED") {
          setNegotiation(res.data);
        } else {
          toast("Invalid or expired negotiation", "error");
          router.push("/shop");
        }
      } catch (err) {
        toast("Failed to load negotiation details", "error");
        router.push("/shop");
      } finally {
        setLoadingNegotiation(false);
      }
    };

    if (negotiationId && isAuthenticated) {
      fetchNegotiation();
    }
  }, [negotiationId, isAuthenticated]);

  // Auto-redirect if cart is empty and no negotiation is present, and not on success screen
  useEffect(() => {
    if (!negotiationId && cart.length === 0 && !success) {
      router.push("/shop/cart");
    }
  }, [cart, success, router, negotiationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      if (negotiationId && negotiation) {
        // Submit negotiated order
        const res = await apiPost(`/api/negotiations/${negotiationId}/checkout`, {
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          address: formData.address,
        });
        setOrderResults([res]);
        setSuccess(true);
        toast("Negotiated order placed successfully!", "success");
      } else {
        // Standard cart checkout
        const merchants = Array.from(
          new Set(cart.map((item) => item.merchant._id)),
        );

        const results = [];
        for (const merchantId of merchants) {
          const merchantItems = cart.filter(
            (item) => item.merchant._id === merchantId,
          );
          const res = await apiPost("/api/orders/public", {
            merchantId,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            items: merchantItems.map((item) => ({
              productCode: item.productCode,
              name: item.name,
              quantity: item.quantity,
            })),
          });
          results.push(res);
        }

        setOrderResults(results);
        setSuccess(true);
        toast("Order placed successfully!", "success");
        clearCart();
      }
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
      toast(err.message || "Order failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Script is now handled by next/script
  }, []);

  const handlePaystackPayment = (orderResult?: any) => {
    // Make sure PaystackPop is loaded
    if (typeof window.PaystackPop === "undefined") {
      alert("Paystack is not loaded yet. Please try again.");
      return;
    }

    const negotiatedPrice = negotiation ? (negotiation.merchantCounterOfferPrice || negotiation.customerOfferPrice) : null;
    const amount = orderResult?.payment?.totalAmount || negotiatedPrice || cartTotal;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, // frontend public key
      email: formData.customerEmail, // customer's email
      amount: amount * 100, // Paystack uses kobo
      currency: "NGN",
      ref: `ref_${Date.now()}`, // unique reference
      callback: function (response: any) {
        // ✅ Must be a proper function, not undefined
        console.log("Payment successful!", response);

        // Send reference to backend for verification
        fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: response.reference }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Backend verification result:", data);
            // Update UI to show success
          })
          .catch((err) => {
            console.error("Verification error:", err);
          });
      },
      onClose: function () {
        console.log("Payment closed by user");
      },
    });

    handler.openIframe();
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 py-32">
          <div className="max-w-md w-full text-center space-y-10 animate-scale-in">
            <div className="text-white bg-[var(--color-green)]/10 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto text-[var(--color-green)] shadow-2xl shadow-[var(--color-purple)]/10 border border-[var(--color-border)]/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] tracking-tight">
                Order Placed!
              </h1>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed font-medium">
                Your order has been sent to our merchants.
              </p>
            </div>

            {orderResults.length > 0 && (
              <div className="space-y-6 text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
                {orderResults.map((res: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 rounded-[2rem] space-y-6 shadow-2xl"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest block">
                          Merchant
                        </label>
                        <h3 className="text-2xl font-black text-[var(--color-text-primary)]">
                          {res.merchant.name}
                        </h3>
                        <p className="text-[var(--color-text-secondary)] font-bold flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[var(--color-blue)]" />
                          {res.merchant.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest block">
                          Status
                        </label>
                        {res.paid ? (
                          <span className="bg-[var(--color-green)] text-white text-[10px] font-black px-3 py-1 rounded-full border border-[var(--color-border)]/20 uppercase tracking-widest animate-pulse">
                            Paid
                          </span>
                        ) : (
                          <span className="text-white bg-[var(--color-green)]/10 text-[var(--color-green)] text-[10px] font-black px-3 py-1 rounded-full border border-[var(--color-border)]/20">
                            SENT
                          </span>
                        )}
                      </div>
                    </div>

                    {!showPayment ? (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => setShowPayment(true)}
                          className="w-full h-14 text-white bg-[var(--color-orange)]/10 text-[var(--color-blue)] border border-[var(--color-purple)]/20 rounded-2xl font-black text-sm hover:bg-[var(--color-orange)]/20 transition-all flex items-center justify-center gap-2"
                        >
                          Manual Bank Transfer
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {!res.paid && (
                          <button
                            id={`pay-btn-${idx}`}
                            onClick={() => handlePaystackPayment(res)}
                            className="w-full h-14 bg-[var(--color-green)] text-white rounded-2xl font-black text-sm hover:bg-[var(--color-green)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[var(--color-purple)]/10 active:scale-95"
                          >
                            <ShieldCheck className="w-5 h-5 text-emerald-100" />
                            Pay with Paystack
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-white bg-[var(--color-orange)]/5 border border-[var(--color-border)]/10 rounded-2xl p-6 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center pb-4 border-b border-[var(--color-border)]">
                          <span className="text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-[0.15em]">
                            Total to Pay
                          </span>
                          <span className="text-2xl font-black text-[var(--color-blue)]">
                            {formatCurrency(res.payment.totalAmount)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">
                              Bank Name
                            </label>
                            <p className="text-[var(--color-text-primary)] font-bold">
                              {res.merchant.bankName || "Not Set"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">
                              Account Number
                            </label>
                            <p className="text-[var(--color-text-primary)] font-bold">
                              {res.merchant.accountNumber || "Not Set"}
                            </p>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">
                              Account Name
                            </label>
                            <p className="text-[var(--color-text-primary)] font-bold">
                              {res.merchant.accountName || res.merchant.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          {!res.paid && (
                            <button
                              onClick={() => handlePaystackPayment(res)}
                              className="w-full h-12 bg-[var(--color-green)] text-white rounded-xl font-black text-xs hover:bg-[var(--color-green)] transition-all flex items-center justify-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Pay instantly with Paystack
                            </button>
                          )}

                          <div className="text-white bg-[var(--color-green)]/5 border border-[var(--color-border)]/10 p-3 rounded-xl flex items-center gap-3">
                            <ShieldCheck className="w-4 h-4 text-[var(--color-green)]" />
                            <p className="text-[9px] font-black text-[var(--color-green)] uppercase tracking-widest">
                              Verified Payment Details
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="pt-8">
              <button
                onClick={() => router.push("/shop")}
                className="w-full bg-[var(--color-orange)] text-white h-16 rounded-2xl font-black text-lg hover:bg-[var(--color-orange)] transition-all active:scale-95 shadow-2xl shadow-[var(--color-orange)]/10"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Authentication Prompt
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 py-24">
          <div className="max-w-xl w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2.5rem] p-12 text-center space-y-10 shadow-2xl">
            <div className="text-white bg-[var(--color-orange)]/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-[var(--color-blue)] border border-[var(--color-purple)]/20">
              <Lock className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Login Required
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg font-medium leading-relaxed">
                To complete your order and track your history, please sign in or
                create a free merchant account.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => router.push("/login?redirect=/shop/checkout")}
                className="flex-1 bg-[var(--color-orange)] text-white h-16 rounded-2xl font-black text-lg hover:bg-[var(--color-orange)] transition-all active:scale-95"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/register?redirect=/shop/checkout")}
                className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] h-16 rounded-2xl font-black text-lg hover:bg-[var(--color-surface)] transition-all active:scale-95"
              >
                Join SHELVES
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Detect negotiated checkout
  const negotiatedTotal = negotiation ? (negotiation.merchantCounterOfferPrice || negotiation.customerOfferPrice) : null;

  // Safe final total
  const displayTotal = negotiatedTotal !== null ? negotiatedTotal : cartTotal;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)]">
      <Script
        src="https://js.paystack.co/v1/inline.js"
        strategy="afterInteractive"
      />
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] mb-2 tracking-tight">
              Checkout
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-12 font-bold uppercase tracking-[0.2em] text-xs">
              Verify your information
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-[var(--color-blue)] transition-colors" />
                    <input
                      required
                      type="text"
                      placeholder="Enter your name"
                      className="w-full h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-14 pr-4 outline-none focus:bg-[var(--color-surface)]/[0.08] focus:border-[var(--color-border)]/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-[var(--color-text-secondary)] font-bold"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-[var(--color-blue)] transition-colors" />
                    <input
                      required
                      type="email"
                      placeholder="Enter your email"
                      className="w-full h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-14 pr-4 outline-none focus:bg-[var(--color-surface)]/[0.08] focus:border-[var(--color-border)]/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-[var(--color-text-secondary)] font-bold"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-[var(--color-blue)] transition-colors" />
                    <input
                      required
                      type="tel"
                      placeholder="090..."
                      className="w-full h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-14 pr-4 outline-none focus:bg-[var(--color-surface)]/[0.08] focus:border-[var(--color-border)]/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-[var(--color-text-secondary)] font-bold"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customerPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">
                  Delivery Address
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-6 w-5 h-5 text-slate-600 group-focus-within:text-[var(--color-blue)] transition-colors" />
                  <textarea
                    required
                    placeholder="Enter full delivery coordinates..."
                    rows={4}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-14 pr-4 py-5 outline-none focus:bg-[var(--color-surface)]/[0.08] focus:border-[var(--color-border)]/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-[var(--color-text-secondary)] font-bold resize-none"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-500/10 text-rose-400 p-5 rounded-2xl text-sm font-bold border border-[var(--color-border)]/20">
                  {error}
                </div>
              )}

              <div className="pt-8">
                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[var(--color-orange)] text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-lg hover:bg-[var(--color-orange)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-[var(--color-orange)]/20"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--color-surface)] rounded-[2.5rem] p-10 border border-[var(--color-border)] shadow-2xl sticky top-28">
              <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-10 flex items-center gap-3 tracking-tight">
                <PackageCheck className="w-7 h-7 text-[var(--color-blue)]" />
                Order Summary
              </h2>

              <div className="space-y-8 mb-12 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                {negotiation ? (
                  <div className="flex gap-5">
                    <div className="w-16 h-16 bg-[var(--color-surface)] rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--color-border)] relative">
                      <span className="absolute -top-2 -right-2 bg-[var(--color-orange)] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--color-border)]">
                        {negotiation.quantity}
                      </span>
                      <Store className="w-8 h-8 text-[var(--color-text-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[var(--color-text-primary)] line-clamp-1">
                        {negotiation.productId?.name}
                      </h4>
                      <p className="text-[10px] text-amber-400 font-bold tracking-widest truncate mt-1">
                        NEGOTIATED BULK PRICE
                      </p>
                    </div>
                    <div className="text-right font-black text-amber-400">
                      {formatCurrency(displayTotal)}
                    </div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item._id} className="flex gap-5">
                      <div className="w-16 h-16 bg-[var(--color-surface)] rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--color-border)] relative">
                        <span className="absolute -top-2 -right-2 bg-[var(--color-orange)] text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--color-border)]">
                          {item.quantity}
                        </span>
                        <Store className="w-8 h-8 text-[var(--color-text-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--color-text-primary)] line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-black tracking-widest truncate mt-1">
                          {item.merchant.businessName}
                        </p>
                      </div>
                      <div className="text-right font-black text-[var(--color-blue)]">
                        {formatCurrency(item.sellingPrice * item.quantity)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-5 pt-10 border-t border-[var(--color-border)]">
                <div className="flex justify-between text-[var(--color-text-secondary)] font-bold text-sm tracking-tight">
                  <span>Subtotal ({negotiation ? '1' : itemCount} items)</span>
                  <span>{formatCurrency(displayTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--color-green)] border border-[var(--color-border)]/10 text-white bg-[var(--color-green)]/5 px-4 py-2 rounded-xl">
                  <span className="font-bold text-xs uppercase tracking-widest">
                    Safe Checkout
                  </span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex justify-between items-end pt-5">
                  <span className="text-xl font-black text-[var(--color-text-primary)] leading-none">
                    Total Payment
                  </span>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[var(--color-blue)] leading-none mb-1">
                      {formatCurrency(displayTotal)}
                    </div>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      Pay on Delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--color-border)]/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
