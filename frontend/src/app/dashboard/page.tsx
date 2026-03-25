"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  AlertTriangle,
  ClipboardList,
  Plus,
  Download,
  Loader2,
  TrendingUp,
  Mail,
  Zap,
} from "lucide-react";

import { useStore, Product, Sale } from "@/hooks/useStore";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";
import { exportToCSV } from "@/utils/exportUtils";

const InventoryModal = dynamic(() => import("@/components/dashboard/InventoryModal"), { 
  ssr: false,
  loading: () => <div className="h-10 w-20 bg-[var(--color-bg)] animate-pulse rounded-xl" />
});

const AreaChartComp           = dynamic(() => import("recharts").then(m => m.AreaChart),          { ssr: false });
const AreaComp                = dynamic(() => import("recharts").then(m => m.Area),               { ssr: false });
const XAxisComp               = dynamic(() => import("recharts").then(m => m.XAxis),              { ssr: false });
const YAxisComp               = dynamic(() => import("recharts").then(m => m.YAxis),              { ssr: false });
const CartesianGridComp       = dynamic(() => import("recharts").then(m => m.CartesianGrid),      { ssr: false });
const TooltipComp             = dynamic(() => import("recharts").then(m => m.Tooltip),            { ssr: false });
const ResponsiveContainerComp = dynamic(() => import("recharts").then(m => m.ResponsiveContainer),{ ssr: false });

// ---- Stat Card ----------------------------------------------------------
function StatCard({
  title,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  accent,
  sub,
}: {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  accent: string;
  sub?: string;
}) {
  const formatted =
    typeof value === "number"
      ? value.toLocaleString()
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-2xl p-3 md:p-6 flex items-start gap-3 md:gap-4 shadow-sm hover:shadow-md transition-shadow w-full"
    >
      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-0.5 md:mb-1 truncate">
          {title}
        </p>
        <p className="text-base md:text-2xl font-black text-[var(--color-text-primary)] leading-none truncate">
          {prefix}{formatted}{suffix}
        </p>
        {sub && (
          <p className="text-[10px] md:text-[11px] text-slate-600 mt-1 md:mt-1.5">{sub}</p>
        )}
      </div>
    </motion.div>
  );
}

// ---- Page ---------------------------------------------------------------
export default function DashboardPage() {
  const { products, sales, report, isLoading, addProduct } = useStore();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [pendingCount, setPendingCount]     = useState<number>(0);
  const [showSmsModal, setShowSmsModal]     = useState(false);

  // Fetch live pending orders count via notification endpoint (shared with Navbar)
  useEffect(() => {
    if (!user?._id) return;
    apiGet(`/api/notifications/summary/${user._id}`)
      .then((data: any) => setPendingCount(data?.pendingOrders ?? 0))
      .catch(() => {});
  }, [user?._id]);

  const totalRevenue     = report?.totalRevenue    ?? sales.reduce((a: number, s: Sale) => a + (s.totalRevenue ?? 0), 0);
  const totalOrders      = report?.salesCount      ?? sales.length;
  const lowStockCount    = report?.lowStockCount   ?? products.filter((p: Product) => p.status !== "In Stock").length;

  // Revenue chart — last 7 days
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });

  const chartData = last7.map(day => ({
    name: day,
    revenue: sales
      .filter((s: Sale) => new Date(s.date).toLocaleDateString("en-US", { weekday: "short" }) === day)
      .reduce((a: number, s: Sale) => a + (s.totalRevenue ?? 0), 0),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[var(--color-blue)] animate-spin mx-auto mb-3" />
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-10 md:pb-20 space-y-4 md:space-y-0">

      {/* ---- Header ---- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6 mb-4 md:mb-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 mb-1 md:mb-2">
            <div className="w-8 md:w-10 h-0.5 text-white bg-[var(--color-orange)] rounded-full" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-blue)]">Overview</span>
          </div>
          <h1 className="text-xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
            Welcome back, <span className="text-[var(--color-blue)]">{user?.businessName || "Boss"}</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] text-xs md:text-sm mt-1">Here is what is happening with your business today.</p>
          {user?.merchantCode && (
            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 md:mt-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] md:text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Store Code:</span>
                <span className="text-xs md:text-sm font-black text-[var(--color-blue)] text-white bg-[var(--color-purple)]/10 border border-[var(--color-purple)]/20 px-2 md:px-3 py-1 rounded-lg tracking-widest select-all">
                  {user.merchantCode}
                </span>
              </div>
              
              <button 
                onClick={() => setShowSmsModal(true)}
                className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg pl-2 pr-3 py-1 hover:border-[var(--color-border)]/30 transition-all group"
              >
                <div className="w-5 h-5 rounded text-white bg-[var(--color-purple)]/10 flex items-center justify-center">
                  <Mail className="w-3 h-3 text-[var(--color-blue)] group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">SMS Balance</span>
                  <span className="text-xs font-black text-[var(--color-text-primary)]">
                    {(user.smsCredits || 0) + Math.max(0, (user.smsFreeMonthly || 0) - (user.smsUsedThisMonth || 0))} 
                    <span className="text-[9px] text-[var(--color-text-secondary)] ml-1">units</span>
                  </span>
                </div>
              </button>
            </div>
          )}
        </motion.div>

        {/* Quick Action Buttons */}
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <button
            onClick={() => exportToCSV(products, "shelves_stock.csv")}
            className="flex-1 md:flex-initial h-11 md:h-auto px-4 md:px-5 md:py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-initial h-11 md:h-auto px-4 md:px-5 md:py-2.5 bg-gradient-brand rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[var(--color-purple)]/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      <InventoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addProduct} />

      {/* ---- 4 Stat Cards — 2-col on mobile, 4-col on desktop ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-5 mb-4 md:mb-12">
        <StatCard
          title="Total Revenue"
          value={totalRevenue}
          prefix="₦"
          icon={DollarSign}
          accent="bg-[var(--color-purple)]/10 text-[var(--color-blue)]"
          sub="All time sales"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          suffix=" orders"
          icon={TrendingUp}
          accent="bg-[var(--color-green)]/10 text-[var(--color-green)]"
          sub="Confirmed sales"
        />
        <StatCard
          title="Pending Orders"
          value={pendingCount}
          suffix=" waiting"
          icon={ClipboardList}
          accent="bg-amber-500/10 text-amber-400"
          sub="Needs your action"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          suffix=" items"
          icon={AlertTriangle}
          accent="bg-rose-500/10 text-rose-400"
          sub="Below threshold"
        />
      </div>

      {/* ---- Revenue Chart ---- */}
      <div className="bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-2xl p-3 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <TrendingUp className="w-4 h-4 text-[var(--color-blue)]" />
          <h2 className="text-xs md:text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Revenue — Last 7 Days</h2>
        </div>
        <div className="h-40 md:h-72 w-full">
          <ResponsiveContainerComp width="100%" height="100%">
            <AreaChartComp data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGridComp strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxisComp dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: "#475569" }} />
              <YAxisComp fontSize={10} axisLine={false} tickLine={false} tick={{ fill: "#475569" }} width={40} />
              <TooltipComp
                contentStyle={{ backgroundColor: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}
                itemStyle={{ color: "var(--color-text-primary)", fontWeight: "bold" }}
              />
              <AreaComp type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChartComp>
          </ResponsiveContainerComp>
        </div>
      </div>

      {/* ---- Recent Stock ---- */}
      {products.length > 0 && (
        <div className="bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-2xl overflow-hidden">
          <div className="px-3 md:px-6 py-3 md:py-4 border-b border-[var(--color-border)] flex items-center gap-3">
            <Package className="w-4 h-4 text-[var(--color-blue)]" />
            <h2 className="text-xs md:text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest">Top Items by Stock</h2>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {products.slice(0, 5).map((p: Product) => (
              <div key={p._id} className="px-3 md:px-6 py-2.5 md:py-3 flex items-center justify-between hover:bg-[var(--color-surface)]/[0.02] transition-colors gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-bold text-[var(--color-text-primary)] truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-600 truncate">{p.productCode}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs md:text-sm font-bold text-[var(--color-text-primary)]">{p.stock} left</p>
                  <span className={`text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full ${
                    p.status === "In Stock" ? "text-[var(--color-green)] text-white bg-[var(--color-green)]/10" :
                    p.status === "Low Stock" ? "text-amber-400 bg-amber-400/10" :
                    "text-rose-400 bg-rose-400/10"
                  }`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMS Credits Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            onClick={() => setShowSmsModal(false)}
            className="absolute inset-0 bg-[var(--color-bg)]/80 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="w-14 h-14 text-white bg-[var(--color-purple)]/10 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="w-7 h-7 text-[var(--color-blue)]" />
              </div>
              <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-2">SMS Credits</h2>
              <p className="text-[var(--color-text-secondary)] text-sm mb-8">Maintain your communication flow with customers.</p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                  <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Free Monthly</span>
                  <span className="text-sm font-black text-[var(--color-text-primary)]">
                    {Math.max(0, (user?.smsFreeMonthly || 0) - (user?.smsUsedThisMonth || 0))} / {user?.smsFreeMonthly || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                  <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Purchased Credits</span>
                  <span className="text-sm font-black text-[var(--color-text-primary)]">{user?.smsCredits || 0}</span>
                </div>
                <div className="flex justify-between items-center p-6 text-white bg-[var(--color-purple)]/10 rounded-2xl border border-[var(--color-purple)]/20">
                  <span className="text-xs font-black text-[var(--color-blue)] uppercase tracking-widest">Total Available</span>
                  <span className="text-2xl font-black text-[var(--color-text-primary)]">
                    {(user?.smsCredits || 0) + Math.max(0, (user?.smsFreeMonthly || 0) - (user?.smsUsedThisMonth || 0))}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowSmsModal(false);
                  // Link to settings or direct purchase flow
                  window.location.href = "/dashboard/settings#sms";
                }}
                className="w-full py-4 bg-[var(--color-orange)] hover:bg-[var(--color-orange)] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[var(--color-orange)]/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                Buy More SMS
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
