"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus } from "lucide-react";
import { useStore, Product } from "@/hooks/useStore";
import { useToast } from "@/context/ToastContext";

interface SaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function SaleDialog({ isOpen, onClose, product }: SaleDialogProps) {
  const { recordSale } = useStore();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState<number | "">(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!product) return null;

  const handleSale = () => {
    const safeQty = !quantity || quantity < 1 ? 1 : quantity;
    if (safeQty > product.stock) {
      toast("Insufficient stock available", "error");
      return;
    }

    try {
      setQuantity(1);
      toast(`Sold ${safeQty} of ${product.name}`, "success");
      onClose();
    } catch (err: any) {
      toast(err.message || "Failed to sell", "error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--color-bg)]/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
          >
            <div className="absolute top-0 inset-x-0 h-1 text-white bg-gradient-brand" />

            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl text-white bg-[var(--color-green)]/10 border border-[var(--color-border)]/20 flex items-center justify-center text-[var(--color-green)]">
                     <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">Sell Item</h2>
                    <p className="text-xs text-[var(--color-text-secondary)] font-bold uppercase tracking-widest mt-0.5">{product.name}</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-2 hover:bg-[var(--color-surface)] rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="p-6 rounded-3xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Quantity in Shop</span>
                      <span className="text-sm font-black text-[var(--color-text-primary)]">{product.stock} Items</span>
                   </div>
                   <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-4">
                      <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Price per Item</span>
                      <span className="text-sm font-black text-[var(--color-green)]">₦{product.sellingPrice.toLocaleString()}</span>
                   </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest ml-1">How many are you selling?</label>
                  <div className="flex items-center gap-4 group">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, (Number(quantity) || 1) - 1))}
                      className="w-14 h-14 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors active:scale-90"
                    >
                      <Minus className="w-6 h-6" />
                    </button>
                    <div className="flex-1 h-14 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl flex items-center justify-center">
                     <input
                          type="number"
                          value={quantity}
                          min={1}
                          max={product.stock}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setQuantity("");
                              return;
                            }
                            const number = parseInt(value);
                            if (!isNaN(number) && number >= 1 && number <= product.stock) {
                              setQuantity(number);
                            }
                          }}
                          className="text-2xl font-black text-[var(--color-text-primary)] bg-transparent text-center w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, (Number(quantity) || 1) + 1))}
                      className="w-14 h-14 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-gray-100 transition-colors active:scale-90"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-6 rounded-3xl text-white bg-gradient-brand border border-[var(--color-purple)]/20">
                   <span className="text-xs font-black text-[var(--color-blue)] uppercase tracking-widest">Total Money</span>
                   <span className="text-2xl font-black text-[var(--color-text-primary)]">₦{(product.sellingPrice * (quantity || 1)).toLocaleString()}</span>
                </div>

                <button 
                  type="button"
                  onClick={handleSale}
                  className="w-full py-5 rounded-3xl bg-gradient-brand text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[var(--color-purple)]/10 hover:scale-[1.02] transition-all active:scale-95"
                >
                  Confirm Sale
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
