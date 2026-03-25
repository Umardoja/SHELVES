"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Menu, AlertTriangle, TrendingUp, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface NotifSummary {
  pendingOrders: number;
  lowStockItems: { name: string; productCode: string; stock: number }[];
  biweeklyProfit: { revenue: number; profit: number; itemsSold: number };
}

export default function Navbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [summary, setSummary] = useState<NotifSummary | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch notification summary
  useEffect(() => {
    if (!user?._id) return;
    apiGet(`/api/notifications/summary/${user._id}`)
      .then((data: NotifSummary) => setSummary(data))
      .catch(() => {});
  }, [user?._id]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    if (showNotif) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotif]);

  const badgeCount = (summary?.pendingOrders ?? 0) + (summary?.lowStockItems?.length ?? 0);

  return (
    <>
      <nav className="h-14 md:h-16 px-3 md:px-6 glass-card flex items-center justify-between sticky top-0 z-40 mb-3 md:mb-6 rounded-xl mx-2 md:mx-4 mt-2 md:mt-4 border border-[var(--color-border)] bg-[var(--color-bg)]/20 backdrop-blur-md">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={toggleSidebar} className="md:hidden p-2 hover:bg-[var(--color-surface)] rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
          {/* Mobile logo */}
          <div className="relative w-8 h-8">
            <Image 
              src={"/logo.png"} 
              alt="SHELVES" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-xs font-black text-[var(--color-text-primary)] tracking-[0.15em] uppercase">
            SHELVES
          </h2>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] mr-2">
              <div className="w-1.5 h-1.5 rounded-full text-white bg-[var(--color-green)] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] font-black text-[var(--color-green)] uppercase tracking-widest">Active</span>
          </div>
          
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(prev => !prev)}
              className="p-2 relative hover:bg-[var(--color-surface)] rounded-xl transition-all border border-transparent hover:border-[var(--color-border)] group cursor-pointer"
            >
              <Bell className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]" />
              {badgeCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 text-white bg-[var(--color-orange)] rounded-full animate-ping"></span>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 text-white bg-[var(--color-orange)] rounded-full"></span>
                </>
              )}
            </button>

            {/* Desktop dropdown */}
            {showNotif && (
              <div className="hidden md:block absolute right-0 top-12 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="px-4 py-3 border-b border-[var(--color-border)]">
                  <p className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-widest">Notifications</p>
                </div>
                <div className="divide-y divide-white/5">
                  {renderNotifContent(summary, badgeCount, setShowNotif)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-[var(--color-border)] group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-[var(--color-text-primary)] uppercase tracking-tighter">{user?.businessName || "Merchant"}</p>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-widest leading-none mt-1">Shop Owner</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl text-white bg-gradient-brand from-[#4F46E5] to-[#06B6D4] flex items-center justify-center border border-[var(--color-border)] shadow-lg shadow-[var(--color-purple)]/20 group-hover:scale-110 transition-transform duration-500">
              <span className="font-black text-[var(--color-text-primary)] text-xs md:text-sm">{(user?.businessName || "U")[0].toUpperCase()}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Notification Sheet — full-screen bottom overlay */}
      {showNotif && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[var(--color-bg)] backdrop-blur-sm" onClick={() => setShowNotif(false)} />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--color-surface)] rounded-t-3xl border-t border-[var(--color-border)] max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom">
            {/* Handle bar */}
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[var(--color-surface)] rounded-full" />
            </div>
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-[var(--color-border)]">
              <p className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Notifications</p>
              <button onClick={() => setShowNotif(false)} className="p-2 hover:bg-[var(--color-surface)] rounded-xl transition-colors">
                <X className="w-5 h-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 pb-safe">
              {renderNotifContent(summary, badgeCount, setShowNotif)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* Extracted notification content to avoid duplication between mobile sheet and desktop dropdown */
function renderNotifContent(
  summary: NotifSummary | null,
  badgeCount: number,
  setShowNotif: (v: boolean) => void
) {
  return (
    <>
      {/* Pending Orders */}
      {(summary?.pendingOrders ?? 0) > 0 && (
        <div className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-amber-400 text-sm">🕒</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">{summary!.pendingOrders} Pending Order{summary!.pendingOrders !== 1 ? "s" : ""}</p>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">Waiting for your confirmation</p>
            <Link
              href="/dashboard/orders"
              onClick={() => setShowNotif(false)}
              className="text-[11px] text-[var(--color-blue)] hover:text-[var(--color-purple)] font-bold mt-1 inline-block"
            >
              View Orders →
            </Link>
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {(summary?.lowStockItems?.length ?? 0) > 0 && (
        <div className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">Low Stock Alert</p>
            <div className="mt-1 space-y-1">
              {summary!.lowStockItems.slice(0, 3).map(item => (
                <p key={item.productCode} className="text-[11px] text-[var(--color-text-secondary)]">
                  <span className="text-rose-400 font-bold">{item.stock}</span> left — {item.name}
                </p>
              ))}
              {summary!.lowStockItems.length > 3 && (
                <p className="text-[10px] text-slate-600">+{summary!.lowStockItems.length - 3} more items</p>
              )}
            </div>
            <Link
              href="/dashboard/inventory"
              onClick={() => setShowNotif(false)}
              className="text-[11px] text-[var(--color-blue)] hover:text-[var(--color-purple)] font-bold mt-1 inline-block"
            >
              Manage Inventory →
            </Link>
          </div>
        </div>
      )}

      {/* Biweekly Profit */}
      {summary?.biweeklyProfit && summary.biweeklyProfit.itemsSold > 0 && (
        <div className="p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg text-white bg-[var(--color-green)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4 text-[var(--color-green)]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">14-Day Summary</p>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
              Revenue: <span className="text-[var(--color-green)] font-bold">₦{summary.biweeklyProfit.revenue.toLocaleString()}</span>
            </p>
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              Profit: <span className="text-[var(--color-green)] font-bold">₦{summary.biweeklyProfit.profit.toLocaleString()}</span> · {summary.biweeklyProfit.itemsSold} items
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {badgeCount === 0 && (!summary?.biweeklyProfit || summary.biweeklyProfit.itemsSold === 0) && (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-8">No new notifications</p>
      )}
    </>
  );
}
