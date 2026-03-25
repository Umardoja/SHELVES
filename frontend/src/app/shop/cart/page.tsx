"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useCart } from "@/context/CartContext";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft,
  Store,
  ShieldCheck
} from "lucide-react";

export default function CartPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart, itemCount } = useCart();

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amt);
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)]">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] mb-12 tracking-tight">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="bg-[var(--color-surface)] rounded-[2.5rem] border border-dashed border-[var(--color-border)] py-32 text-center">
            <div className="bg-[var(--color-surface)] w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-700 shadow-2xl border border-[var(--color-border)]">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Cart is empty</h2>
            <p className="text-[var(--color-text-secondary)] mb-10 max-w-sm mx-auto font-medium">
              Looks like you haven't added anything yet. Explore our marketplace to find great products.
            </p>
            <Link 
              href="/shop"
              className="inline-flex items-center gap-3 bg-[var(--color-orange)] text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-[var(--color-orange)] transition-all active:scale-95 shadow-xl shadow-[var(--color-orange)]/20"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div 
                  key={item._id}
                  className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-6 flex items-center gap-8 group hover:border-[var(--color-border)]/30 hover:bg-[var(--color-surface)]/[0.07] transition-all"
                >
                  <div className="w-24 h-24 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center flex-shrink-0 border border-[var(--color-border)] shadow-xl">
                    <Store className="w-10 h-10 text-[var(--color-text-primary)]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-secondary)] uppercase font-black tracking-[0.2em] mb-1">
                          <Store className="w-3.5 h-3.5" />
                          {item.merchant.businessName}
                        </div>
                        <h3 className="font-extrabold text-[var(--color-text-primary)] text-xl line-clamp-1 group-hover:text-[var(--color-blue)] transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-slate-600 hover:text-rose-500 p-2 transition-colors bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-8">
                      <div className="text-2xl font-black text-[var(--color-blue)]">
                        {formatCurrency(item.sellingPrice)}
                      </div>
                      
                      <div className="flex items-center bg-[var(--color-surface)] rounded-xl p-1 border border-[var(--color-border)] shadow-inner">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface)] transition-all text-[var(--color-text-secondary)]"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-black text-[var(--color-text-primary)] text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface)] transition-all text-[var(--color-text-secondary)]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link 
                href="/shop"
                className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-blue)] font-black py-4 transition-colors uppercase tracking-widest text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-[var(--color-orange)] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-[var(--color-orange)]/20">
                <h2 className="text-2xl font-black mb-8 tracking-tight">Order Summary</h2>
                
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-indigo-200 font-bold">
                    <span>Subtotal ({itemCount})</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-indigo-200 font-bold">
                    <span>Shipping</span>
                    <span className="text-[var(--color-text-primary)] bg-[var(--color-surface)] px-3 py-1 rounded-lg text-[10px] items-center flex uppercase tracking-wider font-black">Negotiated</span>
                  </div>
                  <div className="border-t border-[var(--color-border)] pt-6 flex justify-between items-end">
                    <span className="text-xl font-black">Total Cost</span>
                    <span className="text-4xl font-black tracking-tighter">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                <Link 
                  href="/shop/checkout"
                  className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] h-16 rounded-2xl flex items-center justify-center gap-3 font-black text-lg transition-all active:scale-95 shadow-2xl hover:bg-indigo-900 group"
                >
                  Checkout Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <div className="mt-8 flex items-center justify-center gap-2 opacity-50 text-[10px] font-black uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-4 h-4" />
                  Secure Transaction
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
