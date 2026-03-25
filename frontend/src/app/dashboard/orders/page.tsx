"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Package,
  Loader2,
  RefreshCw,
  TrendingUp,
  Hourglass,
  Star,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost, apiPut } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  _id: string;
  customerPhone: string;
  customerName?: string;
  productName: string;
  productCode: string;
  quantity: number;
  status: string;
  createdAt: string;
  confirmedAt?: string;
  statusUpdatedAt?: string;
  merchantNote?: string;
  paymentStatus?: string;
  paystackReference?: string;
}

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  completed: number;
}

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  className: string;
  dot: string;
}> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "text-amber-400 bg-amber-400/10 border-[var(--color-border)]/20",
    dot: "bg-amber-400",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "text-[var(--color-blue)] bg-blue-400/10 border-[var(--color-border)]/20",
    dot: "bg-blue-400",
  },
  PROCESSING: {
    label: "Processing",
    icon: Hourglass,
    className: "text-orange-400 bg-orange-400/10 border-[var(--color-border)]/20",
    dot: "bg-orange-400",
  },
  COMPLETED: {
    label: "Completed",
    icon: Star,
    className: "text-[var(--color-green)] bg-[var(--color-green)]/10 border-[var(--color-border)]/20",
    dot: "bg-[var(--color-green)]",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "text-[var(--color-green)] bg-[var(--color-green)]/10 border-[var(--color-border)]/20",
    dot: "bg-[var(--color-green)]",
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    className: "text-rose-400 bg-rose-400/10 border-[var(--color-border)]/20",
    dot: "bg-rose-400",
  },
};

function getStatusConfig(rawStatus: string | undefined) {
  const key = (rawStatus ?? "").toUpperCase();
  return STATUS_CONFIG[key] ?? {
    label: rawStatus || "Unknown",
    icon: AlertCircle,
    className: "text-[var(--color-text-secondary)] bg-slate-400/10 border-[var(--color-border)]",
    dot: "bg-slate-400",
  };
}

// ─── Tabs config ─────────────────────────────────────────────────────────────
type TabKey = "ALL" | "PENDING" | "ACCEPTED" | "PROCESSING" | "COMPLETED" | "REJECTED";

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "ALL",        label: "All",        emoji: "📋" },
  { key: "PENDING",    label: "Pending",    emoji: "🕒" },
  { key: "ACCEPTED",   label: "Accepted",   emoji: "✅" },
  { key: "PROCESSING", label: "Processing", emoji: "⚙️" },
  { key: "COMPLETED",  label: "Completed",  emoji: "🌟" },
  { key: "REJECTED",   label: "Rejected",   emoji: "❌" },
];

// ─── Action buttons config per status ────────────────────────────────────────
const NEXT_ACTIONS: Record<string, { label: string; status: string; color: string }[]> = {
  PENDING: [
    { label: "Accept", status: "ACCEPTED", color: "bg-[var(--color-orange)] border-[var(--color-border)]/20 text-blue-300 hover:bg-[var(--color-orange)]" },
    { label: "Reject", status: "REJECTED", color: "bg-rose-500/10 border-[var(--color-border)]/20 text-rose-300 hover:bg-rose-500/20" },
  ],
  ACCEPTED: [
    { label: "Processing", status: "PROCESSING", color: "bg-orange-500/10 border-[var(--color-border)]/20 text-orange-300 hover:bg-orange-500/20" },
    { label: "Reject", status: "REJECTED", color: "bg-rose-500/10 border-[var(--color-border)]/20 text-rose-300 hover:bg-rose-500/20" },
  ],
  PROCESSING: [
    { label: "Complete", status: "COMPLETED", color: "bg-[var(--color-green)]/10 border-[var(--color-border)]/20 text-emerald-300 hover:bg-[var(--color-green)]/20" },
  ],
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("PENDING");
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, accepted: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(async (tab: TabKey = activeTab) => {
    if (!user?._id) return;
    setIsLoading(true);
    try {
      const statusParam = tab === "ALL" ? "" : `?status=${tab}`;
      const data = await apiGet(`/api/orders/merchant/all${statusParam}`);
      setOrders(Array.isArray(data.data) ? data.data : []);
      if (data.stats) setStats(data.stats);
    } catch {
      // Fallback to legacy endpoint
      try {
        const legacy = await apiGet(`/api/orders/merchant/${user._id}${tab !== "ALL" ? `?status=${tab}` : ""}`);
        setOrders(Array.isArray(legacy) ? legacy : []);
      } catch {
        showToast("Could not load orders", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, activeTab]);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Status update (NEW lifecycle route) ───────────────────────────────────
  const handleStatusUpdate = async (orderId: string, newStatus: string, label: string) => {
    setActionLoading(orderId + "-" + newStatus);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("shelves_token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Update in place without full reload
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
      );
      showToast(`Order marked as ${label} ✅`, "success");
      // Refresh stats
      fetchOrders(activeTab);
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Legacy confirm (keeps stock deduction logic)
  const handleConfirm = async (orderId: string) => {
    setActionLoading(orderId + "-confirm");
    try {
      await apiPost(`/api/orders/confirm/${orderId}`, {});
      setOrders(prev => prev.filter(o => o._id !== orderId));
      showToast("Order confirmed! Stock updated ✅", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to confirm order", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId: string) => {
    setActionLoading(orderId + "-reject");
    try {
      await apiPost(`/api/orders/reject/${orderId}`, {});
      setOrders(prev => prev.filter(o => o._id !== orderId));
      showToast("Order rejected", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to reject order", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const switchTab = (tab: TabKey) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setOrders([]);
  };

  return (
    <div className="relative pb-20">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border ${
              toast.type === "success"
                ? "text-white bg-[var(--color-green)]/10 border-[var(--color-border)]/20 text-emerald-300"
                : "bg-rose-500/10 border-[var(--color-border)]/20 text-rose-300"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-0.5 text-white bg-[var(--color-orange)] rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-blue)]">
              Order Management
            </span>
          </div>
          <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">Customer Orders</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            Track and manage orders through their full lifecycle
          </p>
        </div>
        <button
          onClick={() => fetchOrders(activeTab)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", value: stats.total, icon: ClipboardList, color: "text-[var(--color-blue)]", bg: "bg-[var(--color-purple)]/10" },
          { label: "Pending",      value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Accepted",     value: stats.accepted, icon: CheckCircle2, color: "text-[var(--color-blue)]", bg: "bg-[var(--color-orange)]" },
          { label: "Completed",    value: stats.completed, icon: Star, color: "text-[var(--color-green)]", bg: "bg-[var(--color-green)]/10" },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-2xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--color-text-primary)]">{stat.value}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 p-1 bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-2xl">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? "bg-[var(--color-orange)] text-white shadow-lg shadow-[var(--color-purple)]/20"
                : "text-white hover:text-white"
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[var(--color-blue)] animate-spin mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] text-sm font-medium">Loading orders...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[35vh] text-center"
        >
          <ClipboardList className="w-14 h-14 text-slate-700 mb-4" />
          <p className="text-[var(--color-text-secondary)] font-bold">No {activeTab !== "ALL" ? activeTab.toLowerCase() : ""} orders yet.</p>
          <p className="text-slate-600 text-sm mt-1">Orders will appear here when customers place them.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {orders.map((order, i) => {
              const config = getStatusConfig(order.status);
              const StatusIcon = config.icon;
              const upperStatus = (order.status ?? "").toUpperCase();
              const nextActions = NEXT_ACTIONS[upperStatus] || [];
              const isPending = upperStatus === "PENDING";

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-[var(--color-surface)]/30 border rounded-2xl p-5 transition-all ${
                    isPending ? "border-[var(--color-border)]/20 shadow-[var(--color-purple)]/10 shadow-lg" : "border-[var(--color-border)]"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                    {/* Order Info */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">

                      {/* Product */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl text-white bg-[var(--color-purple)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Package className="w-4 h-4 text-[var(--color-blue)]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Product</p>
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">{order.productName}</p>
                          <p className="text-[10px] text-slate-600">Qty: {order.quantity} · Code: {order.productCode}</p>
                        </div>
                      </div>

                      {/* Customer */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Phone className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Customer</p>
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">{order.customerName || order.customerPhone}</p>
                          {order.customerName && (
                            <p className="text-[10px] text-slate-600">{order.customerPhone}</p>
                          )}
                          <a href={`tel:${order.customerPhone}`} className="text-[10px] text-[var(--color-blue)] hover:underline flex items-center gap-0.5 mt-0.5">
                            Call <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Ordered</p>
                          <p className="text-sm font-bold text-[var(--color-text-primary)]">
                            {new Date(order.createdAt).toLocaleDateString("en-NG", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </p>
                          <p className="text-[10px] text-slate-600">
                            {new Date(order.createdAt).toLocaleTimeString("en-NG", {
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex flex-col items-start lg:items-end gap-3 lg:w-52 flex-shrink-0">

                      {/* Status Badge */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${config.className}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${config.dot} ${isPending ? "animate-pulse" : ""}`} />
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </div>

                      {/* Payment Status Badge */}
                      {order.paymentStatus === "PAID" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-green)] text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[var(--color-purple)]/10">
                          <ShieldCheck className="w-3 h-3" />
                          Paid
                        </div>
                      )}

                      {/* Merchant Note */}
                      {order.merchantNote && (
                        <p className="text-[10px] text-[var(--color-text-secondary)] italic max-w-[200px] text-right">&ldquo;{order.merchantNote}&rdquo;</p>
                      )}

                      {/* Action Buttons (new lifecycle) */}
                      {nextActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 w-full lg:justify-end">
                          {nextActions.map(action => {
                            const isActing = actionLoading === order._id + "-" + action.status;
                            return (
                              <button
                                key={action.status}
                                onClick={() => handleStatusUpdate(order._id, action.status, action.label)}
                                disabled={!!actionLoading}
                                className={`flex items-center justify-center gap-1.5 py-2 px-4 border rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${action.color}`}
                              >
                                {isActing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Legacy Confirm (stock deduction) for PENDING orders */}
                      {isPending && (
                        <div className="flex gap-2 w-full lg:justify-end text-[10px] text-slate-600 border-t border-[var(--color-border)] pt-2 mt-1">
                          <button
                            onClick={() => handleConfirm(order._id)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 text-white bg-[var(--color-green)]/10 border border-[var(--color-border)]/20 hover:bg-[var(--color-green)]/20 rounded-lg font-bold text-[var(--color-green)] text-[10px] transition-all disabled:opacity-50"
                          >
                            {actionLoading === order._id + "-confirm" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            Confirm (deduct stock)
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
