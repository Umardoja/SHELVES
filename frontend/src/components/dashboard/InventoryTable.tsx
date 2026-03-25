"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, MoreHorizontal, PackageOpen, ShoppingCart } from "lucide-react";

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  stock: number;
  sellingPrice: number;
  status: string;
}

interface InventoryTableProps {
  data: InventoryItem[];
  onEdit: (product: InventoryItem) => void;
  onDelete: (id: string) => void;
  onSale: (product: InventoryItem) => void;
}

export function InventoryTable({ data, onEdit, onDelete, onSale }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-y-3">
        <thead>
          <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] px-4">
            <th className="pb-2 pl-6">Item Name</th>
            <th className="pb-2">Type of Goods</th>
            <th className="pb-2">Quantity Available</th>
            <th className="pb-2">Selling Price (₦)</th>
            <th className="pb-2">Status</th>
            <th className="pb-2 text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody className="relative z-10">
          <AnimatePresence mode="popLayout">
            {data.map((item, index) => (
              <motion.tr
                key={item._id}
                layout
                initial={{ opacity: 0, x: -20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.05,
                  ease: [0.23, 1, 0.32, 1] 
                }}
                className="group relative"
              >
                <td className="py-4 pl-6 rounded-l-2xl bg-[var(--color-surface)]/40 border-y border-l border-[var(--color-border)] backdrop-blur-md group-hover:bg-[var(--color-surface)]/60 group-hover:border-[var(--color-border)]/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner text-[var(--color-blue)]">
                       <PackageOpen className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-[var(--color-text-primary)] tracking-tight">{item.name}</span>
                  </div>
                </td>
                <td className="py-4 bg-[var(--color-surface)]/40 border-y border-[var(--color-border)] backdrop-blur-md group-hover:bg-[var(--color-surface)]/60 group-hover:border-[var(--color-border)]/30 transition-all duration-300">
                  <span className="text-xs font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-secondary)] uppercase tracking-widest">{item.category}</span>
                </td>
                <td className="py-4 bg-[var(--color-surface)]/40 border-y border-[var(--color-border)] backdrop-blur-md group-hover:bg-[var(--color-surface)]/60 group-hover:border-[var(--color-border)]/30 transition-all duration-300">
                  <span className="text-sm font-black text-[var(--color-text-primary)]">{item.stock.toLocaleString()}</span>
                </td>
                <td className="py-4 bg-[var(--color-surface)]/40 border-y border-[var(--color-border)] backdrop-blur-md group-hover:bg-[var(--color-surface)]/60 group-hover:border-[var(--color-border)]/30 transition-all duration-300">
                  <span className="text-sm font-black text-[var(--color-text-primary)]">₦{item.sellingPrice.toLocaleString()}</span>
                </td>
                <td className="py-4 bg-[var(--color-surface)]/40 border-y border-[var(--color-border)] backdrop-blur-md group-hover:bg-[var(--color-surface)]/60 group-hover:border-[var(--color-border)]/30 transition-all duration-300">
                   <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                      item.status === 'In Stock' ? 'text-white bg-[var(--color-green)]/10 text-[var(--color-green)] border-[var(--color-border)]/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' :
                      item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-400 border-[var(--color-border)]/20 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]' :
                      'bg-rose-500/10 text-rose-400 border-[var(--color-border)]/20 shadow-[0_0_15px_-5px_rgba(244,63,94,0.3)]'
                   }`}>
                      <div className={`w-1 h-1 rounded-full animate-pulse ${
                         item.status === 'In Stock' ? 'text-white bg-[var(--color-green)]' :
                         item.status === 'Low Stock' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                       {item.status === 'Low Stock' ? 'Running Low' : item.status}
                   </div>
                </td>
                <td className="py-4 pr-6 rounded-r-2xl bg-[var(--color-surface)]/40 border-y border-r border-[var(--color-border)] backdrop-blur-md group-hover:bg-[var(--color-surface)]/60 group-hover:border-[var(--color-border)]/30 transition-all duration-300 text-right">
                  <div className="flex items-center justify-end gap-2 px-2">
                      <button 
                        onClick={() => onSale(item)}
                        className="p-2 hover:bg-[var(--color-green)] text-white hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                        title="Record Sale"
                      >
                          <ShoppingCart className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 hover:bg-[var(--color-orange)] text-white hover:text-white rounded-xl transition-all shadow-lg active:scale-90"
                      >
                          <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(item._id)}
                        className="p-2 hover:bg-rose-500 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-xl transition-all shadow-lg active:scale-90"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
