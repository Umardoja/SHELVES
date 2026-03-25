"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Package,
  ArrowUpRight,
  TrendingDown,
  Loader2,
  PieChart as PieIcon,
  BarChart3,
  FileDown
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell 
} from "recharts";
import GlassCard from "../../../components/ui/GlassCard";
import { useStore } from "@/hooks/useStore";
import { apiPost } from "@/lib/api";

const COLORS = ['#6366f1', '#22c55e', '#06b6d4', '#f59e0b', '#ec4899'];

export default function ReportsPage() {
  const { dashboardStats, fetchDashboardStats } = useStore();
  const [range, setRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const loadStats = useCallback(async (r: string) => {
    setIsLoading(true);
    await fetchDashboardStats(r);
    setIsLoading(false);
  }, [fetchDashboardStats]);

  useEffect(() => {
    loadStats(range);
  }, [range, loadStats]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("shelves_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ range })
      });
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shelves_report_${range}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-green)]" />
      </div>
    );
  }

  const { overview, trend, topProducts, inventory, customers, campaigns } = dashboardStats || {
    overview: {}, trend: [], topProducts: [], inventory: {}, customers: {}, campaigns: {}
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-1 text-white bg-[var(--color-green)] rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-green)]/80">Business Performance</span>
           </div>
           <h1 className="text-2xl md:text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
             Intelligence <span className="text-transparent bg-clip-text bg-gradient-brand">Hub.</span>
           </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-[var(--color-surface)]/50 p-1.5 rounded-2xl border border-[var(--color-border)] backdrop-blur-md">
           {['today', 'week', 'month', 'all'].map((r) => (
             <button
               key={r}
               onClick={() => setRange(r)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 range === r 
                 ? 'bg-[var(--color-green)] text-white shadow-lg shadow-[var(--color-purple)]/10' 
                 : 'text-white hover:text-white hover:bg-[var(--color-surface)]'
               }`}
             >
               {r}
             </button>
           ))}
           <div className="w-px h-6 bg-[var(--color-surface)] mx-1" />
           <button 
             onClick={handleExport}
             disabled={isExporting}
             className="flex items-center gap-2 px-4 py-2 bg-[var(--color-green)]/10 text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white rounded-xl transition-all group disabled:opacity-50"
           >
             {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 group-hover:scale-110 transition-transform" />}
             <span className="text-[10px] font-black uppercase tracking-widest">Export CSV</span>
           </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Revenue Card */}
        <GlassCard className="p-4 md:p-6 border-l-4 border-l-emerald-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.07] transition-all duration-500">
              <DollarSign className="w-24 h-24 text-[var(--color-text-primary)]" />
           </div>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 text-white bg-[var(--color-green)]/10 rounded-2xl border border-[var(--color-border)]/20">
                 <TrendingUp className="w-6 h-6 text-[var(--color-green)]" />
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-1">Estimated Revenue</p>
              <h3 className="text-xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">₦{(overview.totalRevenue || 0).toLocaleString()}</h3>
              <div className="flex items-center gap-2 mt-2">
                 <div className="flex items-center gap-1 px-2 py-0.5 text-white bg-[var(--color-green)]/10 rounded-lg text-[var(--color-green)] text-[10px] font-black">
                    <ArrowUpRight className="w-3 h-3" />
                    {overview.count || 0} Orders
                 </div>
                 <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">Avg: ₦{Math.round(overview.avgOrderValue || 0).toLocaleString()}</span>
              </div>
           </div>
        </GlassCard>

        {/* Profit Card */}
        <GlassCard className="p-4 md:p-6 border-l-4 border-l-indigo-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.07] transition-all duration-500">
              <BarChart3 className="w-24 h-24 text-[var(--color-text-primary)]" />
           </div>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 text-white bg-[var(--color-purple)]/10 rounded-2xl border border-[var(--color-purple)]/20">
                 <ShoppingBag className="w-6 h-6 text-[var(--color-blue)]" />
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-1">Net Profit</p>
              <h3 className="text-xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">₦{(overview.totalProfit || 0).toLocaleString()}</h3>
              <div className="flex items-center gap-2 mt-2">
                 <div className="px-2 py-0.5 text-white bg-[var(--color-purple)]/10 rounded-lg text-[var(--color-blue)] text-[10px] font-black uppercase tracking-widest">
                    {Math.round(overview.profitMargin || 0)}% Margin
                 </div>
                 <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">Actual earnings</span>
              </div>
           </div>
        </GlassCard>

        {/* Inventory Card */}
        <GlassCard className="p-4 md:p-6 border-l-4 border-l-orange-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.07] transition-all duration-500">
              <Package className="w-24 h-24 text-[var(--color-text-primary)]" />
           </div>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 text-white bg-orange-500/10 rounded-2xl border border-[var(--color-border)]/20">
                 <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-1">Inventory Value</p>
              <h3 className="text-xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">₦{(inventory.totalValue || 0).toLocaleString()}</h3>
              <div className="flex items-center gap-2 mt-2">
                 <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${inventory.lowStock > 0 ? 'text-white bg-orange-500/10 text-orange-400' : 'bg-[var(--color-green)]/10 text-[var(--color-green)]'}`}>
                    {inventory.lowStock} Low Stock
                 </div>
                 <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">{inventory.totalItems || 0} Units total</span>
              </div>
           </div>
        </GlassCard>

        {/* Customer Card */}
        <GlassCard className="p-4 md:p-6 border-l-4 border-l-cyan-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 group-hover:opacity-[0.07] transition-all duration-500">
              <Users className="w-24 h-24 text-[var(--color-text-primary)]" />
           </div>
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 text-white bg-[var(--color-orange)] rounded-2xl border border-[var(--color-border)]/20">
                 <Users className="w-6 h-6 text-[var(--color-blue)]" />
              </div>
           </div>
           <div>
              <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] mb-1">Active Customers</p>
              <h3 className="text-xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">{customers.total || 0}</h3>
              <div className="flex items-center gap-2 mt-2">
                 <div className="px-2 py-0.5 text-white bg-[var(--color-orange)] rounded-lg text-[var(--color-blue)] text-[10px] font-black uppercase tracking-widest">
                    {customers.repeat || 0} Repeat
                 </div>
                 <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">+{customers.newThisMonth || 0} New this month</span>
              </div>
           </div>
        </GlassCard>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2">
           <GlassCard className="p-4 md:p-8 h-full">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-sm md:text-xl font-black text-[var(--color-text-primary)] tracking-tight">Growth Trend</h3>
                    <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">REVENUE AND PROFIT OVER TIME</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded text-white bg-[var(--color-green)]" />
                       <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded text-white bg-[var(--color-orange)]" />
                       <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Profit</span>
                    </div>
                 </div>
              </div>

              <div className="h-[220px] md:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="_id" 
                      stroke="#475569" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₦${val >= 1000 ? val/1000 + 'k' : val}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "var(--color-bg)", borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ fontWeight: '800' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </GlassCard>
        </div>

        {/* Top Products Chart */}
        <div>
           <GlassCard className="p-4 md:p-8 h-full bg-[var(--color-surface)]/40 relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                 <BarChart3 className="w-24 h-24 text-[var(--color-text-primary)]" />
              </div>
              <h3 className="text-sm md:text-xl font-black text-[var(--color-text-primary)] tracking-tight mb-1">Hero Products</h3>
              <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mb-8">TOP PERFORMERS BY REVENUE</p>

              <div className="space-y-6">
                 {topProducts.length > 0 ? topProducts.map((p: any, idx: number) => (
                   <div key={idx} className="relative">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-wider line-clamp-1 w-2/3">{p.name}</span>
                         <span className="text-[10px] font-black text-[var(--color-green)]">₦{p.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                         <div 
                           className="h-full text-white bg-gradient-brand rounded-full transition-all duration-1000"
                           style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }}
                         />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{p.quantity} Units Sold</span>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{Math.round((p.revenue / overview.totalRevenue) * 100)}% Contribution</span>
                      </div>
                   </div>
                 )) : (
                   <div className="flex flex-col items-center justify-center py-24 text-slate-600">
                      <Package className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No product data</p>
                   </div>
                 )}
              </div>
           </GlassCard>
        </div>
      </div>

      {/* Campaign Performance & Footer Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
         <GlassCard className="p-4 md:p-8">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-pink-500/10 rounded-2xl border border-[var(--color-border)]/20">
                  <PieIcon className="w-6 h-6 text-pink-400" />
               </div>
               <div>
                  <h3 className="text-sm md:text-xl font-black text-[var(--color-text-primary)] tracking-tight">Campaign Impact</h3>
                  <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">SMS MARKETING ANALYTICS</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--color-bg)]/50 rounded-2xl border border-[var(--color-border)]">
                 <p className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Total Sent</p>
                 <p className="text-xl font-black text-[var(--color-text-primary)]">{campaigns.totalSent || 0}</p>
              </div>
              <div className="p-4 bg-[var(--color-bg)]/50 rounded-2xl border border-[var(--color-border)]">
                 <p className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Campaigns</p>
                 <p className="text-xl font-black text-[var(--color-text-primary)]">{campaigns.campaignsCount || 0}</p>
              </div>
              <div className="p-4 text-white bg-[var(--color-green)]/10 rounded-2xl border border-[var(--color-border)]/10">
                 <p className="text-[8px] font-black text-[var(--color-green)]/50 uppercase tracking-widest mb-1">Success Rate</p>
                 <p className="text-xl font-black text-[var(--color-green)]">
                   {campaigns.totalSent > 0 
                     ? Math.round(((campaigns.totalSent - campaigns.failed) / campaigns.totalSent) * 100) 
                     : 100}%
                 </p>
              </div>
            </div>
         </GlassCard>

         <GlassCard className="p-4 md:p-8 group">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 text-white bg-[var(--color-orange)] rounded-2xl border border-[var(--color-border)]/20">
                  <Download className="w-6 h-6 text-[var(--color-blue)]" />
               </div>
               <div>
                  <h3 className="text-sm md:text-xl font-black text-[var(--color-text-primary)] tracking-tight">Business Archives</h3>
                  <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest leading-none mt-1">DATA PORTABILITY</p>
               </div>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] font-medium mb-6">
              Download your full business history including sales, products, and profit margins for the selected period ({range}).
            </p>
            <button 
              onClick={handleExport}
              className="w-full py-4 bg-[var(--color-orange)] border border-[var(--color-border)]/20 hover:bg-[var(--color-orange)] text-[var(--color-blue)] hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
            >
              <FileDown className="w-5 h-5" />
              Generate Business Report
            </button>
         </GlassCard>
      </div>
    </div>
  );
}
