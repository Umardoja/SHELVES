'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddProductModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: Number(formData.get('price')),
        stockQuantity: Number(formData.get('stockQuantity')),
        lowStockThreshold: Number(formData.get('lowStockThreshold')),
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--color-bg)] backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="glass-card w-full max-w-lg p-6 pointer-events-auto m-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add New Product</h3>
                <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface)] rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Product Name</label>
                  <input name="name" required className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary-start outline-none" placeholder="e.g. Dangote Cement" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Category</label>
                        <input name="category" className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary-start outline-none" placeholder="e.g. Building Materials" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Price (₦)</label>
                        <input name="price" type="number" required className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary-start outline-none" placeholder="0.00" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Stock Quantity</label>
                        <input name="stockQuantity" type="number" required className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary-start outline-none" placeholder="0" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Low Stock Alert</label>
                         <input name="lowStockThreshold" type="number" defaultValue={5} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary-start outline-none" />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary-start text-[var(--color-text-primary)] font-bold py-3 rounded-lg hover:bg-primary-middle transition-colors mt-4 flex justify-center"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Add Product'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
