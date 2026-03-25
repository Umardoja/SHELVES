"use client";

import { useState, useEffect } from "react";
import { X, Save, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "../ui/GlassCard";

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  initialData?: any;
}

const CATEGORIES = ["General", "Building", "Tools", "Electrical", "Plumbing", "Hardware", "Tiles", "Electronics", "Paint", "Other"];

export default function InventoryModal({ isOpen, onClose, onSave, initialData }: InventoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: "General",
    sellingPrice: "",
    costPrice: "",
    stock: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "General",
        sellingPrice: initialData.sellingPrice?.toString() || "",
        costPrice: initialData.costPrice?.toString() || "",
        stock: initialData.stock?.toString() || "",
        description: initialData.description || ""
      });
    } else {
      setFormData({
        name: "",
        category: "General",
        sellingPrice: "",
        costPrice: "",
        stock: "",
        description: ""
      });
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await onSave({
        name: formData.name,
        category: formData.category,
        sellingPrice: parseFloat(formData.sellingPrice),
        costPrice: parseFloat(formData.costPrice),
        stock: parseInt(formData.stock),
        description: formData.description
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[var(--color-surface)]/50 border border-[var(--color-border)] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--color-bg)] backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-lg"
          >
            <GlassCard className="p-5 md:p-8 border-[var(--color-border)]/30">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[var(--color-text-primary)] flex items-center gap-2">
                  <Package className="w-6 h-6 text-[var(--color-blue)]" />
                  {initialData ? "Edit Item" : "Add New Item"}
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors text-[var(--color-text-secondary)]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Name */}
                <div>
                  <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">Item Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Dangote Cement"
                  />
                </div>

                {/* Category & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`${inputClass} appearance-none`}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-[var(--color-surface)]">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">Stock Amount</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Cost Price & Selling Price side by side on all screens */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">Cost Price (₦)</label>
                    <input
                      type="number"
                      required
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className={inputClass}
                      placeholder="How much you paid"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">Selling Price (₦)</label>
                    <input
                      type="number"
                      required
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className={inputClass}
                      placeholder="How much you sell"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={1}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter short description..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {error && <p className="text-rose-400 text-xs text-center font-bold">{error}</p>}

                {/* Footer Buttons */}
                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-brand rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-[var(--color-purple)]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-[var(--color-border)] border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Product
                      </>
                    )}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}