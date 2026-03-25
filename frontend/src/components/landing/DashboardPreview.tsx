"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import recharts to prevent SSR/static build errors
// (ResponsiveContainer requires browser dimensions)
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });

const DATA = [
  { name: 'Mon', sales: 4200 },
  { name: 'Tue', sales: 3800 },
  { name: 'Wed', sales: 5100 },
  { name: 'Thu', sales: 4800 },
  { name: 'Fri', sales: 6200 },
  { name: 'Sat', sales: 5400 },
  { name: 'Sun', sales: 3900 },
];

export function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="section-padding bg-[var(--color-bg)]/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
           <h2 className="text-[var(--color-text-primary)] mb-4">Command Center Performance.</h2>
           <p className="text-[var(--color-text-secondary)] text-lg">Real-time data at your fingertips. Designed for clarity and speed.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Main Container with Depth */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-elevated overflow-hidden">
            {/* Header / Tabs */}
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--color-bg)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--color-bg)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--color-bg)]" />
              </div>
              <div className="flex gap-6">
                <div className="h-4 w-24 bg-[var(--color-surface)] rounded" />
                <div className="h-4 w-24 bg-[var(--color-surface)] rounded" />
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: "Total Revenue", val: "₦ 14.2M", diff: "+2.4%" },
                   { label: "Active Orders", val: "1,284", diff: "+12%" },
                   { label: "Avg. Transaction", val: "₦ 12,400", diff: "-0.5%" },
                   { label: "Growth Rate", val: "24.8%", diff: "+4.1%" }
                 ].map((stat, i) => (
                   <div key={i} className="p-4 rounded-xl bg-[var(--color-surface)]/[0.02] border border-[var(--color-border)]">
                      <p className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[var(--color-text-primary)]">{stat.val}</span>
                        <span className={`text-[10px] font-bold ${stat.diff.startsWith('+') ? 'text-[var(--color-green)]' : 'text-rose-500'}`}>{stat.diff}</span>
                      </div>
                   </div>
                 ))}
              </div>

              {/* Professional Chart Content */}
              <div className="h-[350px] w-full bg-[var(--color-surface)]/[0.01] rounded-xl p-6 border border-[var(--color-border)]">
                 <div className="flex justify-between items-center mb-8">
                   <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Sales Distribution</h4>
                   <div className="px-3 py-1 rounded bg-[var(--color-surface)] text-[10px] text-[var(--color-text-secondary)] font-bold">LAST 7 DAYS</div>
                 </div>
                 <div className="w-full h-full pb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DATA}>
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} 
                              dy={10}
                            />
                            <YAxis hide />
                            <Tooltip 
                              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                              contentStyle={{ 
                                backgroundColor: "var(--color-bg)", 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '8px',
                                fontSize: '10px'
                              }}
                            />
                            <Bar 
                                dataKey="sales" 
                                fill="#6366f1" 
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>
          </div>

          {/* Contextual Note Card - Subtle Overlay */}
          <div className="absolute -right-8 -bottom-8 hidden lg:block p-6 glass-surface rounded-xl shadow-2xl max-w-xs border-[var(--color-purple)]/20">
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">
                 "The dashboard is optimized for rapid data retrieval, ensuring your business stays agile in a fast-paced market."
              </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
