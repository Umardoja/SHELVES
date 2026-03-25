"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/customer/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CardSkeleton } from "@/components/customer/Skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  ClipboardList,
  Package,
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Hourglass,
  Star,
  ShoppingBag,
} from "lucide-react";

// ─── Status colour config ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  badge: string;
}> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    badge: "text-amber-400 bg-amber-400/10 border border-[var(--color-border)]/30",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    badge: "text-[var(--color-blue)] bg-blue-400/10 border border-[var(--color-border)]/30",
  },
  PROCESSING: {
    label: "Processing",
    icon: Hourglass,
    badge: "text-orange-400 bg-orange-400/10 border border-[var(--color-border)]/30",
  },
  COMPLETED: {
    label: "Completed",
    icon: Star,
    badge: "text-[var(--color-green)] bg-[var(--color-green)]/10 border border-[var(--color-border)]/30",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    badge: "text-[var(--color-green)] bg-[var(--color-green)]/10 border border-[var(--color-border)]/30",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    badge: "text-rose-400 bg-rose-400/10 border border-[var(--color-border)]/30",
  },
  CANCELLED_BY_CUSTOMER: {
    label: "Cancelled",
    icon: XCircle,
    badge: "text-[var(--color-text-secondary)] bg-slate-400/10 border border-[var(--color-border)]",
  },
};

function getStatus(rawStatus: string | undefined) {
  const key = (rawStatus ?? "").toUpperCase();
  return STATUS_CONFIG[key] ?? {
    label: rawStatus || "Unknown",
    icon: AlertCircle,
    badge: "text-[var(--color-text-secondary)] bg-slate-400/10 border border-[var(--color-border)]",
  };
}

interface Order {
  _id: string;
  productName: string;
  productCode: string;
  quantity: number;
  status: string;
  createdAt: string;
  merchantNote?: string;
  merchantId?: {
    _id: string;
    businessName: string;
    phone: string;
  } | null;
}

// ─── Order Card ──────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const cfg = getStatus(order.status);
  const StatusIcon = cfg.icon;
  const merchant = order.merchantId;

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-border)]/30 transition-all">
      <div className="flex flex-col md:flex-row md:items-center gap-4">

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl text-white bg-[var(--color-purple)]/10 flex items-center justify-center flex-shrink-0">
          <Package className="w-6 h-6 text-[var(--color-blue)]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-[var(--color-text-primary)] text-base truncate">{order.productName}</p>
            <span className="text-slate-600 text-xs">×{order.quantity}</span>
          </div>
          {merchant && (
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] font-semibold">
              <Store className="w-3 h-3" />
              {merchant.businessName}
            </div>
          )}
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            {new Date(order.createdAt).toLocaleDateString("en-NG", {
              day: "numeric", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
          {order.merchantNote && (
            <p className="text-[11px] text-[var(--color-text-secondary)] italic mt-1">💬 &ldquo;{order.merchantNote}&rdquo;</p>
          )}
        </div>

        {/* Status */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${cfg.badge}`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </div>
      </div>
    </div>
  );
}

// ─── Inner content (requires useSearchParams inside Suspense) ─────────────────
function MyOrdersContent() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user?.phone) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/customer/all?phone=${encodeURIComponent(user.phone)}`,
          { headers: { "Content-Type": "application/json" } }
        );
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        } else {
          setError(data.message || "Failed to load orders");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user?.phone]);

  // ─── Guest state ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="bg-[var(--color-surface)]/60 border border-[var(--color-border)] rounded-3xl p-12 max-w-md w-full">
          <ShoppingBag className="w-14 h-14 text-slate-700 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-3">Sign In to Track Orders</h2>
          <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            Log in to see all your past and current orders in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login?redirect=/shop/orders"
              className="flex-1 h-12 rounded-xl bg-[var(--color-orange)] hover:bg-[var(--color-orange)] text-white font-black text-sm flex items-center justify-center transition-all active:scale-95"
            >
              Sign In
            </Link>
            <Link
              href="/register?redirect=/shop/orders"
              className="flex-1 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text-primary)] font-black text-sm flex items-center justify-center transition-all active:scale-95"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-4" />
        <p className="text-[var(--color-text-primary)] font-bold mb-2">Could not load orders</p>
        <p className="text-[var(--color-text-secondary)] text-sm">{error}</p>
      </div>
    );
  }

  // ─── Empty ────────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <ClipboardList className="w-14 h-14 text-slate-700 mb-6" />
        <h3 className="text-xl font-black text-[var(--color-text-primary)] mb-2">No orders yet</h3>
        <p className="text-[var(--color-text-secondary)] mb-8">Start shopping to see orders here</p>
        <Link
          href="/shop"
          className="flex items-center gap-2 px-8 py-3 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] text-white font-black rounded-xl transition-all active:scale-95"
        >
          Browse Marketplace
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // ─── Orders list ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {orders.map(order => <OrderCard key={order._id} order={order} />)}
    </div>
  );
}

// ─── Page Shell ───────────────────────────────────────────────────────────────
export default function MyOrdersPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-white selection:bg-[var(--color-orange)]">
      <Navbar />

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white bg-[var(--color-purple)]/10 border border-[var(--color-purple)]/20 text-[var(--color-blue)] text-xs font-semibold tracking-wide uppercase mb-4">
            <ClipboardList className="w-3 h-3" />
            Order History
          </div>
          <h1 className="text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-2">My Orders</h1>
          <p className="text-[var(--color-text-secondary)]">Track all your past and current orders in real time.</p>
        </div>

        {/* Content */}
        <Suspense fallback={
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        }>
          <MyOrdersContent />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
